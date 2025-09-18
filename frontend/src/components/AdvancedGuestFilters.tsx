import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Users, Filter, X, AlertCircle, Heart, Baby, Utensils, Star } from 'lucide-react';
import { TableGuest } from '@/types/table';

interface AdvancedGuestFiltersProps {
  guests: TableGuest[];
  onFilteredGuestsChange: (filteredGuests: TableGuest[]) => void;
  categories: string[];
}

interface FilterState {
  category: string;
  assignmentStatus: 'all' | 'assigned' | 'unassigned';
  dietaryRestrictions: 'all' | 'has-restrictions' | 'no-restrictions';
  vipStatus: 'all' | 'vip' | 'regular';
  ageGroup: 'all' | 'adult' | 'child';
}

const AdvancedGuestFilters: React.FC<AdvancedGuestFiltersProps> = ({
  guests,
  onFilteredGuestsChange,
  categories
}) => {
  const [filters, setFilters] = useState<FilterState>({
    category: 'all',
    assignmentStatus: 'all',
    dietaryRestrictions: 'all',
    vipStatus: 'all',
    ageGroup: 'all'
  });

  const [activeFiltersCount, setActiveFiltersCount] = useState(0);

  // Applica filtri
  const applyFilters = React.useCallback(() => {
    let filtered = [...guests];

    // Filtro categoria
    if (filters.category !== 'all') {
      filtered = filtered.filter(guest => guest.category === filters.category);
    }

    // Filtro stato assegnazione
    if (filters.assignmentStatus === 'assigned') {
      filtered = filtered.filter(guest => guest.tableId);
    } else if (filters.assignmentStatus === 'unassigned') {
      filtered = filtered.filter(guest => !guest.tableId);
    }

    // Filtro restrizioni alimentari
    if (filters.dietaryRestrictions === 'has-restrictions') {
      filtered = filtered.filter(guest => guest.dietaryRestrictions && guest.dietaryRestrictions.trim() !== '');
    } else if (filters.dietaryRestrictions === 'no-restrictions') {
      filtered = filtered.filter(guest => !guest.dietaryRestrictions || guest.dietaryRestrictions.trim() === '');
    }

    // Conta filtri attivi
    let activeCount = 0;
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== 'all') activeCount++;
    });
    setActiveFiltersCount(activeCount);

    onFilteredGuestsChange(filtered);
  }, [filters, guests, onFilteredGuestsChange]);

  // Aggiorna filtro
  const updateFilter = (key: keyof FilterState, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  // Reset filtri
  const resetFilters = () => {
    setFilters({
      category: 'all',
      assignmentStatus: 'all',
      dietaryRestrictions: 'all',
      vipStatus: 'all',
      ageGroup: 'all'
    });
  };

  // Applica filtri quando cambiano
  React.useEffect(() => {
    applyFilters();
  }, [filters, applyFilters]);

  // Statistiche rapide
  const stats = React.useMemo(() => {
    const total = guests.length;
    const assigned = guests.filter(g => g.tableId).length;
    const unassigned = total - assigned;
    const withDietary = guests.filter(g => g.dietaryRestrictions && g.dietaryRestrictions.trim() !== '').length;
    
    return { total, assigned, unassigned, withDietary };
  }, [guests]);

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Filtri Avanzati
          </CardTitle>
          <div className="flex items-center gap-2">
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="text-xs">
                {activeFiltersCount} attivi
              </Badge>
            )}
            {activeFiltersCount > 0 && (
              <Button variant="ghost" size="sm" onClick={resetFilters} className="h-6 px-2">
                <X className="w-3 h-3" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Statistiche rapide */}
        <div className="grid grid-cols-2 gap-2 p-3 bg-gray-50 rounded-lg">
          <div className="text-center">
            <div className="text-lg font-bold text-green-600">{stats.assigned}</div>
            <div className="text-xs text-gray-600">Assegnati</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-red-600">{stats.unassigned}</div>
            <div className="text-xs text-gray-600">Da assegnare</div>
          </div>
        </div>

        <Separator />

        {/* Filtri */}
        <div className="space-y-3">
          {/* Categoria */}
          <div>
            <label className="text-xs font-medium text-gray-700 mb-1 block">Categoria Famiglia</label>
            <Select value={filters.category} onValueChange={(value) => updateFilter('category', value)}>
              <SelectTrigger className="h-8 text-xs">
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
          </div>

          {/* Stato assegnazione */}
          <div>
            <label className="text-xs font-medium text-gray-700 mb-1 block">Stato Assegnazione</label>
            <Select value={filters.assignmentStatus} onValueChange={(value) => updateFilter('assignmentStatus', value)}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tutti gli ospiti</SelectItem>
                <SelectItem value="assigned">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    Solo assegnati
                  </div>
                </SelectItem>
                <SelectItem value="unassigned">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-3 h-3 text-red-500" />
                    Solo non assegnati
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Restrizioni alimentari */}
          <div>
            <label className="text-xs font-medium text-gray-700 mb-1 block">Restrizioni Alimentari</label>
            <Select value={filters.dietaryRestrictions} onValueChange={(value) => updateFilter('dietaryRestrictions', value)}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tutti</SelectItem>
                <SelectItem value="has-restrictions">
                  <div className="flex items-center gap-2">
                    <Utensils className="w-3 h-3 text-orange-500" />
                    Con restrizioni ({stats.withDietary})
                  </div>
                </SelectItem>
                <SelectItem value="no-restrictions">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                    Senza restrizioni
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Filtri rapidi */}
        <div className="pt-2">
          <label className="text-xs font-medium text-gray-700 mb-2 block">Filtri Rapidi</label>
          <div className="flex flex-wrap gap-1">
            <Button
              variant={filters.assignmentStatus === 'unassigned' ? 'default' : 'outline'}
              size="sm"
              onClick={() => updateFilter('assignmentStatus', filters.assignmentStatus === 'unassigned' ? 'all' : 'unassigned')}
              className="h-6 px-2 text-xs"
            >
              <AlertCircle className="w-3 h-3 mr-1" />
              Urgenti
            </Button>
            <Button
              variant={filters.dietaryRestrictions === 'has-restrictions' ? 'default' : 'outline'}
              size="sm"
              onClick={() => updateFilter('dietaryRestrictions', filters.dietaryRestrictions === 'has-restrictions' ? 'all' : 'has-restrictions')}
              className="h-6 px-2 text-xs"
            >
              <Utensils className="w-3 h-3 mr-1" />
              Allergie
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdvancedGuestFilters;