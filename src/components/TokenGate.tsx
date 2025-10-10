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

//   useEffect(() => {

//   if (!tokenFromUrl) {
//     window.location.href = LOGOUT_URL;
//   } else {
//     if (tokenFromUrl === USER_TOKEN_KEY) {
//       window.location.href = LOGOUT_URL;
//     }
//     localStorage.setItem('userToken', tokenFromUrl);
//     setIsAuthenticated(true);
//   }
// }, [tokenFromUrl]);
useEffect(() => {
  if (!tokenFromUrl || tokenFromUrl === USER_TOKEN_KEY) {
    // Save the full URL as redirect target
    const currentUrl = window.location.href; // full customizer URL
    const encodedUrl = encodeURIComponent(currentUrl);

    // Redirect to login with full redirect param
    window.location.href = `${LOGOUT_URL}?redirect=${encodedUrl}`;
  } else {
    localStorage.setItem('userToken', tokenFromUrl);
    setIsAuthenticated(true);
  }
}, [tokenFromUrl]);



  if (!isAuthenticated) return null;

  return <TShirtCustomizer />;
}
