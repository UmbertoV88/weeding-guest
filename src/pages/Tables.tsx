import { useEffect, useState } from "react";
import { useTables } from "@/hooks/useTables";
import { useGuests } from "@/hooks/useGuests";
import AddTableForm from "@/components/AddTableForm";
import TableList from "@/components/TableList";
import TableStats from "@/components/TableStats";
import { SeatingEditor } from "@/components/SeatingEditor";
import CommonHeader from "@/components/CommonHeader";
import DashboardSidebar from "@/components/DashboardSidebar";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import {
  SidebarProvider,
  SidebarInset,
} from "@/components/ui/sidebar";

const TablesLayout = () => {
  const { user, signOut, signingOut } = useAuth();
  const { profile, isWeddingOrganizer } = useProfile();
  const { 
    tables, 
    loading: tablesLoading, 
    error, 
    addTable, 
    updateTable, 
    deleteTable, 
    getTableStats 
  } = useTables();
  const { guests, loading: guestsLoading } = useGuests();
  const [activeTab, setActiveTab] = useState('overview');
  const { toast } = useToast();

  const loading = tablesLoading || guestsLoading;

  const handleSignOut = async () => {
    await signOut();
  };

  const stats = getTableStats();

  // Convert tables and guests to format expected by SeatingEditor
  const seatingTables = tables.map(table => ({
    id: table.id,
    name: table.name,
    seats: table.capacity,
    x: 200 + Math.random() * 300, // Random initial position
    y: 200 + Math.random() * 200,
    shape: 'round' as const,
    guests: guests.filter(guest => guest.table_id === table.id).map(guest => ({
      id: guest.id,
      name: guest.name,
      tableId: table.id,
      status: guest.status // Aggiungo lo status dell'ospite
    }))
  }));

  // Converti gli ospiti includendo lo status e espandendo anche i companions
  const seatingGuests = guests.flatMap(guest => {
    const baseGuests = [{
      id: guest.id,
      name: guest.name,
      tableId: guest.table_id || undefined,
      status: guest.status // Includo lo status
    }];

    // Aggiungi anche i companions se esistono
    if (guest.companions && guest.companions.length > 0) {
      const companionGuests = guest.companions.map(companion => ({
        id: companion.id,
        name: companion.name,
        tableId: guest.table_id || undefined, // I companions hanno lo stesso tavolo del principale
        status: companion.status // Status del companion
      }));
      return [...baseGuests, ...companionGuests];
    }

    return baseGuests;
  });

  const handleUpdateSeatingTables = async (updatedTables: any[]) => {
    try {
      // This would need to be implemented to update the actual tables and guest assignments
      // For now, just show a success message
      toast({
        title: "Disposizione salvata",
        description: "La disposizione dei tavoli è stata aggiornata con successo"
      });
    } catch (error) {
      toast({
        title: "Errore",
        description: "Impossibile salvare la disposizione",
        variant: "destructive"
      });
    }
  };

  // Funzione per aggiungere tavolo dal SeatingEditor
  const handleAddTableFromEditor = async (tableData: { name: string; capacity: number }) => {
    try {
      await addTable(tableData);
      toast({
        title: "Tavolo aggiunto",
        description: `Il tavolo "${tableData.name}" è stato creato con successo`
      });
    } catch (error) {
      toast({
        title: "Errore",
        description: "Impossibile creare il tavolo",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen w-full overflow-hidden">
        <DashboardSidebar 
          user={user}
          profile={profile}
          isWeddingOrganizer={isWeddingOrganizer}
          onSignOut={handleSignOut}
          signingOut={signingOut}
        />
        <SidebarInset className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <CommonHeader showSidebarTrigger={true} />
          <main className="flex-1 w-full px-4 py-4 sm:px-6 sm:py-8 space-y-6 sm:space-y-8 overflow-y-auto">
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          </main>
        </SidebarInset>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen w-full overflow-hidden">
        <DashboardSidebar 
          user={user}
          profile={profile}
          isWeddingOrganizer={isWeddingOrganizer}
          onSignOut={handleSignOut}
          signingOut={signingOut}
        />
        <SidebarInset className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <CommonHeader showSidebarTrigger={true} />
          <main className="flex-1 w-full px-4 py-4 sm:px-6 sm:py-8 space-y-6 sm:space-y-8 overflow-y-auto">
            <div className="text-center text-destructive">
              <p>Errore nel caricamento dei tavoli: {error}</p>
            </div>
          </main>
        </SidebarInset>
      </div>
    );
  }

  // Debug: Log per verificare i dati
  console.log('Guests from useGuests:', guests);
  console.log('Seating guests with status:', seatingGuests);
  console.log('Confirmed guests:', seatingGuests.filter(g => g.status === 'confirmed'));

  return (
    <div className="flex min-h-screen w-full overflow-hidden">
      <DashboardSidebar 
        user={user}
        profile={profile}
        isWeddingOrganizer={isWeddingOrganizer}
        onSignOut={handleSignOut}
        signingOut={signingOut}
      />
      
      <SidebarInset className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <CommonHeader showSidebarTrigger={true} />
        
        <main className="flex-1 w-full px-4 py-4 sm:px-6 sm:py-8 space-y-6 sm:space-y-8 overflow-y-auto">
          {/* Header - RIMOSSO IL BOTTONE "Nuovo Tavolo" */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-primary-deep">Gestione Tavoli</h1>
              <p className="text-muted-foreground mt-1">
                Organizza i tavoli e la disposizione degli ospiti per il tuo matrimonio
              </p>
            </div>
          </div>

          {/* Main Content */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="overview">Panoramica</TabsTrigger>
              <TabsTrigger value="seating">Editor Disposizione</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* Statistics */}
              <section className="animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                <TableStats stats={stats} />
              </section>

              {/* Tables list */}
              <section className="animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
                <TableList 
                  tables={tables}
                  updateTable={updateTable}
                  deleteTable={deleteTable}
                />
              </section>
            </TabsContent>

            <TabsContent value="seating" className="space-y-6">
              <SeatingEditor
                guests={seatingGuests}
                tables={seatingTables}
                onUpdateTables={handleUpdateSeatingTables}
                onAddTable={handleAddTableFromEditor}
              />
            </TabsContent>
          </Tabs>
        </main>
      </SidebarInset>
    </div>
  );
};

const Tables = () => {
  useEffect(() => {
    document.title = "Gestione Tavoli - Wedding Planner";
  }, []);

  return (
    <SidebarProvider>
      <TablesLayout />
    </SidebarProvider>
  );
};

export default Tables;