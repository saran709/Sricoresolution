import React from 'react';

// Reusable AdSense slot for Auto Ads / In-page ads
export function AdSenseSlot() {
  return (
    <div className="my-8 w-full flex items-center justify-center">
      <ins className="adsbygoogle"
           style={{ display: 'block' }}
           data-ad-client="ca-pub-5684687588450520"
           data-ad-format="auto"
           data-full-width-responsive="true"></ins>
    </div>
  );
}
