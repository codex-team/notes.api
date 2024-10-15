import type { CreationOptional, InferAttributes, InferCreationAttributes, ModelStatic, Sequelize } from 'sequelize';
import { QueryTypes } from 'sequelize';
import { Op } from 'sequelize';
import { NoteModel } from '@repository/storage/postgres/orm/sequelize/note.js';
import type Orm from '@repository/storage/postgres/orm/sequelize/index.js';
import type { NoteInternalId } from '@domain/entities/note.js';
import type { Note } from '@domain/entities/note.js';
import { Model, DataTypes } from 'sequelize';

/**
 * Class representing a note relations in database
 */
export class NoteRelationsModel extends Model<InferAttributes<NoteRelationsModel>, InferCreationAttributes<NoteRelationsModel>> {
  /**
   * Relation id
   */
  public declare id: CreationOptional<number>;

  /**
   * Id of current note
   */
  public declare noteId: Note['id'];

  /**
   * Id of parent note
   */
  public declare parentId: Note['id'];
}

/**
 * Class representing a table storing of Note relationship
 */
export default class NoteRelationsSequelizeStorage {
  /**
   * Note relationship model in database
   */
  public model: typeof NoteRelationsModel;

  /**
   * Note model instance
   */
  private noteModel: typeof NoteModel | null = null;

  /**
   * Database instance
   */
  private readonly database: Sequelize;

  /**
   * Table name
   */
  private readonly tableName = 'note_relations';

  /**
   * Constructor for note relatinship storage
   * @param ormInstance - ORM instance
   */
  constructor({ connection }: Orm) {
    this.database = connection;

    /**
     * Initiate note relationship model
     */
    this.model = NoteRelationsModel.init({
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      noteId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: NoteModel.tableName,
          key: 'id',
        },
      },
      parentId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: NoteModel.tableName,
          key: 'id',
        },
      },
    }, {
      tableName: this.tableName,
      sequelize: this.database,
      timestamps: false,
    });
  }

  /**
   * Insert note relation to database
   * @param noteId - id of the current note
   * @param parentId - id of the parent note
   */
  public async createNoteRelation(noteId: NoteInternalId, parentId: NoteInternalId): Promise<boolean> {
    const newRelation = await this.model.create({
      noteId,
      parentId,
    });

    return newRelation.id !== undefined;
  }

  /**
   * Gets parent note id by note id
   * @param noteId - note id
   */
  public async getParentNoteIdByNoteId(noteId: NoteInternalId): Promise<NoteInternalId | null> {
    const found = await this.model.findOne({
      where: {
        noteId: noteId,
      },
    });
    const parentNoteId = found?.parentId;

    return parentNoteId !== undefined ? parentNoteId : null;
  };

  /**
   * Update note content by id
   * @param noteId - id of the current note
   * @param parentId - parent note id
   * @returns Note on success, null on failure
   */
  public async updateNoteRelationById(noteId: NoteInternalId, parentId: NoteInternalId): Promise<boolean> {
    const [affectedRowsCount] = await this.model.update({
      parentId,
    }, {
      where: {
        noteId,
      },
      returning: true,
    });

    return affectedRowsCount === 1;
  }

  /**
   * Delete all note relations contains noteId
   * @param noteId - id of the current note
   */
  public async deleteNoteRelationsByNoteId(noteId: NoteInternalId): Promise<boolean> {
    const affectedRows = await this.model.destroy({
      where: {
        [Op.or]: [{
          noteId: noteId,
        }, {
          parentId: noteId,
        }],
      },
    });

    /**
     * If the relation was not found return false
     */
    return affectedRows > 0;
  }

  /**
   * Unlink parent note from the current note
   * @param noteId - id of note to unlink parent
   */
  public async unlinkParent(noteId: NoteInternalId): Promise<boolean> {
    const affectedRows = await this.model.destroy({
      where: {
        noteId,
      },
    });

    /**
     * We need to delete only one relation because note can only have one parent
     */
    return affectedRows === 1;
  }

  /**
   * Creates association with note model to make joins
   * @param model - initialized note model
   */
  public createAssociationWithNoteModel(model: ModelStatic<NoteModel>): void {
    this.noteModel = model;

    /**
     * Make one-to-one association with note model
     * We can not create note relations without note
     */
    this.model.belongsTo(model, {
      foreignKey: 'noteId',
      as: 'note',
    });
  }

  /**
   * Checks if the note has any relation
   * @param noteId - id of the current note
   */
  public async hasRelation(noteId: NoteInternalId): Promise<boolean> {
    const foundNote = await this.model.findOne ({
      where: {
        [Op.or]: [{
          noteId: noteId,
        }, {
          parentId: noteId,
        }],
      },
    });

    return foundNote !== null;
  };

  /**
   * Get all parent notes of a note that a user has access to,
   * where the user has access to.
   * @param noteId - the ID of the note.
   */
  public async getNoteParentsIds(noteId: NoteInternalId): Promise<NoteInternalId[]> {
    let parentNotes: NoteInternalId[] = [];

    // get all note ids via a singe sql query instead of many
    const query = `
    WITH RECURSIVE note_parents AS (
      SELECT np.note_id, np.parent_id
      FROM ${String(this.database.literal(this.tableName).val)} np
      WHERE np.note_id = :startNoteId
      UNION ALL
      SELECT nr.note_id, nr.parent_id
      FROM ${String(this.database.literal(this.tableName).val)} nr
      INNER JOIN note_parents np ON np.parent_id = nr.note_id
    )
    SELECT np.note_id, np.parent_id
    FROM note_parents np;`;

    try {
      const result = await this.database.query(query, {
        replacements: { startNoteId: noteId },
        type: QueryTypes.SELECT,
      });

      // eslint-disable-next-line @typescript-eslint/naming-convention
      parentNotes = (result as { note_id: number; parent_id: number }[])?.map(note => note.parent_id) ?? [];

      parentNotes.reverse();
    } catch {
      console.log(`something wrong happened with sql query`);
    }

    return parentNotes;
  }
}
