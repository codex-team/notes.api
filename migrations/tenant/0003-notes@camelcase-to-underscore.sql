-- Rename column "createdAt" to "created_at" if exists
DO $$
BEGIN
  IF EXISTS(SELECT *
    FROM information_schema.columns
    WHERE table_name='notes' and column_name='createdAt')
  THEN
      ALTER TABLE "public"."notes" RENAME COLUMN "createdAt" TO "created_at";
  END IF;
END $$;

-- Rename column "updatedAt" to "updated_at" if exists
DO $$
BEGIN
  IF EXISTS(SELECT *
    FROM information_schema.columns
    WHERE table_name='notes' and column_name='createdAt')
  THEN
      ALTER TABLE "public"."notes" RENAME COLUMN "updatedAt" TO "updated_at";
  END IF;
END $$;
