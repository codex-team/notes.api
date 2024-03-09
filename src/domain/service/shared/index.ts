import type EditorToolsServiceSharedMethods from './editorTools';
import type NoteSettingsSharedMethods from './noteSettings';

export type SharedDomainMethods = {
  editorTools: EditorToolsServiceSharedMethods;
  noteSettings: NoteSettingsSharedMethods;
};
