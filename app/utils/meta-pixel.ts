/**
 * Meta Pixel (Facebook Pixel) tracking utility
 * Provides functions to track various e-commerce events
 */

declare global {
  interface Window {
    fbq?: (
      command: string,
      event: string,
      params?: Record<string, any>,
    ) => void;
  }
}

/**
 * Check if Meta Pixel is loaded
 */
export function isMetaPixelLoaded(): boolean {
  return typeof window !== 'undefined' && typeof window.fbq === 'function';
}

/**
 * Track a custom event
 */
export function trackPixelEvent(
  eventName: string,
  params?: Record<string, any>,
): void {
  if (isMetaPixelLoaded()) {
    window.fbq!('track', eventName, params);
  }
}

/**
 * Track PageView event
 */
export function trackPageView(): void {
  if (isMetaPixelLoaded()) {
    window.fbq!('track', 'PageView');
  }
}

/**
 * Track ViewContent event (product view)
 */
export function trackViewContent(
  contentName: string,
  contentIds?: string[],
  value?: number,
  currency?: string,
): void {
  if (isMetaPixelLoaded()) {
    const params: Record<string, any> = {
      content_name: contentName,
    };

    if (contentIds && contentIds.length > 0) {
      params.content_ids = contentIds;
    }

    if (value !== undefined) {
      params.value = value;
    }

    if (currency) {
      params.currency = currency;
    }

    window.fbq!('track', 'ViewContent', params);
  }
}

/**
 * Track AddToCart event
 */
export function trackAddToCart(
  contentName: string,
  contentIds?: string[],
  value?: number,
  currency?: string,
  quantity?: number,
): void {
  if (isMetaPixelLoaded()) {
    const params: Record<string, any> = {
      content_name: contentName,
    };

    if (contentIds && contentIds.length > 0) {
      params.content_ids = contentIds;
    }

    if (value !== undefined) {
      params.value = value;
    }

    if (currency) {
      params.currency = currency;
    }

    if (quantity !== undefined) {
      params.quantity = quantity;
    }

    window.fbq!('track', 'AddToCart', params);
  }
}

/**
 * Track InitiateCheckout event
 */
export function trackInitiateCheckout(
  value?: number,
  currency?: string,
  contentIds?: string[],
  numItems?: number,
): void {
  if (isMetaPixelLoaded()) {
    const params: Record<string, any> = {};

    if (value !== undefined) {
      params.value = value;
    }

    if (currency) {
      params.currency = currency;
    }

    if (contentIds && contentIds.length > 0) {
      params.content_ids = contentIds;
    }

    if (numItems !== undefined) {
      params.num_items = numItems;
    }

    window.fbq!('track', 'InitiateCheckout', params);
  }
}

/**
 * Track Purchase event
 */
export function trackPurchase(
  value: number,
  currency: string,
  contentIds?: string[],
  contentName?: string,
  numItems?: number,
  orderId?: string,
): void {
  if (isMetaPixelLoaded()) {
    const params: Record<string, any> = {
      value,
      currency,
    };

    if (contentIds && contentIds.length > 0) {
      params.content_ids = contentIds;
    }

    if (contentName) {
      params.content_name = contentName;
    }

    if (numItems !== undefined) {
      params.num_items = numItems;
    }

    if (orderId) {
      params.order_id = orderId;
    }

    window.fbq!('track', 'Purchase', params);
  }
}

/**
 * Track Search event
 */
export function trackSearch(searchString: string): void {
  if (isMetaPixelLoaded()) {
    window.fbq!('track', 'Search', {
      search_string: searchString,
    });
  }
}

/**
 * Track button click (custom event)
 */
export function trackButtonClick(
  buttonName: string,
  buttonLocation?: string,
): void {
  if (isMetaPixelLoaded()) {
    const params: Record<string, any> = {
      button_name: buttonName,
    };

    if (buttonLocation) {
      params.button_location = buttonLocation;
    }

    window.fbq!('trackCustom', 'ButtonClick', params);
  }
}

/**
 * Track AddToWishlist event
 */
export function trackAddToWishlist(
  contentName: string,
  contentIds?: string[],
  value?: number,
  currency?: string,
): void {
  if (isMetaPixelLoaded()) {
    const params: Record<string, any> = {
      content_name: contentName,
    };

    if (contentIds && contentIds.length > 0) {
      params.content_ids = contentIds;
    }

    if (value !== undefined) {
      params.value = value;
    }

    if (currency) {
      params.currency = currency;
    }

    window.fbq!('track', 'AddToWishlist', params);
  }
}

