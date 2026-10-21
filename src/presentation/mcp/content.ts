import { nanoid } from 'nanoid';
import { z } from 'zod';
import type { NoteContent, ToolUsedInNoteContent } from '@domain/entities/note.js';
import type EditorTool from '@domain/entities/editorTools.js';

/**
 * Editor.js block of the note content
 */
export type NoteBlock = NoteContent['blocks'][number];

/**
 * Length of the Editor.js block id
 */
const BLOCK_ID_LENGTH = 10;

/**
 * Block passed by MCP client. Id is optional for new blocks
 */
export const blockInputSchema = z.object({
  id: z.string().min(1)
    .optional()
    .describe('Block id. Keep it for existing blocks, omit for new ones'),
  type: z.string().min(1)
    .describe('Editor tool name, e.g. paragraph, header, list'),
  data: z.record(z.unknown()).describe('Block data, format depends on the block type'),
  tunes: z.record(z.unknown()).optional()
    .describe('Block tunes, keep them as is for existing blocks'),
});

export type NoteBlockInput = z.infer<typeof blockInputSchema>;

/**
 * Description of the content format for MCP tools that write notes
 */
export const BLOCKS_FORMAT_DESCRIPTION = `Note content is an array of Editor.js blocks { id?, type, data }.
Keep "id" of existing blocks, omit it for new ones.
Block "type" must be an editor tool available to the user. Default tools:
- paragraph: { "text": "Text with inline HTML: <b>, <i>, <a href=\\"...\\">, <code>, <mark>" }
- header: { "text": "Heading", "level": 2 } (level from 1 to 6)
- list: { "style": "unordered" | "ordered", "items": ["First item", "Second item"] }
Keep blocks of other types unchanged, as returned by get_note.
The first block is used as the note title.`;

/**
 * Generates ids for blocks passed without them
 * @param blocks - blocks passed by MCP client
 */
export function fillBlockIds(blocks: NoteBlockInput[]): NoteBlock[] {
  return blocks.map(block => ({
    ...block,
    id: block.id ?? nanoid(BLOCK_ID_LENGTH),
  }));
}

/**
 * Lists tools used in blocks in the format required by notes API
 * @param blocks - note content blocks
 * @param availableTools - tools that can be used, first match by name wins
 * @throws Error if some block type is not an available tool
 */
export function getToolsForBlocks(blocks: NoteBlock[], availableTools: Pick<EditorTool, 'id' | 'name'>[]): ToolUsedInNoteContent[] {
  const toolIdsByName = new Map<string, string>();

  for (const tool of availableTools) {
    if (!toolIdsByName.has(tool.name)) {
      toolIdsByName.set(tool.name, tool.id);
    }
  }

  const usedToolNames = Array.from(new Set(blocks.map(block => block.type)));
  const unknownToolNames = usedToolNames.filter(name => !toolIdsByName.has(name));

  if (unknownToolNames.length > 0) {
    throw new Error(`Unknown block types: ${unknownToolNames.join(', ')}. Available block types: ${Array.from(toolIdsByName.keys()).join(', ')}`);
  }

  return usedToolNames.map(name => ({
    name,
    id: toolIdsByName.get(name)!,
  }));
}

/**
 * Removes HTML tags and decodes basic entities
 * @param html - string with inline HTML
 */
export function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, '\'')
    .replace(/&amp;/g, '&')
    .trim();
}

/**
 * Gets note title from the text of the first block
 * @param content - note content
 */
export function getTitle(content: NoteContent): string {
  const text = (content.blocks[0]?.data as { text?: unknown } | undefined)?.text;
  const title = typeof text === 'string' ? stripHtml(text) : '';

  return title === '' ? 'Untitled' : title;
}
