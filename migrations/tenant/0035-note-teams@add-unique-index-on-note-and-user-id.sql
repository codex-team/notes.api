-- remove exists duplicate entries from database
DELETE FROM note_teams
WHERE id IN (
  SELECT id
  FROM (
    SELECT 
      id,
      ROW_NUMBER() OVER (
        PARTITION BY note_id, user_id 
        ORDER BY id
      ) AS row_num
    FROM note_teams
  ) AS duplicates
  WHERE duplicates.row_num > 1
);

-- adds unique index
CREATE UNIQUE INDEX IF NOT EXISTS note_teams_note_id_user_id_unique_idx
ON public.note_teams (note_id, user_id);