--
-- Name: mcp_tokens; Type: TABLE; Schema: public; Owner: codex
-- Personal tokens used by MCP clients to access user notes
--

CREATE TABLE IF NOT EXISTS public.mcp_tokens (
  id SERIAL PRIMARY KEY,
  user_id integer NOT NULL,
  token_hash character(64) NOT NULL,
  preview character varying(4) NOT NULL,
  permission character varying(5) NOT NULL,
  label character varying(255) NOT NULL,
  last_used_at timestamp with time zone,
  request_count integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

--
-- Name: mcp_tokens user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: codex
--
ALTER TABLE public.mcp_tokens DROP CONSTRAINT IF EXISTS mcp_tokens_user_id_fkey;
ALTER TABLE public.mcp_tokens
  ADD CONSTRAINT mcp_tokens_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
  ON UPDATE CASCADE ON DELETE CASCADE;

--
-- Name: mcp_tokens permission_check; Type: CHECK CONSTRAINT; Schema: public; Owner: codex
--
ALTER TABLE public.mcp_tokens DROP CONSTRAINT IF EXISTS mcp_tokens_permission_check;
ALTER TABLE public.mcp_tokens
  ADD CONSTRAINT mcp_tokens_permission_check CHECK (permission IN ('read', 'write'));

CREATE UNIQUE INDEX IF NOT EXISTS mcp_tokens_token_hash_unique_idx ON public.mcp_tokens (token_hash);
CREATE INDEX IF NOT EXISTS mcp_tokens_user_id_idx ON public.mcp_tokens (user_id);
