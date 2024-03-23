--
-- Name: note_visits; Type: TABLE; Schema: public; Owner: codex
--

CREATE TABLE IF NOT EXISTS public.note_visits (
    id SERIAL PRIMARY KEY,
    user_id integer NOT NULL REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE,
    note_id integer NOT NULL REFERENCES public.notes(id) ON UPDATE CASCADE ON DELETE CASCADE,
    "visited_at" timestamp with time zone NOT NULL
);

--
-- Name note_visits note_visits_user_id_idx; Type: INDEX; Schema: public; Owner: codex 
--
CREATE UNIQUE INDEX note_visits_user_id_idx ON public.note_visits (user_id);

ALTER TABLE public.note_visits OWNER TO codex;