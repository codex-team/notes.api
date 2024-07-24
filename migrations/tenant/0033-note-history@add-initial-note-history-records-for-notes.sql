-- Insert note history records for notes that do not have them
INSERT INTO public.note_history (note_id, user_id, tools, content)
  SELECT n.id, n.creator_id, n.tools, n.content
    FROM public.notes n
    LEFT JOIN public.note_history nh ON n.id = nh.note_id
      WHERE nh.note_id IS NULL;
