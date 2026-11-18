import React, { useRef } from 'react';
import { Outlet } from 'react-router-dom';
import { ReadingProgressBar } from '../ui/ReadingProgressBar';
import { Breadcrumbs } from '../ui/Breadcrumbs';

export function MainLayout() {
  const mainRef = useRef<HTMLElement | null>(null);

  return (
    <div className="flex flex-col flex-grow w-full min-w-0 max-w-full overflow-x-clip">
      <ReadingProgressBar targetRef={mainRef} />
      <Breadcrumbs includeSchema={false} />
      <main ref={mainRef} className="flex-grow flex flex-col relative w-full min-w-0 max-w-full overflow-x-clip">
        <Outlet />
      </main>
    </div>
  );
}
