/**
 * Meta Pixel (Facebook Pixel) Utility
 *
 * Usage:
 * 1. Replace 'YOUR_PIXEL_ID' in index.html with your actual Pixel ID
 * 2. Import and use these functions throughout the app
 *
 * Standard Events: https://developers.facebook.com/docs/meta-pixel/reference
 */

// Check if fbq is available (Meta Pixel loaded)
const isFbqAvailable = () => typeof window !== 'undefined' && typeof window.fbq === 'function';

/**
 * Track PageView - Called automatically on initial load via index.html
 * Use this for SPA route changes
 */
export const trackPageView = () => {
  if (!isFbqAvailable()) return;
  window.fbq('track', 'PageView');
};

/**
 * Track ViewContent - When user views a product page
 * @param {Object} params - Product details
 * @param {string} params.content_name - Product name (e.g., "The Syndicate")
 * @param {string} params.content_ids - Product ID
 * @param {string} params.content_type - Type (product/product_group)
 * @param {number} params.value - Product price
 * @param {string} params.currency - Currency code (BDT)
 */
export const trackViewContent = ({ content_name, content_ids, content_type = 'product', value, currency = 'BDT' }) => {
  if (!isFbqAvailable()) return;
  window.fbq('track', 'ViewContent', {
    content_name,
    content_ids: [content_ids],
    content_type,
    value,
    currency
  });
};

/**
 * Track InitiateCheckout - When checkout modal opens
 * @param {Object} params - Checkout details
 * @param {string} params.content_name - Product name
 * @param {string} params.content_ids - Product ID
 * @param {number} params.value - Product price
 * @param {string} params.currency - Currency code (BDT)
 * @param {number} params.num_items - Number of items
 */
export const trackInitiateCheckout = ({ content_name, content_ids, value, currency = 'BDT', num_items = 1 }) => {
  if (!isFbqAvailable()) return;
  window.fbq('track', 'InitiateCheckout', {
    content_name,
    content_ids: [content_ids],
    content_type: 'product',
    value,
    currency,
    num_items
  });
};

/**
 * Track AddToCart - When user upgrades to bundle (upsell)
 * @param {Object} params - Cart details
 * @param {string} params.content_name - Product name
 * @param {string} params.content_ids - Product ID
 * @param {number} params.value - Product price
 * @param {string} params.currency - Currency code (BDT)
 */
export const trackAddToCart = ({ content_name, content_ids, value, currency = 'BDT' }) => {
  if (!isFbqAvailable()) return;
  window.fbq('track', 'AddToCart', {
    content_name,
    content_ids: [content_ids],
    content_type: 'product',
    value,
    currency
  });
};

/**
 * Track Purchase - When order is successfully confirmed
 * @param {Object} params - Purchase details
 * @param {string} params.content_name - Product name
 * @param {string} params.content_ids - Product ID
 * @param {number} params.value - Total order value (including shipping, minus discount)
 * @param {string} params.currency - Currency code (BDT)
 * @param {number} params.num_items - Number of items
 */
export const trackPurchase = ({ content_name, content_ids, value, currency = 'BDT', num_items = 1 }) => {
  if (!isFbqAvailable()) return;
  window.fbq('track', 'Purchase', {
    content_name,
    content_ids: [content_ids],
    content_type: 'product',
    value,
    currency,
    num_items
  });
};

/**
 * Track Custom Event - For any custom tracking needs
 * @param {string} eventName - Custom event name
 * @param {Object} params - Event parameters
 */
export const trackCustomEvent = (eventName, params = {}) => {
  if (!isFbqAvailable()) return;
  window.fbq('trackCustom', eventName, params);
};

/**
 * Product ID to Name mapping for CHOKKA
 */
export const PRODUCT_NAMES = {
  1: 'The Syndicate',
  2: 'Tong',
  3: 'Bundle (Syndicate + Tong)'
};
