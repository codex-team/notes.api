-- Add column "tools" to "notes" if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS(SELECT *
    FROM information_schema.columns
    WHERE table_name='notes' AND column_name='tools')
  THEN
    ALTER TABLE "public"."notes" ADD COLUMN "tools" jsonb; -- Adjust the data type and size as needed
  END IF;
END $$;
