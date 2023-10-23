
-- Adds "editor_tools" column at "users" if not exists
DO $$
BEGIN
  IF NOT EXISTS(SELECT *
    FROM information_schema.columns
    WHERE table_name='users' and column_name='editor_tools')
  THEN
    ALTER TABLE "public"."users" ADD COLUMN "editor_tools" jsonb;
  END IF;
END $$;

-- Removes "extensions" column at "users" if exists
DO $$
BEGIN
  IF EXISTS(SELECT *
    FROM information_schema.columns
    WHERE table_name='users' and column_name='extensions')
  THEN
    ALTER TABLE "public"."users" DROP COLUMN "extensions";
  END IF;
END $$;
