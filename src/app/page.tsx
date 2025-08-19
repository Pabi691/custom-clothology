
"use client";

import { useEffect } from 'react';
import Header from '@/components/header';
import TShirtCustomizer from '@/components/tshirt-customizer';
import useSessionTimeout from '@/hooks/use-session-timeout';

const USER_TOKEN_KEY = 'userToken';
const DEFAULT_USER_TOKEN = '980|lVdbsIUQTH1ZOsBe1dXvtAO4uR9XxDURT13dPZSL';
const LOGOUT_URL = 'https://clothologyglobal.co.in/';

export default function Home() {
  useSessionTimeout(30 * 60 * 1000, () => {
    localStorage.removeItem(USER_TOKEN_KEY);
    window.location.href = LOGOUT_URL;
  });

  useEffect(() => {
    // Check for user token, set a default for now, and redirect if none.
    let token = localStorage.getItem(USER_TOKEN_KEY);
    
    if (!token) {
      // For testing purposes as requested, we'll set a default token.
      // In a real app, you might redirect immediately if there's no token.
      localStorage.setItem(USER_TOKEN_KEY, DEFAULT_USER_TOKEN);
      token = DEFAULT_USER_TOKEN;

      // Uncomment the line below to redirect if the token is missing
      // window.location.href = LOGOUT_URL;
    }
  }, []);

  return (
    <div className="flex flex-col h-screen bg-background font-body">
      <Header />
      <main className="flex-1 overflow-auto">
        <TShirtCustomizer />
      </main>
    </div>
  );
}
