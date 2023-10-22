DO $$
BEGIN
  IF EXISTS(SELECT *
    FROM information_schema.columns
    WHERE table_name='note_settings' and column_name='enabled')
  THEN
      ALTER TABLE "public"."note_settings" RENAME COLUMN "enables" TO "is_public";
  END IF;
END $$;
