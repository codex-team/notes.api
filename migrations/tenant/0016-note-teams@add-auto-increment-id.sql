CREATE SEQUENCE IF NOT EXISTS public.note_teams_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER TABLE public.note_teams_id_seq OWNER TO codex;

ALTER SEQUENCE public.note_teams_id_seq OWNED BY public.note_teams.id;

-- Make identifier default value incrementing
ALTER TABLE ONLY public.note_teams ALTER COLUMN id SET DEFAULT nextval('public.note_teams_id_seq'::regclass);
