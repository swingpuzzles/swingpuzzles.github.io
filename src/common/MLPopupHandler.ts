import navigationManager from "../gui/NavigationManager";
import analyticsManager from "./AnalyticsManager";

// Type definitions
declare global {
  interface Window {
    ml?: (...args: any[]) => void;
  }
}

interface MlPopupOptions {
  formId: string;
  onPopupShown?: () => void;                 // fires when iframe appears
  onSubmitAttempt?: (formId?: string) => void; // optional: if ML posts a "submit" event
  onSuccess?: (formId?: string) => void;     // fires after ML confirms success via postMessage
  logAllMessages?: boolean;                  // set true temporarily to see payloads
  popupIframeSelector?: string;              // override if ML changes markup
  waitMs?: number;                           // how long to wait for iframe to appear
}

class MlPopupHandler {
  private opts: MlPopupOptions;
  private msgHandler?: (e: MessageEvent) => void;
  private observer?: MutationObserver;
  private disposed = false;

  constructor(options: MlPopupOptions) {
    this.opts = {
      popupIframeSelector:
        'iframe[src*="mailerlite"], iframe[src*="mlcdn"], iframe[src*="assets.mailerlite"]',
      waitMs: 5000,
      ...options,
    };
  }

  /** Open ML popup, focus the iframe, and attach postMessage listener */
  // Call this directly from your click handler:
  // button.addEventListener('click', () => mlPopupHandler.open());
  public open() {
    // Track MLPopup Open event
    analyticsManager.trackEvent('ml_popup_open', {
      form_id: this.opts.formId,
      popup_type: 'mailerlite'
    });
    
    // IMPORTANT: keep this call inside the same user gesture
    window.ml?.('show', this.opts.formId, true);
    this.watchForIframe();
    this.attachMessageListener?.(); // if you added postMessage handling
  }

  private watchForIframe() {
    const selector =
      'iframe[src*="mailerlite"], iframe[src*="mlcdn"], iframe[src*="assets.mailerlite"]';
    const deadline = Date.now() + 5000;

    const focusIframe = (iframe: HTMLIFrameElement) => {
      // Make it focusable
      if (!iframe.hasAttribute('tabindex')) iframe.setAttribute('tabindex', '-1');

      // Try a few times – different browsers attach late
      let attempts = 0;
      const tryFocus = () => {
        attempts++;
        // Try focusing the iframe element itself
        iframe.focus({ preventScroll: true });
        // If not focused, try again a few frames; also scroll into view once
        if (document.activeElement !== iframe && attempts < 8) {
          if (attempts === 2) iframe.scrollIntoView({ block: 'center', inline: 'center' });
          requestAnimationFrame(tryFocus);
        }
      };

      // Focus after load too (some browsers need this)
      const onLoad = () => {
        iframe.removeEventListener('load', onLoad);
        requestAnimationFrame(tryFocus);
      };
      iframe.addEventListener('load', onLoad);

      // And try immediately in case it’s already loaded
      requestAnimationFrame(tryFocus);
    };

    const findNow = () => {
      const iframe = document.querySelector<HTMLIFrameElement>(selector);
      if (iframe) {
        this.opts.onPopupShown?.();
        focusIframe(iframe);
        return true;
      }
      return false;
    };

    // quick poll in same gesture frame
    if (findNow()) return;

    // rAF loop up to deadline
    const tick = () => {
      if (Date.now() > deadline) return;
      if (!findNow()) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);

    // backup MutationObserver (covers late injections)
    const mo = new MutationObserver(() => {
      const iframe = document.querySelector<HTMLIFrameElement>(selector);
      if (iframe) {
        mo.disconnect();
        this.opts.onPopupShown?.();
        focusIframe(iframe);
      }
    });
    mo.observe(document.documentElement, { childList: true, subtree: true });
    setTimeout(() => mo.disconnect(), 6000);
  }

  /** Listen for ML/recaptcha postMessage events and route to hooks */
  private attachMessageListener() {
    const trustedOrigins = new Set([
      'https://assets.mailerlite.com',
      'https://static.mailerlite.com',
      'https://www.google.com',
      'https://www.recaptcha.net',
    ]);

    this.msgHandler = (e: MessageEvent) => {
      if (this.disposed) return;

      if (this.opts.logAllMessages) {
        // Inspect these once to learn exact payload shape
        console.log('[ML postMessage]', e.origin, e.data);
      }

      if (!trustedOrigins.has(e.origin)) return;

      // Normalize a few common payload shapes
      const d: any = e.data;
      const type = (d?.type || d?.event || d?.name || '').toString().toLowerCase();
      const formId =
        d?.formId || d?.detail?.formId || d?.payload?.id || this.opts.formId;

      // Heuristics: adjust after you log real messages
      if (type.includes('submit')) {
        this.opts.onSubmitAttempt?.(formId);
      }
      if (type.includes('success') || type.includes('subscribed')) {
        this.opts.onSuccess?.(formId);
        this.dispose(); // cleanup after success
      }
    };

    window.addEventListener('message', this.msgHandler);
  }

  /** Cleanup listeners/observers */
  public dispose() {
    this.disposed = true;
    if (this.msgHandler) window.removeEventListener('message', this.msgHandler);
    this.observer?.disconnect();
  }
}

// ---- Your configured instance ----
const mlPopupHandler = new MlPopupHandler({
  formId: '1RSel7',
  logAllMessages: false, // turn on for a couple of runs, then set to false
  onPopupShown: () => {
    navigationManager.setEmailCaptured(true);
  },
  onSubmitAttempt: (formId) => {
  },
  onSuccess: (formId) => {
  },
});

export default mlPopupHandler;
