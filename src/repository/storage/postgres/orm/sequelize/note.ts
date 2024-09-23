import type { CreationOptional, InferAttributes, InferCreationAttributes, ModelStatic, NonAttribute, Sequelize } from 'sequelize';
import { DataTypes, Model } from 'sequelize';
import type Orm from '@repository/storage/postgres/orm/sequelize/index.js';
import type { Note, NoteCreationAttributes, NoteInternalId, NotePublicId } from '@domain/entities/note.js';
import { UserModel } from '@repository/storage/postgres/orm/sequelize/user.js';
import type { NoteSettingsModel } from './noteSettings.js';
import type { NoteVisitsModel } from './noteVisits.js';
import type { NoteHistoryModel } from './noteHistory.js';
import type { NoteRelationsModel } from './noteRelations.js';
import { notEmpty } from '@infrastructure/utils/empty.js';

/* eslint-disable @typescript-eslint/naming-convention */

/**
 * Class representing a note model in database
 */
export class NoteModel extends Model<InferAttributes<NoteModel>, InferCreationAttributes<NoteModel>> {
  /**
   * Id used for internal relations
   */
  public declare id: CreationOptional<Note['id']>;

  /**
   * Id visible for users. Used to query Note by public API
   */
  public declare publicId: Note['publicId'];

  /**
   * Note content
   */
  public declare content: Note['content'];

  /**
   * Note creator, user identifier, who created this note
   */
  public declare creatorId: Note['creatorId'];

  /**
   * Time when note was created
   */
  public declare createdAt: CreationOptional<Note['createdAt']>;

  /**
   * Last time when note was updated
   */
  public declare updatedAt: CreationOptional<Note['updatedAt']>;

  /**
   * Editor tools, which note contains
   */
  public declare tools: Note['tools'];

  /**
   * Joined note settings model
   */
  public declare noteSettings?: NonAttribute<NoteSettingsModel>;
}

/**
 * Class representing a table storing Notes
 */
export default class NoteSequelizeStorage {
  /**
   * Note model in database
   */
  public model: typeof NoteModel;

  /**
   * Notes settings model in database
   */
  public settingsModel: typeof NoteSettingsModel | null = null;

  /**
   * Note visits model in database
   */
  public visitsModel: typeof NoteVisitsModel | null = null;

  public historyModel: typeof NoteHistoryModel | null = null;

  public noteRelationModel: typeof NoteRelationsModel | null = null;

  /**
   * Database instance
   */
  private readonly database: Sequelize;

  /**
   * Table name
   */
  private readonly tableName = 'notes';

