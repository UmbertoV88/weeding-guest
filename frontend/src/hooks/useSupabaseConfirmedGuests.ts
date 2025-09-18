import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { TableGuest } from '@/types/table';
import { useToast } from '@/hooks/use-toast';

// Hook per recuperare SOLO gli ospiti confermati dal database Supabase
export const useSupabaseConfirmedGuests = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [confirmedGuests, setConfirmedGuests] = useState<TableGuest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Recupera ospiti confermati dal database
  const fetchConfirmedGuests = useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Query per recuperare SOLO ospiti confermati (confermato = TRUE)
      const { data: invitati, error: queryError } = await supabase
        .from('invitati')
        .select(`
          id,
          nome_visualizzato,
          cognome,
          note,
          gruppo,
          confermato,
          user_id,
          unita_invito_id
        `)
        .eq('user_id', user.id)
        .eq('confermato', true) // SOLO ospiti confermati
        .order('nome_visualizzato');

      if (queryError) {
        throw queryError;
      }

      // Mappa i dati dal database al formato TableGuest
      const mappedGuests: TableGuest[] = (invitati || []).map(invitato => ({
        id: invitato.id.toString(),
        name: invitato.nome_visualizzato,
        email: '', // Email non presente nella tabella invitati
        category: invitato.gruppo || 'Altri invitati',
        dietaryRestrictions: invitato.note || undefined,
        tableId: undefined, // Sarà gestito dal sistema tavoli
        seatNumber: undefined,
        user_id: invitato.user_id,
        confermato: true // Già filtrato nel query
      }));

      setConfirmedGuests(mappedGuests);
      
      console.log(`✅ Recuperati ${mappedGuests.length} ospiti confermati dal database`);
      
    } catch (err) {
      console.error('❌ Errore nel recupero ospiti confermati:', err);
      setError(err instanceof Error ? err.message : 'Errore sconosciuto');
      
      toast({
        title: "Errore nel caricamento ospiti",
        description: "Impossibile recuperare gli ospiti confermati dal database.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [user?.id, toast]);

  // Carica ospiti quando il componente si monta o cambia utente
  useEffect(() => {
    fetchConfirmedGuests();
  }, [fetchConfirmedGuests]);

  // Aggiorna assegnazione tavolo per un ospite
  const updateGuestTableAssignment = useCallback(async (guestId: string, tableId: string | undefined, seatNumber?: number) => {
    // Aggiorna lo stato locale immediatamente per UX responsiva
    setConfirmedGuests(prevGuests => 
      prevGuests.map(guest => 
        guest.id === guestId 
          ? { ...guest, tableId, seatNumber }
          : guest
      )
    );

    // TODO: Implementare salvataggio in database se necessario
    // Per ora manteniamo solo lo stato locale del piano tavoli
    console.log(`Ospite ${guestId} assegnato al tavolo ${tableId}`);
  }, []);

  // Statistiche ospiti confermati
  const guestStats = {
    total: confirmedGuests.length,
    assigned: confirmedGuests.filter(g => g.tableId).length,
    unassigned: confirmedGuests.filter(g => !g.tableId).length
  };

  return {
    confirmedGuests,
    loading,
    error,
    guestStats,
    updateGuestTableAssignment,
    refetch: fetchConfirmedGuests
  };
};

export default useSupabaseConfirmedGuests;