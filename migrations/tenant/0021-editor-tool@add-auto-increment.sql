CREATE SEQUENCE IF NOT EXISTS public.editor_tools_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


-- Make identifier default value incrementing
ALTER TABLE ONLY public.editor_tools ALTER COLUMN id SET DEFAULT nextval('public.editor_tools_id_seq'::regclass);
