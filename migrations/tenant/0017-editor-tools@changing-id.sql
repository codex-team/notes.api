-- This migration script alters the data type of the id column to SERIAL
-- Make sure to run this after the initial migration where the table was created

-- Rename the table to avoid conflicts temporarily
ALTER TABLE public.editor_tools RENAME TO temp_editor_tools;

-- Create a new table with the same structure but with id column as SERIAL
CREATE TABLE public.editor_tools (
    id SERIAL PRIMARY KEY,
    name character varying(255) NOT NULL,
    export_name character varying(255) NOT NULL,
    source json NOT NULL,
    is_default BOOLEAN DEFAULT false
);

-- Copy data from the temporary table to the new table
INSERT INTO public.editor_tools (name, export_name, source, is_default)
SELECT name, export_name, source, is_default FROM temp_editor_tools;

-- Drop the temporary table
DROP TABLE temp_editor_tools;
