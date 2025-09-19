import React, { useState, useRef, useEffect } from 'react';
import QRCode from 'react-qr-code';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  QrCode, 
  Download, 
  Share2, 
  Copy, 
  CheckCircle, 
  Users, 
  Calendar, 
  MapPin,
  Camera,
  Scan,
  Heart,
  UserCheck
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { TableGuest } from '@/types/table';

interface QRCodeData {
  guestId: string;
  guestName: string;
  type: 'wedding-rsvp'; // Unificato: info + conferma
  weddingId?: string;
  url: string;
}

interface QRCodeSystemProps {
  guests: TableGuest[];
  weddingInfo?: {
    coupleName: string;
    date: string;
    venue: string;
    weddingId: string;
  };
  onGuestConfirm?: (guestId: string) => void;
}

const QRCodeSystem: React.FC<QRCodeSystemProps> = ({
  guests,
  weddingInfo,
  onGuestConfirm
}) => {
  const { toast } = useToast();
  const [selectedGuest, setSelectedGuest] = useState<TableGuest | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Filtra solo invitati NON confermati
  const unconfirmedGuests = guests.filter(guest => !guest.confermato);

  // Genera URL per QR Code unificato
  const generateQRData = (guest: TableGuest): QRCodeData => {
    const baseUrl = window.location.origin;
    const guestToken = btoa(`${guest.id}_${guest.name}_${Date.now()}`);
    
    const url = `${baseUrl}/wedding-rsvp/${guestToken}`;

    return {
      guestId: guest.id,
      guestName: guest.name,
      type: 'wedding-rsvp',
      weddingId: weddingInfo?.weddingId,
      url
    };
  };

  // Scarica QR Code come immagine
  const downloadQRCode = async (qrData: QRCodeData) => {
    setIsGenerating(true);
    
    try {
      // Crea un canvas temporaneo per generare l'immagine
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) return;
      
      canvas.width = 400;
      canvas.height = 500;
      
      // Sfondo bianco
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Genera QR code SVG e convertilo in immagine
      const svgElement = document.querySelector(`#qr-${qrData.guestId}-${qrData.type}`);
      if (svgElement) {
        const svgData = new XMLSerializer().serializeToString(svgElement);
        const img = new Image();
        const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(svgBlob);
        
        img.onload = () => {
          // Disegna QR code centrato
          const qrSize = 250;
          const qrX = (canvas.width - qrSize) / 2;
          const qrY = 80;
          ctx.drawImage(img, qrX, qrY, qrSize, qrSize);
          
          // Aggiungi testo
          ctx.fillStyle = '#000000';
          ctx.font = 'bold 20px Arial';
          ctx.textAlign = 'center';
          ctx.fillText(`${qrData.guestName}`, canvas.width / 2, 40);
          
          ctx.font = '16px Arial';
          ctx.fillText('Conferma Partecipazione', canvas.width / 2, 60);
          
          if (weddingInfo) {
            ctx.font = '14px Arial';
            ctx.fillText(weddingInfo.coupleName, canvas.width / 2, 360);
            ctx.fillText(weddingInfo.date, canvas.width / 2, 380);
            ctx.fillText(weddingInfo.venue, canvas.width / 2, 400);
          }
          
          // Scarica l'immagine
          canvas.toBlob((blob) => {
            if (blob) {
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `QR_${qrData.guestName}_wedding-rsvp.png`;
              a.click();
              URL.revokeObjectURL(url);
            }
          });
          
          URL.revokeObjectURL(url);
        };
        
        img.src = url;
      }
    } catch (error) {
      console.error('Errore nel download QR:', error);
      toast({
        title: "Errore",
        description: "Impossibile scaricare il QR code",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Copia URL negli appunti
  const copyToClipboard = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      toast({
        title: "✅ Copiato!",
        description: "URL copiato negli appunti"
      });
    } catch (error) {
      toast({
        title: "Errore",
        description: "Impossibile copiare negli appunti",
        variant: "destructive"
      });
    }
  };

  // Condividi QR Code
  const shareQRCode = async (qrData: QRCodeData) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `QR Code - ${qrData.guestName}`,
          text: `QR Code per confermare partecipazione e vedere info matrimonio`,
          url: qrData.url,
        });
      } catch (error) {
        // Fallback a copia negli appunti
        copyToClipboard(qrData.url);
      }
    } else {
      copyToClipboard(qrData.url);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header con statistiche */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <QrCode className="w-6 h-6 text-primary" />
            Sistema QR Code Matrimonio
            <Badge variant="secondary" className="ml-auto">
              {unconfirmedGuests.length} in attesa di conferma
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <Users className="w-8 h-8 mx-auto mb-2 text-blue-600" />
              <div className="text-2xl font-bold text-blue-600">{guests.length}</div>
              <div className="text-sm text-gray-600">Invitati Totali</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-600" />
              <div className="text-2xl font-bold text-green-600">
                {guests.filter(g => g.confermato).length}
              </div>
              <div className="text-sm text-gray-600">Già Confermati</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <Clock className="w-8 h-8 mx-auto mb-2 text-orange-600" />
              <div className="text-2xl font-bold text-orange-600">
                {unconfirmedGuests.length}
              </div>
              <div className="text-sm text-gray-600">In Attesa</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Generatore QR Code */}
      <Card>
        <CardHeader>
          <CardTitle>Genera QR Code per Invitati</CardTitle>
          <p className="text-sm text-gray-600">
            Genera QR code per gli invitati che non hanno ancora confermato la partecipazione
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Selezione invitato */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="guest-select">Seleziona Invitato (Solo Non Confermati)</Label>
                <Select onValueChange={(value) => {
                  const guest = unconfirmedGuests.find(g => g.id === value);
                  setSelectedGuest(guest || null);
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder={
                      unconfirmedGuests.length > 0 
                        ? "Scegli un invitato..." 
                        : "Tutti gli invitati hanno già confermato"
                    } />
                  </SelectTrigger>
                  <SelectContent>
                    {unconfirmedGuests.length === 0 ? (
                      <SelectItem value="no-guests" disabled>
                        Nessun invitato in attesa di conferma
                      </SelectItem>
                    ) : (
                      unconfirmedGuests.map(guest => (
                        <SelectItem key={guest.id} value={guest.id}>
                          <div className="flex items-center gap-2">
                            <span>{guest.name}</span>
                            <Badge variant="outline" className="text-xs">
                              {guest.category}
                            </Badge>
                          </div>
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              {selectedGuest && (
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold mb-2">Invitato Selezionato:</h4>
                  <div className="space-y-1 text-sm">
                    <div><strong>Nome:</strong> {selectedGuest.name}</div>
                    <div><strong>Categoria:</strong> {selectedGuest.category}</div>
                    <div><strong>Email:</strong> {selectedGuest.email || 'Non specificata'}</div>
                    <div>
                      <strong>Status:</strong> 
                      <Badge variant="secondary" className="ml-2">
                        In Attesa di Conferma
                      </Badge>
                    </div>
                  </div>
                  <div className="mt-3 p-3 bg-white rounded border-l-4 border-blue-500">
                    <p className="text-xs text-gray-600">
                      <strong>📱 Funziona così:</strong> L'invitato scannerizza il QR code, 
                      vede le info del matrimonio e può confermare la partecipazione direttamente.
                    </p>
                  </div>
                </div>
              )}

              {unconfirmedGuests.length === 0 && (
                <div className="p-4 bg-green-50 rounded-lg text-center">
                  <CheckCircle className="w-12 h-12 mx-auto mb-2 text-green-600" />
                  <h4 className="font-semibold text-green-800 mb-1">Tutti Confermati! 🎉</h4>
                  <p className="text-sm text-green-700">
                    Fantastico! Tutti i tuoi invitati hanno già confermato la partecipazione.
                  </p>
                </div>
              )}
            </div>

            {/* Anteprima QR Code */}
            <div className="space-y-4">
              {selectedGuest ? (
                <div className="text-center">
                  <div className="bg-white p-6 rounded-lg border shadow-sm inline-block">
                    <QRCode
                      id={`qr-${selectedGuest.id}-wedding-rsvp`}
                      value={generateQRData(selectedGuest).url}
                      size={200}
                      style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                    />
                    <div className="mt-4 space-y-1">
                      <div className="font-semibold">{selectedGuest.name}</div>
                      <div className="text-sm text-gray-600">
                        Info Matrimonio + Conferma RSVP
                      </div>
                      <div className="text-xs text-gray-500">
                        Scansiona per vedere dettagli e confermare
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-center gap-2 mt-4">
                    <Button
                      onClick={() => downloadQRCode(generateQRData(selectedGuest))}
                      disabled={isGenerating}
                      className="gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Scarica PNG
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => shareQRCode(generateQRData(selectedGuest))}
                      className="gap-2"
                    >
                      <Share2 className="w-4 h-4" />
                      Condividi
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => copyToClipboard(generateQRData(selectedGuest).url)}
                      className="gap-2"
                    >
                      <Copy className="w-4 h-4" />
                      Copia URL
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-500 py-12">
                  <QrCode className="w-16 h-16 mx-auto mb-4 opacity-30" />
                  <p>Seleziona un invitato per generare il QR Code</p>
                  <p className="text-sm mt-2">Il QR unifica info matrimonio e conferma RSVP</p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Generazione Batch */}
      {unconfirmedGuests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Generazione Batch QR Code</CardTitle>
            <p className="text-sm text-gray-600">
              Genera QR code per tutti gli invitati che non hanno ancora confermato
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex flex-wrap gap-3">
                <Button 
                  onClick={() => {
                    unconfirmedGuests.forEach((guest, index) => {
                      setTimeout(() => downloadQRCode(generateQRData(guest)), index * 500);
                    });
                    toast({
                      title: "🎉 Generazione avviata!",
                      description: `Generando QR code per ${unconfirmedGuests.length} invitati non confermati`
                    });
                  }}
                  className="gap-2 bg-primary hover:bg-primary/90"
                >
                  <QrCode className="w-4 h-4" />
                  Genera Tutti i QR ({unconfirmedGuests.length})
                </Button>
                
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <span>{unconfirmedGuests.length} invitati in attesa</span>
                </div>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-800 mb-2">💡 Come Utilizzare i QR Code:</h4>
                <div className="text-sm text-blue-700 space-y-1">
                  <div>• <strong>Stampa:</strong> Includi il QR nelle partecipazioni cartacee</div>
                  <div>• <strong>Digitale:</strong> Invia via WhatsApp, email o social</div>
                  <div>• <strong>Invitato:</strong> Scansiona → Vede info matrimonio → Conferma partecipazione</div>
                  <div>• <strong>Tu ricevi:</strong> Notifica automatica quando confermano!</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default QRCodeSystem;