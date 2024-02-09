CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

DO $$
BEGIN
  -- Add data for Header tool
  IF NOT EXISTS(SELECT * FROM public.editor_tools WHERE name = 'header')
  THEN
    INSERT INTO public.editor_tools (name, title, export_name, source, is_default)
    VALUES ('header', 'Heading', 'Header', '{"cdn": "https://cdn.jsdelivr.net/npm/@editorjs/header@2.8.1/dist/header.umd.min.js"}'::json, true);
  END IF;

  -- Add data for Paragraph tool
  IF NOT EXISTS(SELECT * FROM public.editor_tools WHERE name = 'paragraph')
  THEN
    INSERT INTO public.editor_tools (name, title, export_name, source, is_default)
    VALUES ('paragraph', 'Paragraph', 'Paragraph', '{"cdn": "https://cdn.jsdelivr.net/npm/@editorjs/paragraph@2.11.3/dist/paragraph.umd.min.js"}'::json, true);
  END IF;

  -- Add data for List tool
  IF NOT EXISTS(SELECT * FROM public.editor_tools WHERE name = 'list')
  THEN
    INSERT INTO public.editor_tools (name, title, export_name, source, is_default)
    VALUES ('list', 'List', 'List', '{"cdn": "https://cdn.jsdelivr.net/npm/@editorjs/list@1.9.0/dist/list.umd.min.js"}'::json, true);
  END IF;
END $$;
