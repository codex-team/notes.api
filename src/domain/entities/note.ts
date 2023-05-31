/**
 * Note entity
 */
export default class Note {
  /**
   * Note id
   */
  public id?: string;

  /**
   * Note title
   */
  public title: string;

  /**
   * Note content
   */
  public content: string;
  /**
   *
   * @param title - note title
   * @param content - note content
   * @param id - note id
   */
  constructor(title: string, content: string, id?: string) {
    this.title = title;
    this.content = content;
    this.id = id;
  }
}
