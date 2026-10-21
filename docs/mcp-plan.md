# MCP server: implementation plan

Living document. Update the status checkboxes and the "Deviations" section as the work goes.

**Status:** steps 1 and 2 are done on `feat/mcp-server`; step 3 is done on `feat/mcp-tokens` in notes.web.

## Decisions

- **Where it lives.** A remote MCP endpoint `/mcp` inside notes.api. Transport: Streamable HTTP, stateless (no MCP sessions). No separate deployment, no npm package.
- **Auth.** Personal MCP tokens sent as `Authorization: Bearer ntx_…`. A user can have several tokens, each with `read` or `write` permission. No OAuth for now.
- **Content format.** Editor.js JSON as stored in the DB. The server generates ids for new blocks and builds `tools[]` itself.
- **Tools.** `list_notes`, `get_note`, `create_note`, `update_note`. A `read` token sees only the first two. No delete, no search.
- **Permissions.** Tools call existing HTTP routes through `fastify.inject()` with a short-lived access JWT of the token owner, so all route policies and validation apply without duplication.

## Step 1. Tokens (notes.api)

- [x] Migration `migrations/tenant/0036-mcp-tokens@add-mcp-tokens-table.sql`:
  ```sql
  CREATE TABLE IF NOT EXISTS public.mcp_tokens (
    id            SERIAL PRIMARY KEY,
    user_id       INTEGER NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    token_hash    CHAR(64) NOT NULL UNIQUE,
    preview       VARCHAR(4) NOT NULL,
    permission    VARCHAR(5) NOT NULL CHECK (permission IN ('read', 'write')),
    label         VARCHAR(255) NOT NULL,
    last_used_at  TIMESTAMPTZ,
    request_count INTEGER NOT NULL DEFAULT 0,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
  );
  ```
- [x] Entity `src/domain/entities/mcpToken.ts`: `McpToken` and `McpTokenPublic` (without `tokenHash` and `userId`).
- [x] Storage and repository:
  - sequelize model `src/repository/storage/postgres/orm/sequelize/mcpToken.ts`;
  - `src/repository/storage/mcpToken.storage.ts`;
  - `src/repository/mcpToken.repository.ts`;
  - wiring in `src/repository/index.ts`.
- [x] Service `src/domain/service/mcpToken.ts`:
  - `createToken(userId, label, permission)` generates `ntx_` + `nanoid(32)`, stores its sha256 and last 4 chars, returns the plain token once;
  - `getTokensByUserId(userId)`;
  - `revokeToken(userId, id)` revokes only the user's own tokens;
  - `resolveToken(token)` returns the token record or `null`;
  - `trackUsage(id)` atomically increments `request_count` and sets `last_used_at`.
- [x] Router `src/presentation/http/router/mcpTokens.ts` with prefix `/user/mcp-tokens`, all routes `authRequired`:
  - `GET /` lists tokens without hashes;
  - `POST /` with `{ label, permission }` returns `{ token, item }`;
  - `DELETE /:id`.
- [x] Tests:
  - the token is returned only on creation;
  - the list has no hashes;
  - a user cannot revoke someone else's token.

## Step 2. `/mcp` endpoint (notes.api)

- [x] Dependency `@modelcontextprotocol/sdk` (zod may need a bump from `^3.21`).
- [x] `src/presentation/mcp/`:
  - `index.ts` — fastify plugin: `POST /mcp`; `GET` and `DELETE` answer 405;
  - `auth.ts` — Bearer token → `resolveToken()`, 401 without a valid token;
  - `server.ts` — `createMcpServer({ userId, permission })` registers tools by permission;
  - `noteRef.ts` — parses a note URL or id: `notex.so/note/<id>`, `/note/<id>/…`, a bare 10-char id, a custom hostname via `GET /note/resolve-hostname/:hostname`;
  - `content.ts` — fills block ids, builds `tools[]`;
  - `tools/listNotes.ts`, `tools/getNote.ts`, `tools/createNote.ts`, `tools/updateNote.ts`.
- [x] Request flow:
  1. resolve the token;
  2. sign a short access JWT for the owner with `authService.signAccessToken()`;
  3. create `McpServer` and `StreamableHTTPServerTransport({ sessionIdGenerator: undefined })`;
  4. `reply.hijack()` and `transport.handleRequest(request.raw, reply.raw, request.body)`;
  5. tools call the API through `fastify.inject()` with that JWT;
  6. `trackUsage` only on `tools/call`.
