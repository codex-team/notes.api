import SequelizeOrm from '@repository/storage/postgres/orm/index.js';
import users from '../test-data/users.json'
import notes from '../test-data/notes.json'
import notesSettings from '../test-data/notes-settings.json'

const isoDateString = new Date(Date.now()).toISOString().split('T').join(' ').split('.')[0];

export async function insertData(db: SequelizeOrm): Promise<void> {
  await db.connection.query(`INSERT INTO public.users (id, email, name, "created_at") VALUES (${users[0].id}, '${users[0].name}', '${users[0].email}', '${isoDateString}')`);
  await db.connection.query(`INSERT INTO public.notes (id, "public_id", "creator_id", "created_at", "updated_at") VALUES (${notes[0].id}, '${notes[0].public_id}', '${notes[0].creator_id}', '${isoDateString}', '${isoDateString}')`);
  await db.connection.query(`INSERT INTO public.notes_settings (id, "note_id", "custom_hostname", "enabled") VALUES (${notesSettings[0].id}, '${notesSettings[0].note_id}', '${notesSettings[0].custom_hostname}', ${notesSettings[0].enabled})`);

}
