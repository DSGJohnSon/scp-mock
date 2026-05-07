// GTM / gtag globals injected at runtime by Google Tag Manager script
declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: object[];
  }
}

export {};
