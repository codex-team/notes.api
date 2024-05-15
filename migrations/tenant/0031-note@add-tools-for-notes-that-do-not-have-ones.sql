DO $$
DECLARE
    note_record RECORD;
BEGIN
    -- Обходим каждую запись в таблице
    FOR note_record IN SELECT * FROM public.notes LOOP
        -- Обновляем поле tools для каждой записи
        UPDATE public.notes
        SET tools = (
            SELECT jsonb_agg(jsonb_build_object('id', tool.id, 'name', tool.name))
            FROM (
                SELECT DISTINCT block->>'type' AS type
                FROM json_array_elements(note_record.content->'blocks') AS block
            ) AS content
            JOIN public.editor_tools tool ON content.type = tool.name
        )
        WHERE id = note_record.id; -- Обновляем только текущую запись
    END LOOP;
END $$;
