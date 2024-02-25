-- Create "cover" column in note_settings table
DO $$
BEGIN
  IF NOT EXISTS(SELECT *
    FROM information_schema.columns
    WHERE table_name='note_settings' and column_name='cover')
  THEN
      ALTER TABLE "public"."note_settings" ADD COLUMN "cover" VARCHAR(255);
  END IF;
END $$;
