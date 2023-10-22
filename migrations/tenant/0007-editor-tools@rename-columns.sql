ALTER TABLE IF EXISTS public.editor_tools
    RENAME COLUMN "name" TO "title";

ALTER TABLE IF EXISTS public.editor_tools
    RENAME COLUMN "pluginId" TO "name";

ALTER TABLE IF EXISTS public.editor_tools
    RENAME COLUMN "class" TO "exportName";

ALTER TABLE IF EXISTS public.editor_tools
    ADD COLUMN IF NOT EXISTS "isDefault" BOOLEAN;
