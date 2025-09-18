import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, MapPin, Armchair, Calendar } from "lucide-react";
import { TableStats as TableStatsType, TABLE_SIDE_LABELS } from "@/types/table";

interface TableStatsProps {
  stats: TableStatsType;
}

const TableStats = ({ stats }: TableStatsProps) => {
  const occupancyPercentage = stats.totalCapacity > 0 
    ? Math.round((stats.occupiedSeats / stats.totalCapacity) * 100) 
    : 0;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {/* Total Tables */}
      <Card className="p-4 shadow-soft border-primary/10 animate-fade-in-up">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Users className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Tavoli totali</p>
            <p className="text-2xl font-bold text-foreground">{stats.total}</p>
          </div>
        </div>
      </Card>

      {/* Total Capacity */}
      <Card className="p-4 shadow-soft border-primary/10 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Armchair className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Posti totali</p>
            <p className="text-2xl font-bold text-foreground">{stats.totalCapacity}</p>
          </div>
        </div>
      </Card>

      {/* Occupied Seats */}
      <Card className="p-4 shadow-soft border-primary/10 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-100 rounded-lg">
            <Calendar className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Posti occupati</p>
            <p className="text-2xl font-bold text-foreground">{stats.occupiedSeats}</p>
            <p className="text-xs text-muted-foreground">{occupancyPercentage}% occupazione</p>
          </div>
        </div>
      </Card>

      {/* Available Seats */}
      <Card className="p-4 shadow-soft border-primary/10 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-orange-100 rounded-lg">
            <MapPin className="w-5 h-5 text-orange-600" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Posti liberi</p>
            <p className="text-2xl font-bold text-foreground">{stats.availableSeats}</p>
          </div>
        </div>
      </Card>

      {/* Tables by Side */}
      <Card className="p-4 shadow-soft border-primary/10 animate-fade-in-up sm:col-span-2 lg:col-span-4" style={{ animationDelay: '0.4s' }}>
        <div className="space-y-3">
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            <MapPin className="w-4 h-4 text-primary" />
            Distribuzione per posizione
          </h3>
          <div className="flex flex-wrap gap-2">
            {Object.entries(stats.bySide).map(([side, count]) => (
              <Badge key={side} variant="secondary" className="flex items-center gap-1">
                <span>{TABLE_SIDE_LABELS[side as keyof typeof TABLE_SIDE_LABELS]}</span>
                <span className="bg-primary/20 text-primary px-1.5 py-0.5 rounded text-xs font-semibold">
                  {count}
                </span>
              </Badge>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default TableStats;