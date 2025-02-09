import type { CreationOptional, InferAttributes, InferCreationAttributes, ModelStatic, NonAttribute, Sequelize } from 'sequelize';
import { DataTypes, Model, Op, QueryTypes } from 'sequelize';
import type Orm from '@repository/storage/postgres/orm/sequelize/index.js';
import type { Note, NoteContent, NoteCreationAttributes, NoteInternalId, NotePublicId } from '@domain/entities/note.js';
import { UserModel } from '@repository/storage/postgres/orm/sequelize/user.js';
import type { NoteSettingsModel } from './noteSettings.js';
import type { NoteVisitsModel } from './noteVisits.js';
import type { NoteHistoryModel } from './noteHistory.js';
import type { NoteTree } from '@domain/entities/noteTree.js';

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
   * Get all notes based on their ids in the same order of passed ids
   * @param noteIds - list of note ids
   */
  public async getNotesByIds(noteIds: NoteInternalId[]): Promise<Note[]> {
    if (noteIds.length === 0) {
      return [];
    }

    const notes: Note[] = await this.model.findAll({
      where: {
        id: {
          [Op.in]: noteIds,
        },
      },
      order: [
        this.database.literal(`ARRAY_POSITION(ARRAY[${noteIds.map(id => `${id}`).join(',')}], id)`),
      ],
    });

    return notes;
  }

  /**
   * Creates a tree of notes
   * @param noteId - public note id
   * @returns NoteTree
   */
  public async getNoteTreebyNoteId(noteId: NoteInternalId): Promise<NoteTree | null> {
    // Fetch all notes and relations in a recursive query
    const query = `
    WITH RECURSIVE note_tree AS (
      SELECT 
        n.id AS noteId,
        n.content,
        n.public_id,
        nr.parent_id
      FROM ${String(this.database.literal(this.tableName).val)} n
      LEFT JOIN ${String(this.database.literal('note_relations').val)} nr ON n.id = nr.note_id
      WHERE n.id = :startNoteId
      
      UNION ALL

      SELECT 
        n.id AS noteId,
        n.content,
        n.public_id,
        nr.parent_id
      FROM ${String(this.database.literal(this.tableName).val)} n
      INNER JOIN ${String(this.database.literal('note_relations').val)} nr ON n.id = nr.note_id
      INNER JOIN note_tree nt ON nr.parent_id = nt.noteId
    )
    SELECT * FROM note_tree;
    `;

    const result = await this.model.sequelize?.query(query, {
      replacements: { startNoteId: noteId },
      type: QueryTypes.SELECT,
    });

    if (!result || result.length === 0) {
      return null; // No data found
    }

    type NoteRow = {
      noteid: NoteInternalId;
      public_id: NotePublicId;
      content: NoteContent;
      parent_id: NoteInternalId | null;
    };

    const notes = result as NoteRow[];

    const notesMap = new Map<NoteInternalId, NoteTree>();

    let root: NoteTree | null = null;

    // Step 1: Parse and initialize all notes
    notes.forEach((note) => {
      notesMap.set(note.noteid, {
        id: note.public_id,
        content: note.content,
        childNotes: [],
      });
    });

    // Step 2: Build hierarchy
    notes.forEach((note) => {
      if (note.parent_id === null) {
        root = notesMap.get(note.noteid) ?? null;
      } else {
        const parent = notesMap.get(note.parent_id);

        if (parent) {
          parent.childNotes?.push(notesMap.get(note.noteid)!);
        }
      }
    });

    return root;
  }
}
