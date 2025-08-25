"use client";

import { Suspense } from 'react';
import Header from '@/components/header';
import TShirtCustomizer from '@/components/tshirt-customizer';
import TokenGate from '@/components/TokenGate'; // You’ll create this (see below)

export default function Home() {
  return (
    <div className="flex flex-col h-screen bg-background font-body">
      <Header />
      <main className="flex-1 overflow-auto">
        <Suspense fallback={<div className="p-8 text-center">Loading customizer...</div>}>
          <TokenGate />
        </Suspense>
      </main>
    </div>
  );
}
