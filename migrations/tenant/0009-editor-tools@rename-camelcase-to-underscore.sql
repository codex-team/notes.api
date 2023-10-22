/*
 Rename columns in "editor_tools" table:
*/
-- Rename column "isDefault" to "is_default" if exists
DO $$
BEGIN
  IF EXISTS(SELECT *
    FROM information_schema.columns
    WHERE table_name='editor_tools' and column_name='isDefault')
  THEN
    ALTER TABLE "public"."editor_tools" RENAME COLUMN "isDefault" TO "is_default";
  END IF;
END $$;

-- Rename column "exportName" to "export_name" if exists
DO $$
BEGIN
  IF EXISTS(SELECT *
    FROM information_schema.columns
    WHERE table_name='editor_tools' and column_name='exportName')
  THEN
    ALTER TABLE "public"."editor_tools" RENAME COLUMN "exportName" TO "export_name";
  END IF;
END $$;
