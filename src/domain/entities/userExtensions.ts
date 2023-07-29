import type EditorTool from '@domain/entities/editorTool.js';

/**
 * Tools that user uses in the editor while changing notes
 */
export interface UserEditorTool {
    /**
     * Unique tool identifier
     */
    id: EditorTool['id'];
}

/**
 * Custom user extensions and plugin that expand the capabilities
 * of the editor
 */
export default interface UserExtensions {
    editorTools?: UserEditorTool[];
}