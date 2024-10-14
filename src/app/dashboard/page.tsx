"use client";
import { useState, useEffect } from 'react';
import ChatComponent from '../../components/chatComponent';
import { useRouter } from 'next/navigation';
import { useSessionContext, useSupabaseClient } from '@supabase/auth-helpers-react'; 
import { Session, User } from '@supabase/supabase-js';

const Dashboard = () => {
  const router = useRouter();
  const { session: contextSession } = useSessionContext(); // Session from context
  const supabase = useSupabaseClient(); // Supabase client to manually fetch session
  const [user, setUser] = useState<User | null>(null); // Track the user object

  useEffect(() => {
    const fetchSession = async () => {
      if (contextSession?.user) {
        // If session exists in context, use it
        setUser(contextSession.user);
      } else {
        // Try fetching session manually using Supabase auth
        const { data, error } = await supabase.auth.getSession();
        if (data?.session?.user) {
          setUser(data.session.user);
        } else {
          router.push('/login');
        }
      }
    };

    fetchSession();
  }, [contextSession, supabase, router]);

  return (
    <div>
      <h1>Dashboard</h1>
      <ChatComponent />
    </div>
  );
};

export default Dashboard;