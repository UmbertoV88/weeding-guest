import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Edit, Check } from "lucide-react";
import { Table, TableFormData, TABLE_SIDE_LABELS, TableSide } from "@/types/table";
import { useToast } from "@/hooks/use-toast";

interface EditTableFormProps {
  table: Table;
  updateTable: (tableId: number, tableData: TableFormData) => Promise<void>;
}

const EditTableForm = ({ table, updateTable }: EditTableFormProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState<TableFormData>({
    nome_tavolo: '',
    capacita_max: 8,
    lato: 'centro'
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const { toast } = useToast();

  // Initialize form data when dialog opens
  useEffect(() => {
    if (isOpen && table) {
      setFormData({
        nome_tavolo: table.nome_tavolo || '',
        capacita_max: table.capacita_max,
        lato: (table.lato || 'centro') as TableSide
      });
    }
  }, [isOpen, table]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.nome_tavolo.trim()) {
      newErrors.nome_tavolo = 'Il nome del tavolo è obbligatorio';
    } else if (formData.nome_tavolo.trim().length < 2) {
      newErrors.nome_tavolo = 'Il nome deve contenere almeno 2 caratteri';
    }

    if (formData.capacita_max < 2) {
      newErrors.capacita_max = 'La capacità minima è 2 persone';
    } else if (formData.capacita_max > 20) {
      newErrors.capacita_max = 'La capacità massima è 20 persone';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      await updateTable(table.id, formData);
      setIsOpen(false);
    } catch (error) {
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante la modifica del tavolo.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        size="sm"
        variant="ghost"
        className="h-8 w-8 p-0 text-primary hover:bg-primary/10"
      >
        <Edit className="w-4 h-4" />
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Modifica Tavolo</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="nome_tavolo">Nome tavolo *</Label>
              <Input
                id="nome_tavolo"
                value={formData.nome_tavolo}
                onChange={(e) => setFormData(prev => ({ ...prev, nome_tavolo: e.target.value }))}
                placeholder="Es: Tavolo 1, Famiglia Rossi..."
                className={errors.nome_tavolo ? 'border-destructive' : ''}
              />
              {errors.nome_tavolo && (
                <p className="text-destructive text-sm mt-1">{errors.nome_tavolo}</p>
              )}
            </div>

            <div>
              <Label htmlFor="capacita_max">Capacità massima *</Label>
              <Input
                id="capacita_max"
                type="number"
                min="2"
                max="20"
                value={formData.capacita_max}
                onChange={(e) => setFormData(prev => ({ ...prev, capacita_max: parseInt(e.target.value) || 8 }))}
                className={errors.capacita_max ? 'border-destructive' : ''}
              />
              {errors.capacita_max && (
                <p className="text-destructive text-sm mt-1">{errors.capacita_max}</p>
              )}
            </div>

            <div>
              <Label htmlFor="lato">Posizione nella sala</Label>
              <select
                id="lato"
                value={formData.lato}
                onChange={(e) => setFormData(prev => ({ ...prev, lato: e.target.value as TableSide }))}
                className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {Object.entries(TABLE_SIDE_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                onClick={() => setIsOpen(false)}
                variant="outline"
                disabled={submitting}
              >
                Annulla
              </Button>
              <Button 
                onClick={handleSubmit} 
                disabled={submitting}
                className="bg-success hover:bg-success/90 text-white"
              >
                <Check className="w-4 h-4 mr-1" />
                {submitting ? 'Salvataggio...' : 'Salva modifiche'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default EditTableForm;