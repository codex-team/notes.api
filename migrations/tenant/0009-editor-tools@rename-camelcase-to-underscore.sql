-- "editor_tools" table:

-- Rename column "isDefault" to "is_default" if "isDefault" exists and "is_default" not exists
DO $$
BEGIN
  IF EXISTS(SELECT *
    FROM information_schema.columns
    WHERE table_name='editor_tools' and column_name='isDefault')
  THEN
    IF NOT EXISTS(SELECT *
      FROM information_schema.columns
      WHERE table_name='editor_tools' and column_name='is_default')
    THEN
      ALTER TABLE "public"."editor_tools" RENAME COLUMN "isDefault" TO "is_default";
    END IF;
  END IF;
END $$;

-- Rename column "exportName" to "export_name" if "exportName" exists and "export_name" not exists
DO $$
BEGIN
  IF EXISTS(SELECT *
    FROM information_schema.columns
    WHERE table_name='editor_tools' and column_name='exportName')
  THEN
    IF NOT EXISTS(SELECT *
      FROM information_schema.columns
      WHERE table_name='editor_tools' and column_name='export_name')
    THEN
      ALTER TABLE "public"."editor_tools" RENAME COLUMN "exportName" TO "export_name";
    END IF;
  END IF;
END $$;
