import React, { useState } from 'react';
import { ScrollArea } from '../ui/scroll-area';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Separator } from '../ui/separator';
import { Plus, Table, Users, Trash2, Edit, Circle, Square } from 'lucide-react';

const TableManager = ({ 
  tables, 
  guests, 
  tableShapes, 
  onCreateTable, 
  onUpdateTable, 
  onDeleteTable,
  selectedTable,
  setSelectedTable 
}) => {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingTable, setEditingTable] = useState(null);
  const [newTable, setNewTable] = useState({
    name: '',
    shape: 'round',
    seats: 8,
    x: 300,
    y: 200
  });

  // Create new table
  const handleCreateTable = () => {
    if (newTable.name.trim()) {
      onCreateTable(newTable);
      setNewTable({
        name: '',
        shape: 'round',
        seats: 8,
        x: 300,
        y: 200
      });
      setShowCreateDialog(false);
    }
  };

  // Edit table
  const handleEditTable = (table) => {
    setEditingTable({ ...table });
    setShowEditDialog(true);
  };

  const handleUpdateTable = () => {
    if (editingTable && editingTable.name.trim()) {
      onUpdateTable(editingTable.id, editingTable);
      setShowEditDialog(false);
      setEditingTable(null);
    }
  };

  // Delete table
  const handleDeleteTable = (tableId) => {
    if (window.confirm('Sei sicuro di voler eliminare questo tavolo?')) {
      onDeleteTable(tableId);
      if (selectedTable?.id === tableId) {
        setSelectedTable(null);
      }
    }
  };

  // Get guests for table
  const getTableGuests = (table) => {
    return guests.filter(guest => guest.tableId === table.id);
  };

  // Get shape icon
  const getShapeIcon = (shape) => {
    switch (shape) {
      case 'round':
        return <Circle className="w-4 h-4" />;
      case 'rectangular':
        return <Square className="w-4 h-4" />;
      case 'square':
        return <Square className="w-4 h-4" />;
      default:
        return <Circle className="w-4 h-4" />;
    }
  };

  // Calculate table statistics
  const totalSeats = tables.reduce((sum, table) => sum + table.seats, 0);
  const occupiedSeats = tables.reduce((sum, table) => sum + table.assignedGuests.length, 0);
  const occupancyRate = totalSeats > 0 ? ((occupiedSeats / totalSeats) * 100).toFixed(1) : 0;

  return (
    <div className="h-full flex flex-col">
      {/* Header with Statistics */}
      <div className="p-4 border-b bg-gray-50">
        <div className="space-y-3">
          {/* Statistics */}
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="text-center p-2 bg-white rounded">
              <div className="font-bold text-blue-600">{tables.length}</div>
              <div className="text-gray-600">Tavoli</div>
            </div>
            <div className="text-center p-2 bg-white rounded">
              <div className="font-bold text-green-600">{occupiedSeats}</div>
              <div className="text-gray-600">Occupati</div>
            </div>
            <div className="text-center p-2 bg-white rounded">
              <div className="font-bold text-purple-600">{occupancyRate}%</div>
              <div className="text-gray-600">Tasso occ.</div>
            </div>
          </div>

          {/* Add Table Button */}
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button size="sm" className="w-full gap-2 bg-rose-600 hover:bg-rose-700">
                <Plus className="w-3 h-3" />
                Aggiungi Tavolo
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Crea Nuovo Tavolo</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div>
                  <Label>Nome Tavolo</Label>
                  <Input
                    value={newTable.name}
                    onChange={(e) => setNewTable(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Es. Tavolo 1, Tavolo Sposi..."
                  />
                </div>
                <div>
                  <Label>Forma Tavolo</Label>
                  <Select 
                    value={newTable.shape} 
                    onValueChange={(value) => setNewTable(prev => ({ ...prev, shape: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {tableShapes.map(shape => (
                        <SelectItem key={shape.id} value={shape.id}>
                          <div className="flex items-center gap-2">
                            {getShapeIcon(shape.id)}
                            {shape.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Numero di Posti</Label>
                  <Input
                    type="number"
                    min="2"
                    max="16"
                    value={newTable.seats}
                    onChange={(e) => setNewTable(prev => ({ ...prev, seats: parseInt(e.target.value) || 8 }))}
                  />
                </div>
                <Button onClick={handleCreateTable} className="w-full" disabled={!newTable.name.trim()}>
                  Crea Tavolo
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Table List */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-3">
          {tables.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Table className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Nessun tavolo presente</p>
              <p className="text-xs mt-1">Aggiungi il primo tavolo per iniziare</p>
            </div>
          ) : (
            tables.map(table => {
              const tableGuests = getTableGuests(table);
              const occupancyRate = (table.assignedGuests.length / table.seats) * 100;
              
              return (
                <Card
                  key={table.id}
                  className={`cursor-pointer transition-colors hover:bg-gray-50 ${
                    selectedTable?.id === table.id ? 'ring-2 ring-rose-500 bg-rose-50' : ''
                  }`}
                  onClick={() => setSelectedTable(table)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getShapeIcon(table.shape)}
                        <CardTitle className="text-sm font-medium">{table.name}</CardTitle>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditTable(table);
                          }}
                          className="h-6 w-6 p-0"
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
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
                    <div className="space-y-3">
                      {/* Occupancy */}
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4 text-gray-500" />
                          <span>{table.assignedGuests.length}/{table.seats} posti</span>
                        </div>
                        <Badge
                          variant={occupancyRate === 100 ? 'default' : 
                                 occupancyRate > 50 ? 'secondary' : 'destructive'}
                        >
                          {occupancyRate.toFixed(0)}%
                        </Badge>
                      </div>

                      {/* Progress bar */}
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all ${
                            occupancyRate === 100 ? 'bg-green-500' :
                            occupancyRate > 50 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${occupancyRate}%` }}
                        />
                      </div>

                      {/* Guest List */}
                      {tableGuests.length > 0 && (
                        <div>
                          <Separator className="my-2" />
                          <div className="space-y-1">
                            <h4 className="text-xs font-medium text-gray-700">Ospiti assegnati:</h4>
                            <div className="space-y-1">
                              {tableGuests.map(guest => (
                                <div key={guest.id} className="flex items-center justify-between text-xs">
                                  <span className="truncate">{guest.name}</span>
                                  <Badge variant="outline" className="text-xs">
                                    Posto {guest.seatNumber || '?'}
                                  </Badge>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </ScrollArea>

      {/* Edit Table Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifica Tavolo</DialogTitle>
          </DialogHeader>
          {editingTable && (
            <div className="space-y-4 pt-4">
              <div>
                <Label>Nome Tavolo</Label>
                <Input
                  value={editingTable.name}
                  onChange={(e) => setEditingTable(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div>
                <Label>Forma Tavolo</Label>
                <Select 
                  value={editingTable.shape} 
                  onValueChange={(value) => setEditingTable(prev => ({ ...prev, shape: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {tableShapes.map(shape => (
                      <SelectItem key={shape.id} value={shape.id}>
                        <div className="flex items-center gap-2">
                          {getShapeIcon(shape.id)}
                          {shape.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Numero di Posti</Label>
                <Input
                  type="number"
                  min="2"
                  max="16"
                  value={editingTable.seats}
                  onChange={(e) => setEditingTable(prev => ({ ...prev, seats: parseInt(e.target.value) || 8 }))}
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleUpdateTable} className="flex-1" disabled={!editingTable.name.trim()}>
                  Salva Modifiche
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowEditDialog(false)}
                  className="flex-1"
                >
                  Annulla
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