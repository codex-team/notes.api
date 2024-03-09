DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM   information_schema.columns
    WHERE  table_name = 'files'
    AND    column_name = 'extension'
  )
  THEN
    ALTER TABLE public.files RENAME COLUMN extension TO mimetype;
  END IF;
END $$;
