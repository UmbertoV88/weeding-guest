-- Script per correggere la tabella tavoli nel database Supabase
-- PROBLEMA: Manca la colonna user_id necessaria per RLS e isolamento dati utente

-- 1. Aggiungi colonna user_id alla tabella tavoli
ALTER TABLE tavoli ADD COLUMN user_id uuid;

-- 2. Abilita Row Level Security sulla tabella tavoli
ALTER TABLE tavoli ENABLE ROW LEVEL SECURITY;

-- 3. Crea policy per permettere agli utenti di accedere solo ai propri tavoli
CREATE POLICY "Users can access their own tables" ON tavoli
FOR ALL
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- 4. (Opzionale) Se ci sono già tavoli esistenti, imposta un user_id di default
-- ATTENZIONE: Eseguire solo se ci sono tavoli esistenti che devono essere assegnati a un utente
-- UPDATE tavoli SET user_id = 'UUID_UTENTE_ESISTENTE' WHERE user_id IS NULL;

-- 5. (Opzionale) Rendi la colonna user_id NOT NULL dopo aver impostato i valori
-- ALTER TABLE tavoli ALTER COLUMN user_id SET NOT NULL;

-- Verifica finale: Controlla la struttura della tabella
-- SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_name = 'tavoli';

-- Verifica le policy RLS
-- SELECT * FROM pg_policies WHERE tablename = 'tavoli';