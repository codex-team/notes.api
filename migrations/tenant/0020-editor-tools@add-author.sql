-- Add the author column to the editor_tools table
DO $$
BEGIN
  IF NOT EXISTS(SELECT *
    FROM information_schema.columns
    WHERE table_name='editor_tools' AND column_name='author')
  THEN
    ALTER TABLE "public"."editor_tools" ADD COLUMN "author" integer;
    ALTER TABLE "public"."editor_tools" ADD CONSTRAINT "fk_author"
      FOREIGN KEY ("author") REFERENCES "public"."users" ("id");
  END IF;
END $$;
