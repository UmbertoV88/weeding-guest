import React, { useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Edit2, Trash2, Users, Layout } from 'lucide-react';
import { AdvancedTable, TableGuest, TableShape } from '@/types/table';

interface TableManagerProps {
  tables: AdvancedTable[];
  guests: TableGuest[];
  tableShapes: TableShape[];
  onCreateTable: (tableData: Omit<AdvancedTable, 'id' | 'user_id' | 'assignedGuests'>) => void;
  onUpdateTable: (tableId: string, updates: Partial<AdvancedTable>) => void;
  onDeleteTable: (tableId: string) => void;
  selectedTable: AdvancedTable | null;
  setSelectedTable: (table: AdvancedTable | null) => void;
}

interface CreateTableForm {
  name: string;
  shape: 'round' | 'rectangular' | 'square';
  seats: number;
  x: number;
  y: number;
  lato: 'sposo' | 'sposa' | 'centro';
}

const TableManager: React.FC<TableManagerProps> = ({
  tables,
  guests,
  tableShapes,
  onCreateTable,
  onUpdateTable,
  onDeleteTable,
  selectedTable,
  setSelectedTable
}) => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingTable, setEditingTable] = useState<AdvancedTable | null>(null);
  
  const [createForm, setCreateForm] = useState<CreateTableForm>({
    name: '',
    shape: 'round',
    seats: 6,
    x: 300,
    y: 200,
    lato: 'centro'
  });

  // Handle create table
  const handleCreateTable = () => {
    if (!createForm.name.trim()) return;
    
    onCreateTable(createForm);
    
    // Reset form
    setCreateForm({
      name: '',
      shape: 'round',
      seats: 6,
      x: 300,
      y: 200,
      lato: 'centro'
    });
    
    setIsCreateDialogOpen(false);
  };

  // Handle edit table
  const handleEditTable = (table: AdvancedTable) => {
    setEditingTable(table);
    setIsEditDialogOpen(true);
  };

  // Handle update table
  const handleUpdateTable = () => {
    if (!editingTable) return;
    
    onUpdateTable(editingTable.id, editingTable);
    setIsEditDialogOpen(false);
    setEditingTable(null);
  };

  // Handle delete table
  const handleDeleteTable = (tableId: string) => {
    onDeleteTable(tableId);
  };

  // Get guests assigned to a table
  const getTableGuests = (tableId: string) => {
    return guests.filter(guest => guest.tableId === tableId);
  };

  // Get max seats for selected shape
  const getMaxSeatsForShape = (shape: string) => {
    const tableShape = tableShapes.find(s => s.id === shape);
    return tableShape?.maxSeats || 12;
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 bg-gray-50 border-b">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Layout className="w-4 h-4" />
            <span className="font-medium text-sm">Gestione Tavoli</span>
          </div>
          <Badge variant="outline" className="text-xs">
            {tables.length} tavoli
          </Badge>
        </div>

        {/* Create Table Button */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full gap-2 bg-rose-600 hover:bg-rose-700 text-sm">
              <Plus className="w-4 h-4" />
              Aggiungi Tavolo
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Crea Nuovo Tavolo</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="table-name">Nome Tavolo</Label>
                <Input
                  id="table-name"
                  value={createForm.name}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="es. Tavolo degli Sposi"
                />
              </div>
              
              <div>
                <Label htmlFor="table-shape">Forma</Label>
                <Select 
                  value={createForm.shape} 
                  onValueChange={(value: 'round' | 'rectangular' | 'square') => 
                    setCreateForm(prev => ({ ...prev, shape: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {tableShapes.map(shape => (
                      <SelectItem key={shape.id} value={shape.id}>
                        {shape.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="table-seats">Numero Posti</Label>
                <Input
                  id="table-seats"
                  type="number"
                  min="2"
                  max={getMaxSeatsForShape(createForm.shape)}
                  value={createForm.seats}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, seats: parseInt(e.target.value) || 6 }))}
                />
              </div>
              
              <div>
                <Label htmlFor="table-side">Lato</Label>
                <Select 
                  value={createForm.lato} 
                  onValueChange={(value: 'sposo' | 'sposa' | 'centro') => 
                    setCreateForm(prev => ({ ...prev, lato: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sposo">Lato Sposo</SelectItem>
                    <SelectItem value="sposa">Lato Sposa</SelectItem>
                    <SelectItem value="centro">Centro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="table-x">Posizione X</Label>
                  <Input
                    id="table-x"
                    type="number"
                    value={createForm.x}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, x: parseInt(e.target.value) || 0 }))}
                  />
                </div>
                <div>
                  <Label htmlFor="table-y">Posizione Y</Label>
                  <Input
                    id="table-y"
                    type="number"
                    value={createForm.y}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, y: parseInt(e.target.value) || 0 }))}
                  />
                </div>
              </div>
              
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Annulla
                </Button>
                <Button onClick={handleCreateTable}>
                  Crea Tavolo
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Tables List */}
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-2">
          {tables.map(table => {
            const tableGuests = getTableGuests(table.id);
            const occupancyRate = tableGuests.length / table.seats;
            const isSelected = selectedTable?.id === table.id;

            return (
              <Card
                key={table.id}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  isSelected ? 'ring-2 ring-rose-500 bg-rose-50' : ''
                }`}
                onClick={() => setSelectedTable(isSelected ? null : table)}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium">{table.name}</CardTitle>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditTable(table);
                        }}
                        className="h-6 w-6 p-0"
                      >
                        <Edit2 className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteTable(table.id);
                        }}
                        className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-600">
                        {table.shape === 'round' ? 'Rotondo' : 
                         table.shape === 'rectangular' ? 'Rettangolare' : 'Quadrato'}
                      </span>
                      <Badge 
                        variant={occupancyRate === 1 ? "default" : occupancyRate > 0.5 ? "secondary" : "outline"}
                        className="text-xs"
                      >
                        {tableGuests.length}/{table.seats}
                      </Badge>
                    </div>
                    
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all ${
                          occupancyRate === 1 ? 'bg-green-500' :
                          occupancyRate > 0.5 ? 'bg-yellow-500' :
                          occupancyRate > 0 ? 'bg-red-500' : 'bg-gray-300'
                        }`}
                        style={{ width: `${occupancyRate * 100}%` }}
                      />
                    </div>
                    
                    <div className="text-xs text-gray-500">
                      Posizione: ({table.x}, {table.y})
                    </div>
                    
                    {tableGuests.length > 0 && (
                      <div className="pt-2 border-t">
                        <div className="text-xs text-gray-600 mb-1">Ospiti:</div>
                        <div className="space-y-1 max-h-16 overflow-y-auto">
                          {tableGuests.map(guest => (
                            <div key={guest.id} className="text-xs bg-gray-100 px-2 py-1 rounded flex items-center justify-between">
                              <span className="truncate">{guest.name}</span>
                              {guest.seatNumber && (
                                <Badge variant="outline" className="text-xs ml-1">
                                  #{guest.seatNumber}
                                </Badge>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {tables.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Layout className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Nessun tavolo creato</p>
              <p className="text-xs">Clicca "Aggiungi Tavolo" per iniziare</p>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Edit Table Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifica Tavolo</DialogTitle>
          </DialogHeader>
          {editingTable && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-table-name">Nome Tavolo</Label>
                <Input
                  id="edit-table-name"
                  value={editingTable.name}
                  onChange={(e) => setEditingTable(prev => prev ? { ...prev, name: e.target.value } : null)}
                />
              </div>
              
              <div>
                <Label htmlFor="edit-table-shape">Forma</Label>
                <Select 
                  value={editingTable.shape} 
                  onValueChange={(value: 'round' | 'rectangular' | 'square') => 
                    setEditingTable(prev => prev ? { ...prev, shape: value } : null)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {tableShapes.map(shape => (
                      <SelectItem key={shape.id} value={shape.id}>
                        {shape.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="edit-table-seats">Numero Posti</Label>
                <Input
                  id="edit-table-seats"
                  type="number"
                  min="2"
                  max={getMaxSeatsForShape(editingTable.shape)}
                  value={editingTable.seats}
                  onChange={(e) => setEditingTable(prev => 
                    prev ? { ...prev, seats: parseInt(e.target.value) || 6 } : null
                  )}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-table-x">Posizione X</Label>
                  <Input
                    id="edit-table-x"
                    type="number"
                    value={editingTable.x}
                    onChange={(e) => setEditingTable(prev => 
                      prev ? { ...prev, x: parseInt(e.target.value) || 0 } : null
                    )}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-table-y">Posizione Y</Label>
                  <Input
                    id="edit-table-y"
                    type="number"
                    value={editingTable.y}
                    onChange={(e) => setEditingTable(prev => 
                      prev ? { ...prev, y: parseInt(e.target.value) || 0 } : null
                    )}
                  />
                </div>
              </div>
              
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Annulla
                </Button>
                <Button onClick={handleUpdateTable}>
                  Salva Modifiche
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TableManager;