import React from 'react';

interface AdSlotProps {
  isLoading?: boolean;
}

/**
 * Hides placeholder ad space completely so empty dashed boxes and allocated space
 * do not disrupt the clean user interface.
 */
export function AdSlot({ isLoading }: AdSlotProps) {
  // Do not render empty dashed box or allocate blank space on the page
  return null;
}
