-- Add column "title" to "editor_tools" if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS(SELECT *
    FROM information_schema.columns
    WHERE table_name='editor_tools' AND column_name='title')
  THEN
    ALTER TABLE "public"."editor_tools" ADD COLUMN "title" VARCHAR(255); -- Adjust the data type and size as needed
  END IF;
END $$;
