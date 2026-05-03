-- مسح جدول الكوبونات القديم (إن وجد) لأنه قد يحتوي على أعمدة ناقصة أو بأسماء مختلفة
DROP TABLE IF EXISTS coupons CASCADE;

-- إنشاء جدول الكوبونات بالهيكلية الصحيحة تماماً
CREATE TABLE coupons (
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

-- تفعيل الأمان (RLS)
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;

-- سياسات الكوبونات
CREATE POLICY "Allow public read coupons" ON coupons FOR SELECT USING (true);
CREATE POLICY "Allow admin full access coupons" ON coupons USING (auth.role() = 'authenticated');
