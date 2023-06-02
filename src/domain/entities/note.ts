/**
 * Note entity
 */
export default class Note {
  /**
   * Note id
   */
  public id: number;

  /**
   * Note title
   */
  public title: string;

  /**
   * Note content
   */
  public content: string;

  /**
   * Note entity constructor
   *
   * @param title - note title
   * @param content - note content
   * @param id - note id
   */
  constructor(title: string, content: string, id = 0) {
    this.title = title;
    this.content = content;
    this.id = id;
  }
}