  /**
   * Constructor for note storage
   * @param ormInstance - ORM instance
   */
  constructor({ connection }: Orm) {
    this.database = connection;

    /**
     * Initiate note model
     */
    this.model = NoteModel.init({
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      publicId: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      content: DataTypes.JSON,
      creatorId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: UserModel,
          key: 'id',
        },
      },
      tools: DataTypes.JSONB,
      createdAt: DataTypes.DATE,
      updatedAt: DataTypes.DATE,
    }, {
      tableName: this.tableName,
      sequelize: this.database,
    });
  }

  /**
   * Creates association with note settings model
   * @param model - initialized note settings model
   */
  public createAssociationWithNoteSettingsModel(model: ModelStatic<NoteSettingsModel>): void {
    this.settingsModel = model;

    /**
     * Create association with note settings, one-to-one
     */
    this.model.hasOne(this.settingsModel, {
      foreignKey: 'noteId',
      as: 'noteSettings',
    });
  }

  /**
   * create association with note visits model
   * @param model - initialized note visits model
   */
  public createAssociationWithNoteVisitsModel(model: ModelStatic<NoteVisitsModel>): void {
    this.visitsModel = model;

    /**
     * Create association with note visits, one-to-many
     */
    this.model.hasMany(this.visitsModel, {
      foreignKey: 'noteId',
      as: 'noteVisits',
    });
  };

  public createAssociationWithNoteRelationModel(model: ModelStatic<NoteRelationsModel>): void {
    /**
     * Create association with note relations
     */
    this.noteRelationModel = model;
  }

  /**
   * Insert note to database
   * @param options - note creation options
   * @returns - created note
   */
  public async createNote(options: NoteCreationAttributes): Promise<Note> {
    return await this.model.create({
      publicId: options.publicId,
      content: options.content,
      creatorId: options.creatorId,
      tools: options.tools,
    });
  }

  /**
   * Update note content by id
   * @param id - note internal id
   * @param content - new content
   * @param tools - tools which are used in note
   * @returns Note on success, null on failure
   */
  public async updateNoteContentAndToolsById(id: NoteInternalId, content: Note['content'], tools: Note['tools']): Promise<Note | null> {
    const [affectedRowsCount, affectedRows] = await this.model.update({
      content,
      tools,
    }, {
      where: {
        id,
      },
      returning: true,
    });

    if (affectedRowsCount !== 1) {
      return null;
    }

    return affectedRows[0];
  }

  /**
   * Gets note by id
   * @param id - internal id
   */
  public async getNoteById(id: NoteInternalId): Promise<Note | null> {
    return await this.model.findOne({
      where: {
        id,
      },
    });
  }

  /**
   * Deletes note by id
   * @param id - internal id
   */
  public async deleteNoteById(id: NoteInternalId): Promise<boolean> {
    const affectedRows = await this.model.destroy({
      where: {
        id,
      },
    });

    /**
     * If note not found return false
     */
    return affectedRows > 0;
  }

  /**
   * Gets note list by creator id
   * @param userId - id of certain user
   * @param offset - number of skipped notes
   * @param limit - number of notes to get
   * @returns list of the notes
   */
  public async getNoteListByUserId(userId: number, offset: number, limit: number): Promise<Note[]> {
    if (this.visitsModel === null) {
      throw new Error('NoteStorage: NoteVisit model should be defined');
    }

    if (!this.settingsModel) {
      throw new Error('NoteStorage: Note settings model not initialized');
    }

    const reply = await this.model.findAll({
      offset: offset,
      limit: limit,
      where: {
        '$noteVisits.user_id$': userId,
      },
      order: [[
        {
          model: this.visitsModel,
          as: 'noteVisits',
        },
        'visited_at',
        'DESC',
      ]],
      include: [{
        model: this.visitsModel,
        as: 'noteVisits',
        duplicating: false,
      }, {
        model: this.settingsModel,
        as: 'noteSettings',
        attributes: ['cover'],
        duplicating: false,
      }],
    });

    /**
     * Convert note model data to Note entity with cover property
     */
    return reply.map((note) => {
      return {
        id: note.id,
        /**
         * noteSettings is required to be, because we make join
         */
        cover: note.noteSettings!.cover,
        content: note.content,
        updatedAt: note.updatedAt,
        createdAt: note.createdAt,
        publicId: note.publicId,
        creatorId: note.creatorId,
        tools: note.tools,
      };
    });
  }

  /**
   * Gets note by id
   * @param hostname - custom hostname
   * @returns found note
   */
  public async getNoteByHostname(hostname: string): Promise<Note | null> {
    if (!this.settingsModel) {
      throw new Error('NoteStorage: Note settings model not initialized');
    }

    /**
     * select note which has hostname in its settings
     */
    return await this.model.findOne({
      where: {
        '$noteSettings.custom_hostname$': hostname,
      },
      include: {
        model: this.settingsModel,
        as: 'noteSettings',
        required: true,
        attributes: [],
      },
    });
  }

  /**
   * Gets note by public id
   * @param publicId - note public id
   * @returns found note
   */
  public async getNoteByPublicId(publicId: NotePublicId): Promise<Note | null> {
    return await this.model.findOne({
      where: {
        publicId,
      },
    });
  };

  /**
   * Get all parent notes of a note that a user has access to,
   * where the user has access to.
   * @param noteId - the ID of the note.
   */
  public async getAllNoteParents(noteId: NoteInternalId): Promise<Note[]> {
    if (!this.noteRelationModel) {
      throw new Error('NoteStorage: Note Relation model is not defined');
    }

    const parentNotes: Note[] = [];
    let currentNoteId: NoteInternalId | null = noteId;

    while (currentNoteId != null) {
      // Get the note for database
      const note: Note | null = await this.model.findOne({
        where: { id: currentNoteId },
      });

      if (notEmpty(note)) {
        parentNotes.push(note);
      }

      // Retrieve the parent note
      const noteRelation: NoteRelationsModel | null = await this.noteRelationModel.findOne({
        where: { noteId: currentNoteId },
      });

      if (noteRelation != null) {
        currentNoteId = noteRelation.parentId;
      } else {
        currentNoteId = null;
      }
    }

    parentNotes.reverse();

    return parentNotes;
  }
}
