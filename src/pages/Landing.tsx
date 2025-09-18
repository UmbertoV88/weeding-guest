import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Heart, Users, Calendar, CheckCircle, Star, Clock, Shield, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import CommonHeader from "@/components/CommonHeader";

const Landing = () => {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    document.title = "Sistema Gestione Invitati Matrimonio - Organizza il Tuo Giorno Perfetto";
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Sistema completo per gestire invitati matrimonio in 7 giorni. Addio liste Excel caotiche, benvenuto matrimonio perfetto!');
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-elegant overflow-x-hidden">
      <CommonHeader showAuthButtons={true} />

      {/* Hero Section */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-gold/10 to-primary-deep/20"></div>
        <div className="relative container mx-auto px-4 py-8 sm:py-16 text-center">
          <div className="flex items-center justify-center gap-3 mb-4 sm:mb-6 animate-fade-in-up">
            <Heart className="w-8 h-8 sm:w-12 sm:h-12 text-primary animate-heartbeat" fill="currentColor" />
            <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-gold animate-sparkle" />
          </div>
          
          <h1 className="text-2xl sm:text-4xl md:text-6xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-primary-deep to-gold bg-clip-text text-transparent text-responsive">
            TRASFORMA IL CAOS IN ELEGANZA
          </h1>
          
          <h2 className="text-lg sm:text-2xl md:text-3xl font-semibold mb-6 sm:mb-8 text-primary-deep text-responsive">
            Come Organizzare Un Matrimonio Perfetto E Gestire Tutti Gli Invitati In Soli 7 Giorni
          </h2>
          
          <p className="text-base sm:text-lg mb-6 sm:mb-8 text-muted-foreground max-w-2xl mx-auto text-responsive">
            (anche se finora hai usato solo liste Excel caotiche e telefonate infinite)
          </p>
          
          <Link to="/auth">
            <Button size="lg" className="bg-gold hover:bg-gold/90 text-primary-deep text-lg sm:text-xl px-8 sm:px-12 py-4 sm:py-6 rounded-full shadow-elegant animate-pulse">
              ACCEDI ORA - Solo €97
            </Button>
          </Link>
          
          <p className="mt-4 text-sm text-muted-foreground">
            🔥 OFFERTA LIMITATA (Prezzo normale €297)
          </p>
        </div>
      </header>

      {/* Problem Section */}
      <section className="py-8 sm:py-16 bg-white/50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-xl sm:text-3xl font-bold mb-6 sm:mb-8 text-primary-deep text-responsive">
              Il Sistema Che Sta Trasformando Lo Stress Matrimoniale In Serenità Organizzativa In Soli 7 Giorni
            </h2>
            
            <blockquote className="text-lg sm:text-2xl italic mb-8 sm:mb-12 text-primary font-medium text-responsive">
              "Non riesco più a tenere traccia di chi viene, chi conferma, chi ha allergie... È un incubo!"
            </blockquote>
            
            <div className="text-left max-w-3xl mx-auto mb-8 sm:mb-12">
              <p className="text-base sm:text-lg mb-4 sm:mb-6 text-responsive">
                Ricordo ancora quando mia sorella stava organizzando il suo matrimonio. Aveva liste Excel sparse ovunque, 
                post-it attaccati al frigo, e passava le serate al telefono cercando di capire chi avesse confermato la presenza.
              </p>
              
              <p className="text-base sm:text-lg mb-6 sm:mb-8 text-responsive">
                Due settimane prima del matrimonio, si rese conto che aveva perso traccia di 15 invitati e non sapeva 
                quante persone sarebbero effettivamente venute. Il catering doveva sapere i numeri esatti...
              </p>
              
              <h3 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6 text-primary-deep text-responsive">
                La sua lotta quotidiana con la gestione invitati includeva:
              </h3>
              
              <ul className="space-y-3 sm:space-y-4 text-base sm:text-lg">
                <li className="flex items-start gap-3">
                  <span className="text-destructive font-bold flex-shrink-0">✗</span>
                  <span className="text-responsive">Liste Excel confuse con versioni multiple e contraddittorie</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-destructive font-bold flex-shrink-0">✗</span>
                  <span className="text-responsive">Telefonate infinite per confermare le presenze, spesso senza risposta</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-destructive font-bold flex-shrink-0">✗</span>
                  <span className="text-responsive">Allergie e intolleranze dimenticate o perse tra le note</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-destructive font-bold flex-shrink-0">✗</span>
                  <span className="text-responsive">Impossibilità di sapere in tempo reale quanti invitati avrebbero partecipato</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-destructive font-bold flex-shrink-0">✗</span>
                  <span className="text-responsive">Stress continuo per la paura di dimenticare qualcuno o qualche dettaglio importante</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Features vs Traditional */}
      <section className="py-8 sm:py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-xl sm:text-3xl font-bold text-center mb-8 sm:mb-12 text-primary-deep text-responsive">
              Le 4 Caratteristiche Essenziali Che Separano Un Matrimonio Perfetto Dal Caos Organizzativo
            </h2>
            
            <p className="text-lg sm:text-xl text-center mb-8 sm:mb-12 text-muted-foreground text-responsive">
              Le 4 Funzionalità Fondamentali Che Ogni Coppia Deve Avere (Che Excel e WhatsApp Non Possono Fornire)
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
              <Card className="p-4 sm:p-6 shadow-elegant">
                <div className="flex items-center gap-3 mb-4">
                  <Users className="w-6 h-6 sm:w-8 sm:h-8 text-primary flex-shrink-0" />
                  <h3 className="text-lg sm:text-xl font-bold text-primary-deep text-responsive">Gestione Invitati Intelligente</h3>
                </div>
                <p className="text-base sm:text-lg mb-4 text-responsive">
                  Sistema completo per organizzare invitati principali e accompagnatori - 
                  mantieni tutto organizzato senza perdere mai traccia di nessuno.
                </p>
                <p className="text-destructive font-medium text-responsive">
                  (senza questo, rischi di dimenticare invitati importanti e creare imbarazzo)
                </p>
              </Card>
              
              <Card className="p-4 sm:p-6 shadow-elegant">
                <div className="flex items-center gap-3 mb-4">
                  <CheckCircle className="w-6 h-6 sm:w-8 sm:h-8 text-primary flex-shrink-0" />
                  <h3 className="text-lg sm:text-xl font-bold text-primary-deep text-responsive">Tracciamento Stati Real-Time</h3>
                </div>
                <p className="text-base sm:text-lg mb-4 text-responsive">
                  Monitora automaticamente chi ha confermato, chi è in attesa, chi ha rifiutato - 
                  statistiche sempre aggiornate a portata di mano.
                </p>
                <p className="text-destructive font-medium text-responsive">
                  (senza questo, arrivi al matrimonio senza sapere quante persone verranno davvero)
                </p>
              </Card>
              
              <Card className="p-4 sm:p-6 shadow-elegant">
                <div className="flex items-center gap-3 mb-4">
                  <Shield className="w-6 h-6 sm:w-8 sm:h-8 text-primary flex-shrink-0" />
                  <h3 className="text-lg sm:text-xl font-bold text-primary-deep text-responsive">Gestione Allergie e Intolleranze</h3>
                </div>
                <p className="text-base sm:text-lg mb-4 text-responsive">
                  Registra e traccia automaticamente tutte le esigenze alimentari speciali - 
                  nessun invitato verrà dimenticato dal catering.
                </p>
                <p className="text-destructive font-medium text-responsive">
                  (senza questo, rischi emergenze alimentari che possono rovinare il matrimonio)
                </p>
              </Card>
              
              <Card className="p-4 sm:p-6 shadow-elegant">
                <div className="flex items-center gap-3 mb-4">
                  <Calendar className="w-6 h-6 sm:w-8 sm:h-8 text-primary flex-shrink-0" />
                  <h3 className="text-lg sm:text-xl font-bold text-primary-deep text-responsive">Categorie Personalizzabili</h3>
                </div>
                <p className="text-base sm:text-lg mb-4 text-responsive">
                  Organizza gli invitati per famiglia, amici, colleghi, o qualsiasi categoria - 
                  mantieni tutto ordinato e facilmente accessibile.
                </p>
                <p className="text-destructive font-medium text-responsive">
                  (senza questo, perdi tempo prezioso cercando informazioni tra liste caotiche)
                </p>
              </Card>
            </div>
            
            <div className="text-center mt-8 sm:mt-12">
              <Link to="/auth">
                <Button size="lg" className="bg-primary hover:bg-primary/90 text-white text-lg sm:text-xl px-8 sm:px-12 py-4 sm:py-6 rounded-full shadow-elegant">
                  ACCEDI AL SISTEMA - Solo €97
                </Button>
              </Link>
              <p className="mt-4 text-sm text-muted-foreground">
                🔥 OFFERTA LIMITATA (Prezzo normale €297)
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-8 sm:py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-2xl sm:text-4xl font-bold mb-6 sm:mb-8 text-primary-deep text-responsive">
              Ottieni Il Sistema Matrimonio Perfetto Ora
            </h2>
            
            <p className="text-lg sm:text-xl mb-8 sm:mb-12 text-muted-foreground text-responsive">
              Mentre altre coppie lottano con liste Excel caotiche, tu potrai goderti la serenità 
              di un matrimonio perfettamente organizzato usando il nostro sistema collaudato.
            </p>
            
            <Card className="p-6 sm:p-8 shadow-elegant mb-8 sm:mb-12 bg-gradient-to-br from-gold/10 to-primary/10">
              <h3 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-primary-deep text-responsive">
                Ecco tutto quello che ricevi con il Sistema Matrimonio Perfetto oggi:
              </h3>
              
              <div className="text-left max-w-2xl mx-auto space-y-4 mb-6 sm:mb-8">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-primary flex-shrink-0 mt-1" />
                  <div className="text-responsive">
                    <strong>Il Sistema Completo Matrimonio Perfetto:</strong> 5 moduli provati che risolvono 
                    il caos degli invitati e garantiscono serenità totale
                  </div>
                </div>
              </div>
              
              <div className="text-center">
                <p className="text-xl sm:text-2xl mb-4">
                  <span className="line-through text-muted-foreground">Normalmente: €297</span>
                </p>
                <p className="text-2xl sm:text-4xl font-bold text-primary mb-6 sm:mb-8">
                  Oggi Solo: €97
                </p>
                
                <form onSubmit={handleSubmit} className="max-w-md mx-auto mb-6 sm:mb-8">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Input
                      type="email"
                      placeholder="La tua email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="flex-1"
                    />
                    <Button type="submit" size="lg" className="bg-gold hover:bg-gold/90 text-primary-deep font-bold">
                      ACCEDI ORA
                    </Button>
                  </div>
                </form>
                
                {isSubmitted && (
                  <div className="bg-primary/10 p-4 sm:p-6 rounded-lg mb-6 sm:mb-8">
                    <h4 className="text-lg font-bold text-primary mb-2">🎉 Grazie per il tuo interesse!</h4>
                    <p className="text-muted-foreground mb-4 text-responsive">
                      Per vedere il sistema in azione, puoi accedere alla demo completa:
                    </p>
                    <Link to="/auth">
                      <Button className="bg-primary hover:bg-primary/90 text-white">
                        Prova il Sistema Ora
                      </Button>
                    </Link>
                  </div>
                )}
                
                <p className="text-sm text-muted-foreground mb-4">
                  🔥 OFFERTA LIMITATA - Solo per le prime 100 coppie
                </p>
                
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    Pagamento Sicuro
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Accesso Immediato
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-primary-deep text-white py-8 sm:py-12">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-3 mb-4 sm:mb-6">
            <Heart className="w-6 h-6 sm:w-8 sm:h-8 text-gold animate-heartbeat" fill="currentColor" />
            <h3 className="text-xl sm:text-2xl font-bold">Sistema Matrimonio Perfetto</h3>
          </div>
          
          <div className="flex flex-wrap justify-center gap-4 sm:gap-8 text-sm mb-6 sm:mb-8">
            <a href="#" className="hover:text-gold transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-gold transition-colors">Termini & Condizioni</a>
            <a href="#" className="hover:text-gold transition-colors">Supporto</a>
          </div>
          
          <p className="text-xs text-muted-foreground mb-4">
            COPYRIGHT 2025 | SISTEMA MATRIMONIO PERFETTO
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;