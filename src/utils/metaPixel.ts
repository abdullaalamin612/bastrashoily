/**
 * Advanced Meta Pixel & Conversion API (CAPI) Tracking Utility
 * Implements Meta's recommended Dual-Tracking with Server-Side Deduplication (event_id).
 */

declare global {
  interface Window {
    fbq?: any;
    _fbq?: any;
  }
}

// SHA-256 Hasher for standard Meta CAPI user data compliance
export async function sha256(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message.trim().toLowerCase());
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

// Generate unique event ID for deduplication between browser pixel and server CAPI
export function generateEventId(eventName: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 9);
  return `${eventName.toLowerCase()}_${timestamp}_${random}`;
}

export interface TrackingUserData {
  phone?: string;
  email?: string;
  name?: string;
  city?: string;
  country?: string;
}

export interface TrackingCustomData {
  currency?: string;
  value?: number;
  content_name?: string;
  content_category?: string;
  content_ids?: string[];
  contents?: Array<{ id: string; quantity: number; item_price?: number }>;
  order_id?: string;
  num_items?: number;
}

class MetaTracker {
  private pixelId: string = '';
  private isInitialized: boolean = false;

  constructor() {
    this.init();
  }

  public async init() {
    if (typeof window === 'undefined') return;
    try {
      const res = await fetch('/api/pixel-settings');
      const data = await res.json();
      if (data.success && data.settings?.pixelId) {
        this.pixelId = data.settings.pixelId.trim();
        if (this.pixelId && data.settings.status !== 'inactive') {
          this.injectBrowserPixel(this.pixelId);
          this.isInitialized = true;
        }
      }
    } catch {}
  }

  private injectBrowserPixel(pixelId: string) {
    if (window.fbq) return;

    /* eslint-disable */
    (function (f: any, b: any, e: any, v: any, n?: any, t?: any, s?: any) {
      if (f.fbq) return;
      n = f.fbq = function () {
        n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
      };
      if (!f._fbq) f._fbq = n;
      n.push = n;
      n.loaded = !0;
      n.version = '2.0';
      n.queue = [];
      t = b.createElement(e);
      t.async = !0;
      t.src = v;
      s = b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t, s);
    })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
    /* eslint-enable */

    if (window.fbq) {
      window.fbq('init', pixelId);
      window.fbq('track', 'PageView');
    }
  }

  /**
   * Track Event with Meta Dual Tracking (Browser Pixel + Server CAPI)
   */
  public async track(
    eventName: 'PageView' | 'ViewContent' | 'AddToCart' | 'InitiateCheckout' | 'Purchase' | 'Search' | 'Contact',
    customData: TrackingCustomData = {},
    userData: TrackingUserData = {}
  ): Promise<string> {
    const eventId = generateEventId(eventName);
    const eventSourceUrl = typeof window !== 'undefined' ? window.location.href : '';

    // 1. Browser Pixel Dispatch with eventID for deduplication
    if (typeof window !== 'undefined' && window.fbq) {
      try {
        window.fbq('track', eventName, customData, { eventID: eventId });
      } catch (err) {
        console.warn('Meta Browser Pixel dispatch error:', err);
      }
    }

    // 2. Server-side Conversion API (CAPI) Dispatch
    try {
      fetch('/api/tracking/meta-capi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventName,
          eventId,
          eventSourceUrl,
          userData,
          customData: {
            currency: 'BDT',
            ...customData,
          },
        }),
      }).catch(() => {});
    } catch {}

    return eventId;
  }
}

export const metaTracker = new MetaTracker();
