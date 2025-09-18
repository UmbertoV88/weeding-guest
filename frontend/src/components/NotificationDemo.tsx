import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useNotifications } from '@/contexts/NotificationContext';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Info,
  Users,
  Heart,
  Calendar,
  Settings
} from 'lucide-react';

const NotificationDemo: React.FC = () => {
  const {
    notifyGuestConfirmed,
    notifyGuestDeclined,
    notifyGuestUpdated,
    notifyDeadlineReminder,
    notifyTableAssigned,
    showNotification
  } = useNotifications();

  const demoGuests = [
    "Marco Rossi",
    "Giulia Bianchi", 
    "Luca Verdi",
    "Sofia Romano",
    "Alessandro Ferrari"
  ];

  const getRandomGuest = () => demoGuests[Math.floor(Math.random() * demoGuests.length)];

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="w-6 h-6 text-primary" />
          Demo Sistema Notifiche
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Notifiche Wedding-Specific */}
        <div>
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <Heart className="w-5 h-5 text-rose-500" />
            Notifiche Matrimonio
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Button
              onClick={() => notifyGuestConfirmed(getRandomGuest())}
              className="gap-2 bg-green-500 hover:bg-green-600"
            >
              <CheckCircle className="w-4 h-4" />
              Conferma Ospite
            </Button>
            
            <Button
              onClick={() => notifyGuestDeclined(getRandomGuest())}
              variant="outline"
              className="gap-2 text-orange-600 border-orange-200 hover:bg-orange-50"
            >
              <XCircle className="w-4 h-4" />
              Rifiuto Ospite
            </Button>
            
            <Button
              onClick={() => notifyGuestUpdated(getRandomGuest())}
              variant="outline"
              className="gap-2 text-blue-600 border-blue-200 hover:bg-blue-50"
            >
              <Users className="w-4 h-4" />
              Aggiorna Ospite
            </Button>
            
            <Button
              onClick={() => notifyTableAssigned(getRandomGuest(), "Tavolo Famiglia")}
              variant="outline"
              className="gap-2 text-purple-600 border-purple-200 hover:bg-purple-50"
            >
              <Users className="w-4 h-4" />
              Assegna Tavolo
            </Button>
          </div>
        </div>

        {/* Notifiche Deadline */}
        <div>
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-500" />
            Reminder e Deadline
          </h4>
          <div className="grid grid-cols-1 gap-3">
            <Button
              onClick={() => notifyDeadlineReminder("Mancano 2 settimane al matrimonio! Conferma il menù con il catering.")}
              variant="outline"
              className="gap-2 text-amber-600 border-amber-200 hover:bg-amber-50"
            >
              <AlertTriangle className="w-4 h-4" />
              Reminder 2 Settimane
            </Button>
            
            <Button
              onClick={() => notifyDeadlineReminder("Ultimo giorno per confermare il numero di invitati con la location!")}
              variant="outline"
              className="gap-2 text-red-600 border-red-200 hover:bg-red-50"
            >
              <AlertTriangle className="w-4 h-4" />
              Deadline Urgente
            </Button>
          </div>
        </div>

        {/* Notifiche Generiche */}
        <div>
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <Info className="w-5 h-5 text-gray-500" />
            Notifiche Personalizzate
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Button
              onClick={() => showNotification({
                type: 'success',
                title: '🎉 Pagamento Ricevuto!',
                message: 'Il fotografo ha confermato il pagamento dell\'acconto'
              })}
              className="gap-2 bg-emerald-500 hover:bg-emerald-600"
            >
              <CheckCircle className="w-4 h-4" />
              Success Custom
            </Button>
            
            <Button
              onClick={() => showNotification({
                type: 'error',
                title: '❌ Errore Prenotazione',
                message: 'Problema con la prenotazione del ristorante. Contatta il venue.'
              })}
              variant="outline"
              className="gap-2 text-red-600 border-red-200 hover:bg-red-50"
            >
              <XCircle className="w-4 h-4" />
              Error Custom
            </Button>
            
            <Button
              onClick={() => showNotification({
                type: 'warning',
                title: '⚠️ Attenzione Meteo',
                message: 'Previste piogge per il weekend del matrimonio. Preparare plan B.'
              })}
              variant="outline"
              className="gap-2 text-amber-600 border-amber-200 hover:bg-amber-50"
            >
              <AlertTriangle className="w-4 h-4" />
              Warning Custom
            </Button>
            
            <Button
              onClick={() => showNotification({
                type: 'info',
                title: '📱 Nuova Feature!',
                message: 'È ora disponibile il sistema QR Code per gli inviti!'
              })}
              variant="outline"
              className="gap-2 text-blue-600 border-blue-200 hover:bg-blue-50"
            >
              <Info className="w-4 h-4" />
              Info Custom
            </Button>
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600">
            💡 <strong>Suggerimento:</strong> Le notifiche appariranno nell'header in alto a destra 
            e come toast in basso. Clicca sull'icona campanella per vedere lo storico completo.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default NotificationDemo;