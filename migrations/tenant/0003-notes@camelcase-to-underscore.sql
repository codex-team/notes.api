ALTER TABLE IF EXISTS public.notes
    RENAME "createdAt" TO created_at;

ALTER TABLE IF EXISTS public.notes
    RENAME "updatedAt" TO updated_at;
