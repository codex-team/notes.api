DO $$
BEGIN
  IF EXISTS(SELECT *
    FROM information_schema.columns
    WHERE table_name='editor_tools' and column_name='name' and column_name='pluginId')
  THEN
      ALTER TABLE IF EXISTS public.editor_tools RENAME COLUMN "name" TO "title";
      ALTER TABLE IF EXISTS public.editor_tools RENAME COLUMN "pluginId" TO "name";
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS(SELECT *
    FROM information_schema.columns
    WHERE table_name='editor_tools' and column_name='class')
  THEN
      ALTER TABLE IF EXISTS public.editor_tools RENAME COLUMN "class" TO "exportName";
  END IF;
END $$;

ALTER TABLE IF EXISTS public.editor_tools
    ADD COLUMN IF NOT EXISTS "isDefault" BOOLEAN;
