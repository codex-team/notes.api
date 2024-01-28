CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

DO $$
BEGIN
  -- Add data for Header tool
  IF NOT EXISTS(SELECT * FROM public.editor_tools WHERE name = 'header')
  THEN
    INSERT INTO public.editor_tools (id, name, title, export_name, source, is_default)
    VALUES (uuid_generate_v4(), 'header', 'Heading', 'Header', '{"cdn": "https://cdn.jsdelivr.net/npm/@editorjs/header@2.8.1/dist/header.umd.min.js"}'::json, true);
  END IF;

  -- Add data for Paragraph tool
  IF NOT EXISTS(SELECT * FROM public.editor_tools WHERE name = 'paragraph')
  THEN
    INSERT INTO public.editor_tools (id, name, title, export_name, source, is_default)
    VALUES (uuid_generate_v4(), 'paragraph', 'Paragraph', 'Paragraph', '{"cdn": "https://cdn.jsdelivr.net/npm/@editorjs/paragraph@2.11.3/dist/paragraph.umd.min.js"}'::json, true);
  END IF;

  -- Add data for List tool
  IF NOT EXISTS(SELECT * FROM public.editor_tools WHERE name = 'list')
  THEN
    INSERT INTO public.editor_tools (id, name, title, export_name, source, is_default)
    VALUES (uuid_generate_v4(), 'list', 'List', 'NestedList', '{"cdn": "https://cdn.jsdelivr.net/npm/@editorjs/nested-list@1.4.2/dist/nested-list.umd.min.js"}'::json, true);
  END IF;
END $$;
