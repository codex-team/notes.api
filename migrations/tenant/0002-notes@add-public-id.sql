TRUNCATE TABLE public.notes CASCADE;

ALTER TABLE IF EXISTS public.notes
    ADD COLUMN IF NOT EXISTS public_id character(10) NOT NULL;

COMMENT ON COLUMN public.notes.public_id
    IS 'Id visible for users. Used to query Note by public API';
