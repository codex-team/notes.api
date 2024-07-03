import type EditorToolsServiceSharedMethods from './editorTools.js';
import type FileUploaderServiceSharedMethods from './fileUploader.js';
import type NoteServiceSharedMethods from './note.js';

export type SharedDomainMethods = {
  editorTools: EditorToolsServiceSharedMethods;

  note: NoteServiceSharedMethods;

  fileUploader: FileUploaderServiceSharedMethods;
};
