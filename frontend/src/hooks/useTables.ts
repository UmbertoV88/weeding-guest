import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Table, TableFormData, TableStats, SavedSeatingPlan } from '@/types/table';
import { useToast } from '@/hooks/use-toast';

export const useTables = () => {
  const [tables, setTables] = useState<Table[]>([]);
  const [seatingPlans, setSeatingPlans] = useState<SavedSeatingPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  // Fetch tables
  const fetchTables = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('tavoli')
        .select('*')
        .order('id', { ascending: true });

      if (error) throw error;
      setTables(data || []);
    } catch (err) {
      console.error('Error fetching tables:', err);
      setError(err instanceof Error ? err.message : 'Errore nel caricamento tavoli');
    } finally {
      setLoading(false);
    }
  };

  // Fetch seating plans
  const fetchSeatingPlans = async () => {
    try {
      const { data, error } = await supabase
        .from('piani_salvati')
        .select('*');

      if (error) throw error;
      setSeatingPlans(data || []);
    } catch (err) {
      console.error('Error fetching seating plans:', err);
    }
  };

  // Add new table
  const addTable = async (tableData: TableFormData): Promise<void> => {
    if (!user) throw new Error('User not authenticated');

    try {
      console.log('Creating table with data:', {
        nome_tavolo: tableData.nome_tavolo,
        capacita_max: tableData.capacita_max,
        lato: tableData.lato,
        user_id: user.id
      });

      const { data, error } = await supabase
        .from('tavoli')
        .insert({
          nome_tavolo: tableData.nome_tavolo,
          capacita_max: tableData.capacita_max,
          lato: tableData.lato,
          user_id: user.id, // Add user_id for RLS policy
        })
        .select()
        .single();

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      console.log('Table created successfully:', data);
      setTables(prev => [...prev, data]);
      toast({
        title: "Tavolo aggiunto!",
        description: `${tableData.nome_tavolo} è stato creato con successo.`,
      });
    } catch (err) {
      console.error('Error adding table:', err);
      throw err;
    }
  };

  // Update table
  const updateTable = async (tableId: number, tableData: TableFormData): Promise<void> => {
    try {
      const { data, error } = await supabase
        .from('tavoli')
        .update({
          nome_tavolo: tableData.nome_tavolo,
          capacita_max: tableData.capacita_max,
          lato: tableData.lato,
        })
        .eq('id', tableId)
        .select()
        .single();

      if (error) throw error;

      setTables(prev => prev.map(table => 
        table.id === tableId ? data : table
      ));
      
      toast({
        title: "Tavolo aggiornato!",
        description: `${tableData.nome_tavolo} è stato modificato con successo.`,
      });
    } catch (err) {
      console.error('Error updating table:', err);
      throw err;
    }
  };

  // Delete table
  const deleteTable = async (tableId: number): Promise<void> => {
    try {
      // First check if table has assigned guests
      const { data: assignedGuests } = await supabase
        .from('piani_salvati')
        .select('*')
        .eq('tavolo_id', tableId);

      if (assignedGuests && assignedGuests.length > 0) {
        throw new Error('Non puoi eliminare un tavolo con invitati assegnati');
      }

      const { error } = await supabase
        .from('tavoli')
        .delete()
        .eq('id', tableId);

      if (error) throw error;

      setTables(prev => prev.filter(table => table.id !== tableId));
      toast({
        title: "Tavolo eliminato",
        description: "Il tavolo è stato rimosso con successo.",
        variant: "destructive",
      });
    } catch (err) {
      console.error('Error deleting table:', err);
      throw err;
    }
  };

  // Get table statistics
  const getTableStats = (): TableStats => {
    const totalCapacity = tables.reduce((sum, table) => sum + table.capacita_max, 0);
    const occupiedSeats = seatingPlans.length;
    const availableSeats = totalCapacity - occupiedSeats;

    const bySide = tables.reduce((acc, table) => {
      const side = (table.lato || 'centro') as keyof typeof acc;
      acc[side] = (acc[side] || 0) + 1;
      return acc;
    }, { sposo: 0, sposa: 0, centro: 0 });

    return {
      total: tables.length,
      totalCapacity,
      occupiedSeats,
      availableSeats,
      bySide,
    };
  };

  // Assign guest to table
  const assignGuestToTable = async (guestId: number, tableId: number): Promise<void> => {
    try {
      // Check if guest is already assigned
      const { data: existing } = await supabase
        .from('piani_salvati')
        .select('*')
        .eq('invitato_id', guestId)
        .single();

      if (existing) {
        // Update existing assignment
        const { error } = await supabase
          .from('piani_salvati')
          .update({ tavolo_id: tableId })
          .eq('invitato_id', guestId);

        if (error) throw error;
      } else {
        // Create new assignment
        const { error } = await supabase
          .from('piani_salvati')
          .insert({
            invitato_id: guestId,
            tavolo_id: tableId,
          });

        if (error) throw error;
      }

      await fetchSeatingPlans();
      toast({
        title: "Invitato assegnato!",
        description: "L'invitato è stato assegnato al tavolo con successo.",
      });
    } catch (err) {
      console.error('Error assigning guest to table:', err);
      throw err;
    }
  };

  // Remove guest from table
  const removeGuestFromTable = async (guestId: number): Promise<void> => {
    try {
      const { error } = await supabase
        .from('piani_salvati')
        .delete()
        .eq('invitato_id', guestId);

      if (error) throw error;

      await fetchSeatingPlans();
      toast({
        title: "Invitato rimosso",
        description: "L'invitato è stato rimosso dal tavolo.",
      });
    } catch (err) {
      console.error('Error removing guest from table:', err);
      throw err;
    }
  };

  useEffect(() => {
    if (user) {
      fetchTables();
      fetchSeatingPlans();
    }
  }, [user]);

  return {
    tables,
    seatingPlans,
    loading,
    error,
    addTable,
    updateTable,
    deleteTable,
    getTableStats,
    assignGuestToTable,
    removeGuestFromTable,
    refetch: () => {
      fetchTables();
      fetchSeatingPlans();
    },
  };
};