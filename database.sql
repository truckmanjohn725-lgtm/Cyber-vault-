-- ============================================
-- CYBER VAULT - Complete Database Schema
-- Run this entire file in Supabase SQL Editor
-- ============================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABLES
-- ============================================

CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT DEFAULT '',
  wallet_balance NUMERIC DEFAULT 0,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  category TEXT NOT NULL,
  base_price NUMERIC DEFAULT 0,
  selling_price NUMERIC NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  customer_email TEXT NOT NULL,
  product_name TEXT NOT NULL,
  category TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  payment_method TEXT CHECK (payment_method IN ('Wallet', 'OPay', 'Crypto')) NOT NULL,
  payment_proof_url TEXT,
  status TEXT CHECK (status IN ('Pending', 'Approved', 'Rejected', 'Delivered')) DEFAULT 'Pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS wallet_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL,
  type TEXT CHECK (type IN ('Deposit', 'Purchase', 'Refund')) NOT NULL,
  description TEXT DEFAULT '',
  status TEXT CHECK (status IN ('Pending', 'Completed')) DEFAULT 'Pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS admin_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  opay_account_number TEXT DEFAULT '8123456789',
  opay_account_name TEXT DEFAULT 'Cyber Vault Admin',
  profit_margin NUMERIC DEFAULT 30,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- DEFAULT DATA
-- ============================================

INSERT INTO admin_settings (opay_account_number, opay_account_name, profit_margin)
VALUES ('8123456789', 'Cyber Vault Admin', 30)
ON CONFLICT DO NOTHING;

INSERT INTO products (name, description, category, base_price, selling_price) VALUES
  ('USA WhatsApp Number', 'US virtual number for WhatsApp verification. Instant delivery.', 'Virtual Phone Numbers', 3.85, 5.00),
  ('UK Telegram Number', 'UK virtual number for Telegram signup. Instant delivery.', 'Virtual Phone Numbers', 2.31, 3.00),
  ('Nigeria Verification Number', 'Nigerian virtual number for any app verification.', 'Virtual Phone Numbers', 1.54, 2.00),
  ('1000 Instagram Followers', 'Real-looking followers added within 24hrs.', 'Social Media Boosting', 7.69, 10.00),
  ('500 TikTok Likes', '500 likes on any TikTok video. Fast delivery.', 'Social Media Boosting', 3.85, 5.00),
  ('100 YouTube Views', '100 views added to your YouTube video.', 'Social Media Boosting', 2.31, 3.00),
  ('Notion Productivity Bundle', '20 premium Notion templates for work and business.', 'Digital Templates', 6.15, 8.00),
  ('Canva Pro Design Kit', '50 editable Canva templates for social media and more.', 'Digital Templates', 9.23, 12.00),
  ('Excel Financial Model Pack', '10 professional Excel financial models and trackers.', 'Digital Templates', 11.54, 15.00),
  ('Auto-Posting Bot Script', 'Python script for automated social media scheduling.', 'Developer Tools', 11.54, 15.00),
  ('SEO Keyword Scraper', 'Extract keywords and search data from public sources.', 'Developer Tools', 15.38, 20.00),
  ('Bulk Email Validator', 'Validate large email lists for deliverability. CLI tool.', 'Developer Tools', 19.23, 25.00)
ON CONFLICT DO NOTHING;

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallet_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users view own profile" ON profiles;
DROP POLICY IF EXISTS "Users update own profile" ON profiles;
DROP POLICY IF EXISTS "Admin view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admin update all profiles" ON profiles;
DROP POLICY IF EXISTS "Products public read" ON products;
DROP POLICY IF EXISTS "Admin manage products" ON products;
DROP POLICY IF EXISTS "Users view own orders" ON orders;
DROP POLICY IF EXISTS "Users create orders" ON orders;
DROP POLICY IF EXISTS "Admin view all orders" ON orders;
DROP POLICY IF EXISTS "Admin update orders" ON orders;
DROP POLICY IF EXISTS "Users view own transactions" ON wallet_transactions;
DROP POLICY IF EXISTS "Users create transactions" ON wallet_transactions;
DROP POLICY IF EXISTS "Admin view all transactions" ON wallet_transactions;
DROP POLICY IF EXISTS "Admin create transactions" ON wallet_transactions;
DROP POLICY IF EXISTS "Admin update transactions" ON wallet_transactions;
DROP POLICY IF EXISTS "Public read settings" ON admin_settings;
DROP POLICY IF EXISTS "Admin update settings" ON admin_settings;

CREATE POLICY "Users view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admin view all profiles" ON profiles FOR SELECT
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE));
CREATE POLICY "Admin update all profiles" ON profiles FOR UPDATE
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE));

CREATE POLICY "Products public read" ON products FOR SELECT USING (TRUE);
CREATE POLICY "Admin manage products" ON products FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE));

CREATE POLICY "Users view own orders" ON orders FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users create orders" ON orders FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Admin view all orders" ON orders FOR SELECT
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE));
CREATE POLICY "Admin update orders" ON orders FOR UPDATE
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE));

CREATE POLICY "Users view own transactions" ON wallet_transactions FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users create transactions" ON wallet_transactions FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Admin view all transactions" ON wallet_transactions FOR SELECT
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE));
CREATE POLICY "Admin create transactions" ON wallet_transactions FOR INSERT
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE));
CREATE POLICY "Admin update transactions" ON wallet_transactions FOR UPDATE
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE));

CREATE POLICY "Public read settings" ON admin_settings FOR SELECT USING (TRUE);
CREATE POLICY "Admin update settings" ON admin_settings FOR UPDATE
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE));

-- ============================================
-- TRIGGER: Auto-create profile on signup
-- ============================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name, is_admin)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    CASE WHEN NEW.email = 'olakunleomogbolahan3@gmail.com' THEN TRUE ELSE FALSE END
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
