import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { Guest, GuestStatus } from "@/types/guest";
import { exportGuestsToCSV } from "@/services/csvExport";
import { useToast } from "@/hooks/use-toast";

interface ExportButtonProps {
  getAllGuests: () => Guest[];
  getGuestsByStatus: (status: GuestStatus) => Guest[];
}

const ExportButton = ({ getAllGuests, getGuestsByStatus }: ExportButtonProps) => {
  const { toast } = useToast();

  const handleExport = () => {
    try {
      const allGuests = getAllGuests();
      exportGuestsToCSV(allGuests, "lista_invitati_completa");
      
      toast({
        title: "Export completato!",
        description: `Esportati ${allGuests.length} invitati in formato CSV`,
      });
    } catch (error) {
      toast({
        title: "Errore durante l'export",
        description: "Si è verificato un errore durante l'esportazione",
        variant: "destructive",
      });
    }
  };

  return (
    <Button 
      onClick={handleExport}
      variant="outline" 
      className="flex items-center gap-2 text-primary hover:bg-primary hover:text-primary-foreground transition-romantic"
    >
      <Download className="w-4 h-4" />
      Esporta CSV
    </Button>
  );
};

export default ExportButton;