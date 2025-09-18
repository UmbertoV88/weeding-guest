import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Profile {
  id: string;
  user_id: string;
  full_name: string | null;
  email: string | null;
  is_wedding_organizer: boolean;
  wedding_date: string | null;
  created_at: string;
  updated_at: string;
}

export const useProfile = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isWeddingOrganizer, setIsWeddingOrganizer] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchProfile = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // Profile doesn't exist, create one
          await createProfile();
        } else {
          throw error;
        }
      } else {
        setProfile(data);
        setIsWeddingOrganizer(data.is_wedding_organizer);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast({
        title: "Errore",
        description: "Impossibile caricare il profilo utente",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .insert({
          user_id: user.id,
          email: user.email,
          full_name: user.user_metadata?.full_name || null,
          is_wedding_organizer: false,
          wedding_date: null,
        })
        .select()
        .single();

      if (error) throw error;

      setProfile(data);
      setIsWeddingOrganizer(false);
    } catch (error) {
      console.error('Error creating profile:', error);
      toast({
        title: "Errore",
        description: "Impossibile creare il profilo utente",
        variant: "destructive",
      });
    }
  };

  const updateWeddingDate = async (date: Date | null): Promise<void> => {
    if (!user || !profile) {
      throw new Error('User or profile not available');
    }

    try {
      // Convert date to YYYY-MM-DD format to avoid timezone issues
      const dateString = date ? date.toISOString().split('T')[0] : null;
      
      console.log('Saving wedding date:', {
        originalDate: date,
        dateString: dateString,
        localeDateString: date?.toLocaleDateString('it-IT')
      });

      const { data, error } = await supabase
        .from('profiles')
        .update({
          wedding_date: dateString,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      setProfile(data);
      
      toast({
        title: "Data salvata!",
        description: date 
          ? `Data del matrimonio impostata per il ${date.toLocaleDateString('it-IT')}`
          : "Data del matrimonio rimossa",
      });
    } catch (error) {
      console.error('Error updating wedding date:', error);
      toast({
        title: "Errore",
        description: "Impossibile salvare la data del matrimonio",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateProfile = async (updates: Partial<Profile>): Promise<void> => {
    if (!user || !profile) {
      throw new Error('User or profile not available');
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      setProfile(data);
      
      toast({
        title: "Profilo aggiornato!",
        description: "Le modifiche sono state salvate con successo.",
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Errore",
        description: "Impossibile aggiornare il profilo",
        variant: "destructive",
      });
      throw error;
    }
  };

  // Get wedding date as Date object, handling timezone correctly
  const getWeddingDate = (): Date | null => {
    if (!profile?.wedding_date) return null;
    
    // If it's just a date string (YYYY-MM-DD), create date in local timezone
    if (profile.wedding_date.length === 10) {
      const [year, month, day] = profile.wedding_date.split('-').map(Number);
      return new Date(year, month - 1, day); // month is 0-indexed
    }
    
    // If it's a full timestamp, parse it normally
    return new Date(profile.wedding_date);
  };

  useEffect(() => {
    fetchProfile();
  }, [user]);

  return {
    profile,
    loading,
    isWeddingOrganizer,
    weddingDate: getWeddingDate(),
    updateWeddingDate,
    updateProfile,
    refetch: fetchProfile,
  };
};