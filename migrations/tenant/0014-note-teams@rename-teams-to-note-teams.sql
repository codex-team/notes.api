DO $$
BEGIN
  IF EXISTS(SELECT * 
    FROM information_schema.tables
    WHERE table_name= 'teams')
  THEN
    -- if note_teams table already exists, then we drop teams table
    -- if there is no note_teams table, then we rename teams pkey and rename table teams -> note_teams
    IF EXISTS(SELECT * 
      FROM information_schema.tables
      WHERE table_name= 'note_teams')
    THEN
      DROP TABLE public.teams CASCADE;
    ELSE
      ALTER TABLE public.teams
        RENAME CONSTRAINT teams_pkey TO note_teams_pkey;
      ALTER TABLE public.teams
        RENAME TO note_teams;
    END IF;
  END IF;
END $$;