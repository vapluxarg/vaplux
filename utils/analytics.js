/**
 * utils/analytics.js
 *
 * Client-side event tracking for Vaplux.
 * Calls the Supabase RPC `track_product_event` which atomically:
 *  - Inserts a row into analytics_events
 *  - Increments the right counter(s) in the products table
 *
 * Event logic:
 *  'view'               → views_count + 1
 *  'cart_add'           → added_to_cart_count + 1
 *  'whatsapp_checkout'  → added_to_cart_count + 1  +  whatsapp_clicks + 1
 *                         (direct WA purchase = implicit cart add + instant checkout)
 *  'meli_click'         → meli_clicks + 1
 */

import { supabase } from '@/utils/supabase'

/**
 * Track a product interaction event.
 * Fire-and-forget — never throws, failures are silently logged.
 *
 * @param {'view'|'cart_add'|'whatsapp_checkout'|'meli_click'} eventType
 * @param {string} productId  — UUID of the product
 */
export async function trackProductEvent(eventType, productId) {
  if (!productId) return

  try {
    const { error } = await supabase.rpc('track_product_event', {
      p_product_id: productId,
      p_event_type: eventType,
    })
    if (error) console.warn('[analytics] track error:', error.message)
  } catch (e) {
    console.warn('[analytics] unexpected error:', e)
  }
}

/**
 * Track a category interaction event.
 * Fire-and-forget — never throws, failures are silently logged.
 *
 * @param {'view'} eventType
 * @param {string} categoryId  — UUID of the category
 */
export async function trackCategoryEvent(eventType, categoryId) {
  if (!categoryId) return

  try {
    const { error } = await supabase.rpc('track_category_event', {
      p_category_id: categoryId,
      p_event_type: eventType,
    })
    if (error) console.warn('[analytics] track category error:', error.message)
  } catch (e) {
    console.warn('[analytics] unexpected error:', e)
  }
}
