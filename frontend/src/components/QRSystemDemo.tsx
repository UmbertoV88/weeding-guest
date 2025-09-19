import React from 'react';
import QRCodeSystem from './QRCodeSystem';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TableGuest } from '@/types/table';

// Mock data per demo - alcuni confermati, alcuni no
const mockGuestsForQR: TableGuest[] = [
  {
    id: "g1",
    name: "Marco Rossi",
    email: "marco.rossi@email.com",
    category: "Famiglia di lui",
    dietaryRestrictions: "Vegetariano",
    tableId: "t1",
    seatNumber: 1,
    user_id: "test",
    status: "confirmed" // Già confermato - NON apparirà nel selettore
  },
  {
    id: "g2",
    name: "Anna Bianchi", 
    email: "anna.bianchi@email.com",
    category: "Famiglia di lei",
    dietaryRestrictions: "Senza glutine",
    tableId: undefined,
    seatNumber: undefined,
    user_id: "test",
    status: "pending" // Non confermato - apparirà nel selettore
  },
  {
    id: "g3",
    name: "Luigi Verdi",
    email: "luigi.verdi@email.com", 
    category: "Amici",
    dietaryRestrictions: undefined,
    tableId: "t2",
    seatNumber: 2,
    user_id: "test",
    status: "pending" // Non confermato - apparirà nel selettore
  },
  {
    id: "g4",
    name: "Sofia Romano",
    email: "sofia.romano@email.com",
    category: "Colleghi",
    dietaryRestrictions: "Vegan",
    tableId: undefined,
    seatNumber: undefined,
    user_id: "test", 
    status: "confirmed" // Già confermato - NON apparirà nel selettore
  },
  {
    id: "g5",
    name: "Alessandro Ferrari",
    email: "alessandro.ferrari@email.com",
    category: "Amici",
    dietaryRestrictions: undefined,
    tableId: undefined,
    seatNumber: undefined,
    user_id: "test", 
    status: "pending" // Non confermato - apparirà nel selettore
  }
];

const QRSystemDemo: React.FC = () => {
  const mockWeddingInfo = {
    coupleName: "Marco & Giulia",
    date: "15 Giugno 2025",
    venue: "Villa Rosa",
    weddingId: "wedding_demo_001"
  };

  const handleGuestConfirm = (guestId: string) => {
    console.log('Guest confirmed via QR:', guestId);
    // In un'app reale qui aggiorneresti lo stato o il database
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🎯 Demo Sistema QR Code
          </h1>
          <p className="text-gray-600">
            Test del sistema QR modificato: solo invitati NON confermati + QR unificato
          </p>
        </div>

        {/* Stato attuale invitati */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Stato Invitati Demo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold mb-2 text-green-800">✅ Già Confermati (non nel QR selector):</h4>
                <ul className="space-y-1 text-sm">
                  {mockGuestsForQR.filter(g => g.status === "confirmed").map(guest => (
                    <li key={guest.id} className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>{guest.name} - {guest.category}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2 text-orange-800">⏳ In Attesa (apparirà nel QR selector):</h4>
                <ul className="space-y-1 text-sm">
                  {mockGuestsForQR.filter(g => g.status === "pending").map(guest => (
                    <li key={guest.id} className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                      <span>{guest.name} - {guest.category}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sistema QR Code */}
        <QRCodeSystem
          guests={mockGuestsForQR}
          weddingInfo={mockWeddingInfo}
          onGuestConfirm={handleGuestConfirm}
        />

        {/* Footer informativo */}
        <Card className="mt-8">
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <h3 className="text-lg font-semibold">🎯 Cosa è Cambiato:</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold text-blue-800 mb-2">1️⃣ Solo Non Confermati</h4>
                  <p className="text-blue-700">Nel selettore appaiono solo invitati con confermato = FALSE</p>
                </div>
                
                <div className="p-4 bg-purple-50 rounded-lg">
                  <h4 className="font-semibold text-purple-800 mb-2">2️⃣ QR Unificato</h4>
                  <p className="text-purple-700">Un solo QR che combina info matrimonio + conferma RSVP</p>
                </div>
                
                <div className="p-4 bg-green-50 rounded-lg">
                  <h4 className="font-semibold text-green-800 mb-2">3️⃣ Aggiorna DB</h4>
                  <p className="text-green-700">Quando confermano, confermato diventa TRUE nel database</p>
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-xs text-gray-600">
                  🚫 <strong>Rimosso:</strong> Check-in matrimonio • Separazione tipi QR • Invitati già confermati nel selettore
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default QRSystemDemo;