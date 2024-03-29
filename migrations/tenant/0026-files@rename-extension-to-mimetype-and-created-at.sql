DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM   information_schema.columns
    WHERE  table_name = 'files'
    AND    column_name = 'extension'
  ) AND NOT EXISTS (
    SELECT 1
    FROM   information_schema.columns
    WHERE  table_name = 'files'
    AND    column_name = 'mimetype'
  )
  THEN
    ALTER TABLE public.files RENAME COLUMN extension TO mimetype;
  END IF;
  IF EXISTS (
    SELECT 1
    FROM   information_schema.columns
    WHERE  table_name = 'files'
    AND    column_name = 'uploaded_at'
  ) AND NOT EXISTS (
    SELECT 1
    FROM   information_schema.columns
    WHERE  table_name = 'files'
    AND    column_name = 'created_at'
  )
  THEN
    ALTER TABLE public.files RENAME COLUMN uploaded_at TO created_at;
  END IF;
END $$;
