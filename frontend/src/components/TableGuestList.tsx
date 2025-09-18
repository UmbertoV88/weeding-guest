import React, { useState, useMemo } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Search, Users, AlertCircle, Check } from 'lucide-react';
import { AdvancedTable, TableGuest } from '@/types/table';

interface TableGuestListProps {
  guests: TableGuest[];
  tables: AdvancedTable[];
  categories: string[];
  onGuestAssignment: (guestId: string, tableId: string, seatNumber?: number) => void;
  selectedGuest: TableGuest | null;
  setSelectedGuest: (guest: TableGuest | null) => void;
}

const TableGuestList: React.FC<TableGuestListProps> = ({
  guests,
  tables,
  categories,
  onGuestAssignment,
  selectedGuest,
  setSelectedGuest
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showUnassignedOnly, setShowUnassignedOnly] = useState(false);

  // Filter and search guests
  const filteredGuests = useMemo(() => {
    return guests.filter(guest => {
      const matchesSearch = guest.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           guest.email?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = selectedCategory === 'all' || guest.category === selectedCategory;
      
      const matchesAssignment = !showUnassignedOnly || !guest.tableId;
      
      return matchesSearch && matchesCategory && matchesAssignment;
    });
  }, [guests, searchTerm, selectedCategory, showUnassignedOnly]);

  // Get guest's assigned table
  const getGuestTable = (guest: TableGuest) => {
    return tables.find(table => table.id === guest.tableId);
  };

  // Handle guest assignment
  const handleAssignToTable = (guest: TableGuest, tableId: string) => {
    onGuestAssignment(guest.id, tableId);
    setSelectedGuest(null);
  };

  // Remove guest from table
  const handleRemoveFromTable = (guest: TableGuest) => {
    if (guest.tableId) {
      onGuestAssignment(guest.id, '', 0);
    }
  };

  const unassignedCount = guests.filter(g => !g.tableId).length;
  const assignedCount = guests.filter(g => g.tableId).length;

  return (
    <div className="h-full flex flex-col">
      {/* Header Stats */}
      <div className="p-4 bg-gray-50 border-b">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 mb-3">
          <div className="text-xs text-blue-800 font-medium text-center">
            ✅ Solo ospiti confermati
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs mb-3">
          <div className="text-center p-2 bg-white rounded shadow-sm">
            <div className="font-bold text-green-600">{assignedCount}</div>
            <div className="text-gray-600">Assegnati</div>
          </div>
          <div className="text-center p-2 bg-white rounded shadow-sm">
            <div className="font-bold text-red-600">{unassignedCount}</div>
            <div className="text-gray-600">Da assegnare</div>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Cerca ospiti..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 text-sm"
          />
        </div>

        {/* Filters */}
        <div className="space-y-2">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="text-xs">
              <SelectValue placeholder="Categoria" />
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

          <Button
            variant={showUnassignedOnly ? "default" : "outline"}
            size="sm"
            onClick={() => setShowUnassignedOnly(!showUnassignedOnly)}
            className="w-full text-xs"
          >
            <AlertCircle className="w-3 h-3 mr-1" />
            Solo non assegnati
          </Button>
        </div>
      </div>

      {/* Guest List */}
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {filteredGuests.map(guest => {
            const assignedTable = getGuestTable(guest);
            const isSelected = selectedGuest?.id === guest.id;

            return (
              <Card
                key={guest.id}
                className={`p-3 cursor-pointer transition-all hover:shadow-md ${
                  isSelected ? 'ring-2 ring-rose-500 bg-rose-50' : ''
                } ${!guest.tableId ? 'border-l-4 border-l-red-400' : 'border-l-4 border-l-green-400'}`}
                onClick={() => setSelectedGuest(isSelected ? null : guest)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-sm truncate">{guest.name}</h4>
                      <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                        ✅ Confermato
                      </Badge>
                      {guest.tableId && (
                        <Badge variant="secondary" className="text-xs">
                          <Check className="w-3 h-3 mr-1" />
                          Assegnato
                        </Badge>
                      )}
                    </div>
                    
                    <div className="text-xs text-gray-600 space-y-1">
                      <div className="truncate">{guest.email}</div>
                      <div className="truncate">
                        <Badge variant="outline" className="text-xs">
                          {guest.category}
                        </Badge>
                      </div>
                      
                      {guest.dietaryRestrictions && (
                        <div className="text-orange-600 font-medium">
                          🥗 {guest.dietaryRestrictions}
                        </div>
                      )}
                      
                      {assignedTable && (
                        <div className="text-green-600 font-medium">
                          📍 {assignedTable.name}
                          {guest.seatNumber && ` - Posto ${guest.seatNumber}`}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Assignment Actions */}
                {isSelected && (
                  <div className="mt-3 pt-3 border-t space-y-2">
                    {guest.tableId ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveFromTable(guest);
                        }}
                        className="w-full text-xs"
                      >
                        Rimuovi dal tavolo
                      </Button>
                    ) : (
                      <div className="space-y-1">
                        <div className="text-xs font-medium text-gray-700">Assegna a tavolo:</div>
                        <div className="space-y-1 max-h-24 overflow-y-auto">
                          {tables.map(table => {
                            const availableSeats = table.seats - table.assignedGuests.length;
                            const canAssign = availableSeats > 0;
                            
                            return (
                              <Button
                                key={table.id}
                                variant="outline"
                                size="sm"
                                disabled={!canAssign}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleAssignToTable(guest, table.id);
                                }}
                                className="w-full text-xs justify-between"
                              >
                                <span>{table.name}</span>
                                <Badge variant={canAssign ? "secondary" : "destructive"} className="text-xs">
                                  {table.assignedGuests.length}/{table.seats}
                                </Badge>
                              </Button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </Card>
            );
          })}

          {filteredGuests.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Nessun ospite trovato</p>
              {searchTerm && (
                <Button
                  variant="link"
                  size="sm"
                  onClick={() => setSearchTerm('')}
                  className="text-xs"
                >
                  Cancella ricerca
                </Button>
              )}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default TableGuestList;