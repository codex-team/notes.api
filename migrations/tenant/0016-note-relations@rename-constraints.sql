-- rename note_relations
DO $$
BEGIN
  IF EXISTS(SELECT *
    FROM information_schema.table_constraints
    WHERE table_name='note_relations' and constraint_name='relation_id')
  THEN 
    ALTER TABLE public.note_relations
    RENAME CONSTRAINT "relation_id" TO "note_relations_pkey";
  END IF;
END $$; 