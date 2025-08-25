"use client";

import { useEffect, Suspense } from 'react';
import Header from '@/components/header';
import TShirtCustomizer from '@/components/tshirt-customizer';
import useSessionTimeout from '@/hooks/use-session-timeout';

const USER_TOKEN_KEY = 'userToken';
const LOGOUT_URL = 'https://clothologyglobal.co.in/login';

export default function Home() {
  // Set up session timeout
  useSessionTimeout(30 * 60 * 1000, () => {
    localStorage.removeItem(USER_TOKEN_KEY);
    window.location.href = LOGOUT_URL;
  });

  useEffect(() => {
    const token = localStorage.getItem(USER_TOKEN_KEY);

    if (!token) {
      // Redirect to login if no token found
      window.location.href = LOGOUT_URL;
    }
  }, []);

  return (
    <div className="flex flex-col h-screen bg-background font-body">
      <Header />
      <main className="flex-1 overflow-auto">
        <Suspense fallback={<div className="p-8 text-center">Loading customizer...</div>}>
          <TShirtCustomizer />
        </Suspense>
      </main>
    </div>
  );
}
