-- Create "sidebar_position" column in note_settings table
DO $$
BEGIN
  IF NOT EXISTS(SELECT *
    FROM information_schema.columns
    WHERE table_name='note_settings' and column_name='sidebar_position')
  THEN
      ALTER TABLE "public"."note_settings" ADD COLUMN "sidebar_position" VARCHAR(255) NOT NULL DEFAULT 'content';
  END IF;
END $$;
