"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../supabaseClient';
import { User } from '@supabase/supabase-js'; // Import the User type from Supabase

const Dashboard = () => {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null); // Define the type as User | null

  useEffect(() => {
    const getSession = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        console.error('Error fetching session:', error);
        router.push('/login');
      } else if (data.session) {
        setUser(data.session.user);
      } else {
        router.push('/login');
      }
    };
  
    getSession();
  }, [router]);

  if (!user) return null;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold">Welcome to your Dashboard</h1>
      <p className="text-gray-500">Hello, {user.email}</p>
      <div className="mt-4">
        <p>This is your dashboard. Here you can manage your account and view your data.</p>
      </div>
    </div>
  );
};

export default Dashboard;