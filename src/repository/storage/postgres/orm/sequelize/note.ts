import { Model, DataTypes, Sequelize, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import Orm from '@repository/storage/postgres/orm/sequelize/index.js';

/**
 * Interface for inserted note
 */
interface InsertedNote {
  /**
   * Note id
   */
  id: number;

  /**
   * Note title
   */
  title: string;

  /**
   * Note content
   */
  content: string;
}

/**
 * Class representing a note model in database
 */
class NoteModel extends Model<InferAttributes<NoteModel>, InferCreationAttributes<NoteModel>> {
  /**
   * Note id
   */
  public declare id: CreationOptional<number>;

  /**
   * Note title
   */
  public declare title: string;

  /**
   * Note content
   */
  public declare content: string;
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
   * Database instance
   */
  private readonly database: Sequelize;

  /**
   * Table name
   */
  private readonly tableName = 'notes';

  /**
   * Constructor for note storage
   *
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
      title: DataTypes.STRING,
      content: DataTypes.STRING,
    }, {
      tableName: this.tableName,
      sequelize: this.database,
    });
  }

  /**
   * Insert note to database
   *
   * @param title - note title
   * @param content - note content
   * @returns { InsertedNote } - inserted note
   */
  public async insertNote(title: string, content: string): Promise<InsertedNote> {
    const insertedNote = await this.model.create({
      title,
      content,
    });

    return {
      id: insertedNote.id,
      title: insertedNote.title,
      content: insertedNote.content,
    };
  }

  /**
   * Gets note by id
   *
   * @param id - note id
   * @returns { Promise<InsertedNote | null> } found note
   */
  public async getNoteById(id: number): Promise<InsertedNote | null> {
    const note = await this.model.findOne({
      where: {
        id,
      },
    });

    /**
     * If note not found, return null
     */
    if (!note) {
      return null;
    }

    return {
      id: note.id,
      title: note.title,
      content: note.content,
    };
  }
}
