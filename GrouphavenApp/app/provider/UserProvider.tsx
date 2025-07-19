import {
  PropsWithChildren,
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/utils/supabase';

type PublicUserProfile = {
  id: string;
  name: string;
  avatar_url: string | null;
};

type UserContextType = {
  session: Session | null;
  user: User | null;
  profile: PublicUserProfile | null;
  loading: boolean;
};

const UserContext = createContext<UserContextType>({
  session: null,
  user: null,
  profile: null,
  loading: true,
});

export default function UserProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<PublicUserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (!error) {
        setSession(session);
      }
    };

    getSession();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!session?.user) {
        console.log('No user in session.');
        setProfile(null);
        setLoading(false);
        return;
      }

      console.log('Fetching profile for user:', session.user.id);

      const { data, error } = await supabase
        .from('users')
        .select('id, name, avatar_url')
        .eq('id', session.user.id)
        .single();

      if (error) {
        console.error("Error loading user profile:", error.message);
        setProfile(null);
      } else {
        setProfile(data);
      }

      setLoading(false);
    };

    fetchProfile();
  }, [session?.user]);

  return (
    <UserContext.Provider value={{ session, user: session?.user ?? null, profile, loading }}>
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => useContext(UserContext);
