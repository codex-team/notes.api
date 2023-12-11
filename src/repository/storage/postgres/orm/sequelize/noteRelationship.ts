import type { CreationOptional, InferAttributes, InferCreationAttributes, ModelStatic, Sequelize } from 'sequelize';
import { NoteModel } from '@repository/storage/postgres/orm/sequelize/note.js';
import type Orm from '@repository/storage/postgres/orm/sequelize/index.js';
import type { NoteInternalId } from '@domain/entities/note.js';
import type { Note } from '@domain/entities/note';
import { Model, DataTypes } from 'sequelize';

/**
 * Class representing a note relations in database
 */
export class NoteRelationshipModel extends Model<InferAttributes<NoteRelationshipModel>, InferCreationAttributes<NoteRelationshipModel>> {
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
export default class NoteRelationshipSequelizeStorage {
  /**
   * Note relationship model in database
   */
  public model: typeof NoteRelationshipModel;

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
   *
   * @param ormInstance - ORM instance
   */
  constructor({ connection }: Orm) {
    this.database = connection;

    /**
     * Initiate note relationship model
     */
    this.model = NoteRelationshipModel.init({
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
   * @todo create a functions for add note relation, update note relation and return parent note
   */

  /**
   * Insert note relation to database
   *
   * @param noteId - id of the current note
   * @param parentId - id of the parent note
   */
  public async createNoteRelation(noteId: NoteInternalId, parentId: NoteInternalId): Promise<boolean> {
    const entryId = await this.model.create({
      noteId,
      parentId,
    });

    return entryId.id !== undefined;
  }

  /**
   * Gets parent note id by note id
   *
   * @param parentId - parent note id
   * @returns { Promise<Note | null> } found note
   */
  public async getParentNoteIdById(parentId: NoteInternalId): Promise<number | null> {
    const finded = await this.model.findOne({
      where: {
        parentId,
      },
    });
    const parentNoteId = finded?.parentId;

    return parentNoteId !== undefined ? parentNoteId : null;
  };

  /**
   * Creates association with note model to make joins
   *
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
      as: this.noteModel.tableName,
    });
  }
}
