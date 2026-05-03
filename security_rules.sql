-- Enable RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts if they exist
DROP POLICY IF EXISTS "Allow public read access on products" ON products;
DROP POLICY IF EXISTS "Allow admin to insert products" ON products;
DROP POLICY IF EXISTS "Allow admin to update products" ON products;
DROP POLICY IF EXISTS "Allow admin to delete products" ON products;

DROP POLICY IF EXISTS "Allow public to insert orders" ON orders;
DROP POLICY IF EXISTS "Allow admin to read all orders" ON orders;
DROP POLICY IF EXISTS "Allow admin to update orders" ON orders;

DROP POLICY IF EXISTS "Allow public to insert customers" ON customers;
DROP POLICY IF EXISTS "Allow admin to read all customers" ON customers;
DROP POLICY IF EXISTS "Allow admin to update customers" ON customers;

DROP POLICY IF EXISTS "Allow public to insert reviews" ON reviews;
DROP POLICY IF EXISTS "Allow public to read approved reviews" ON reviews;
DROP POLICY IF EXISTS "Allow admin to update reviews" ON reviews;

-- Products Policies
CREATE POLICY "Allow public read access on products" ON products FOR SELECT USING (true);
CREATE POLICY "Allow admin to insert products" ON products FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow admin to update products" ON products FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Allow admin to delete products" ON products FOR DELETE USING (auth.role() = 'authenticated');

-- Orders Policies
CREATE POLICY "Allow public to insert orders" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow admin to read all orders" ON orders FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow admin to update orders" ON orders FOR UPDATE USING (auth.role() = 'authenticated');

-- Customers Policies
CREATE POLICY "Allow public to insert customers" ON customers FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow admin to read all customers" ON customers FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow admin to update customers" ON customers FOR UPDATE USING (auth.role() = 'authenticated');

-- Reviews Policies
CREATE POLICY "Allow public to insert reviews" ON reviews FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public to read approved reviews" ON reviews FOR SELECT USING (status = 'approved' OR auth.role() = 'authenticated');
CREATE POLICY "Allow admin to update reviews" ON reviews FOR UPDATE USING (auth.role() = 'authenticated');
