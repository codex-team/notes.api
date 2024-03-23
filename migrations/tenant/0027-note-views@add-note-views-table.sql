--
-- Name: note_views; Type: TABLE; Schema: public; Owner: codex
--

CREATE TABLE IF NOT EXISTS public.note_views (
    id SERIAL PRIMARY KEY,
    user_id integer NOT NULL REFERENCES public.users(id)
    ON UPDATE CASCADE ON DELETE CASCADE,
    note_id integer NOT NULL REFERENCES public.notes(id)
    ON UPDATE CASCADE ON DELETE CASCADE,
    "visited_at" timestamp with time zone NOT NULL
);

--
-- Name note_views note_views_user_id_idx; Type: INDEX; Schema: public; Owner: codex 
--
CREATE UNIQUE INDEX note_views_user_id_idx ON public.note_views (user_id);

ALTER TABLE public.note_views OWNER TO codex;