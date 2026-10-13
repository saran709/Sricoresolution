import type * as React from 'react';

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'amp-ad': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        width?: string | number;
        height?: string | number;
        type?: string;
        'data-ad-client'?: string;
        'data-ad-slot'?: string;
        'data-auto-format'?: string;
        'data-full-width'?: string;
        layout?: string;
      };
    }
  }
}

export {};
