import type EditorToolsServiceSharedMethods from './editorTools';
import type NoteServiceSharedMethods from './note';

export type SharedDomainMethods = {
  editorTools: EditorToolsServiceSharedMethods;

  note: NoteServiceSharedMethods;
};
