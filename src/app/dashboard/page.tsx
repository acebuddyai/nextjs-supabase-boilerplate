"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSessionContext, useSupabaseClient } from '@supabase/auth-helpers-react'; 
import { Session, User } from '@supabase/supabase-js';

const Dashboard = () => {
  const router = useRouter();
  const { session: contextSession } = useSessionContext(); // Session from context
  const supabase = useSupabaseClient(); // Supabase client to manually fetch session
  const [user, setUser] = useState<User | null>(null); // Track the user object
  const [query, setQuery] = useState(''); // Track the query input
  const [response, setResponse] = useState(''); // Track the AI API response

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
          console.error('Error fetching session:', error);
          router.push('/login'); // Redirect to login if no session found
        }
      }
    };

    fetchSession();
  }, [contextSession, router, supabase]); // Ensure dependencies include context and router

  const handleQuery = async () => {
    const res = await fetch('/api/query', { // Corrected the path
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query }),
    });
    const data = await res.json();
    console.log('API Response:', data); // Log the response for debugging
    if (Array.isArray(data.response) && data.response.length > 0) {
      console.log('Full Generated Text:', data.response[0].generated_text); // Log the full generated text
      setResponse(data.response[0].generated_text);
    } else {
      setResponse('Invalid response format');
    }
  };

  if (!user) return <div>Loading...</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold">Welcome to your Dashboard</h1>
      <p className="text-gray-500">Hello, {user.email}</p>
      <div className="mt-4">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ask something..."
          className="border p-2 w-full"
        />
        <button onClick={handleQuery} className="mt-2 p-2 bg-blue-500 text-white">
          Submit
        </button>
      </div>
      {response && (
        <div className="mt-4 p-4 border">
          <h2 className="text-xl font-bold">Response:</h2>
          <pre className="whitespace-pre-wrap">{response}</pre>
        </div>
      )}
    </div>
  );
};

export default Dashboard;