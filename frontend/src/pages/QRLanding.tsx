import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { 
  Heart, 
  CheckCircle, 
  XCircle, 
  MapPin, 
  Calendar, 
  Clock, 
  Users, 
  Phone,
  Mail,
  Loader2,
  Sparkles,
  Info
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNotifications } from '@/contexts/NotificationContext';
import { supabase } from '@/integrations/supabase/client';

interface GuestInfo {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  category?: string;
  dietaryRestrictions?: string;
}

interface WeddingInfo {
  coupleName: string;
  date: string;
  time: string;
  venue: string;
  address: string;
  dressCode?: string;
  notes?: string;
}

const QRLanding: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { notifyGuestConfirmed, notifyGuestDeclined } = useNotifications();
  
  // Determina il tipo dalla URL
  const type = window.location.pathname.split('/')[1]; // 'rsvp', 'checkin', o 'wedding-info'
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [guestInfo, setGuestInfo] = useState<GuestInfo | null>(null);
  const [response, setResponse] = useState<'yes' | 'no' | ''>('');
  const [companions, setCompanions] = useState<number>(0);
  const [dietaryNeeds, setDietaryNeeds] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [isCheckedIn, setIsCheckedIn] = useState(false);

  // Mock wedding info - in realtà verrebbe dal database
  const weddingInfo: WeddingInfo = {
    coupleName: "Marco & Giulia",
    date: "15 Giugno 2025",
    time: "16:00",
    venue: "Villa Rosa",
    address: "Via dei Giardini 123, Roma",
    dressCode: "Elegante",
    notes: "Cerimonia all'aperto, si consiglia di portare una giacca per la sera."
  };

  // Decodifica token
  useEffect(() => {
    if (!token) {
      navigate('/');
      return;
    }

    try {
      // Decodifica il token base64
      const decoded = atob(token);
      const [id, name] = decoded.split('_');
      
      setGuestInfo({
        id,
        name: name.replace(/_/g, ' '),
      });
      
      setLoading(false);
    } catch (error) {
      console.error('Token non valido:', error);
      navigate('/');
    }
  }, [token, navigate]);

  // Gestione RSVP
  const handleRSVPSubmit = async () => {
    if (!response || !guestInfo) return;
    
    setSubmitting(true);
    
    try {
      // Simula API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock update - in realtà aggiornerebbe il database
      const rsvpData = {
        guestId: guestInfo.id,
        guestName: guestInfo.name,
        response: response === 'yes',
        companions,
        dietaryNeeds,
        phone,
        notes,
        timestamp: new Date()
      };
      
      console.log('RSVP Data:', rsvpData);
      
      // Trigger notifiche
      if (response === 'yes') {
        notifyGuestConfirmed(guestInfo.name, guestInfo.id);
        toast({
          title: "🎉 Grazie!",
          description: "La tua partecipazione è stata confermata con successo!"
        });
      } else {
        notifyGuestDeclined(guestInfo.name, guestInfo.id);
        toast({
          title: "😔 Ci dispiace",
          description: "La tua risposta è stata registrata. Ci mancherai!"
        });
      }
      
    } catch (error) {
      toast({
        title: "Errore",
        description: "Si è verificato un errore. Riprova più tardi.",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Gestione Check-in
  const handleCheckIn = async () => {
    if (!guestInfo) return;
    
    setSubmitting(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setIsCheckedIn(true);
      toast({
        title: "✅ Check-in completato!",
        description: "Benvenuto al matrimonio! Divertiti!"
      });
      
    } catch (error) {
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante il check-in.",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 flex items-center justify-center">
        <Card className="p-8 text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <h3 className="text-lg font-semibold">Caricamento...</h3>
        </Card>
      </div>
    );
  }

  if (type === 'rsvp') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 p-4">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8 mt-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Heart className="w-12 h-12 text-rose-500 animate-pulse" fill="currentColor" />
              <Sparkles className="w-8 h-8 text-gold animate-bounce" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              {weddingInfo.coupleName}
            </h1>
            <p className="text-xl text-gray-600">
              {weddingInfo.date} • {weddingInfo.venue}
            </p>
          </div>

          <Card className="shadow-xl border-0">
            <CardHeader className="bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-t-lg">
              <CardTitle className="text-2xl text-center">
                Ciao {guestInfo?.name}! 👋
              </CardTitle>
              <p className="text-center text-rose-100 mt-2">
                Conferma la tua partecipazione al nostro matrimonio
              </p>
            </CardHeader>
            
            <CardContent className="p-6 space-y-6">
              {/* Risposta principale */}
              <div>
                <Label className="text-lg font-semibold mb-4 block">
                  Potrai partecipare al nostro matrimonio? 💕
                </Label>
                <RadioGroup value={response} onValueChange={setResponse} className="space-y-3">
                  <div className="flex items-center space-x-3 p-4 border-2 border-green-200 rounded-lg bg-green-50">
                    <RadioGroupItem value="yes" id="yes" />
                    <Label htmlFor="yes" className="flex items-center gap-2 cursor-pointer flex-1">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="text-green-800 font-medium">Sì, ci sarò! 🎉</span>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3 p-4 border-2 border-red-200 rounded-lg bg-red-50">
                    <RadioGroupItem value="no" id="no" />
                    <Label htmlFor="no" className="flex items-center gap-2 cursor-pointer flex-1">
                      <XCircle className="w-5 h-5 text-red-600" />
                      <span className="text-red-800 font-medium">Mi dispiace, non posso partecipare 😔</span>
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {response === 'yes' && (
                <div className="space-y-4 animate-fade-in">
                  <Separator />
                  
                  {/* Accompagnatori */}
                  <div>
                    <Label htmlFor="companions" className="font-semibold mb-2 block">
                      Quanti accompagnatori porti? 👥
                    </Label>
                    <Input
                      id="companions"
                      type="number"
                      min="0"
                      max="5"
                      value={companions}
                      onChange={(e) => setCompanions(parseInt(e.target.value) || 0)}
                      placeholder="0"
                    />
                  </div>

                  {/* Esigenze alimentari */}
                  <div>
                    <Label htmlFor="dietary" className="font-semibold mb-2 block">
                      Allergie o intolleranze alimentari? 🍽️
                    </Label>
                    <Textarea
                      id="dietary"
                      value={dietaryNeeds}
                      onChange={(e) => setDietaryNeeds(e.target.value)}
                      placeholder="Es: vegetariano, celiaco, allergico alle noci..."
                      rows={3}
                    />
                  </div>

                  {/* Telefono */}
                  <div>
                    <Label htmlFor="phone" className="font-semibold mb-2 block">
                      Numero di telefono 📱
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+39 123 456 7890"
                    />
                  </div>
                </div>
              )}

              {/* Note aggiuntive */}
              <div>
                <Label htmlFor="notes" className="font-semibold mb-2 block">
                  Note aggiuntive 📝
                </Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Qualcosa che vorresti farci sapere..."
                  rows={3}
                />
              </div>

              <Button 
                onClick={handleRSVPSubmit} 
                disabled={!response || submitting}
                className="w-full bg-rose-500 hover:bg-rose-600 text-white py-3 text-lg"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    Invio in corso...
                  </>
                ) : (
                  <>
                    <Heart className="w-5 h-5 mr-2" />
                    Conferma Risposta
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (type === 'checkin') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 p-4">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8 mt-8">
            <UserCheck className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              Check-in Matrimonio
            </h1>
            <p className="text-xl text-gray-600">
              {weddingInfo.coupleName}
            </p>
          </div>

          <Card className="shadow-xl border-0">
            <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-t-lg">
              <CardTitle className="text-2xl text-center">
                Benvenuto {guestInfo?.name}! 🎊
              </CardTitle>
            </CardHeader>
            
            <CardContent className="p-6 text-center">
              {!isCheckedIn ? (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Calendar className="w-12 h-12 text-green-600 mx-auto" />
                    <h3 className="text-xl font-semibold">È il momento del check-in!</h3>
                    <p className="text-gray-600">
                      Clicca il pulsante per confermare il tuo arrivo al matrimonio
                    </p>
                  </div>
                  
                  <Button 
                    onClick={handleCheckIn}
                    disabled={submitting}
                    className="bg-green-500 hover:bg-green-600 text-white py-3 px-8 text-lg"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin mr-2" />
                        Check-in in corso...
                      </>
                    ) : (
                      <>
                        <UserCheck className="w-5 h-5 mr-2" />
                        Effettua Check-in
                      </>
                    )}
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <CheckCircle className="w-16 h-16 text-green-600 mx-auto" />
                    <h3 className="text-2xl font-semibold text-green-800">Check-in Completato! ✅</h3>
                    <p className="text-gray-600">
                      Benvenuto al matrimonio! Goditi questa giornata speciale! 🎉
                    </p>
                  </div>
                  
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-green-800 mb-2">Informazioni utili:</h4>
                    <div className="text-sm text-green-700 space-y-1 text-left">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        Cerimonia: {weddingInfo.time}
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        Location: {weddingInfo.venue}
                      </div>
                      {weddingInfo.dressCode && (
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          Dress code: {weddingInfo.dressCode}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (type === 'wedding-info') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8 mt-8">
            <MapPin className="w-16 h-16 text-blue-600 mx-auto mb-4" />
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              Info Matrimonio
            </h1>
            <p className="text-xl text-gray-600">
              {weddingInfo.coupleName}
            </p>
          </div>

          <Card className="shadow-xl border-0">
            <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-t-lg">
              <CardTitle className="text-2xl text-center">
                Tutte le informazioni per {guestInfo?.name}
              </CardTitle>
            </CardHeader>
            
            <CardContent className="p-6 space-y-6">
              <div className="grid gap-4">
                <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
                  <Calendar className="w-6 h-6 text-blue-600" />
                  <div>
                    <div className="font-semibold">Data</div>
                    <div className="text-gray-600">{weddingInfo.date}</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
                  <Clock className="w-6 h-6 text-blue-600" />
                  <div>
                    <div className="font-semibold">Orario</div>
                    <div className="text-gray-600">{weddingInfo.time}</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
                  <MapPin className="w-6 h-6 text-blue-600" />
                  <div>
                    <div className="font-semibold">Location</div>
                    <div className="text-gray-600">{weddingInfo.venue}</div>
                    <div className="text-sm text-gray-500">{weddingInfo.address}</div>
                  </div>
                </div>
                
                {weddingInfo.dressCode && (
                  <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
                    <Users className="w-6 h-6 text-blue-600" />
                    <div>
                      <div className="font-semibold">Dress Code</div>
                      <div className="text-gray-600">{weddingInfo.dressCode}</div>
                    </div>
                  </div>
                )}
              </div>
              
              {weddingInfo.notes && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Note importanti:</h4>
                  <p className="text-gray-600">{weddingInfo.notes}</p>
                </div>
              )}

              <div className="flex gap-2">
                <Button className="flex-1 bg-green-500 hover:bg-green-600">
                  <Phone className="w-4 h-4 mr-2" />
                  Chiama
                </Button>
                <Button variant="outline" className="flex-1">
                  <Mail className="w-4 h-4 mr-2" />
                  Email
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
      <Card className="p-8 text-center">
        <h3 className="text-lg font-semibold mb-2">Pagina non trovata</h3>
        <p className="text-gray-600">Il link che hai seguito non è valido.</p>
      </Card>
    </div>
  );
};

export default QRLanding;