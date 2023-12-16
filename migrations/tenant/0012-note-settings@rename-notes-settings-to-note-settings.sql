DO $$
BEGIN
  IF EXISTS(SELECT * 
    FROM information_schema.tables
    WHERE table_name= 'notes_settings')
  THEN
    DROP TABLE IF EXISTS public.note_settings;
    ALTER TABLE public.notes_settings 
      RENAME TO note_settings;
  END IF;
END $$;