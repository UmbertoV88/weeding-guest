import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Users, ArrowRight, ArrowLeft, Check, X } from "lucide-react";
import { TableFormData, TABLE_SIDE_LABELS, TableSide } from "@/types/table";
import { useToast } from "@/hooks/use-toast";

interface AddTableFormProps {
  addTable: (tableData: TableFormData) => Promise<void>;
}

const AddTableForm = ({ addTable }: AddTableFormProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<TableFormData>({
    nome_tavolo: '',
    capacita_max: 8,
    lato: 'centro'
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const { toast } = useToast();
  const totalSteps = 3;

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    switch (step) {
      case 1:
        if (!formData.nome_tavolo.trim()) {
          newErrors.nome_tavolo = 'Il nome del tavolo è obbligatorio';
        } else if (formData.nome_tavolo.trim().length < 2) {
          newErrors.nome_tavolo = 'Il nome deve contenere almeno 2 caratteri';
        }
        break;
      
      case 2:
        if (formData.capacita_max < 2) {
          newErrors.capacita_max = 'La capacità minima è 2 persone';
        } else if (formData.capacita_max > 20) {
          newErrors.capacita_max = 'La capacità massima è 20 persone';
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const resetForm = () => {
    setFormData({
      nome_tavolo: '',
      capacita_max: 8,
      lato: 'centro'
    });
    setCurrentStep(1);
    setErrors({});
    setIsOpen(false);
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;

    setSubmitting(true);
    try {
      await addTable(formData);
      resetForm();
    } catch (error) {
      console.error('Error in AddTableForm:', error);
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante la creazione del tavolo.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <Users className="w-12 h-12 text-primary mx-auto mb-3" />
              <h3 className="text-xl font-semibold">Nome del tavolo</h3>
              <p className="text-muted-foreground">Come vuoi chiamare questo tavolo?</p>
            </div>
            
            <div>
              <Label htmlFor="nome_tavolo">Nome tavolo *</Label>
              <Input
                id="nome_tavolo"
                value={formData.nome_tavolo}
                onChange={(e) => setFormData(prev => ({ ...prev, nome_tavolo: e.target.value }))}
                placeholder="Es: Tavolo 1, Famiglia Rossi, Amici università..."
                className={errors.nome_tavolo ? 'border-destructive' : ''}
              />
              {errors.nome_tavolo && (
                <p className="text-destructive text-sm mt-1">{errors.nome_tavolo}</p>
              )}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <Users className="w-12 h-12 text-primary mx-auto mb-3" />
              <h3 className="text-xl font-semibold">Capacità del tavolo</h3>
              <p className="text-muted-foreground">Quante persone può ospitare?</p>
            </div>
            
            <div>
              <Label htmlFor="capacita_max">Numero massimo di posti *</Label>
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
              <p className="text-xs text-muted-foreground mt-1">
                Consigliato: 6-10 persone per tavolo
              </p>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <Users className="w-12 h-12 text-primary mx-auto mb-3" />
              <h3 className="text-xl font-semibold">Posizione nella sala</h3>
              <p className="text-muted-foreground">Dove sarà posizionato questo tavolo?</p>
            </div>
            
            <div className="grid gap-3">
              {Object.entries(TABLE_SIDE_LABELS).map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, lato: key as TableSide }))}
                  className={`p-4 rounded-lg border-2 text-left transition-romantic ${
                    formData.lato === key
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <span className="font-medium">{label}</span>
                </button>
              ))}
            </div>

            {/* Summary */}
            <Card className="p-4 bg-muted/30 border-primary/20 mt-6">
              <h4 className="font-semibold mb-2">Riepilogo tavolo:</h4>
              <div className="space-y-1 text-sm">
                <div><strong>Nome:</strong> {formData.nome_tavolo}</div>
                <div><strong>Capacità:</strong> {formData.capacita_max} persone</div>
                <div><strong>Posizione:</strong> {TABLE_SIDE_LABELS[formData.lato as TableSide]}</div>
              </div>
            </Card>
          </div>
        );
      
      default:
        return null;
    }
  };

  if (!isOpen) {
    return (
      <Button 
        onClick={() => setIsOpen(true)}
        size="lg"
        className="bg-primary text-white shadow-elegant hover:shadow-floating transition-romantic"
      >
        <Plus className="w-5 h-5 mr-2" />
        Aggiungi nuovo tavolo
      </Button>
    );
  }

  return (
    <Card className="p-6 shadow-elegant border-primary/20 animate-fade-in-up">
      {/* Progress bar */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium">Passo {currentStep} di {totalSteps}</span>
          <Button 
            onClick={resetForm}
            variant="ghost" 
            size="sm"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
        <div className="w-full bg-muted rounded-full h-2">
          <div 
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      {/* Step content */}
      <div className="mb-6">
        {renderStepContent()}
      </div>

      {/* Navigation buttons */}
      <div className="flex justify-between">
        <Button
          onClick={prevStep}
          disabled={currentStep === 1}
          variant="outline"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Indietro
        </Button>

        {currentStep < totalSteps ? (
          <Button onClick={nextStep}>
            Avanti
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        ) : (
          <Button 
            onClick={handleSubmit} 
            disabled={submitting}
            className="bg-success hover:bg-success/90 text-white"
          >
            <Check className="w-4 h-4 mr-1" />
            {submitting ? 'Creazione...' : 'Crea tavolo'}
          </Button>
        )}
      </div>
    </Card>
  );
};

export default AddTableForm;