-- Create "sidebar_position" enum type
DO $$
BEGIN
  IF NOT EXISTS(SELECT *
    FROM pg_type
    WHERE typname='enum_note_settings_sidebar_position')
  THEN
      CREATE TYPE "public"."enum_note_settings_sidebar_position" AS ENUM ('edge', 'content', 'none');
  END IF;
END $$;

-- Create "sidebar_position" column in note_settings table
DO $$
BEGIN
  IF NOT EXISTS(SELECT *
    FROM information_schema.columns
    WHERE table_name='note_settings' and column_name='sidebar_position')
  THEN
      ALTER TABLE "public"."note_settings" ADD COLUMN "sidebar_position" "public"."enum_note_settings_sidebar_position" NOT NULL DEFAULT 'content';
  END IF;
END $$;
