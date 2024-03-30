DROP INDEX IF EXISTS note_visits_user_id_idx;

CREATE INDEX note_visits_user_id_idx ON public.note_visits (user_id);
