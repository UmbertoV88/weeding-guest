import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Users, 
  Search, 
  Edit, 
  Trash2, 
  MapPin,
  Filter
} from "lucide-react";
import { Table, TABLE_SIDE_LABELS, TableSide } from "@/types/table";
import { useToast } from "@/hooks/use-toast";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import EditTableForm from "@/components/EditTableForm";

interface TableListProps {
  tables: Table[];
  updateTable: (tableId: number, tableData: any) => Promise<void>;
  deleteTable: (tableId: number) => Promise<void>;
}

const TableList = ({ tables, updateTable, deleteTable }: TableListProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSide, setSelectedSide] = useState<string>("all");
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    tableId: number | null;
    tableName: string;
  }>({
    open: false,
    tableId: null,
    tableName: ""
  });

  const { toast } = useToast();

  // Filter tables based on search and side
  const filteredTables = tables.filter(table => {
    const matchesSearch = table.nome_tavolo?.toLowerCase().includes(searchTerm.toLowerCase()) || false;
    const matchesSide = selectedSide === "all" || table.lato === selectedSide;
    return matchesSearch && matchesSide;
  });

  const handleDelete = async (tableId: number, tableName: string) => {
    setDeleteDialog({
      open: true,
      tableId,
      tableName
    });
  };

  const confirmDelete = async () => {
    if (!deleteDialog.tableId) return;

    try {
      await deleteTable(deleteDialog.tableId);
      setDeleteDialog({ open: false, tableId: null, tableName: "" });
    } catch (error) {
      toast({
        title: "Errore",
        description: error instanceof Error ? error.message : "Errore durante l'eliminazione del tavolo",
        variant: "destructive",
      });
    }
  };

  const sides = Object.keys(TABLE_SIDE_LABELS);

  if (tables.length === 0) {
    return (
      <Card className="p-8 text-center shadow-soft border-primary/10">
        <div className="mx-auto w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mb-4">
          <Users className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">
          Nessun tavolo creato
        </h3>
        <p className="text-muted-foreground">
          Inizia creando il primo tavolo per il tuo matrimonio.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search and filters */}
      <Card className="p-4 shadow-soft border-primary/10">
        <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Cerca tavoli..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <select
              value={selectedSide}
              onChange={(e) => setSelectedSide(e.target.value)}
              className="px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm"
            >
              <option value="all">Tutte le posizioni</option>
              {sides.map(side => (
                <option key={side} value={side}>
                  {TABLE_SIDE_LABELS[side as TableSide]}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="mt-3 text-sm text-muted-foreground">
          Visualizzando {filteredTables.length} di {tables.length} tavoli
        </div>
      </Card>

      {/* Tables grid */}
      {filteredTables.length === 0 ? (
        <Card className="p-8 text-center shadow-soft border-primary/10">
          <div className="mx-auto w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mb-4">
            <Users className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Nessun risultato
          </h3>
          <p className="text-muted-foreground">
            Prova a modificare i filtri di ricerca.
          </p>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredTables.map((table, index) => (
            <Card 
              key={table.id} 
              className="p-4 shadow-soft border-primary/10 hover:shadow-elegant transition-romantic animate-fade-in-up"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className="space-y-3">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-foreground">
                      {table.nome_tavolo || `Tavolo ${table.id}`}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary" className="text-xs">
                        <Users className="w-3 h-3 mr-1" />
                        {table.capacita_max} posti
                      </Badge>
                      {table.lato && (
                        <Badge variant="outline" className="text-xs">
                          <MapPin className="w-3 h-3 mr-1" />
                          {TABLE_SIDE_LABELS[table.lato as TableSide]}
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <EditTableForm 
                      table={table} 
                      updateTable={updateTable}
                    />
                    <Button
                      onClick={() => handleDelete(table.id, table.nome_tavolo || `Tavolo ${table.id}`)}
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Table info */}
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex justify-between">
                    <span>Capacità massima:</span>
                    <span className="font-medium">{table.capacita_max} persone</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Posizione:</span>
                    <span className="font-medium">
                      {table.lato ? TABLE_SIDE_LABELS[table.lato as TableSide] : 'Non specificata'}
                    </span>
                  </div>
                  {table.created_at && (
                    <div className="flex justify-between">
                      <span>Creato il:</span>
                      <span className="font-medium">
                        {new Date(table.created_at).toLocaleDateString('it-IT')}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog(prev => ({ ...prev, open }))}
        title="Elimina tavolo"
        description={`Sei sicuro di voler eliminare "${deleteDialog.tableName}"? Questa azione non può essere annullata.`}
        confirmText="Elimina"
        cancelText="Annulla"
        onConfirm={confirmDelete}
        variant="destructive"
      />
    </div>
  );
};

export default TableList;