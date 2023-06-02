import { Model, DataTypes, Sequelize, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import Note from '@domain/entities/note.js';
import Orm from './index.js';
import NoteStorageInterface from '@repository/note.storage.interface.js';

/**
 *
 */
class NoteModel extends Model<InferAttributes<NoteModel>, InferCreationAttributes<NoteModel>> {
  public declare id: CreationOptional<number>;
}


/**
 * Class representing a table storing Notes
 */
export default class NoteSequelizeStorage {
  /**
   * Database instance
   */
  private readonly database: Sequelize;
  private model: typeof NoteModel;

  /**
   * Constructor for note storage
   *
   * @param ormInstance
   */
  constructor({ connection }: Orm) {
    this.database = connection;

    this.model = NoteModel.init({
      id: DataTypes.STRING,
      // title: DataTypes.STRING,
      // content: DataTypes.STRING,
    }, {
      tableName: 'notes',
      sequelize: this.database,
    });
  }

  /**
   * Insert note to database
   *
   * @param note - note to insert
   * @returns { Note } - inserted note
   */
  public insertNote(note: Pick<Note, 'title' | 'content'>): Note {
    /**
     * TODO - add note to database
     */
    note.id = '42';


    return note;
  }
}
