import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Lightbulb, Users, AlertTriangle, CheckCircle, ArrowRight, Zap } from 'lucide-react';
import { AdvancedTable, TableGuest } from '@/types/table';

interface SmartTableSuggestionsProps {
  guests: TableGuest[];
  tables: AdvancedTable[];
  onApplySuggestion: (guestId: string, tableId: string) => void;
}

interface Suggestion {
  id: string;
  type: 'family_grouping' | 'dietary_match' | 'capacity_optimization' | 'conflict_resolution';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  guestId: string;
  guestName: string;
  recommendedTableId: string;
  recommendedTableName: string;
  reason: string;
  confidence: number;
}

const SmartTableSuggestions: React.FC<SmartTableSuggestionsProps> = ({
  guests,
  tables,
  onApplySuggestion
}) => {
  const suggestions = useMemo(() => {
    const suggestions: Suggestion[] = [];
    const unassignedGuests = guests.filter(g => !g.tableId);

    unassignedGuests.forEach(guest => {
      // Suggerimento 1: Raggruppamento famiglia
      const familyMembers = guests.filter(g => 
        g.category === guest.category && 
        g.id !== guest.id && 
        g.tableId
      );

      if (familyMembers.length > 0) {
        const mostCommonTable = familyMembers.reduce((acc, member) => {
          const tableId = member.tableId!;
          acc[tableId] = (acc[tableId] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        const bestTableId = Object.entries(mostCommonTable)
          .sort(([,a], [,b]) => b - a)[0]?.[0];

        if (bestTableId) {
          const table = tables.find(t => t.id === bestTableId);
          const availableSeats = table ? table.seats - table.assignedGuests.length : 0;

          if (table && availableSeats > 0) {
            suggestions.push({
              id: `family_${guest.id}_${bestTableId}`,
              type: 'family_grouping',
              priority: 'high',
              title: 'Raggruppamento Famiglia',
              description: `${guest.name} dovrebbe sedersi con altri membri della categoria "${guest.category}"`,
              guestId: guest.id,
              guestName: guest.name,
              recommendedTableId: bestTableId,
              recommendedTableName: table.name,
              reason: `${mostCommonTable[bestTableId]} membri della stessa categoria già al tavolo`,
              confidence: Math.min(90, mostCommonTable[bestTableId] * 30)
            });
          }
        }
      }

      // Suggerimento 2: Restrizioni alimentari simili
      if (guest.dietaryRestrictions) {
        const guestsWithSameDiet = guests.filter(g => 
          g.dietaryRestrictions === guest.dietaryRestrictions && 
          g.id !== guest.id && 
          g.tableId
        );

        if (guestsWithSameDiet.length > 0) {
          const dietTable = guestsWithSameDiet[0];
          const table = tables.find(t => t.id === dietTable.tableId);
          const availableSeats = table ? table.seats - table.assignedGuests.length : 0;

          if (table && availableSeats > 0) {
            suggestions.push({
              id: `diet_${guest.id}_${table.id}`,
              type: 'dietary_match',
              priority: 'medium',
              title: 'Restrizioni Alimentari',
              description: `${guest.name} ha le stesse esigenze alimentari di altri ospiti`,
              guestId: guest.id,
              guestName: guest.name,
              recommendedTableId: table.id,
              recommendedTableName: table.name,
              reason: `Stessa restrizione: ${guest.dietaryRestrictions}`,
              confidence: 75
            });
          }
        }
      }

      // Suggerimento 3: Ottimizzazione capacità
      const underUtilizedTables = tables.filter(t => {
        const occupancy = t.assignedGuests.length / t.seats;
        return occupancy < 0.5 && t.assignedGuests.length > 0;
      });

      if (underUtilizedTables.length > 0) {
        const bestTable = underUtilizedTables[0];
        suggestions.push({
          id: `capacity_${guest.id}_${bestTable.id}`,
          type: 'capacity_optimization',
          priority: 'low',
          title: 'Ottimizzazione Tavoli',
          description: `${guest.name} può completare un tavolo sottoutilizzato`,
          guestId: guest.id,
          guestName: guest.name,
          recommendedTableId: bestTable.id,
          recommendedTableName: bestTable.name,
          reason: `Tavolo occupato solo al ${Math.round((bestTable.assignedGuests.length / bestTable.seats) * 100)}%`,
          confidence: 60
        });
      }
    });

    // Ordina per priorità e confidenza
    return suggestions.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
      if (priorityDiff !== 0) return priorityDiff;
      return b.confidence - a.confidence;
    }).slice(0, 10); // Mostra solo le prime 10 suggerimenti
  }, [guests, tables]);

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'medium': return <Lightbulb className="w-4 h-4 text-yellow-500" />;
      case 'low': return <CheckCircle className="w-4 h-4 text-green-500" />;
      default: return <Lightbulb className="w-4 h-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-red-200 bg-red-50';
      case 'medium': return 'border-yellow-200 bg-yellow-50';
      case 'low': return 'border-green-200 bg-green-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  if (suggestions.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <CheckCircle className="w-12 h-12 mx-auto mb-3 text-green-500" />
          <h3 className="font-semibold text-gray-900 mb-2">Ottimo Lavoro!</h3>
          <p className="text-sm text-gray-600">
            Non ci sono suggerimenti al momento. La tua disposizione sembra ben organizzata!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Zap className="w-5 h-5 text-blue-500" />
          Suggerimenti Intelligenti
          <Badge variant="secondary" className="ml-auto">
            {suggestions.length}
          </Badge>
        </CardTitle>
        <p className="text-sm text-gray-600">
          AI-powered suggestions per ottimizzare la disposizione degli ospiti
        </p>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {suggestions.map(suggestion => (
          <div
            key={suggestion.id}
            className={`border rounded-lg p-4 ${getPriorityColor(suggestion.priority)}`}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                {getPriorityIcon(suggestion.priority)}
                <h4 className="font-medium text-sm">{suggestion.title}</h4>
                <Badge variant="outline" className="text-xs">
                  {suggestion.confidence}% match
                </Badge>
              </div>
            </div>
            
            <p className="text-xs text-gray-700 mb-3">{suggestion.description}</p>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs">
                <Users className="w-3 h-3" />
                <span className="font-medium">{suggestion.guestName}</span>
                <ArrowRight className="w-3 h-3 text-gray-400" />
                <span className="font-medium">{suggestion.recommendedTableName}</span>
              </div>
              
              <Button
                size="sm"
                onClick={() => onApplySuggestion(suggestion.guestId, suggestion.recommendedTableId)}
                className="h-6 px-2 text-xs"
              >
                Applica
              </Button>
            </div>
            
            <div className="mt-2 text-xs text-gray-600 bg-white/50 rounded px-2 py-1">
              💡 {suggestion.reason}
            </div>
          </div>
        ))}
        
        {suggestions.length > 0 && (
          <Alert>
            <Lightbulb className="w-4 h-4" />
            <AlertDescription className="text-xs">
              I suggerimenti sono basati su categoria famiglia, restrizioni alimentari e ottimizzazione capacità tavoli.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

export default SmartTableSuggestions;