DO $$
BEGIN
  IF EXISTS(SELECT * 
    FROM information_schema.tables
    WHERE table_name= 'teams')
  THEN
    DROP TABLE IF EXISTS public.note_teams;
    ALTER TABLE public.teams
      RENAME TO note_teams;
  END IF;
END $$;