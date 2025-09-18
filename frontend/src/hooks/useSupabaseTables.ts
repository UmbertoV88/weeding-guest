import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { AdvancedTable } from '@/types/table';
import { useToast } from '@/hooks/use-toast';

// Hook per gestire i tavoli dal database Supabase reale
export const useSupabaseTables = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [tables, setTables] = useState<AdvancedTable[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Recupera tavoli dal database
  const fetchTables = useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Query per recuperare i tavoli dell'utente
      const { data: tavoliData, error: queryError } = await supabase
        .from('tavoli')
        .select(`
          id,
          nome_tavolo,
          capacita_max,
          lato,
          created_at
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (queryError) {
        throw queryError;
      }

      // Mappa i dati dal database al formato AdvancedTable
      const mappedTables: AdvancedTable[] = (tavoliData || []).map(tavolo => ({
        id: tavolo.id.toString(),
        name: tavolo.nome_tavolo || `Tavolo ${tavolo.id}`,
        shape: 'round' as const, // Default shape
        seats: tavolo.capacita_max,
        x: 200 + (parseInt(tavolo.id.toString()) % 3) * 200, // Distribuzione orizzontale
        y: 150 + Math.floor(parseInt(tavolo.id.toString()) / 3) * 150, // Distribuzione verticale
        assignedGuests: [], // Sarà gestito dal sistema
        user_id: user.id,
        lato: (tavolo.lato as 'sposo' | 'sposa' | 'centro') || 'centro', // Mappa il lato dal DB
        created_at: tavolo.created_at
      }));

      setTables(mappedTables);
      
      console.log(`✅ Recuperati ${mappedTables.length} tavoli dal database`);
      
    } catch (err) {
      console.error('❌ Errore nel recupero tavoli:', err);
      setError(err instanceof Error ? err.message : 'Errore sconosciuto');
      
      toast({
        title: "Errore nel caricamento tavoli",
        description: "Impossibile recuperare i tavoli dal database.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [user?.id, toast]);

  // Crea un nuovo tavolo nel database
  const createTable = useCallback(async (tableData: Omit<AdvancedTable, 'id' | 'user_id' | 'assignedGuests'>) => {
    if (!user?.id) return null;

    try {
      const { data, error } = await supabase
        .from('tavoli')
        .insert({
          nome_tavolo: tableData.name,
          capacita_max: tableData.seats,
          lato: (tableData as any).side || 'centro',
          user_id: user.id
        })
        .select()
        .single();

      if (error) throw error;

      // Aggiungi il nuovo tavolo allo stato locale
      const newTable: AdvancedTable = {
        id: data.id.toString(),
        name: data.nome_tavolo || `Tavolo ${data.id}`,
        shape: tableData.shape,
        seats: data.capacita_max,
        x: tableData.x,
        y: tableData.y,
        assignedGuests: [],
        user_id: user.id,
        created_at: data.created_at
      };

      setTables(prev => [...prev, newTable]);

      toast({
        title: "Tavolo creato",
        description: `${newTable.name} è stato aggiunto al database.`
      });

      return newTable;
    } catch (err) {
      console.error('❌ Errore nella creazione tavolo:', err);
      toast({
        title: "Errore creazione tavolo",
        description: "Impossibile creare il tavolo nel database.",
        variant: "destructive"
      });
      return null;
    }
  }, [user?.id, toast]);

  // Aggiorna un tavolo nel database
  const updateTable = useCallback(async (tableId: string, updates: Partial<AdvancedTable>) => {
    if (!user?.id) return false;

    try {
      const dbUpdates: any = {};
      
      if (updates.name !== undefined) dbUpdates.nome_tavolo = updates.name;
      if (updates.seats !== undefined) dbUpdates.capacita_max = updates.seats;
      if ((updates as any).side !== undefined) dbUpdates.lato = (updates as any).side;

      // Aggiorna nel database solo se ci sono campi da aggiornare per il DB
      if (Object.keys(dbUpdates).length > 0) {
        const { error } = await supabase
          .from('tavoli')
          .update(dbUpdates)
          .eq('id', parseInt(tableId))
          .eq('user_id', user.id);

        if (error) throw error;
      }

      // Aggiorna lo stato locale
      setTables(prev => prev.map(table => 
        table.id === tableId 
          ? { ...table, ...updates }
          : table
      ));

      return true;
    } catch (err) {
      console.error('❌ Errore nell\'aggiornamento tavolo:', err);
      toast({
        title: "Errore aggiornamento tavolo",
        description: "Impossibile aggiornare il tavolo nel database.",
        variant: "destructive"
      });
      return false;
    }
  }, [user?.id, toast]);

  // Elimina un tavolo dal database
  const deleteTable = useCallback(async (tableId: string) => {
    if (!user?.id) return false;

    try {
      const { error } = await supabase
        .from('tavoli')
        .delete()
        .eq('id', parseInt(tableId))
        .eq('user_id', user.id);

      if (error) throw error;

      // Rimuovi dallo stato locale
      setTables(prev => prev.filter(table => table.id !== tableId));

      toast({
        title: "Tavolo eliminato",
        description: "Il tavolo è stato rimosso dal database."
      });

      return true;
    } catch (err) {
      console.error('❌ Errore nell\'eliminazione tavolo:', err);
      toast({
        title: "Errore eliminazione tavolo",
        description: "Impossibile eliminare il tavolo dal database.",
        variant: "destructive"
      });
      return false;
    }
  }, [user?.id, toast]);

  // Carica tavoli quando il componente si monta o cambia utente
  useEffect(() => {
    fetchTables();
  }, [fetchTables]);

  // Statistiche tavoli
  const tableStats = {
    total: tables.length,
    totalCapacity: tables.reduce((sum, table) => sum + table.seats, 0),
    averageCapacity: tables.length > 0 ? Math.round(tables.reduce((sum, table) => sum + table.seats, 0) / tables.length) : 0
  };

  return {
    tables,
    loading,
    error,
    createTable,
    updateTable,
    deleteTable,
    tableStats,
    refetch: fetchTables
  };
};

export default useSupabaseTables;