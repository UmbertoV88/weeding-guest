import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { Bell, CheckCircle, XCircle, AlertTriangle, Calendar, Users, Heart } from 'lucide-react';

interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  guestId?: string;
  actionType?: 'guest_confirmed' | 'guest_declined' | 'guest_updated' | 'deadline_reminder' | 'table_assigned';
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  showNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotification: (id: string) => void;
  clearAllNotifications: () => void;
  // Metodi specifici per eventi matrimonio
  notifyGuestConfirmed: (guestName: string, guestId?: string) => void;
  notifyGuestDeclined: (guestName: string, guestId?: string) => void;
  notifyGuestUpdated: (guestName: string, guestId?: string) => void;
  notifyDeadlineReminder: (message: string) => void;
  notifyTableAssigned: (guestName: string, tableName: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Genera ID unico per le notifiche
  const generateId = () => `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // Calcola notifiche non lette
  const unreadCount = notifications.filter(n => !n.read).length;

  // Mostra notifica generica
  const showNotification = useCallback((notificationData: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notificationData,
      id: generateId(),
      timestamp: new Date(),
      read: false,
    };

    setNotifications(prev => [newNotification, ...prev]);

    // Mostra toast con icona personalizzata
    const getIcon = () => {
      switch (notificationData.type) {
        case 'success': return <CheckCircle className="w-5 h-5" />;
        case 'error': return <XCircle className="w-5 h-5" />;
        case 'warning': return <AlertTriangle className="w-5 h-5" />;
        default: return <Bell className="w-5 h-5" />;
      }
    };

    toast.custom((t) => (
      <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} 
        max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}>
        <div className="flex-1 w-0 p-4">
          <div className="flex items-start">
            <div className={`flex-shrink-0 ${
              notificationData.type === 'success' ? 'text-green-500' :
              notificationData.type === 'error' ? 'text-red-500' :
              notificationData.type === 'warning' ? 'text-yellow-500' : 'text-blue-500'
            }`}>
              {getIcon()}
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm font-medium text-gray-900">
                {notificationData.title}
              </p>
              <p className="mt-1 text-sm text-gray-500">
                {notificationData.message}
              </p>
            </div>
          </div>
        </div>
        <div className="flex border-l border-gray-200">
          <button
            onClick={() => toast.dismiss(t.id)}
            className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-indigo-600 hover:text-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            Chiudi
          </button>
        </div>
      </div>
    ), {
      duration: 5000,
      position: 'top-right',
    });
  }, []);

  // Metodi specifici per eventi matrimonio
  const notifyGuestConfirmed = useCallback((guestName: string, guestId?: string) => {
    showNotification({
      type: 'success',
      title: '🎉 Conferma Ricevuta!',
      message: `${guestName} ha confermato la partecipazione al matrimonio`,
      actionType: 'guest_confirmed',
      guestId,
    });
  }, [showNotification]);

  const notifyGuestDeclined = useCallback((guestName: string, guestId?: string) => {
    showNotification({
      type: 'warning',
      title: '😔 Partecipazione Declinata',
      message: `${guestName} non potrà partecipare al matrimonio`,
      actionType: 'guest_declined',
      guestId,
    });
  }, [showNotification]);

  const notifyGuestUpdated = useCallback((guestName: string, guestId?: string) => {
    showNotification({
      type: 'info',
      title: '📝 Invitato Aggiornato',
      message: `Le informazioni di ${guestName} sono state aggiornate`,
      actionType: 'guest_updated',
      guestId,
    });
  }, [showNotification]);

  const notifyDeadlineReminder = useCallback((message: string) => {
    showNotification({
      type: 'warning',
      title: '⏰ Reminder Importante',
      message,
      actionType: 'deadline_reminder',
    });
  }, [showNotification]);

  const notifyTableAssigned = useCallback((guestName: string, tableName: string) => {
    showNotification({
      type: 'success',
      title: '🪑 Tavolo Assegnato',
      message: `${guestName} è stato assegnato al ${tableName}`,
      actionType: 'table_assigned',
    });
  }, [showNotification]);

  // Segna come letta
  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  }, []);

  // Segna tutte come lette
  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  // Rimuovi notifica
  const clearNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  // Rimuovi tutte le notifiche
  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // Simulazione notifiche automatiche (es. reminder deadline)
  useEffect(() => {
    // Esempio: reminder 2 settimane prima del matrimonio
    const checkDeadlines = () => {
      // Qui potresti integrare con i dati reali del matrimonio
      // Per ora è solo una demo
    };

    const interval = setInterval(checkDeadlines, 60000); // Check ogni minuto
    return () => clearInterval(interval);
  }, []);

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    showNotification,
    markAsRead,
    markAllAsRead,
    clearNotification,
    clearAllNotifications,
    notifyGuestConfirmed,
    notifyGuestDeclined,
    notifyGuestUpdated,
    notifyDeadlineReminder,
    notifyTableAssigned,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 5000,
          style: {
            background: '#fff',
            color: '#363636',
          },
        }}
      />
    </NotificationContext.Provider>
  );
};

export default NotificationProvider;