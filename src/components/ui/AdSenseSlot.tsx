import React from 'react';
import { AmpAd } from './AmpAd';

/**
 * AdSense slot that renders the Google AdSense AMP unit while automatically
 * collapsing and hiding any allocated placeholder area when no ad is served.
 */
export function AdSenseSlot({ className }: { className?: string }) {
  return <AmpAd className={className} />;
}

export default AdSenseSlot;
