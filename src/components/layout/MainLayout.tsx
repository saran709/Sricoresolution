import React from 'react';
import { Outlet } from 'react-router-dom';

export function MainLayout() {
  return (
    <div className="flex flex-col flex-grow w-full">
      <main className="flex-grow flex flex-col relative w-full">
        <Outlet />
      </main>
    </div>
  );
}
