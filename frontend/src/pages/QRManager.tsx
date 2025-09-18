import React, { useEffect } from 'react';
import { useAuth } from "@/contexts/AuthContext";
import { useSupabaseConfirmedGuests } from '@/hooks/useSupabaseConfirmedGuests';
import CommonHeader from "@/components/CommonHeader";
import DashboardSidebar from "@/components/DashboardSidebar";
import QRCodeSystem from "@/components/QRCodeSystem";
import { useNotifications } from '@/contexts/NotificationContext';
import {
  SidebarProvider,
  SidebarInset,
} from "@/components/ui/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { QrCode, Loader2 } from 'lucide-react';

const QRManager = () => {
  const { user, signOut, signingOut } = useAuth();
  const { 
    confirmedGuests, 
    loading: guestsLoading, 
    error: guestsError 
  } = useSupabaseConfirmedGuests();
  
  const { showNotification } = useNotifications();

  useEffect(() => {
    document.title = "QR Code Manager - Wedding Planner";
    
    // Notifica di benvenuto
    if (user && confirmedGuests.length > 0) {
      showNotification({
        type: 'info',
        title: '🎯 QR Code Manager',
        message: `Genera QR code per ${confirmedGuests.length} invitati confermati`
      });
    }
  }, [user, confirmedGuests.length]);

  const handleSignOut = async () => {
    await signOut();
  };

  // Mock wedding info - in un'app reale verrebbe dal database
  const weddingInfo = {
    coupleName: "Il Tuo Matrimonio",
    date: "2025-06-15",
    venue: "Villa Rosa",
    weddingId: user?.id || "wedding_001"
  };

  const handleGuestConfirm = (guestId: string) => {
    console.log('Guest confirmed via QR:', guestId);
    showNotification({
      type: 'success',
      title: '🎉 Conferma QR!',
      message: 'Un invitato ha confermato tramite QR code'
    });
  };

  const handleGuestCheckIn = (guestId: string) => {
    console.log('Guest checked in via QR:', guestId);
    showNotification({
      type: 'success',
      title: '✅ Check-in QR!',
      message: 'Un invitato ha effettuato il check-in'
    });
  };

  if (guestsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 flex items-center justify-center">
        <Card className="p-8 text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Caricamento invitati...</h3>
          <p className="text-gray-600">Recuperando dati dal database</p>
        </Card>
      </div>
    );
  }

  if (guestsError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <div className="text-red-500 mb-4">
            <QrCode className="w-12 h-12 mx-auto mb-2" />
          </div>
          <h3 className="text-lg font-semibold mb-2 text-red-800">Errore nel caricamento</h3>
          <p className="text-gray-600 mb-4">{guestsError}</p>
        </Card>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full overflow-hidden">
        {/* Sidebar */}
        <DashboardSidebar 
          user={user}
          profile={null}
          isWeddingOrganizer={false}
          onSignOut={handleSignOut}
          signingOut={signingOut}
        />
        
        {/* Contenuto principale */}
        <SidebarInset className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <CommonHeader showSidebarTrigger={true} />
          
          <main className="flex-1 w-full px-4 py-4 sm:px-6 sm:py-8 space-y-6 sm:space-y-8 overflow-y-auto">
            {/* Hero section */}
            <section className="text-center space-y-4 sm:space-y-6">
              <div className="space-y-2 sm:space-y-3 animate-fade-in-up">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <QrCode className="w-12 h-12 text-primary animate-pulse" />
                </div>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground text-responsive">
                  QR Code Manager
                </h2>
                <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto text-responsive">
                  Genera QR code personalizzati per RSVP, check-in e informazioni matrimonio. 
                  Semplifica la gestione degli invitati con la tecnologia moderna.
                </p>
              </div>
            </section>

            {/* QR Code System */}
            <section className="animate-fade-in-up w-full" style={{ animationDelay: '0.2s' }}>
              <QRCodeSystem
                guests={confirmedGuests}
                weddingInfo={weddingInfo}
                onGuestConfirm={handleGuestConfirm}
                onGuestCheckIn={handleGuestCheckIn}
              />
            </section>

            {/* Footer con suggerimenti */}
            <footer className="text-center py-8 sm:py-12 border-t border-primary/10 bg-elegant rounded-lg animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
              <div className="max-w-3xl mx-auto space-y-4 px-4">
                <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-4">
                  💡 Suggerimenti per l'uso dei QR Code
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 text-sm text-muted-foreground">
                  <div className="p-4 bg-white/60 rounded-lg shadow-soft">
                    <h4 className="font-semibold text-primary mb-2">📱 RSVP Digitale</h4>
                    <p className="text-responsive">Includi i QR code RSVP nelle tue partecipazioni per conferme rapide</p>
                  </div>
                  
                  <div className="p-4 bg-white/60 rounded-lg shadow-soft">
                    <h4 className="font-semibold text-primary mb-2">✅ Check-in Veloce</h4>
                    <p className="text-responsive">Usa i QR check-in il giorno del matrimonio per una gestione fluida degli arrivi</p>
                  </div>
                  
                  <div className="p-4 bg-white/60 rounded-lg shadow-soft sm:col-span-2 md:col-span-1">
                    <h4 className="font-semibold text-primary mb-2">🎊 Condivisione Smart</h4>
                    <p className="text-responsive">Condividi info matrimonio istantaneamente con tutti gli invitati</p>
                  </div>
                </div>
                
                <p className="text-xs text-muted-foreground mt-6 sm:mt-8">
                  🔐 Tutti i QR code sono sicuri e tracciabili per una gestione ottimale
                </p>
              </div>
            </footer>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default QRManager;