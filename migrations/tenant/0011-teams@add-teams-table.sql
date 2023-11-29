--
-- Name: teams; Type: TABLE; Schema: public; Owner: codex
--

CREATE TABLE IF NOT EXISTS public.teams (
    id integer NOT NULL,
    user_id integer NOT NULL,
    note_id integer NOT NULL,
    role integer NOT NULL,
);

--
-- Name: teams relation_id; Type: PK CONSTRAINT; Schema: public; Owner: codex
--
ALTER TABLE public.note_relations DROP CONSTRAINT IF EXISTS relation_id_pkey;
ALTER TABLE public.note_relations 
    ADD CONSTRAINT relation_id PRIMARY KEY (id);

--
-- Name: teams user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: codex
--
ALTER TABLE public.note_relations DROP CONSTRAINT IF EXISTS user_id_fkey;
ALTER TABLE public.note_relations 
    ADD CONSTRAINT user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
    ON UPDATE CASCADE ON DELETE CASCADE;

--
-- Name: teams note_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: codex
--
ALTER TABLE public.note_relations DROP CONSTRAINT IF EXISTS note_id_fkey;
ALTER TABLE public.note_relations
    ADD CONSTRAINT note_id_fkey FOREIGN KEY (note-id) REFERENCES public.notes(id)
    ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE public.note_relations OWNER TO codex;
