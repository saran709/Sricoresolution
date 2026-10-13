import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { AmpAd } from '../ui/AmpAd';

export function MainLayout() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow flex flex-col relative w-full">
        <Outlet />
      </main>
      <AmpAd />
      <Footer />
    </div>
  );
}
