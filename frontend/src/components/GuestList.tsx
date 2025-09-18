import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  UserCheck,
  RotateCcw,
  Trash2,
  Users,
  AlertTriangle,
  Filter
} from "lucide-react";
import EditGuestForm from "@/components/EditGuestForm";
import { Guest, CATEGORY_LABELS, GuestStatus, AGE_GROUP_LABELS, AgeGroup } from "@/types/guest";
import { useToast } from "@/hooks/use-toast";
import { ConfirmDialog } from "@/components/ConfirmDialog";

interface GuestListProps {
  guests: Guest[];
  type: "pending" | "confirmed" | "deleted";
  emptyMessage: string;
  companionLoading?: string | null;
  confirmGuest: (guestId: string) => Promise<any>;
  confirmGuestOnly: (guestId: string) => Promise<any>;
  revertGuestOnly: (guestId: string) => Promise<any>;
  confirmGuestAndAllCompanions: (guestId: string) => Promise<any>;
  restoreGuest: (guestId: string) => Promise<any>;
  deleteGuest: (guestId: string) => Promise<any>;
  permanentlyDeleteGuest: (guestId: string) => Promise<any>;
  updateGuest: (guestId: string, formData: any) => Promise<any>;
  updateGuestStatus: (guestId: string, status: GuestStatus) => Promise<any>;
  updateCompanionStatus: (guestId: string, companionId: string, status: GuestStatus) => Promise<any>;
  confirmCompanion: (guestId: string, companionId: string) => Promise<any>;
  deleteCompanion: (guestId: string, companionId: string) => Promise<any>;
  restoreCompanion: (guestId: string, companionId: string) => Promise<any>;
  permanentlyDeleteCompanion: (guestId: string, companionId: string) => Promise<any>;
}

