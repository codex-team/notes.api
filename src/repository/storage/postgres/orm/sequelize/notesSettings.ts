import type { InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import { Model } from 'sequelize';

/* eslint-disable @typescript-eslint/naming-convention */

/**
 * Class representing a notes settings model in database
 */
export class NotesSettingsModel extends Model<InferAttributes<NotesSettingsModel>, InferCreationAttributes<NotesSettingsModel>> {
  /**
   * Note Settings id
   */
  public declare id: CreationOptional<number>;

  /**
   * Note ID
   */
  public declare note_id: number;

  /**
   * Custom hostname
   */
  public declare custom_hostname: string;
}