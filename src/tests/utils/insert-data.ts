import type SequelizeOrm from '@repository/storage/postgres/orm/index.js';
import users from '../test-data/users.json';
import notes from '../test-data/notes.json';
import notesSettings from '../test-data/notes-settings.json';

/**
 * Now date in format that matches postgres timestamp format
 */
const nowDateString = new Date(Date.now()).toISOString()
  .split('T')
  .join(' ')
  .split('.')[0];


/**
 * Fills in the database with users data
 *
 * @param db - SequelizeOrm instance
 */
async function insertUsers(db: SequelizeOrm): Promise<void> {
  for (const user of users) {
    await db.connection.query(`INSERT INTO public.users (id, email, name, "created_at") VALUES (${user.id}, '${user.name}', '${user.email}', '${nowDateString}')`);
  }
}

/**
 * Fills in the database with notes data
 *
 * @param db - SequelizeOrm instance
 */
async function insertNotes(db: SequelizeOrm): Promise<void> {
  for (const note of notes) {
    await db.connection.query(`INSERT INTO public.notes (id, "public_id", "creator_id", "created_at", "updated_at") VALUES (${note.id}, '${note.public_id}', '${note.creator_id}', '${nowDateString}', '${nowDateString}')`);
  }
}

/**
 * Fills in the database with notes settings data
 *
 * @param db - SequelizeOrm instance
 */
async function insertNotesSettings(db: SequelizeOrm): Promise<void> {
  for (const noteSettings of notesSettings) {
    await db.connection.query(`INSERT INTO public.notes_settings (id, "note_id", "custom_hostname", "enabled") VALUES (${noteSettings.id}, '${noteSettings.note_id}', '${noteSettings.custom_hostname}', ${noteSettings.enabled})`);
  }
}


/**
 * Fills in the database with test data
 *
 * @param db - SequelizeOrm instance
 */
export async function insertData(db: SequelizeOrm): Promise<void> {
  await insertUsers(db);
  await insertNotes(db);
  await insertNotesSettings(db);
}

