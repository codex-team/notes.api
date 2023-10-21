ALTER TABLE IF EXISTS public.notes_settings
    RENAME COLUMN IF EXISTS enabled TO is_public;
```