DO $$
BEGIN
  IF EXISTS(SELECT *
    FROM information_schema.columns
    WHERE table_name='note_settings' and column_name='enabled')
  THEN
      ALTER TABLE "public"."note_settings" RENAME COLUMN "enabled" TO "is_public";
  END IF;
END $$;
