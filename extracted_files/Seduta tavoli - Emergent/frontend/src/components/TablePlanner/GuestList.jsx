import React, { useState, useMemo } from 'react';
import { ScrollArea } from '../ui/scroll-area';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Separator } from '../ui/separator';
import { Card, CardContent } from '../ui/card';
import { Plus, Search, User, Users, MapPin, Utensils } from 'lucide-react';
import { mockDietaryRestrictions } from '../../data/mock';

const GuestList = ({ 
  guests, 
  tables, 
  categories, 
  onGuestAssignment,
  selectedGuest,
  setSelectedGuest 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterAssignment, setFilterAssignment] = useState('all'); // all, assigned, unassigned
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newGuest, setNewGuest] = useState({
    name: '',
    email: '',
    category: categories[0],
    dietaryRestrictions: null
  });

  // Filter guests based on search and filters
  const filteredGuests = useMemo(() => {
    return guests.filter(guest => {
      const matchesSearch = guest.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          guest.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = filterCategory === 'all' || guest.category === filterCategory;
      const matchesAssignment = filterAssignment === 'all' || 
                               (filterAssignment === 'assigned' && guest.tableId) ||
                               (filterAssignment === 'unassigned' && !guest.tableId);
      
      return matchesSearch && matchesCategory && matchesAssignment;
    });
  }, [guests, searchTerm, filterCategory, filterAssignment]);

  // Group guests by category
  const groupedGuests = useMemo(() => {
    const groups = {};
    filteredGuests.forEach(guest => {
      if (!groups[guest.category]) {
        groups[guest.category] = [];
      }
      groups[guest.category].push(guest);
    });
    return groups;
  }, [filteredGuests]);

  // Add new guest
  const handleAddGuest = () => {
    // In real app, this would call API
    console.log('Adding guest:', newGuest);
    setNewGuest({
      name: '',
      email: '',
      category: categories[0],
      dietaryRestrictions: null
    });
    setShowAddDialog(false);
  };

  // Get table name for guest
  const getTableName = (tableId) => {
    const table = tables.find(t => t.id === tableId);
    return table ? table.name : '';
  };

  return (
    <div className="h-full flex flex-col">
      {/* Search and Filters */}
      <div className="p-4 border-b bg-gray-50">
        <div className="space-y-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Cerca ospite..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 text-sm"
            />
          </div>
          
          {/* Filters */}
          <div className="grid grid-cols-1 gap-2">
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tutte le categorie</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={filterAssignment} onValueChange={setFilterAssignment}>
              <SelectTrigger className="text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tutti gli ospiti</SelectItem>
                <SelectItem value="assigned">Assegnati</SelectItem>
                <SelectItem value="unassigned">Non assegnati</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Add Guest Button */}
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button size="sm" className="w-full gap-2 bg-rose-600 hover:bg-rose-700">
                <Plus className="w-3 h-3" />
                Aggiungi Ospite
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Aggiungi Nuovo Ospite</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div>
                  <Label>Nome Completo</Label>
                  <Input
                    value={newGuest.name}
                    onChange={(e) => setNewGuest(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Es. Marco Rossi"
                  />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={newGuest.email}
                    onChange={(e) => setNewGuest(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="Es. marco@email.com"
                  />
                </div>
                <div>
                  <Label>Categoria</Label>
                  <Select 
                    value={newGuest.category} 
                    onValueChange={(value) => setNewGuest(prev => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Restrizioni Alimentari</Label>
                  <Select 
                    value={newGuest.dietaryRestrictions || 'none'} 
                    onValueChange={(value) => setNewGuest(prev => ({ ...prev, dietaryRestrictions: value === 'none' ? null : value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Nessuna restrizione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Nessuna restrizione</SelectItem>
                      {mockDietaryRestrictions.map(restriction => (
                        <SelectItem key={restriction} value={restriction}>
                          {restriction}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleAddGuest} className="w-full">
                  Aggiungi Ospite
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Guest List */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {/* Statistics */}
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <CardContent className="p-3">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="text-center">
                  <div className="font-bold text-lg text-blue-600">{filteredGuests.length}</div>
                  <div className="text-blue-700">Ospiti trovati</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-lg text-green-600">
                    {filteredGuests.filter(g => g.tableId).length}
                  </div>
                  <div className="text-green-700">Assegnati</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Grouped Guest List */}
          {Object.entries(groupedGuests).map(([category, categoryGuests]) => (
            <div key={category} className="space-y-2">
              <div className="flex items-center gap-2 py-2">
                <Users className="w-4 h-4 text-gray-500" />
                <h3 className="font-medium text-sm text-gray-700">{category}</h3>
                <Badge variant="secondary" className="text-xs">
                  {categoryGuests.length}
                </Badge>
              </div>
              
              <div className="space-y-2">
                {categoryGuests.map(guest => (
                  <Card
                    key={guest.id}
                    className={`cursor-pointer transition-colors hover:bg-gray-50 ${
                      selectedGuest?.id === guest.id ? 'ring-2 ring-rose-500 bg-rose-50' : ''
                    }`}
                    onClick={() => setSelectedGuest(guest)}
                  >
                    <CardContent className="p-3">
                      <div className="space-y-2">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm truncate">{guest.name}</div>
                            <div className="text-xs text-gray-500 truncate">{guest.email}</div>
                          </div>
                          <div className="flex-shrink-0 ml-2">
                            {guest.tableId ? (
                              <Badge className="text-xs bg-green-100 text-green-800">
                                {getTableName(guest.tableId)}
                              </Badge>
                            ) : (
                              <Badge variant="destructive" className="text-xs">
                                Non assegnato
                              </Badge>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3 text-xs text-gray-600">
                          {guest.tableId && (
                            <div className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              <span>Posto {guest.seatNumber || '?'}</span>
                            </div>
                          )}
                          
                          {guest.dietaryRestrictions && (
                            <div className="flex items-center gap-1">
                              <Utensils className="w-3 h-3" />
                              <span className="truncate">{guest.dietaryRestrictions}</span>
                            </div>
                          )}
                        </div>
                        
                        {/* Quick Assign */}
                        {!guest.tableId && tables.length > 0 && (
                          <div className="pt-2 border-t">
                            <Select 
                              value=""
                              onValueChange={(tableId) => onGuestAssignment(guest.id, tableId)}
                            >
                              <SelectTrigger className="h-7 text-xs">
                                <SelectValue placeholder="Assegna a tavolo..." />
                              </SelectTrigger>
                              <SelectContent>
                                {tables
                                  .filter(table => table.assignedGuests.length < table.seats)
                                  .map(table => (
                                  <SelectItem key={table.id} value={table.id}>
                                    {table.name} ({table.assignedGuests.length}/{table.seats})
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              {categoryGuests.length === 0 && (
                <div className="text-center py-4 text-sm text-gray-500">
                  Nessun ospite trovato in questa categoria
                </div>
              )}
            </div>
          ))}
          
          {Object.keys(groupedGuests).length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <User className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Nessun ospite trovato</p>
              <p className="text-xs mt-1">Prova a modificare i filtri di ricerca</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default GuestList;