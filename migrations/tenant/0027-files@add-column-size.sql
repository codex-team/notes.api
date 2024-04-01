DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM   information_schema.columns
    WHERE  table_name = 'files'
    AND    column_name = 'size'
  )
  THEN
    ALTER TABLE files ADD COLUMN size integer NOT NULL;
  END IF;

  CREATE SEQUENCE IF NOT EXISTS public.files_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


-- Make identifier default value incrementing
  ALTER TABLE ONLY public.files ALTER COLUMN id SET DEFAULT nextval('public.files_id_seq'::regclass);

  IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'files'
        AND column_name = 'note_id'
    ) THEN
        -- Drop the column if it exists
        ALTER TABLE files
        DROP COLUMN note_id;
  END IF;

  IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'files'
        AND column_name = 'location'
    ) THEN
        -- Add the new column with jsonb type
        ALTER TABLE files
        ADD COLUMN location JSONB;
  END IF;
END $$;
