import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Database, AlertTriangle, CheckCircle, Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const DatabaseSchemaFix: React.FC = () => {
  const { toast } = useToast();

  const sqlScript = `-- Script per correggere la tabella tavoli nel database Supabase
-- PROBLEMA: Manca la colonna user_id necessaria per RLS e isolamento dati utente

-- 1. Aggiungi colonna user_id alla tabella tavoli
ALTER TABLE tavoli ADD COLUMN user_id uuid;

-- 2. Abilita Row Level Security sulla tabella tavoli
ALTER TABLE tavoli ENABLE ROW LEVEL SECURITY;

-- 3. Crea policy per permettere agli utenti di accedere solo ai propri tavoli
CREATE POLICY "Users can access their own tables" ON tavoli
FOR ALL
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(sqlScript);
    toast({
      title: "SQL copiato!",
      description: "Lo script SQL è stato copiato negli appunti."
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 flex items-center justify-center p-4">
      <Card className="max-w-4xl w-full shadow-lg">
        <CardHeader className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
          <CardTitle className="flex items-center gap-3">
            <AlertTriangle className="w-6 h-6" />
            Correzione Schema Database Richiesta
          </CardTitle>
        </CardHeader>
        
        <CardContent className="p-6 space-y-6">
          <Alert>
            <Database className="w-4 h-4" />
            <AlertDescription>
              <strong>PROBLEMA IDENTIFICATO:</strong> La tabella "tavoli" nel database Supabase non ha la colonna <code>user_id</code> necessaria per il funzionamento del sistema di gestione tavoli.
            </AlertDescription>
          </Alert>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                Problema Attuale
              </h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>• Tabella tavoli manca colonna <code>user_id</code></li>
                <li>• RLS (Row Level Security) non funziona</li>
                <li>• Utenti non possono avere tavoli privati</li>
                <li>• Operazioni CRUD sui tavoli falliscono</li>
                <li>• Tasto eliminazione tavolo non funziona</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                Soluzione
              </h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>• Aggiungere colonna <code>user_id uuid</code></li>
                <li>• Abilitare Row Level Security</li>
                <li>• Creare policy di accesso per utente</li>
                <li>• Testare operazioni CRUD</li>
                <li>• Verificare funzionamento tavoli</li>
              </ul>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3">Script SQL per Correzione</h3>
            <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm overflow-x-auto">
              <pre>{sqlScript}</pre>
            </div>
            <div className="mt-3 flex justify-end">
              <Button onClick={copyToClipboard} variant="outline" className="gap-2">
                <Copy className="w-4 h-4" />
                Copia Script SQL
              </Button>
            </div>
          </div>

          <Alert>
            <CheckCircle className="w-4 h-4" />
            <AlertDescription>
              <strong>ISTRUZIONI:</strong>
              <ol className="mt-2 space-y-1 text-sm">
                <li>1. Accedi al tuo dashboard Supabase</li>
                <li>2. Vai alla sezione "SQL Editor"</li>
                <li>3. Incolla lo script SQL copiato</li>
                <li>4. Esegui lo script</li>
                <li>5. Ricarica l'applicazione</li>
              </ol>
            </AlertDescription>
          </Alert>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-800 mb-2">Dopo aver eseguito lo script:</h4>
            <p className="text-blue-700 text-sm">
              Il sistema tavoli funzionerà correttamente con dati reali dal database invece di dati mock. 
              Ogni utente vedrà solo i propri tavoli e potrà creare, modificare ed eliminare tavoli in modo sicuro.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DatabaseSchemaFix;