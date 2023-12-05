--
-- Name: note_relations; Type: TABLE; Schema: public; Owner: codex
--

CREATE TABLE IF NOT EXISTS public.note_relations (
    id integer NOT NULL,
    note_id integer NOT NULL,
    parent_id integer NOT NULL
);

--
-- Name: note_relations relation_id; Type: PK CONSTRAINT; Schema: public; Owner: codex
--
ALTER TABLE public.note_relations DROP CONSTRAINT IF EXISTS note_relations_pkey;
ALTER TABLE public.note_relations 
    ADD CONSTRAINT relations_id_pkey PRIMARY KEY (id);

--
-- Name: note_relations child_note_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: codex
--
ALTER TABLE public.note_relations DROP CONSTRAINT IF EXISTS child_note_id_fkey;
ALTER TABLE public.note_relations 
    ADD CONSTRAINT child_note_id_fkey FOREIGN KEY (note_id) REFERENCES public.notes(id)
    ON UPDATE CASCADE ON DELETE CASCADE;

--
-- Name: note_relations parent_note_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: codex
--
ALTER TABLE public.note_relations DROP CONSTRAINT IF EXISTS parent_note_id_fkey;
ALTER TABLE public.note_relations
    ADD CONSTRAINT parent_note_id_fkey FOREIGN KEY (parent_id) REFERENCES public.notes(id)
    ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE public.note_relations OWNER TO codex;
