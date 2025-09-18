import { useState, useMemo, useCallback } from 'react';
import { TableGuest } from '@/types/table';

// Hook personalizzato per gestire gli ospiti confermati nella sezione tavoli
export const useConfirmedGuests = (allGuests: TableGuest[]) => {
  
  // Filtra automaticamente solo gli ospiti confermati
  const confirmedGuests = useMemo(() => {
    return allGuests.filter(guest => guest.confermato === true);
  }, [allGuests]);

  // Statistiche degli ospiti confermati
  const guestStats = useMemo(() => {
    const assigned = confirmedGuests.filter(guest => guest.tableId);
    const unassigned = confirmedGuests.filter(guest => !guest.tableId);
    
    return {
      total: confirmedGuests.length,
      assigned: assigned.length,
      unassigned: unassigned.length,
      assignedPercentage: confirmedGuests.length > 0 ? Math.round((assigned.length / confirmedGuests.length) * 100) : 0
    };
  }, [confirmedGuests]);

  // Funzione per ottenere ospiti per categoria (solo confermati)
  const getGuestsByCategory = useCallback((category: string) => {
    return confirmedGuests.filter(guest => guest.category === category);
  }, [confirmedGuests]);

  // Funzione per ottenere ospiti non assegnati (solo confermati)
  const getUnassignedGuests = useCallback(() => {
    return confirmedGuests.filter(guest => !guest.tableId);
  }, [confirmedGuests]);

  // Funzione per ottenere ospiti assegnati a un tavolo specifico
  const getGuestsForTable = useCallback((tableId: string) => {
    return confirmedGuests.filter(guest => guest.tableId === tableId);
  }, [confirmedGuests]);

  // Funzione per verificare se un ospite ha allergie/restrizioni
  const getGuestsWithDietaryRestrictions = useCallback(() => {
    return confirmedGuests.filter(guest => guest.dietaryRestrictions && guest.dietaryRestrictions.trim() !== '');
  }, [confirmedGuests]);

  return {
    confirmedGuests,
    guestStats,
    getGuestsByCategory,
    getUnassignedGuests,
    getGuestsForTable,
    getGuestsWithDietaryRestrictions
  };
};

export default useConfirmedGuests;