/**
 * Polyfills for React Native environment
 */

// TextDecoder polyfill for streaming API responses
import { TextDecoder as TextDecoderPolyfill, TextEncoder as TextEncoderPolyfill } from 'text-encoding';

// Add TextDecoder and TextEncoder to global scope if they don't exist
if (typeof global.TextDecoder === 'undefined') {
  global.TextDecoder = TextDecoderPolyfill as any;
}

if (typeof global.TextEncoder === 'undefined') {
  global.TextEncoder = TextEncoderPolyfill as any;
}

// Also add to window for web compatibility
if (typeof window !== 'undefined') {
  if (typeof window.TextDecoder === 'undefined') {
    (window as any).TextDecoder = TextDecoderPolyfill;
  }
  if (typeof window.TextEncoder === 'undefined') {
    (window as any).TextEncoder = TextEncoderPolyfill;
  }
}

export {};