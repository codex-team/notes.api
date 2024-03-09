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
END $$;
