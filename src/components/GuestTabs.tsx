import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle, Trash2 } from "lucide-react";
import { Guest, GuestStatus } from "@/types/guest";
import GuestList from "./GuestList";
import GuestStats from "./GuestStats";

interface GuestTabsProps {
  getGuestsByStatus: (status: GuestStatus) => Guest[];
  getStats: () => {
    total: number;
    totalWithCompanions: number;
    confirmed: number;
    pending: number;
    deleted: number;
    byCategory: Record<string, number>;
  };
  companionLoading?: string | null;
  confirmGuest: (guestId: string) => Promise<void>;
  confirmGuestOnly: (guestId: string) => Promise<void>;
  revertGuestOnly: (guestId: string) => Promise<void>;
  confirmGuestAndAllCompanions: (guestId: string) => Promise<void>;
  restoreGuest: (guestId: string) => Promise<void>;
  deleteGuest: (guestId: string) => Promise<void>;
  permanentlyDeleteGuest: (guestId: string) => Promise<void>;
  updateGuest: (guestId: string, formData: any) => Promise<void>;
  updateGuestStatus: (guestId: string, status: GuestStatus) => Promise<void>;
  updateCompanionStatus: (guestId: string, companionId: string, status: GuestStatus) => Promise<void>;
  confirmCompanion: (guestId: string, companionId: string) => Promise<void>;
  deleteCompanion: (guestId: string, companionId: string) => Promise<void>;
  restoreCompanion: (guestId: string, companionId: string) => Promise<void>;
  permanentlyDeleteCompanion: (guestId: string, companionId: string) => Promise<void>;
}

const GuestTabs = ({ getGuestsByStatus, getStats, companionLoading, confirmGuest, confirmGuestOnly, revertGuestOnly, confirmGuestAndAllCompanions, restoreGuest, deleteGuest, permanentlyDeleteGuest, updateGuest, updateGuestStatus, updateCompanionStatus, confirmCompanion, deleteCompanion, restoreCompanion, permanentlyDeleteCompanion }: GuestTabsProps) => {
  
  const stats = getStats();
  const pendingGuests = getGuestsByStatus('pending');
  const confirmedGuests = getGuestsByStatus('confirmed');
  const deletedGuests = getGuestsByStatus('deleted');

  return (
    <div className="w-full overflow-hidden">
      <Tabs defaultValue="pending" className="w-full">
        <div className="overflow-x-auto">
          <TabsList className="grid w-full grid-cols-3 bg-muted/50 p-1 min-w-fit">
            <TabsTrigger 
              value="pending" 
              className="flex items-center gap-1 sm:gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-romantic text-xs sm:text-sm"
            >
              <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden xs:inline sm:inline">Da confermare</span>
              <span className="xs:hidden sm:hidden">Pending</span>
              <Badge variant="secondary" className="ml-1 text-xs">
                {stats.pending}
              </Badge>
            </TabsTrigger>
            
            <TabsTrigger 
              value="confirmed"
              className="flex items-center gap-1 sm:gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-romantic text-xs sm:text-sm"
            >
              <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden xs:inline sm:inline">Confermati</span>
              <span className="xs:hidden sm:hidden">OK</span>
              <Badge variant="secondary" className="ml-1 text-xs">
                {stats.confirmed}
              </Badge>
            </TabsTrigger>
            
            <TabsTrigger 
              value="deleted"
              className="flex items-center gap-1 sm:gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-romantic text-xs sm:text-sm"
            >
              <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden xs:inline sm:inline">Eliminati</span>
              <span className="xs:hidden sm:hidden">Del</span>
              <Badge variant="secondary" className="ml-1 text-xs">
                {stats.deleted}
              </Badge>
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="mt-4 sm:mt-6">
          <GuestStats 
            stats={stats} 
            getAllGuests={() => [...pendingGuests, ...confirmedGuests, ...deletedGuests]}
            getGuestsByStatus={getGuestsByStatus}
          />
        </div>

        <TabsContent value="pending" className="mt-4 sm:mt-6 animate-fade-in-up">
          <GuestList 
            guests={pendingGuests} 
            type="pending"
            emptyMessage="Nessun invitato da confermare. Aggiungi il primo invitato!"
            companionLoading={companionLoading}
            confirmGuest={confirmGuest}
            confirmGuestOnly={confirmGuestOnly}
            revertGuestOnly={revertGuestOnly}
            confirmGuestAndAllCompanions={confirmGuestAndAllCompanions}
            restoreGuest={restoreGuest}
            deleteGuest={deleteGuest}
            permanentlyDeleteGuest={permanentlyDeleteGuest}
            updateGuest={updateGuest}
            updateGuestStatus={updateGuestStatus}
            updateCompanionStatus={updateCompanionStatus}
            confirmCompanion={confirmCompanion}
            deleteCompanion={deleteCompanion}
            restoreCompanion={restoreCompanion}
            permanentlyDeleteCompanion={permanentlyDeleteCompanion}
          />
        </TabsContent>

        <TabsContent value="confirmed" className="mt-4 sm:mt-6 animate-fade-in-up">
          <GuestList 
            guests={confirmedGuests} 
            type="confirmed"
            emptyMessage="Nessun invitato confermato ancora."
            companionLoading={companionLoading}
            confirmGuest={confirmGuest}
            confirmGuestOnly={confirmGuestOnly}
            revertGuestOnly={revertGuestOnly}
            confirmGuestAndAllCompanions={confirmGuestAndAllCompanions}
            restoreGuest={restoreGuest}
            deleteGuest={deleteGuest}
            permanentlyDeleteGuest={permanentlyDeleteGuest}
            updateGuest={updateGuest}
            updateGuestStatus={updateGuestStatus}
            updateCompanionStatus={updateCompanionStatus}
            confirmCompanion={confirmCompanion}
            deleteCompanion={deleteCompanion}
            restoreCompanion={restoreCompanion}
            permanentlyDeleteCompanion={permanentlyDeleteCompanion}
          />
        </TabsContent>

        <TabsContent value="deleted" className="mt-4 sm:mt-6 animate-fade-in-up">
          <GuestList 
            guests={deletedGuests} 
            type="deleted"
            emptyMessage="Nessun invitato eliminato."
            companionLoading={companionLoading}
            confirmGuest={confirmGuest}
            confirmGuestOnly={confirmGuestOnly}
            revertGuestOnly={revertGuestOnly}
            confirmGuestAndAllCompanions={confirmGuestAndAllCompanions}
            restoreGuest={restoreGuest}
            deleteGuest={deleteGuest}
            permanentlyDeleteGuest={permanentlyDeleteGuest}
            updateGuest={updateGuest}
            updateGuestStatus={updateGuestStatus}
            updateCompanionStatus={updateCompanionStatus}
            confirmCompanion={confirmCompanion}
            deleteCompanion={deleteCompanion}
            restoreCompanion={restoreCompanion}
            permanentlyDeleteCompanion={permanentlyDeleteCompanion}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default GuestTabs;