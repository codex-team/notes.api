import type { MultipartFields, MultipartFile, MultipartValue } from '@fastify/multipart';

export interface AddEditorToolDto extends MultipartFields {
  name: MultipartValue;
  title: MultipartValue;
  exportName: MultipartValue;
  description: MultipartValue;
  isDefault?: MultipartValue;
  cover?: MultipartFile;
  userId: MultipartValue;
  source: MultipartValue<string>;
}
