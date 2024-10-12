"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../supabaseClient';

const Dashboard = () => {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState('');

  useEffect(() => {
    const session = supabase.auth.session();
    if (!session) {
      router.push('/login');
    } else {
      setUser(session.user);
    }
  }, [router]);

  const handleQuery = async () => {
    const res = await fetch('/api/query', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query }),
    });
    const data = await res.json();
    setResponse(data.response);
  };

  if (!user) return null;

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
          <p>{response}</p>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
