ALTER TABLE IF EXISTS public.note_settings
    RENAME COLUMN enabled TO is_public;