/// <reference types="vite/client" />

import type { DetailedHTMLProps, HTMLAttributes } from 'react'

declare module 'react' {
  namespace JSX {
   interface IntrinsicElements {
    'model-viewer': DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement> & {
      src?: string; 'ios-src'?: string; ar?: boolean; 'camera-controls'?: boolean; autoplay?: boolean;
      exposure?: string; 'shadow-intensity'?: string; poster?: string; alt?: string;
    }
   }
  }
}
