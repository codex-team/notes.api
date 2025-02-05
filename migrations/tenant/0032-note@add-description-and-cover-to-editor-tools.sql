-- Add column "description" and "cover "to "editor-tools" if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS(SELECT *
    FROM information_schema.columns
    WHERE table_name='editor_tools' AND column_name='description')
  THEN
    ALTER TABLE "editor_tools" ADD COLUMN "description" VARCHAR(255); -- Adjust the data type and size as needed
  END IF;
  IF NOT EXISTS(SELECT *
    FROM information_schema.columns
    WHERE table_name='editor_tools' AND column_name='cover')
  THEN
    ALTER TABLE "editor_tools" ADD COLUMN "cover" VARCHAR(255); -- Adjust the data type and size as needed
  END IF;
END $$;
