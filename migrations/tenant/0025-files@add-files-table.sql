--
-- Name: files; Type: TABLE; Schema: public; Owner: codex
--

CREATE TABLE IF NOT EXISTS public.files (
    id integer NOT NULL,
    user_id integer,
    note_id integer,
    name character varying(255) NOT NULL,
    key character varying(255) NOT NULL UNIQUE,
    uploaded_at timestamp with time zone NOT NULL,
    extension character varying(255) NOT NULL,
    type integer NOT NULL
);

--
-- Name: files files_id_pkey; Type: PK CONSTRAINT; Schema: public; Owner: codex
--
ALTER TABLE public.files DROP CONSTRAINT IF EXISTS files_pkey;
ALTER TABLE public.files
    ADD CONSTRAINT files_pkey PRIMARY KEY (id);

--
-- Name: files user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: codex
--
ALTER TABLE public.files DROP CONSTRAINT IF EXISTS user_id_fkey;
ALTER TABLE public.files
    ADD CONSTRAINT user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
    ON UPDATE CASCADE ON DELETE CASCADE;

--
-- Name: files note_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: codex
--
ALTER TABLE public.files DROP CONSTRAINT IF EXISTS note_id_fkey;
ALTER TABLE public.files
    ADD CONSTRAINT note_id_fkey FOREIGN KEY (note_id) REFERENCES public.notes(id)
    ON UPDATE CASCADE ON DELETE CASCADE;

CREATE UNIQUE INDEX files_key_idx ON public.files (key);

ALTER TABLE public.files OWNER TO codex;
