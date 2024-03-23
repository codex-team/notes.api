--
-- Name: note_views; Type: TABLE; Schema: public; Owner: codex
--

CREATE TABLE IF NOT EXISTS public.note_views (
    id integer NOT NULL,
    user_id integer NOT NULL,
    note_id integer NOT NULL,
    "interaction_time" timestamp with time zone NOT NULL
);

--
-- Name: note_views note_views_pkey; Type: PK CONSTRAINT; Schema: public; Owner: codex
--
ALTER TABLE public.note_views DROP CONSTRAINT IF EXISTS note_views_pkey;
ALTER TABLE public.note_views
    ADD CONSTRAINT note_view_pkey PRIMARY KEY (id);

--
-- Name: note_view user_id_fkey; Type: FK CONSTRAINT; Shema: public; Owner: codex
-- 
ALTER TABLE public.note_views DROP CONSTRAINT IF EXISTS user_id_fkey;
ALTER TABLE public.note_views 
    ADD CONSTRAINT user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
    ON UPDATE CASCADE ON DELETE CASCADE;

--
-- Name note_view note_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: codex
--
ALTER TABLE public.note_views DROP CONSTRAINT IF EXISTS note_id_fkey;
ALTER TABLE public.note_views
    ADD CONSTRAINT note_id_fkey FOREIGN KEY (note_id) REFERENCES public.notes(id)
    ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE public.note_views OWNER TO codex;