--
-- Name: note-history; Type: TABLE; Schema: public; Owner: codex
--

CREATE TABLE IF NOT EXISTS public.note_history (
  id SERIAL PRIMARY KEY,
  note_id integer NOT NULL,
  user_id integer,
  created_at TIMESTAMP NOT NULL,
  content json,
  tools jsonb
);

--
-- Name: note_history note_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: codex
--
ALTER TABLE public.note_history DROP CONSTRAINT IF EXISTS note_id_fkey;
ALTER TABLE public.note_history
  ADD CONSTRAINT note_id_fkey FOREIGN KEY (note_id) REFERENCES public.notes(id)
  ON UPDATE CASCADE ON DELETE CASCADE;

--
-- Name: note_history user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: codex
--
ALTER TABLE public.note_history DROP CONSTRAINT IF EXISTS user_id_fkey;
ALTER TABLE public.note_history
  ADD CONSTRAINT user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
  ON UPDATE CASCADE ON DELETE CASCADE;

CREATE INDEX note_history_note_id_idx ON public.note_history (note_id);
