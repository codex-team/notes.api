-- Add the author column to the editor_tools table
DO $$
BEGIN
  IF NOT EXISTS(SELECT *
    FROM information_schema.columns
    WHERE table_name='editor_tools' AND column_name='user_id')
  THEN
    ALTER TABLE "public"."editor_tools" ADD COLUMN "user_id" integer;
    ALTER TABLE "public"."editor_tools" ADD CONSTRAINT "fk_author"
      FOREIGN KEY ("user_id") REFERENCES "public"."users" ("id");
  END IF;
END $$;
