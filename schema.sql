-- ==========================================
-- إنشاء الجداول (Tables Creation)
-- ==========================================

-- جدول الكوبونات
CREATE TABLE IF NOT EXISTS coupons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT NOT NULL UNIQUE,
    type TEXT NOT NULL,
    value NUMERIC NOT NULL,
    usage_limit INTEGER,
    used_count INTEGER DEFAULT 0,
    expiry_date TIMESTAMP WITH TIME ZONE,
    min_order_amount NUMERIC DEFAULT 0,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- جدول المجموعات
CREATE TABLE IF NOT EXISTS collections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    image TEXT,
    description TEXT,
    products TEXT[] DEFAULT '{}',
    status TEXT DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- جدول التصنيفات
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    products_count INTEGER DEFAULT 0,
    status TEXT DEFAULT 'active',
    image TEXT,
    parent_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- (في حال لم تكن بعض الجداول الأخرى موجودة)
CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    price NUMERIC,
    originalPrice NUMERIC,
    status TEXT,
    category TEXT,
    images JSONB,
    features JSONB,
    specifications JSONB,
    colors JSONB,
    engravingOptions JSONB,
    giftOptions JSONB,
    createdAt TEXT,
    updatedAt TEXT
);

CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    customer_name TEXT,
    customer_email TEXT,
    phone TEXT,
    address TEXT,
    total NUMERIC,
    status TEXT,
    date TEXT,
    payment_method TEXT,
    items JSONB,
    is_gift BOOLEAN,
    gift_wrapping TEXT,
    gift_message TEXT,
    recipient_names JSONB,
    coupon_code TEXT,
    discount NUMERIC,
    created_at TEXT,
    updated_at TEXT
);

CREATE TABLE IF NOT EXISTS customers (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    name TEXT,
    email TEXT,
    phone TEXT,
    address TEXT,
    ordersCount INTEGER DEFAULT 0,
    totalSpent NUMERIC DEFAULT 0,
    lastOrderDate TEXT,
    status TEXT,
    created_at TEXT,
    updated_at TEXT
);

CREATE TABLE IF NOT EXISTS reviews (
    id TEXT PRIMARY KEY,
    productId TEXT,
    customer TEXT,
    productName TEXT,
    rating INTEGER,
    comment TEXT,
    date TEXT,
    status TEXT DEFAULT 'pending',
    createdAt TEXT,
    updatedAt TEXT
);

-- تفعيل الـ RLS للكوبونات والمجموعات
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- سياسات الكوبونات
CREATE POLICY "Allow public read coupons" ON coupons FOR SELECT USING (true);
CREATE POLICY "Allow admin full access coupons" ON coupons USING (auth.role() = 'authenticated');

-- سياسات المجموعات
CREATE POLICY "Allow public read collections" ON collections FOR SELECT USING (true);
CREATE POLICY "Allow admin full access collections" ON collections USING (auth.role() = 'authenticated');

-- سياسات التصنيفات
CREATE POLICY "Allow public read categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Allow admin full access categories" ON categories USING (auth.role() = 'authenticated');
