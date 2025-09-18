import React, { useState, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Plus, Users, Layout, Settings, Download, Eye, ArrowLeft, Loader2, Trash2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import CommonHeader from '@/components/CommonHeader';
import FloorPlanCanvas from './FloorPlanCanvas';
import TableGuestList from './TableGuestList';
import TableManager from './TableManager';
import { useSupabaseConfirmedGuests } from '@/hooks/useSupabaseConfirmedGuests';
import { useSupabaseTables } from '@/hooks/useSupabaseTables';
import { AdvancedTable, Venue, TableShape } from '@/types/table';

// Categorie ospiti standard
const defaultGuestCategories: string[] = [
  "Famiglia dello sposo",
  "Famiglia della sposa", 
  "Amici dello sposo",
  "Amici della sposa",
  "Colleghi",
  "Altri invitati"
];

const mockTables: AdvancedTable[] = [
  {
    id: "t1",
    name: "Tavolo 1",
    shape: "round",
    seats: 8,
    x: 200,
    y: 150,
    assignedGuests: ["g3", "g4", "g5"],
    user_id: ""
  },
  {
    id: "t2",
    name: "Tavolo 2",
    shape: "round",
    seats: 6,
    x: 400,
    y: 200,
    assignedGuests: [],
    user_id: ""
  },
  {
    id: "t3",
    name: "Tavolo 3",
    shape: "rectangular",
    seats: 10,
    x: 600,
    y: 150,
    assignedGuests: [],
    user_id: ""
  }
];

const mockVenue: Venue = {
  id: "v1",
  name: "Villa Rosa - Sala Principale",
  width: 1000,
  height: 600,
  elements: [], // Rimossi palco e pista da ballo
  user_id: ""
};

const mockGuestCategories: string[] = [
  "Famiglia dello sposo",
  "Famiglia della sposa",
  "Amici dello sposo",
  "Amici della sposa",
  "Colleghi",
  "Altri invitati"
];

const mockTableShapes: TableShape[] = [
  { id: "round", name: "Rotondo", maxSeats: 12 },
  { id: "rectangular", name: "Rettangolare", maxSeats: 16 },
  { id: "square", name: "Quadrato", maxSeats: 8 }
];

const TablePlanner: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // Hook per recuperare ospiti confermati dal database reale
  const { 
    confirmedGuests, 
    loading: guestsLoading, 
    error: guestsError, 
    guestStats,
    updateGuestTableAssignment 
  } = useSupabaseConfirmedGuests();

  // Hook per recuperare tavoli dal database reale
  const {
    tables: dbTables,
    loading: tablesLoading,
    error: tablesError,
    createTable: createDbTable,
    updateTable: updateDbTable,
    deleteTable: deleteDbTable,
    tableStats
  } = useSupabaseTables();
  
  const [guests, setGuests] = useState(confirmedGuests);
  // Usa direttamente i tavoli dal database invece dello stato locale per evitare problemi di sincronizzazione
  const tables = dbTables;
  const [venue, setVenue] = useState<Venue>(mockVenue);
  const [selectedTable, setSelectedTable] = useState<AdvancedTable | null>(null);
  const [selectedGuest, setSelectedGuest] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<string>('guests');
  const [viewMode, setViewMode] = useState<'design' | 'preview'>('design');
  const [tableToDelete, setTableToDelete] = useState<AdvancedTable | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Aggiorna stato locale quando cambiano gli ospiti dal database
  useEffect(() => {
    setGuests(confirmedGuests);
  }, [confirmedGuests]);

  // Initialize with user data
  useEffect(() => {
    if (user) {
      setVenue(prev => ({ ...prev, user_id: user.id }));
    }
  }, [user]);

  // Handle guest assignment to table - Aggiornato per usare hook database
  const handleGuestAssignment = useCallback((guestId: string, tableId: string, seatNumber?: number) => {
    // Aggiorna stato locale per UI reattiva
    setGuests(prev => prev.map(guest => 
      guest.id === guestId 
        ? { ...guest, tableId, seatNumber }
        : guest
    ));
    
    // Aggiorna tavoli
    setTables(prev => prev.map(table => {
      if (table.id === tableId) {
        const updatedGuests = [...table.assignedGuests];
        if (!updatedGuests.includes(guestId)) {
          updatedGuests.push(guestId);
        }
        return { ...table, assignedGuests: updatedGuests };
      }
      return {
        ...table,
        assignedGuests: table.assignedGuests.filter(id => id !== guestId)
      };
    }));

    // Aggiorna nel hook database
    updateGuestTableAssignment(guestId, tableId, seatNumber);

    toast({
      title: "Ospite assegnato",
      description: `L'ospite confermato è stato assegnato al tavolo con successo.`
    });
  }, [toast, updateGuestTableAssignment]);

  // Handle table updates - Usa direttamente il database
  const handleTableUpdate = useCallback(async (tableId: string, updates: Partial<AdvancedTable>) => {
    // Aggiorna direttamente nel database - il hook aggiornerà automaticamente i dati
    await updateDbTable(tableId, updates);
  }, [updateDbTable]);

  // Handle table creation - Aggiornato per usare database reale
  const handleCreateTable = useCallback(async (tableData: Omit<AdvancedTable, 'id' | 'user_id' | 'assignedGuests'>) => {
    const newTable = await createDbTable(tableData);
    if (newTable) {
      // Il nuovo tavolo è già stato aggiunto allo stato dal hook
      console.log(`✅ Tavolo creato nel database: ${newTable.name}`);
    }
  }, [createDbTable]);

  // Handle table deletion request - Apre il modal di conferma
  const handleDeleteTableRequest = useCallback((tableId: string) => {
    const tableToDelete = tables.find(t => t.id === tableId);
    if (tableToDelete) {
      setTableToDelete(tableToDelete);
      setIsDeleteDialogOpen(true);
    }
  }, [tables]);

  // Handle confirmed table deletion
  const handleConfirmDeleteTable = useCallback(async () => {
    if (!tableToDelete) return;

    // Remove guests from deleted table
    setGuests(prev => prev.map(guest => 
      guest.tableId === tableToDelete.id 
        ? { ...guest, tableId: undefined, seatNumber: undefined }
        : guest
    ));
    
    // Elimina dal database - il hook aggiornerà automaticamente la lista
    const success = await deleteDbTable(tableToDelete.id);
    if (success) {
      console.log(`✅ Tavolo eliminato dal database: ${tableToDelete.id}`);
    }

    // Chiudi il dialog
    setIsDeleteDialogOpen(false);
    setTableToDelete(null);
  }, [tableToDelete, deleteDbTable]);

  // Handle cancel deletion
  const handleCancelDeleteTable = useCallback(() => {
    setIsDeleteDialogOpen(false);
    setTableToDelete(null);
  }, []);

  // Export seating chart
  const handleExport = () => {
    toast({
      title: "Esportazione in corso",
      description: "Il piano tavoli verrà scaricato a breve."
    });
  };

  // Get unassigned guests
  const unassignedGuests = guests.filter(guest => !guest.tableId);
  const assignedGuests = guests.filter(guest => guest.tableId);

  // Mostra loading se stiamo caricando ospiti o tavoli
  if (guestsLoading || tablesLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 flex items-center justify-center">
        <Card className="p-8 text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">
            Caricamento {guestsLoading && tablesLoading ? 'ospiti e tavoli' : guestsLoading ? 'ospiti confermati' : 'tavoli'} dal database...
          </h3>
          <p className="text-gray-600">Recuperando dati dal database Supabase</p>
        </Card>
      </div>
    );
  }

  // Mostra errore se c'è un problema
  if (guestsError || tablesError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <div className="text-red-500 mb-4">
            <Users className="w-12 h-12 mx-auto mb-2" />
          </div>
          <h3 className="text-lg font-semibold mb-2 text-red-800">Errore nel caricamento</h3>
          <p className="text-gray-600 mb-4">
            {guestsError && `Ospiti: ${guestsError}`}
            {guestsError && tablesError && <br />}
            {tablesError && `Tavoli: ${tablesError}`}
          </p>
          <Button onClick={() => window.location.reload()} variant="outline">
            Riprova
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50">
      <CommonHeader showSidebarTrigger={false} />
      
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => navigate('/dashboard')}
                className="gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Torna alla Dashboard
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Piano Tavoli Avanzato</h1>
                <p className="text-gray-600 mt-1">Ospiti e tavoli recuperati dal database Supabase</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={() => setViewMode(viewMode === 'design' ? 'preview' : 'design')}
                className="gap-2"
              >
                <Eye className="w-4 h-4" />
                {viewMode === 'design' ? 'Anteprima' : 'Modifica'}
              </Button>
              <Button onClick={handleExport} className="gap-2 bg-rose-600 hover:bg-rose-700">
                <Download className="w-4 h-4" />
                Esporta
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Side Panel */}
          <div className="lg:col-span-1">
            <Card className="shadow-lg border-0">
              <CardHeader className="bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-t-lg">
                <CardTitle className="text-lg font-semibold">Gestione Evento</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-3 rounded-none">
                    <TabsTrigger value="guests" className="gap-1 text-xs">
                      <Users className="w-3 h-3" />
                      Ospiti
                    </TabsTrigger>
                    <TabsTrigger value="tables" className="gap-1 text-xs">
                      <Layout className="w-3 h-3" />
                      Tavoli
                    </TabsTrigger>
                    <TabsTrigger value="settings" className="gap-1 text-xs">
                      <Settings className="w-3 h-3" />
                      Impost.
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="guests" className="m-0">
                    <TableGuestList
                      guests={guests}
                      tables={tables}
                      categories={defaultGuestCategories}
                      onGuestAssignment={handleGuestAssignment}
                      selectedGuest={selectedGuest}
                      setSelectedGuest={setSelectedGuest}
                    />
                  </TabsContent>
                  
                  <TabsContent value="tables" className="m-0">
                    <TableManager
                      tables={tables}
                      guests={guests}
                      tableShapes={mockTableShapes}
                      onCreateTable={handleCreateTable}
                      onUpdateTable={handleTableUpdate}
                      onDeleteTable={handleDeleteTableRequest}
                      selectedTable={selectedTable}
                      setSelectedTable={setSelectedTable}
                    />
                  </TabsContent>
                  
                  <TabsContent value="settings" className="m-0 p-4">
                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm font-medium">Nome Venue</Label>
                        <Input
                          value={venue.name}
                          onChange={(e) => setVenue(prev => ({ ...prev, name: e.target.value }))}
                          className="mt-1"
                        />
                      </div>
                      <Separator />
                      <div className="space-y-2">
                        <h4 className="font-medium text-sm">Statistiche Ospiti</h4>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="p-2 bg-gray-50 rounded">
                            <div className="font-medium">{guests.length}</div>
                            <div className="text-gray-600">Ospiti totali</div>
                          </div>
                          <div className="p-2 bg-gray-50 rounded">
                            <div className="font-medium">{assignedGuests.length}</div>
                            <div className="text-gray-600">Assegnati</div>
                          </div>
                          <div className="p-2 bg-gray-50 rounded">
                            <div className="font-medium">{tables.length}</div>
                            <div className="text-gray-600">Tavoli</div>
                          </div>
                          <div className="p-2 bg-red-50 rounded border border-red-200">
                            <div className="font-medium text-red-700">{unassignedGuests.length}</div>
                            <div className="text-red-600">Da assegnare</div>
                          </div>
                        </div>
                        <div className="text-xs text-gray-500 bg-blue-50 p-2 rounded border border-blue-200">
                          💡 Sistema di gestione tavoli integrato con database
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Main Floor Plan */}
          <div className="lg:col-span-3">
            <Card className="shadow-lg border-0">
              <CardHeader className="bg-white border-b">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg font-semibold text-gray-900">
                      {venue.name}
                    </CardTitle>
                    <p className="text-sm text-gray-600 mt-1">
                      Trascina i tavoli per posizionarli nella sala
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {unassignedGuests.length > 0 && (
                      <Badge variant="destructive" className="animate-pulse">
                        {unassignedGuests.length} ospiti da assegnare
                      </Badge>
                    )}
                    {guests.length > 0 && (
                      <Badge variant="outline">
                        {guests.length} ospiti totali
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <FloorPlanCanvas
                  tables={tables}
                  guests={guests}
                  venue={venue}
                  onTableUpdate={handleTableUpdate}
                  onTableSelect={setSelectedTable}
                  selectedTable={selectedTable}
                  viewMode={viewMode}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Modal di Conferma Eliminazione Tavolo */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-red-500" />
              Conferma Eliminazione Tavolo
            </AlertDialogTitle>
            <AlertDialogDescription>
              Sei sicuro di voler eliminare <strong>"{tableToDelete?.name}"</strong> dal database?
              <br /><br />
              <div className="bg-yellow-50 border border-yellow-200 rounded p-3 mt-2">
                <strong>⚠️ Attenzione:</strong>
                <ul className="mt-1 text-sm space-y-1">
                  <li>• Il tavolo verrà rimosso definitivamente dal database</li>
                  <li>• Gli ospiti assegnati a questo tavolo verranno rimossi automaticamente</li>
                  <li>• Questa azione non può essere annullata</li>
                </ul>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelDeleteTable}>
              Annulla
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmDeleteTable}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Elimina Tavolo
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default TablePlanner;