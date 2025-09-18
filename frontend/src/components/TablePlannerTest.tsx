import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Users, Layout, Settings, Lightbulb } from 'lucide-react';
import AdvancedGuestFilters from './AdvancedGuestFilters';
import SmartTableSuggestions from './SmartTableSuggestions';
import TableStatsDashboard from './TableStatsDashboard';
import { AdvancedTable, TableGuest } from '@/types/table';

// Mock data per testing
const mockGuests: TableGuest[] = [
  {
    id: "g1",
    name: "Marco Rossi",
    email: "marco.rossi@email.com",
    category: "Famiglia di lui",
    dietaryRestrictions: "Vegetariano",
    tableId: "t1",
    seatNumber: 1,
    user_id: "test",
    confermato: true
  },
  {
    id: "g2",
    name: "Anna Bianchi", 
    email: "anna.bianchi@email.com",
    category: "Famiglia di lei",
    dietaryRestrictions: "Senza glutine",
    tableId: undefined,
    seatNumber: undefined,
    user_id: "test",
    confermato: true
  },
  {
    id: "g3",
    name: "Luigi Verdi",
    email: "luigi.verdi@email.com", 
    category: "Amici",
    dietaryRestrictions: undefined,
    tableId: "t2",
    seatNumber: 2,
    user_id: "test",
    confermato: true
  },
  {
    id: "g4",
    name: "Sofia Romano",
    email: "sofia.romano@email.com",
    category: "Colleghi",
    dietaryRestrictions: "Vegan",
    tableId: undefined,
    seatNumber: undefined,
    user_id: "test", 
    confermato: true
  }
];

const mockTables: AdvancedTable[] = [
  {
    id: "t1",
    name: "Tavolo Famiglia",
    shape: "round",
    seats: 8,
    x: 200,
    y: 150,
    assignedGuests: ["g1"],
    user_id: "test",
    lato: "sposo"
  },
  {
    id: "t2", 
    name: "Tavolo Amici",
    shape: "round",
    seats: 6,
    x: 400,
    y: 200,
    assignedGuests: ["g3"],
    user_id: "test",
    lato: "sposa"
  },
  {
    id: "t3",
    name: "Tavolo Colleghi", 
    shape: "rectangular",
    seats: 10,
    x: 600,
    y: 150,
    assignedGuests: [],
    user_id: "test",
    lato: "centro"
  }
];

const categories = ["Famiglia di lui", "Famiglia di lei", "Amici", "Colleghi"];

const TablePlannerTest: React.FC = () => {
  const [filteredGuests, setFilteredGuests] = useState(mockGuests);
  const [activeTab, setActiveTab] = useState<string>('filters');

  const handleGuestAssignment = (guestId: string, tableId: string) => {
    console.log(`Assigning guest ${guestId} to table ${tableId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Test Advanced Components</h1>
          <p className="text-gray-600 mt-2">Testing Progress component and advanced table features</p>
        </div>

        <Card className="shadow-lg border-0">
          <CardHeader className="bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-t-lg">
            <CardTitle className="text-lg font-semibold">Advanced Features Test</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4 rounded-none">
                <TabsTrigger value="filters" className="gap-2">
                  <Users className="w-4 h-4" />
                  Filtri Avanzati
                </TabsTrigger>
                <TabsTrigger value="suggestions" className="gap-2">
                  <Lightbulb className="w-4 h-4" />
                  Suggerimenti Smart
                </TabsTrigger>
                <TabsTrigger value="stats" className="gap-2">
                  <Settings className="w-4 h-4" />
                  Statistiche
                </TabsTrigger>
                <TabsTrigger value="info" className="gap-2">
                  <Layout className="w-4 h-4" />
                  Info
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="filters" className="m-0 p-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Test Advanced Guest Filters</h3>
                  <AdvancedGuestFilters
                    guests={mockGuests}
                    categories={categories}
                    onFilteredGuestsChange={setFilteredGuests}
                  />
                  <div className="mt-4">
                    <Badge variant="secondary">
                      Filtered Guests: {filteredGuests.length}
                    </Badge>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="suggestions" className="m-0 p-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Test Smart Table Suggestions</h3>
                  <SmartTableSuggestions
                    guests={mockGuests}
                    tables={mockTables}
                    onApplySuggestion={handleGuestAssignment}
                  />
                </div>
              </TabsContent>
              
              <TabsContent value="stats" className="m-0 p-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Test Statistics Dashboard (with Progress Component)</h3>
                  <TableStatsDashboard
                    guests={mockGuests}
                    tables={mockTables}
                    categories={categories}
                  />
                </div>
              </TabsContent>
              
              <TabsContent value="info" className="m-0 p-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Component Status</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardContent className="p-4">
                        <h4 className="font-semibold text-green-600">✅ AdvancedGuestFilters</h4>
                        <p className="text-sm text-gray-600">Component loaded successfully</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <h4 className="font-semibold text-green-600">✅ SmartTableSuggestions</h4>
                        <p className="text-sm text-gray-600">Component loaded successfully</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <h4 className="font-semibold text-green-600">✅ TableStatsDashboard</h4>
                        <p className="text-sm text-gray-600">Component with Progress bars loaded</p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TablePlannerTest;