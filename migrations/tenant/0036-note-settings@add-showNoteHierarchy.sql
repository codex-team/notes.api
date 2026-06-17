DO $$
BEGIN
  IF NOT EXISTS (
    SELECT *
    FROM information_schema.columns
    WHERE table_name = 'note_settings' AND column_name = 'show_note_hierarchy'
  ) THEN
    ALTER TABLE "public"."note_settings"
    ADD COLUMN "show_note_hierarchy" BOOLEAN NOT NULL DEFAULT false;
  END IF;
END $$;