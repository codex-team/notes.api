-- Change role type to note teams from integer to string
ALTER TABLE public.note_teams ALTER COLUMN role TYPE varchar(255);
