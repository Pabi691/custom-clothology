"use client";

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import useSessionTimeout from '@/hooks/use-session-timeout';
import TShirtCustomizer from '@/components/tshirt-customizer';

const LOGOUT_URL = 'https://clothologyglobal.co.in/login';
const USER_TOKEN_KEY = `${process.env.NEXT_PUBLIC_TOKEN_KEY}`;

export default function TokenGate() {
  const searchParams = useSearchParams();
  const tokenFromUrl = searchParams.get('token');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // ✅ Always call the hook
  useSessionTimeout(
    isAuthenticated ? 30 * 60 * 1000 : null,
    () => {
      localStorage.removeItem('userToken');
      window.location.href = LOGOUT_URL;
    }
  );

  useEffect(() => {
  console.log("Token from URL:", tokenFromUrl);
  console.log("USER_TOKEN_KEY:", USER_TOKEN_KEY);

  if (!tokenFromUrl) {
    window.location.href = LOGOUT_URL;
  } else {
    if (tokenFromUrl === USER_TOKEN_KEY) {
      window.location.href = LOGOUT_URL;
    }
    localStorage.setItem('userToken', tokenFromUrl);
    setIsAuthenticated(true);
  }
}, [tokenFromUrl]);


  if (!isAuthenticated) return null;

  return <TShirtCustomizer />;
}
