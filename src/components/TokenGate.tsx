"use client";

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import useSessionTimeout from '@/hooks/use-session-timeout';
import TShirtCustomizer from '@/components/tshirt-customizer';

const LOGOUT_URL = 'https://clothologyglobal.co.in/login';

export default function TokenGate() {
  const searchParams = useSearchParams();
  const tokenFromUrl = searchParams.get('token');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    if (!tokenFromUrl) {
      window.location.href = LOGOUT_URL;
    } else {
      // Optionally store it in localStorage
      localStorage.setItem('userToken', tokenFromUrl);
      setIsAuthenticated(true);
    }
  }, [tokenFromUrl]);

  useEffect(() => {
    if (isAuthenticated) {
      useSessionTimeout(30 * 60 * 1000, () => {
        localStorage.removeItem('userToken');
        window.location.href = LOGOUT_URL;
      });
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) return null;

  return <TShirtCustomizer />;
}
