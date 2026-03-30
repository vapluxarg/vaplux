export interface Category {
  id: string;
  name: string;
  slug: string;
  is_active: boolean;
  views_count: number;
  created_at: string;
}

export interface Product {
  id: string;
  category_id: string | null;
  title: string;
  description: string | null;
  price_ars: number | null;
  price_usd: number | null;
  preferred_currency: 'ars' | 'usd';
  image_urls: string[];
  video_url: string | null;
  ml_link: string | null;
  stock: number;
  is_active: boolean;
  views_count: number;
  whatsapp_clicks: number;
  meli_clicks: number;
  added_to_cart_count: number;
  created_at: string;
  updated_at: string;
}

export interface Promotion {
  id: string;
  title: string;
  short_description: string | null;
  banner_image_url: string | null;
  product_ids: string[];
  is_active: boolean;
  clicks_count: number;
  created_at: string;
  expires_at: string | null;
}

export interface CartItem {
  product: Product;
  quantity: number;
}
