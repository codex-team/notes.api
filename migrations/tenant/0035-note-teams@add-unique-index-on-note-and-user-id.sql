CREATE UNIQUE INDEX IF NOT EXISTS note_teams_note_id_user_id_unique_idx
ON public.note_teams (note_id, user_id);