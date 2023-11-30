--
-- Name: teams; Type: TABLE; Schema: public; Owner: codex
--

CREATE TABLE IF NOT EXISTS public.teams (
    id integer NOT NULL,
    user_id integer NOT NULL,
    note_id integer NOT NULL,
    role integer NOT NULL
);

--
-- Name: teams relation_id_pkey; Type: PK CONSTRAINT; Schema: public; Owner: codex
--
ALTER TABLE public.teams DROP CONSTRAINT IF EXISTS relation_id_pkey;
ALTER TABLE public.teams 
    ADD CONSTRAINT relation_id_pkey PRIMARY KEY (id);

--
-- Name: teams user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: codex
--
ALTER TABLE public.teams DROP CONSTRAINT IF EXISTS user_id_fkey;
ALTER TABLE public.teams 
    ADD CONSTRAINT user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
    ON UPDATE CASCADE ON DELETE CASCADE;

--
-- Name: teams note_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: codex
--
ALTER TABLE public.teams DROP CONSTRAINT IF EXISTS note_id_fkey;
ALTER TABLE public.teams
    ADD CONSTRAINT note_id_fkey FOREIGN KEY (note_id) REFERENCES public.notes(id)
    ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE public.teams OWNER TO codex;