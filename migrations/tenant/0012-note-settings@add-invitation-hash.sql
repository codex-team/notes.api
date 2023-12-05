-- Create "invitation hash" column in note_settings table
DO $$
BEGIN
  IF NOT EXISTS(SELECT *
    FROM information_schema.columns
    WHERE table_name='note_settings' and column_name='invitation_hash')
  THEN
      ALTER TABLE "public"."note_settings" ADD COLUMN "invitation_hash" VARCHAR(255);
  END IF;
END $$;

-- Generate invitation hash for records with NULL invitation_hash
DO $$
BEGIN
  UPDATE "public"."note_settings"
  SET "invitation_hash" = SUBSTRING(CAST(GEN_RANDOM_UUID() AS VARCHAR), 1, 10)
  WHERE "invitation_hash" IS NULL;
END $$;

-- Makes the column 'invitation_hash' NOT NULL
DO $$
BEGIN
  ALTER TABLE "public"."note_settings" ALTER COLUMN "invitation_hash" SET NOT NULL;
END $$;
