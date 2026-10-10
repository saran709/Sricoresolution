import React from 'react';
import { useAdVisibility } from '../../hooks/useAdVisibility';

interface AdSlotProps {
  isLoading: boolean;
}

export function AdSlot({ isLoading }: AdSlotProps) {
  const isReady = useAdVisibility(isLoading);

  return (
    <div className="my-6 min-h-[250px] w-full bg-slate-100 rounded-xl flex items-center justify-center border-2 border-dashed border-slate-300">
      {isReady ? (
        <span className="text-slate-400">Ad Space (Auto-managed)</span>
      ) : (
        <span className="text-slate-400">Loading...</span>
      )}
    </div>
  );
}
