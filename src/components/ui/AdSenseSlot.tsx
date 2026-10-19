import React from 'react';
import { AdUnit } from './AdUnit';

interface AdSenseSlotProps {
  className?: string;
  adSlot?: string;
}

/**
 * Standard Google AdSense Slot
 * Routes through the compliance-enforced AdUnit component.
 * Automatically checks route eligibility and collapses cleanly if unfilled.
 */
export function AdSenseSlot({ className, adSlot }: AdSenseSlotProps) {
  return <AdUnit className={className} adSlot={adSlot} />;
}

export default AdSenseSlot;
