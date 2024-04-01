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

  -- IF EXISTS (
  --   SELECT 1
  --   FROM information_schema.columns
  --   WHERE table_name = 'files'
  --   AND column_name = 'type'
  --   AND data_type = 'character varying'
  --   ) THEN
  --       ALTER TABLE files
  --       ALTER COLUMN type TYPE INTEGER
  --       USING type::INTEGER;
  -- END IF;
END $$;
