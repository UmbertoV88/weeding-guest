import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { ScrollArea } from '../ui/scroll-area';
import { Separator } from '../ui/separator';
import { Plus, Users, Layout, Settings, Download, Eye } from 'lucide-react';
import FloorPlanCanvas from './FloorPlanCanvas';
import GuestList from './GuestList';
import TableManager from './TableManager';
import { mockGuests, mockTables, mockVenue, mockGuestCategories, mockTableShapes } from '../../data/mock';
import { useToast } from '../../hooks/use-toast';

const TablePlanner = () => {
  const [guests, setGuests] = useState(mockGuests);
  const [tables, setTables] = useState(mockTables);
  const [venue, setVenue] = useState(mockVenue);
  const [selectedTable, setSelectedTable] = useState(null);
  const [selectedGuest, setSelectedGuest] = useState(null);
  const [activeTab, setActiveTab] = useState('floor-plan');
  const [viewMode, setViewMode] = useState('design'); // design or preview
  const { toast } = useToast();

  // Handle guest assignment to table
  const handleGuestAssignment = useCallback((guestId, tableId, seatNumber = null) => {
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
  const handleTableUpdate = useCallback((tableId, updates) => {
    setTables(prev => prev.map(table => 
      table.id === tableId 
        ? { ...table, ...updates }
        : table
    ));
  }, []);

  // Handle table creation
  const handleCreateTable = useCallback((tableData) => {
    const newTable = {
      id: `t${Date.now()}`,
      assignedGuests: [],
      ...tableData
    };
    setTables(prev => [...prev, newTable]);
    toast({
      title: "Tavolo creato",
      description: `${newTable.name} è stato aggiunto alla pianta.`
    });
  }, [toast]);

  // Handle table deletion
  const handleDeleteTable = useCallback((tableId) => {
    // Remove guests from deleted table
    setGuests(prev => prev.map(guest => 
      guest.tableId === tableId 
        ? { ...guest, tableId: null, seatNumber: null }
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
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Piano Tavoli</h1>
              <p className="text-gray-600 mt-1">Organizza la disposizione degli ospiti per il tuo matrimonio</p>
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
                    <GuestList
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
                        <h4 className="font-medium text-sm">Statistiche</h4>
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
                          <div className="p-2 bg-gray-50 rounded">
                            <div className="font-medium">{unassignedGuests.length}</div>
                            <div className="text-gray-600">Da assegnare</div>
                          </div>
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