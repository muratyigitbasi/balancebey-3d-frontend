/// <reference types="vite/client" />

import type { DetailedHTMLProps, HTMLAttributes } from 'react'

declare module 'react' {
  namespace JSX {
   interface IntrinsicElements {
    'model-viewer': DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement> & {
      src?: string; 'ios-src'?: string; ar?: boolean; 'camera-controls'?: boolean; autoplay?: boolean;
      exposure?: string; 'shadow-intensity'?: string; poster?: string; alt?: string;
      'ar-modes'?: string; 'ar-scale'?: string; 'ar-placement'?: string; 'touch-action'?: string;
      'shadow-softness'?: string; 'camera-orbit'?: string; 'field-of-view'?: string;
      'xr-environment'?: boolean; loading?: string; reveal?: string; 'interaction-prompt'?: string;
    }
   }
  }
}
