DO $$
BEGIN
  IF EXISTS(SELECT * 
    FROM information_schema.tables
    WHERE table_name= 'notes_settings')
  THEN
    -- if note_settings table is already created, then we just drop empty notes_settings
    -- if there is no note_settings table, then we rename notes_settings -> note_settings 
    IF EXISTS(SELECT *
      FROM information_schema.tables
      WHERE table_name= 'note_settings')
    THEN
      DROP TABLE public.notes_settings CASCADE;
    ELSE
      ALTER TABLE public.notes_settings 
        RENAME TO note_settings;
    END IF;
  END IF;
END $$;