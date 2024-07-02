import EditorTool from '@domain/entities/editorTools.js';
import type { MultipartFields, MultipartFile, MultipartValue } from '@fastify/multipart';
import { Multipart } from '@fastify/multipart';

export interface AddEditorToolDto extends MultipartFields {
  name: MultipartValue;
  title: MultipartValue;
  exportName: MultipartValue;
  description: MultipartValue;
  isDefault?: MultipartValue;
  userId: MultipartValue;
  source: MultipartValue;
  cover: MultipartFile;
}
