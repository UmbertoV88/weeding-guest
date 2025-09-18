-- Enable full row data for realtime on invitati
ALTER TABLE public.invitati REPLICA IDENTITY FULL;

-- Ensure invitati table is included in the realtime publication
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'invitati'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.invitati;
  END IF;
END $$;