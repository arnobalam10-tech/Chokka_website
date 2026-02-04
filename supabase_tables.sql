-- =============================================
-- CHOKKA ADMIN PANEL - NEW TABLES
-- Run this in Supabase SQL Editor
-- =============================================

-- 1. INVENTORY TABLE
-- Tracks raw materials and finished goods
CREATE TABLE IF NOT EXISTS inventory (
    id SERIAL PRIMARY KEY,
    category VARCHAR(50) NOT NULL, -- 'Finished Goods', 'Packaging', 'Labels'
    item_name VARCHAR(100) NOT NULL,
    stock INTEGER DEFAULT 0,
    reorder_level INTEGER DEFAULT 5,
    product_id INTEGER DEFAULT NULL, -- Links to products table (1=Syndicate, 2=Tong, NULL=shared)
    item_type VARCHAR(50) DEFAULT NULL, -- 'card_set', 'packet', 'sticker' for auto-deduction
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. EXPENSES TABLE
-- Tracks production costs
CREATE TABLE IF NOT EXISTS expenses (
    id SERIAL PRIMARY KEY,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    print_cost DECIMAL(10,2) DEFAULT 0,
    cutting_cost DECIMAL(10,2) DEFAULT 0,
    packaging_cost DECIMAL(10,2) DEFAULT 0,
    miscellaneous DECIMAL(10,2) DEFAULT 0,
    particular VARCHAR(255), -- e.g., "Syndicate = 15p, tong 10p"
    note TEXT,
    total DECIMAL(10,2) GENERATED ALWAYS AS (print_cost + cutting_cost + packaging_cost + miscellaneous) STORED,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. PAYOUTS TABLE
-- Tracks Steadfast COD payments received
CREATE TABLE IF NOT EXISTS payouts (
    id SERIAL PRIMARY KEY,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    invoice_no VARCHAR(50),
    amount DECIMAL(10,2) NOT NULL,
    note VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- INSERT DEFAULT INVENTORY ITEMS
-- =============================================

INSERT INTO inventory (category, item_name, stock, reorder_level, product_id, item_type) VALUES
-- Finished Goods
('Finished Goods', 'Syndicate Card Set', 13, 5, 1, 'card_set'),
('Finished Goods', 'Tong Card Set', 12, 5, 2, 'card_set'),

-- Packaging
('Packaging', 'Packet for Syndicate', 5, 5, 1, 'packet'),
('Packaging', 'Packet for Tong', 2, 5, 2, 'packet'),

-- Labels
('Labels', 'Sticker for Syndicate', 3, 10, 1, 'sticker'),
('Labels', 'Sticker for Tong', 18, 10, 2, 'sticker');

-- =============================================
-- CREATE INDEXES FOR PERFORMANCE
-- =============================================

CREATE INDEX IF NOT EXISTS idx_inventory_category ON inventory(category);
CREATE INDEX IF NOT EXISTS idx_inventory_product_id ON inventory(product_id);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(date);
CREATE INDEX IF NOT EXISTS idx_payouts_date ON payouts(date);

-- =============================================
-- ENABLE ROW LEVEL SECURITY (Optional)
-- =============================================

-- ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE payouts ENABLE ROW LEVEL SECURITY;

-- =============================================
-- UPDATE TRIGGER FOR inventory.updated_at
-- =============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_inventory_updated_at
    BEFORE UPDATE ON inventory
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