- [x] `userIdResolver` skips `ntx_…` tokens instead of logging a JWT error on every request.
- [x] Tools:

  | Tool | Params | API | Returns |
  |---|---|---|---|
  | `list_notes` | `source: recent \| created` (default `recent`), `page` (1–30), `parent?` | `GET /notes`, `GET /notes/created`; with `parent` — `GET /note/note-hierarchy/:id`, subtree of the parent | `[{ id, title, url, updatedAt }]` or a tree `{ id, title, url, children }` |
  | `get_note` | `note` (URL or id) | `GET /note/:id` | `{ id, url, title, updatedAt, canEdit, parents, content: { blocks } }` |
  | `create_note` | `blocks`, `parent?` (URL or id) | `POST /note` | `{ id, url }` |
  | `update_note` | `note`, `blocks`, `mode: replace \| append`, `expectedUpdatedAt?` | `GET /note/:id`, compare `updatedAt`, merge, `PATCH /note/:id` | `{ id, url, updatedAt }` |

- [x] `tools[]` lookup order for each block type: tools of the note, then user tools (`GET /user/editor-tools`), then default tools (`GET /editor-tools/all`). Unknown type → error listing the available tools.
- [x] Tool descriptions document the default block formats: `paragraph {text}` with inline HTML, `header {text, level}`, `list {style, items: string[]}` (list@1.9).
- [x] Note links are built from a new config value `mcp.webUrl` (default `https://notex.so`).
- [x] Tests `src/presentation/mcp/mcp.test.ts`:
  - 401 without a token;
  - a `read` token doesn't see write tools in `tools/list`;
  - create → get → update round trip;
  - `expectedUpdatedAt` conflict;
  - `request_count` grows.

## Step 3. Settings in notes.web

- [x] New "MCP" fieldset in `Settings.vue`:
  - token list: label, permission, `ntx_…a1b2`, created, last used, request count, "Revoke";
  - new token form: label and an "Allow editing" checkbox (off by default);
  - after creation the token is shown once with a copy button and ready-made setup instructions for Claude Code, Cursor, and claude.ai (custom connector → Request headers).
- [x] Layers: entity, notes-api transport methods, service, ru/en texts.

Setup snippets for the UI:

- Claude Code: `claude mcp add --transport http notex https://api.notex.so/mcp --header "Authorization: Bearer ntx_…"`
- Cursor: `{ "mcpServers": { "notex": { "url": "https://api.notex.so/mcp", "headers": { "Authorization": "Bearer ntx_…" } } } }`

## Order

Step 1 → step 2. Step 3 depends only on the step 1 routes and can go in parallel with step 2.

## Out of scope for v1

OAuth, search, deleting notes, Markdown format, MCP resources.

Separate fix, not part of this work: `POST /note` with `parentId` does not check that the user can edit the parent note, so any logged-in user can attach a note to someone else's tree. `create_note` goes through the same route and has the same gap until it is fixed.

## Deviations

- Step 1: the migration declares the FK, the permission check and the indexes as named constraints (same structure as other migrations) instead of inline column constraints.
- Step 2: zod is bumped to `^3.25.0`, the SDK (`@modelcontextprotocol/sdk@^1.32.1`) requires `^3.25 || ^4`.
- Step 2: the web url lives in `httpApi.mcp.webUrl` (default `https://notex.so`, `http://localhost:5173` in `app-config.yaml`), so `HttpApi` keeps getting only its own config section.
- Step 2: the transport runs with `enableJsonResponse: true`: responses are plain JSON, no SSE streams.
- Step 2: `GET /user/editor-tools` already includes the default tools, so `tools[]` is built from the note tools and the user tools; `GET /editor-tools/all` is not called.
- Step 2: two helper modules were added: `notexApi.ts` (API client over `fastify.inject()`) and `types.ts` (tool context and result helper).
- Step 2: besides the tests through `fastify.inject()`, the endpoint was checked over real HTTP with curl against a local server: `initialize`, `tools/list`, `create_note`, `list_notes`, 405 on `GET`, 401 for a revoked token, two tools for a read token. It has not been tried with Claude Code or Cursor yet.
- Step 2 (review): `PATCH /note/:notePublicId` accepts an optional `expectedUpdatedAt`. The note is updated only if its `updated_at` still matches, checked in the same `UPDATE` query; otherwise the route returns 409. `update_note` always passes the version it read, so concurrent updates and appends can't overwrite each other. Note history is now written after a successful update, not before.
- Step 2 (review): `/mcp` copies headers set by Fastify hooks (CORS) to the raw response, since the hijacked reply doesn't flush them.
- Step 3: notes.web has only the English locale, so texts are added to `en.json` only.
- Step 3: the section is a separate component `src/presentation/components/mcp/McpTokens.vue` with the `useMcpTokens` composable; `Settings.vue` only renders it.
- Step 3: the "Create token" button sits below the form card, like the "Logout" button in the General section.
- Step 3: checked in the browser against a local API: creating read and write tokens, the one-time token with setup snippets, the list with usage, revoking with confirmation, no horizontal scroll at 375px width.

## Verification

The repo may contain other sessions' worktrees in `.claude/worktrees`, which ESLint and Vitest pick up. Run checks on this checkout only:

- `yarn typecheck`
- `yarn eslint src`
- `yarn vitest run --exclude '.claude/**'`
