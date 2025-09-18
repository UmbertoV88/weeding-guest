import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Users, Utensils, AlertTriangle, CheckCircle, TrendingUp, BarChart3 } from 'lucide-react';
import { AdvancedTable, TableGuest } from '@/types/table';

interface TableStatsDashboardProps {
  guests: TableGuest[];
  tables: AdvancedTable[];
  categories: string[];
}

const TableStatsDashboard: React.FC<TableStatsDashboardProps> = ({
  guests,
  tables,
  categories
}) => {
  // Calcola statistiche principali
  const stats = React.useMemo(() => {
    const totalGuests = guests.length;
    const assignedGuests = guests.filter(g => g.tableId).length;
    const unassignedGuests = totalGuests - assignedGuests;
    const assignmentProgress = totalGuests > 0 ? (assignedGuests / totalGuests) * 100 : 0;

    // Statistiche tavoli
    const totalTables = tables.length;
    const totalCapacity = tables.reduce((sum, table) => sum + table.seats, 0);
    const occupiedSeats = assignedGuests;
    const capacityUtilization = totalCapacity > 0 ? (occupiedSeats / totalCapacity) * 100 : 0;

    // Restrizioni alimentari
    const guestsWithDietary = guests.filter(g => g.dietaryRestrictions && g.dietaryRestrictions.trim() !== '').length;
    const dietaryTypes = guests
      .filter(g => g.dietaryRestrictions && g.dietaryRestrictions.trim() !== '')
      .reduce((acc, guest) => {
        const restriction = guest.dietaryRestrictions!.toLowerCase();
        acc[restriction] = (acc[restriction] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

    // Distribuzione per categoria
    const categoryDistribution = categories.map(category => {
      const categoryGuests = guests.filter(g => g.category === category);
      const assignedInCategory = categoryGuests.filter(g => g.tableId).length;
      return {
        category,
        total: categoryGuests.length,
        assigned: assignedInCategory,
        percentage: categoryGuests.length > 0 ? (assignedInCategory / categoryGuests.length) * 100 : 0
      };
    });

    // Efficienza tavoli
    const tableEfficiency = tables.map(table => {
      const occupancy = (table.assignedGuests.length / table.seats) * 100;
      const tableGuests = guests.filter(g => g.tableId === table.id);
      const dietaryCount = tableGuests.filter(g => g.dietaryRestrictions).length;
      
      return {
        id: table.id,
        name: table.name,
        occupancy,
        occupancyLevel: occupancy === 100 ? 'full' : occupancy >= 75 ? 'high' : occupancy >= 50 ? 'medium' : occupancy > 0 ? 'low' : 'empty',
        seats: table.seats,
        assigned: table.assignedGuests.length,
        dietaryCount,
        lato: table.lato || 'centro'
      };
    });

    // Problemi da risolvere
    const issues: Array<{type: string, message: string, severity: 'high' | 'medium' | 'low', count: number}> = [];
    
    if (unassignedGuests > 0) {
      issues.push({
        type: 'unassigned',
        message: `${unassignedGuests} ospiti non assegnati`,
        severity: 'high',
        count: unassignedGuests
      });
    }

    const underUtilizedTables = tableEfficiency.filter(t => t.occupancyLevel === 'low').length;
    if (underUtilizedTables > 0) {
      issues.push({
        type: 'underutilized',
        message: `${underUtilizedTables} tavoli sottoutilizzati`,
        severity: 'medium',
        count: underUtilizedTables
      });
    }

    const emptyTables = tableEfficiency.filter(t => t.occupancyLevel === 'empty').length;
    if (emptyTables > 0) {
      issues.push({
        type: 'empty',
        message: `${emptyTables} tavoli vuoti`,
        severity: 'low',
        count: emptyTables
      });
    }

    return {
      totalGuests,
      assignedGuests,
      unassignedGuests,
      assignmentProgress,
      totalTables,
      totalCapacity,
      occupiedSeats,
      capacityUtilization,
      guestsWithDietary,
      dietaryTypes,
      categoryDistribution,
      tableEfficiency,
      issues
    };
  }, [guests, tables, categories]);

  const getProgressColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-green-500';
    if (percentage >= 70) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getOccupancyColor = (level: string) => {
    switch (level) {
      case 'full': return 'bg-green-500';
      case 'high': return 'bg-blue-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-orange-500';
      case 'empty': return 'bg-gray-300';
      default: return 'bg-gray-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Progresso Assegnazione</p>
                <p className="text-2xl font-bold">{Math.round(stats.assignmentProgress)}%</p>
              </div>
              <div className="p-2 bg-blue-100 rounded-full">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <Progress value={stats.assignmentProgress} className="mt-2" />
            <p className="text-xs text-gray-500 mt-1">
              {stats.assignedGuests} di {stats.totalGuests} ospiti assegnati
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Utilizzo Capacità</p>
                <p className="text-2xl font-bold">{Math.round(stats.capacityUtilization)}%</p>
              </div>
              <div className="p-2 bg-green-100 rounded-full">
                <BarChart3 className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <Progress value={stats.capacityUtilization} className="mt-2" />
            <p className="text-xs text-gray-500 mt-1">
              {stats.occupiedSeats} di {stats.totalCapacity} posti occupati
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Restrizioni Alimentari</p>
                <p className="text-2xl font-bold">{stats.guestsWithDietary}</p>
              </div>
              <div className="p-2 bg-orange-100 rounded-full">
                <Utensils className="w-6 h-6 text-orange-600" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-3">
              {Object.keys(stats.dietaryTypes).length} tipi diversi
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Problemi</p>
                <p className="text-2xl font-bold text-red-600">{stats.issues.length}</p>
              </div>
              <div className="p-2 bg-red-100 rounded-full">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-3">
              {stats.issues.filter(i => i.severity === 'high').length} critici
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Distribuzione per Categoria */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Distribuzione per Categoria</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats.categoryDistribution.map(category => (
              <div key={category.category} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{category.category}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">
                      {category.assigned}/{category.total}
                    </span>
                    <Badge variant={category.percentage === 100 ? 'default' : category.percentage >= 50 ? 'secondary' : 'destructive'}>
                      {Math.round(category.percentage)}%
                    </Badge>
                  </div>
                </div>
                <Progress value={category.percentage} className="h-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Efficienza Tavoli */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Efficienza Tavoli</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {stats.tableEfficiency.map(table => (
              <div key={table.id} className="border rounded-lg p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-sm">{table.name}</h4>
                  <div className={`w-3 h-3 rounded-full ${getOccupancyColor(table.occupancyLevel)}`}></div>
                </div>
                
                <div className="flex items-center justify-between text-xs text-gray-600">
                  <span>{table.assigned}/{table.seats} posti</span>
                  <span>{Math.round(table.occupancy)}%</span>
                </div>
                
                <Progress value={table.occupancy} className="h-2" />
                
                <div className="flex items-center justify-between text-xs">
                  <Badge variant="outline" className="text-xs">
                    {table.lato === 'sposo' ? 'Lato Sposo' : table.lato === 'sposa' ? 'Lato Sposa' : 'Centro'}
                  </Badge>
                  {table.dietaryCount > 0 && (
                    <span className="text-orange-600 flex items-center gap-1">
                      <Utensils className="w-3 h-3" />
                      {table.dietaryCount}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Problemi e Raccomandazioni */}
      {stats.issues.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              Problemi da Risolvere
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {stats.issues.map((issue, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className={`w-4 h-4 ${
                      issue.severity === 'high' ? 'text-red-500' : 
                      issue.severity === 'medium' ? 'text-yellow-500' : 'text-blue-500'
                    }`} />
                    <span className="text-sm">{issue.message}</span>
                  </div>
                  <Badge variant={issue.severity === 'high' ? 'destructive' : issue.severity === 'medium' ? 'secondary' : 'outline'}>
                    {issue.severity}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TableStatsDashboard;