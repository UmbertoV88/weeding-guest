import React, { useState, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Plus, Users, Layout, Settings, Download, Eye, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import CommonHeader from '@/components/CommonHeader';
import FloorPlanCanvas from './FloorPlanCanvas';
import TableGuestList from './TableGuestList';
import TableManager from './TableManager';
import { AdvancedTable, Venue, TableGuest, GuestCategory, TableShape } from '@/types/table';

// Mock data for initial implementation - SOLO OSPITI CONFERMATI
const mockGuests: TableGuest[] = [
  {
    id: "g1",
    name: "Marco Rossi",
    email: "marco.rossi@email.com",
    category: "Famiglia dello sposo",
    dietaryRestrictions: "Vegetariano",
    tableId: undefined,
    seatNumber: undefined,
    user_id: "",
    confermato: true // ✅ Confermato
  },
  {
    id: "g2",
    name: "Anna Bianchi",
    email: "anna.bianchi@email.com",
    category: "Famiglia della sposa",
    dietaryRestrictions: "Senza glutine",
    tableId: undefined,
    seatNumber: undefined,
    user_id: "",
    confermato: true // ✅ Confermato
  },
  {
    id: "g3",
    name: "Luigi Verdi",
    email: "luigi.verdi@email.com",
    category: "Amici dello sposo",
    dietaryRestrictions: undefined,
    tableId: "t1",
    seatNumber: 1,
    user_id: "",
    confermato: true // ✅ Confermato
  },
  {
    id: "g4",
    name: "Francesca Romano",
    email: "francesca.romano@email.com",
    category: "Amici della sposa",
    dietaryRestrictions: undefined,
    tableId: "t1",
    seatNumber: 2,
    user_id: "",
    confermato: true // ✅ Confermato
  },
  {
    id: "g5",
    name: "Giuseppe Marino",
    email: "giuseppe.marino@email.com",
    category: "Famiglia dello sposo",
    dietaryRestrictions: undefined,
    tableId: "t1",
    seatNumber: 3,
    user_id: "",
    confermato: true // ✅ Confermato
  },
  {
    id: "g6",
    name: "Valentina Ferrari",
    email: "valentina.ferrari@email.com",
    category: "Amici della sposa",
    dietaryRestrictions: "Vegano",
    tableId: undefined,
    seatNumber: undefined,
    user_id: "",
    confermato: true // ✅ Confermato
  },
  {
    id: "g7",
    name: "Roberto Conti",
    email: "roberto.conti@email.com",
    category: "Colleghi",
    dietaryRestrictions: undefined,
    tableId: undefined,
    seatNumber: undefined,
    user_id: "",
    confermato: true // ✅ Confermato
  },
  {
    id: "g8",
    name: "Silvia Martini",
    email: "silvia.martini@email.com",
    category: "Famiglia della sposa",
    dietaryRestrictions: "Intollerante al lattosio",
    tableId: "t2",
    seatNumber: 1,
    user_id: "",
    confermato: true // ✅ Confermato
  }
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
  elements: [
    {
      id: "dancefloor",
      type: "dancefloor",
      x: 100,
      y: 400,
      width: 200,
      height: 150,
      label: "Pista da ballo"
    },
    {
      id: "stage",
      type: "stage",
      x: 50,
      y: 450,
      width: 100,
      height: 50,
      label: "Palco"
    }
  ],
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
  
  const [guests, setGuests] = useState<TableGuest[]>(mockGuests);
  const [tables, setTables] = useState<AdvancedTable[]>(mockTables);
  const [venue, setVenue] = useState<Venue>(mockVenue);
  const [selectedTable, setSelectedTable] = useState<AdvancedTable | null>(null);
  const [selectedGuest, setSelectedGuest] = useState<TableGuest | null>(null);
  const [activeTab, setActiveTab] = useState<string>('floor-plan');
  const [viewMode, setViewMode] = useState<'design' | 'preview'>('design');

  // Initialize with user data
  useEffect(() => {
    if (user) {
      // Update mock data with actual user_id
      setGuests(prev => prev.map(g => ({ ...g, user_id: user.id })));
      setTables(prev => prev.map(t => ({ ...t, user_id: user.id })));
      setVenue(prev => ({ ...prev, user_id: user.id }));
    }
  }, [user]);

  // Handle guest assignment to table
  const handleGuestAssignment = useCallback((guestId: string, tableId: string, seatNumber?: number) => {
    setGuests(prev => prev.map(guest => 
      guest.id === guestId 
        ? { ...guest, tableId, seatNumber }
        : guest
    ));
    
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

    toast({
      title: "Ospite assegnato",
      description: `L'ospite è stato assegnato al tavolo con successo.`
    });
  }, [toast]);

  // Handle table updates
  const handleTableUpdate = useCallback((tableId: string, updates: Partial<AdvancedTable>) => {
    setTables(prev => prev.map(table => 
      table.id === tableId 
        ? { ...table, ...updates }
        : table
    ));
  }, []);

  // Handle table creation
  const handleCreateTable = useCallback((tableData: Omit<AdvancedTable, 'id' | 'user_id' | 'assignedGuests'>) => {
    const newTable: AdvancedTable = {
      id: `t${Date.now()}`,
      assignedGuests: [],
      user_id: user?.id || '',
      ...tableData
    };
    setTables(prev => [...prev, newTable]);
    toast({
      title: "Tavolo creato",
      description: `${newTable.name} è stato aggiunto alla pianta.`
    });
  }, [toast, user]);

  // Handle table deletion
  const handleDeleteTable = useCallback((tableId: string) => {
    // Remove guests from deleted table
    setGuests(prev => prev.map(guest => 
      guest.tableId === tableId 
        ? { ...guest, tableId: undefined, seatNumber: undefined }
        : guest
    ));
    
    setTables(prev => prev.filter(table => table.id !== tableId));
    
    toast({
      title: "Tavolo eliminato",
      description: "Il tavolo è stato rimosso dalla pianta."
    });
  }, [toast]);

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
                <p className="text-gray-600 mt-1">Organizza la disposizione degli ospiti con drag & drop</p>
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
                      categories={mockGuestCategories}
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
                      onDeleteTable={handleDeleteTable}
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
                        <h4 className="font-medium text-sm">Statistiche Ospiti Confermati</h4>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="p-2 bg-green-50 rounded border border-green-200">
                            <div className="font-medium text-green-700">{guests.length}</div>
                            <div className="text-green-600">✅ Confermati</div>
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
                          💡 Vengono mostrati solo gli ospiti che hanno confermato la presenza
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
                        {unassignedGuests.length} ospiti non assegnati
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
    </div>
  );
};

export default TablePlanner;