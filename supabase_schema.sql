-- Esquema Inicial Vaplux (Supabase)

-- 1. Categorías
CREATE TABLE categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  is_active boolean DEFAULT true,
  views_count integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now()
);

-- 2. Productos
CREATE TABLE products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  title text NOT NULL,
  description text,
  price_ars numeric,
  price_usd numeric,
  preferred_currency text DEFAULT 'usd', -- 'ars' o 'usd'
  image_urls text[] DEFAULT '{}', -- Hasta 4 imágenes
  video_url text,
  ml_link text,
  stock integer DEFAULT 0,
  is_active boolean DEFAULT true,
  views_count integer DEFAULT 0,
  whatsapp_clicks integer DEFAULT 0,
  meli_clicks integer DEFAULT 0,
  added_to_cart_count integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- 3. Promociones
CREATE TABLE promotions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  short_description text,
  banner_image_url text,
  product_ids uuid[] DEFAULT '{}', -- IDs referenciando productos (hasta 3)
  is_active boolean DEFAULT false,
  clicks_count integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  expires_at timestamp with time zone
);

-- 4. Eventos de Analíticas (Para Tendencias y "Última Semana")
CREATE TABLE analytics_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL, -- Ej: 'view', 'whatsapp_click', 'meli_click', 'promo_click'
  entity_type text NOT NULL, -- Ej: 'product', 'category', 'promo'
  entity_id uuid NOT NULL, -- Referencia genérica al id del elemento
  created_at timestamp with time zone DEFAULT now()
);

-- Indices para mejorar la velocidad en consultas comunes
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_analytics_created_at ON analytics_events(created_at);
CREATE INDEX idx_analytics_entity ON analytics_events(entity_type, entity_id);