const GuestList = ({ guests, type, emptyMessage, companionLoading, confirmGuest, confirmGuestOnly, revertGuestOnly, confirmGuestAndAllCompanions, restoreGuest, deleteGuest, permanentlyDeleteGuest, updateGuest, updateGuestStatus, updateCompanionStatus, confirmCompanion, deleteCompanion, restoreCompanion, permanentlyDeleteCompanion }: GuestListProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    title: string;
    description: string;
    onConfirm: () => void;
  }>({
    open: false,
    title: "",
    description: "",
    onConfirm: () => {}
  });
  const { toast } = useToast();

  // Filter guests based on search and category
  const filteredGuests = guests.filter(guest => {
    const matchesSearch = guest.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      guest.companions.some(comp => comp.name.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === "all" || guest.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const handleConfirmMainOnly = async (guestId: string, guestName: string) => {
    try {
      await confirmGuestOnly(guestId);
      toast({
        title: "Invitato confermato!",
        description: `${guestName} è stato confermato (solo l'invitato principale).`,
      });
    } catch (error) {
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante la conferma.",
        variant: "destructive",
      });
    }
  };

  const handleRestore = async (guestId: string, guestName: string) => {
    try {
      await restoreGuest(guestId);
      toast({
        title: "Invitato ripristinato!",
        description: `${guestName} è stato ripristinato nell'elenco.`,
      });
    } catch (error) {
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante il ripristino.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (guestId: string, guestName: string) => {
    try {
      await deleteGuest(guestId);
      toast({
        title: "Invitato eliminato",
        description: `${guestName} è stato spostato nel cestino.`,
        variant: "destructive",
      });
    } catch (error) {
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante l'eliminazione.",
        variant: "destructive",
      });
    }
  };

  const handlePermanentDelete = async (guestId: string, guestName: string) => {
    setDeleteDialog({
      open: true,
      title: "Elimina definitivamente invitato",
      description: `Sei sicuro di voler eliminare definitivamente ${guestName}? Questa azione non può essere annullata.`,
      onConfirm: async () => {
        try {
          await permanentlyDeleteGuest(guestId);
          toast({
            title: "Invitato eliminato definitivamente",
            description: `${guestName} è stato rimosso permanentemente.`,
            variant: "destructive",
          });
        } catch (error) {
          toast({
            title: "Errore",
            description: "Si è verificato un errore durante l'eliminazione permanente.",
            variant: "destructive",
          });
        }
      }
    });
  };

  const handleRevertMainOnly = async (guestId: string, guestName: string) => {
    try {
      await revertGuestOnly(guestId);
      toast({
        title: "Invitato riportato a da confermare!",
        description: `${guestName} è stato riportato nello stato da confermare (solo l'invitato principale).`,
      });
    } catch (error) {
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante l'operazione.",
        variant: "destructive",
      });
    }
  };

  const handleConfirmAll = async (guestId: string, guestName: string) => {
    try {
      await confirmGuestAndAllCompanions(guestId);
      toast({
        title: "Gruppo confermato!",
        description: `${guestName} e tutti gli accompagnatori sono stati confermati.`,
      });
    } catch (error) {
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante la conferma del gruppo.",
        variant: "destructive",
      });
    }
  };

  const handleConfirmedToending = async (guestId: string, guestName: string) => {
    try {
      await updateGuestStatus(guestId, 'pending');
      toast({
        title: "Invitato riportato a da confermare!",
        description: `${guestName} è stato riportato nello stato da confermare.`,
      });
    } catch (error) {
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante l'operazione.",
        variant: "destructive",
      });
    }
  };

  const categories = Object.keys(CATEGORY_LABELS);

  return (
    <div className="space-y-4 w-full">
      {/* Search and filters */}
      <Card className="p-4 shadow-soft border-primary/10 w-full">
        <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
          <div className="flex-1 min-w-0">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Cerca invitati..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-2 flex-shrink-0">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm min-w-0"
            >
              <option value="all">Tutte</option>
              {categories.map(category => (
                <option key={category} value={category}>
                  {CATEGORY_LABELS[category as keyof typeof CATEGORY_LABELS]}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="mt-3 text-sm text-muted-foreground">
          Visualizzando {filteredGuests.length} di {guests.length} invitati
        </div>
      </Card>

      {/* Guest list */}
      {filteredGuests.length === 0 ? (
        <Card className="p-8 text-center shadow-soft border-primary/10 w-full">
          <div className="mx-auto w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mb-4">
            <Users className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            {searchTerm || selectedCategory !== "all" ? "Nessun risultato" : "Lista vuota"}
          </h3>
          <p className="text-muted-foreground text-responsive">
            {searchTerm || selectedCategory !== "all" 
              ? "Prova a modificare i filtri di ricerca." 
              : emptyMessage
            }
          </p>
        </Card>
      ) : (
        <div className="grid gap-4 w-full">
          {filteredGuests.map((guest, index) => (
            <Card 
              key={guest.id} 
              className="p-4 shadow-soft border-primary/10 hover:shadow-elegant transition-romantic animate-fade-in-up w-full overflow-hidden"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className="flex flex-col space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold text-foreground text-responsive">
                        {guest.name}
                      </h3>
                      <Badge variant="secondary" className="text-xs">
                        {CATEGORY_LABELS[guest.category]}
                      </Badge>
                      {guest.ageGroup && (
                        <Badge variant="outline" className="text-xs">
                          {AGE_GROUP_LABELS[guest.ageGroup]}
                        </Badge>
                      )}
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      {guest.companions.length > 0 && (
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-muted-foreground text-xs font-medium">
                            <Users className="w-3 h-3" />
                            <span>Accompagnatori:</span>
                          </div>
                          <div className="pl-5 space-y-2">
                            {guest.companions.map(companion => (
                              <div key={companion.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                <div className="flex flex-wrap items-center gap-2 min-w-0">
                                  <span className="text-sm text-responsive">{companion.name}</span>
                                  {companion.ageGroup && (
                                    <Badge variant="outline" className="text-xs">
                                      {AGE_GROUP_LABELS[companion.ageGroup]}
                                    </Badge>
                                  )}
                                  <Badge 
                                    variant={
                                      companion.status === 'confirmed' ? 'default' : 
                                      companion.status === 'pending' ? 'secondary' : 
                                      'destructive'
                                    }
                                    className="text-xs"
                                  >
                                    {companion.status === 'confirmed' ? 'Confermato' : 
                                     companion.status === 'pending' ? 'Da confermare' : 
                                     'Eliminato'}
                                  </Badge>
                                </div>
                                <div className="flex items-center gap-1 flex-shrink-0">
                                  {/* Show companion actions regardless of main guest status if companion is pending */}
                                  {companion.status === 'pending' && (
                                    <>
                                      <Button
                                        onClick={() => confirmCompanion(guest.id, companion.id)}
                                        size="sm"
                                        variant="ghost"
                                        className="h-6 px-2 text-xs bg-success/10 hover:bg-success/20 text-success"
                                        disabled={companionLoading === companion.id}
                                      >
                                        <UserCheck className="w-3 h-3" />
                                      </Button>
                                      <Button
                                        onClick={() => deleteCompanion(guest.id, companion.id)}
                                        size="sm"
                                        variant="ghost"
                                        className="h-6 px-2 text-xs text-destructive hover:bg-destructive/10"
                                        disabled={companionLoading === companion.id}
                                      >
                                        <Trash2 className="w-3 h-3" />
                                      </Button>
                                    </>
                                  )}
                                  {/* Show delete for confirmed companions */}
                                  {companion.status === 'confirmed' && (
                                    <>
                                      <Button
                                        onClick={() => {
                                          // Change companion status to pending
                                          updateCompanionStatus(guest.id, companion.id, 'pending');
                                        }}
                                        size="sm"
                                        variant="ghost"
                                        className="h-6 px-2 text-xs text-primary hover:bg-primary/10"
                                        disabled={companionLoading === companion.id}
                                      >
                                        <RotateCcw className="w-3 h-3" />
                                      </Button>
                                      <Button
                                        onClick={() => deleteCompanion(guest.id, companion.id)}
                                        size="sm"
                                        variant="ghost"
                                        className="h-6 px-2 text-xs text-destructive hover:bg-destructive/10"
                                        disabled={companionLoading === companion.id}
                                      >
                                        <Trash2 className="w-3 h-3" />
                                      </Button>
                                    </>
                                  )}
                                  {/* Show restore for deleted companions */}
                                  {type === "deleted" && companion.status === 'deleted' && (
                                    <>
                                      <Button
                                        onClick={() => restoreCompanion(guest.id, companion.id)}
                                        size="sm"
                                        variant="ghost"
                                        className="h-6 px-2 text-xs text-primary hover:bg-primary/10"
                                        disabled={companionLoading === companion.id}
                                      >
                                        <RotateCcw className="w-3 h-3" />
                                      </Button>
                                       <Button
                                         onClick={() => {
                                           setDeleteDialog({
                                             open: true,
                                             title: "Elimina definitivamente accompagnatore",
                                             description: `Eliminare definitivamente ${companion.name}?`,
                                             onConfirm: () => permanentlyDeleteCompanion(guest.id, companion.id)
                                           });
                                         }}
                                         size="sm"
                                         variant="ghost"
                                         className="h-6 px-2 text-xs text-destructive hover:bg-destructive/10"
                                         disabled={companionLoading === companion.id}
                                       >
                                         <Trash2 className="w-3 h-3" />
                                       </Button>
                                    </>
                                  )}
                               </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {(guest.allergies || guest.companions.some(comp => comp.allergies)) && (
                        <div className="flex items-start gap-2 text-warning">
                          <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                          <div className="text-responsive">
                            {guest.allergies && (
                              <div>{guest.name}: {guest.allergies}</div>
                            )}
                            {guest.companions.filter(comp => comp.allergies).map(comp => (
                              <div key={comp.id}>{comp.name}: {comp.allergies}</div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Main guest action icons - only show for cards that contain the primary guest */}
                  {guest.containsPrimary && (
                    <div className="flex flex-wrap items-center gap-2">
                      {/* Edit button - available for all statuses */}
                      <EditGuestForm guest={guest} updateGuest={updateGuest} />
                      
                      {guest.status === 'pending' && (
                        <>
                          <Button
                            onClick={() => handleConfirmMainOnly(guest.id, guest.name)}
                            size="sm"
                            variant="ghost"
                            className="h-6 px-2 text-xs bg-success/10 hover:bg-success/20 text-success"
                          >
                            <UserCheck className="w-3 h-3" />
                          </Button>
                          <Button
                            onClick={() => handleDelete(guest.id, guest.name)}
                            size="sm"
                            variant="ghost"
                            className="h-6 px-2 text-xs text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </>
                      )}
                      {guest.status === 'confirmed' && (
                        <>
                          <Button
                            onClick={() => handleRevertMainOnly(guest.id, guest.name)}
                            size="sm"
                            variant="ghost"
                            className="h-6 px-2 text-xs text-primary hover:bg-primary/10"
                          >
                            <RotateCcw className="w-3 h-3" />
                          </Button>
                          <Button
                            onClick={() => handleDelete(guest.id, guest.name)}
                            size="sm"
                            variant="ghost"
                            className="h-6 px-2 text-xs text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </>
                      )}
                      {type === "deleted" && guest.status === 'deleted' && (
                        <>
                          <Button
                            onClick={() => handleRestore(guest.id, guest.name)}
                            size="sm"
                            variant="ghost"
                            className="h-6 px-2 text-xs text-primary hover:bg-primary/10"
                          >
                            <RotateCcw className="w-3 h-3" />
                          </Button>
                          <Button
                            onClick={() => handlePermanentDelete(guest.id, guest.name)}
                            size="sm"
                            variant="ghost"
                            className="h-6 px-2 text-xs text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </>
                      )}
                    </div>
                  )}
                </div>
                
                {/* Show group actions only for cards that contain the primary guest */}
                {guest.containsPrimary && (
                  <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-primary/10">
                    {type === "pending" && (
                      <>
                        {/* Show "Conferma tutto" and "Elimina tutto" only if there are companions */}
                        {guest.companions.length > 0 && guest.companions.some(comp => comp.status === 'pending') && (
                          <Button
                            onClick={() => handleConfirmAll(guest.id, guest.name)}
                            size="sm"
                            className="bg-success hover:bg-success/90 text-white text-xs"
                          >
                            <UserCheck className="w-4 h-4 mr-1" />
                            <span className="hidden sm:inline">Conferma tutto</span>
                            <span className="sm:hidden">Conferma</span>
                          </Button>
                        )}
                        {guest.companions.length > 0 && (
                          <Button
                            onClick={() => handleDelete(guest.id, guest.name)}
                            size="sm"
                            variant="destructive"
                            className="text-xs"
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            <span className="hidden sm:inline">Elimina tutto</span>
                            <span className="sm:hidden">Elimina</span>
                          </Button>
                        )}
                      </>
                    )}
                    
                    {type === "confirmed" && (
                      <Button
                        onClick={() => handleConfirmedToending(guest.id, guest.name)}
                        size="sm"
                        variant="outline"
                        className="text-xs"
                      >
                        <RotateCcw className="w-4 h-4 mr-1" />
                        <span className="hidden sm:inline">Riporta a da confermare</span>
                        <span className="sm:hidden">Riporta</span>
                      </Button>
                    )}
                    
                    {type === "deleted" && (
                      <>
                        <Button
                          onClick={() => handleRestore(guest.id, guest.name)}
                          size="sm"
                          variant="outline"
                          className="text-xs"
                        >
                          <RotateCcw className="w-4 h-4 mr-1" />
                          <span className="hidden sm:inline">Ripristina</span>
                          <span className="sm:hidden">Ripristina</span>
                        </Button>
                        <Button
                          onClick={() => handlePermanentDelete(guest.id, guest.name)}
                          size="sm"
                          variant="destructive"
                          className="text-xs"
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          <span className="hidden sm:inline">Elimina per sempre</span>
                          <span className="sm:hidden">Elimina</span>
                        </Button>
                      </>
                    )}
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
      
      <ConfirmDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog(prev => ({ ...prev, open }))}
        title={deleteDialog.title}
        description={deleteDialog.description}
        confirmText="Elimina"
        cancelText="Annulla"
        onConfirm={deleteDialog.onConfirm}
        variant="destructive"
      />
    </div>
  );
};

export default GuestList;