import type EditorToolsServiceSharedMethods from './editorTools.js';
import FileUploaderServiceSharedMethods from './fileUploader.js';
import type NoteServiceSharedMethods from './note.js';

export type SharedDomainMethods = {
  editorTools: EditorToolsServiceSharedMethods;

  note: NoteServiceSharedMethods;

  fileUploader: FileUploaderServiceSharedMethods;
};
