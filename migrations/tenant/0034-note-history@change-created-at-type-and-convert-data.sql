DO $$
BEGIN
    -- Check if field created_at exists in public.note_history
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'note_history'
          AND column_name = 'created_at'
    ) THEN
        -- Changing field type to timestamp with time zone
        ALTER TABLE public.note_history
        ALTER COLUMN created_at TYPE timestamp with time zone
        USING created_at AT TIME ZONE 'UTC';

        -- Update current values of created_at field
        UPDATE public.note_history
        SET created_at = created_at AT TIME ZONE 'UTC' AT TIME ZONE 'Europe/Moscow'; -- Замените 'Europe/Moscow' на нужный вам часовой пояс
    END IF;
END $$;
