-- ============================================
-- TiDB Cloud Schema for Money Flow
-- Version: 2.0
-- Last Updated: November 2025
-- 
-- Optimized for TiDB distributed SQL:
-- - Uses CUID/UUID for distributed IDs
-- - Avoids auto_increment (causes hotspots)
-- - Partitioned tables for time-series data
-- - Composite indexes for multi-tenant queries
-- ============================================

-- Enable clustered indexes globally
SET GLOBAL tidb_enable_clustered_index = 'ON';

-- ============================================
-- ORGANIZATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS organizations (
    id VARCHAR(36) NOT NULL,
    
    -- Basic Info
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) NOT NULL,
    logo_url VARCHAR(500),
    
    -- Settings
    settings JSON DEFAULT '{}',
    
    -- Subscription
    subscription_tier ENUM('FREE', 'STARTER', 'PROFESSIONAL', 'ENTERPRISE') DEFAULT 'FREE',
    subscription_status ENUM('ACTIVE', 'PAST_DUE', 'CANCELLED', 'TRIAL') DEFAULT 'TRIAL',
    trial_ends_at DATETIME,
    
    -- Timestamps
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at DATETIME,
    
    PRIMARY KEY (id) CLUSTERED,
    UNIQUE KEY uk_slug (slug),
    KEY idx_subscription (subscription_tier, subscription_status),
    KEY idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- USERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) NOT NULL,
    organization_id VARCHAR(36) NOT NULL,
    
    -- Authentication
    email VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    
    -- Profile
    full_name VARCHAR(255) NOT NULL,
    avatar_url VARCHAR(500),
    phone VARCHAR(50),
    
    -- Role & Permissions
    role ENUM('OWNER', 'ADMIN', 'MANAGER', 'STAFF', 'VIEWER') DEFAULT 'STAFF',
    permissions JSON DEFAULT '[]',
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    email_verified BOOLEAN DEFAULT FALSE,
    
    -- Timestamps
    last_login_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at DATETIME,
    
    PRIMARY KEY (id) CLUSTERED,
    UNIQUE KEY uk_email (email),
    KEY idx_org (organization_id),
    KEY idx_org_role (organization_id, role),
    KEY idx_org_active (organization_id, is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- CUSTOMERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS customers (
    id VARCHAR(36) NOT NULL,
    organization_id VARCHAR(36) NOT NULL,

    -- Basic Info
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    company VARCHAR(255),

    -- Address
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    postal_code VARCHAR(20),
    country VARCHAR(2) DEFAULT 'PK',

    -- Business Info
    tax_id VARCHAR(50),
    credit_limit DECIMAL(15,2),
    balance DECIMAL(15,2) DEFAULT 0.00,

    -- Status
    status ENUM('ACTIVE', 'INACTIVE', 'BLOCKED') DEFAULT 'ACTIVE',

    -- Metadata
    notes TEXT,
    tags JSON,

    -- Timestamps
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at DATETIME,

    PRIMARY KEY (id) CLUSTERED,
    UNIQUE KEY uk_org_email (organization_id, email),
    KEY idx_org (organization_id),
    KEY idx_org_status (organization_id, status),
    KEY idx_org_name (organization_id, name),
    KEY idx_org_created (organization_id, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- PRODUCTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS products (
    id VARCHAR(36) NOT NULL,
    organization_id VARCHAR(36) NOT NULL,

    -- Basic Info
    name VARCHAR(255) NOT NULL,
    description TEXT,
    sku VARCHAR(100),
    barcode VARCHAR(100),

    -- Pricing
    unit_price DECIMAL(15,2) NOT NULL,
    cost_price DECIMAL(15,2),
    tax_rate DECIMAL(5,2) DEFAULT 0.00,

    -- Inventory
    track_inventory BOOLEAN DEFAULT TRUE,
    quantity INT DEFAULT 0,
    min_quantity INT DEFAULT 0,
    max_quantity INT,

    -- Categorization
    category VARCHAR(100),
    unit VARCHAR(50) DEFAULT 'piece',

    -- Status
    status ENUM('ACTIVE', 'INACTIVE', 'DISCONTINUED') DEFAULT 'ACTIVE',

    -- Metadata
    image_url VARCHAR(500),
    metadata JSON,

    -- Timestamps
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at DATETIME,

    PRIMARY KEY (id) CLUSTERED,
    UNIQUE KEY uk_org_sku (organization_id, sku),
    KEY idx_org (organization_id),
    KEY idx_org_status (organization_id, status),
    KEY idx_org_category (organization_id, category),
    KEY idx_org_low_stock (organization_id, track_inventory, quantity, min_quantity)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- INVOICES TABLE (Partitioned by month)
-- ============================================
CREATE TABLE IF NOT EXISTS invoices (
    id VARCHAR(36) NOT NULL,
    organization_id VARCHAR(36) NOT NULL,
    customer_id VARCHAR(36) NOT NULL,

    -- Invoice Info
    invoice_number VARCHAR(50) NOT NULL,
    reference VARCHAR(100),

    -- Dates
    issue_date DATE NOT NULL,
    due_date DATE NOT NULL,
    paid_date DATE,

    -- Amounts
    subtotal DECIMAL(15,2) NOT NULL,
    tax_amount DECIMAL(15,2) DEFAULT 0.00,
    discount_amount DECIMAL(15,2) DEFAULT 0.00,
    total DECIMAL(15,2) NOT NULL,
    amount_paid DECIMAL(15,2) DEFAULT 0.00,
    balance_due DECIMAL(15,2) NOT NULL,

    -- Currency
    currency VARCHAR(3) DEFAULT 'PKR',
    exchange_rate DECIMAL(10,6) DEFAULT 1.000000,

    -- Status
    status ENUM('DRAFT', 'SENT', 'VIEWED', 'PAID', 'OVERDUE', 'CANCELLED', 'REFUNDED') DEFAULT 'DRAFT',
    payment_status ENUM('UNPAID', 'PARTIAL', 'PAID', 'REFUNDED') DEFAULT 'UNPAID',

    -- Additional
    notes TEXT,
    terms TEXT,
    footer TEXT,

    -- Metadata
    metadata JSON,

    -- Timestamps
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at DATETIME,
    created_by VARCHAR(36) NOT NULL,

    PRIMARY KEY (id, issue_date) CLUSTERED,
    UNIQUE KEY uk_org_invoice_num (organization_id, invoice_number),
    KEY idx_org (organization_id),
    KEY idx_org_status (organization_id, status),
    KEY idx_org_customer (organization_id, customer_id),
    KEY idx_org_issue_date (organization_id, issue_date),
    KEY idx_org_due_date (organization_id, due_date),
    KEY idx_org_payment_status (organization_id, payment_status)
)
PARTITION BY RANGE (YEAR(issue_date) * 100 + MONTH(issue_date)) (
    PARTITION p202401 VALUES LESS THAN (202402),
    PARTITION p202402 VALUES LESS THAN (202403),
    PARTITION p202403 VALUES LESS THAN (202404),
    PARTITION p202404 VALUES LESS THAN (202405),
    PARTITION p202405 VALUES LESS THAN (202406),
    PARTITION p202406 VALUES LESS THAN (202407),
    PARTITION p202407 VALUES LESS THAN (202408),
    PARTITION p202408 VALUES LESS THAN (202409),
    PARTITION p202409 VALUES LESS THAN (202410),
    PARTITION p202410 VALUES LESS THAN (202411),
    PARTITION p202411 VALUES LESS THAN (202412),
    PARTITION p202412 VALUES LESS THAN (202501),
    PARTITION p202501 VALUES LESS THAN (202502),
    PARTITION p202502 VALUES LESS THAN (202503),
    PARTITION p202503 VALUES LESS THAN (202504),
    PARTITION p202504 VALUES LESS THAN (202505),
    PARTITION p202505 VALUES LESS THAN (202506),
    PARTITION p202506 VALUES LESS THAN (202507),
    PARTITION p202507 VALUES LESS THAN (202508),
    PARTITION p202508 VALUES LESS THAN (202509),
    PARTITION p202509 VALUES LESS THAN (202510),
    PARTITION p202510 VALUES LESS THAN (202511),
    PARTITION p202511 VALUES LESS THAN (202512),
    PARTITION p202512 VALUES LESS THAN (202601),
    PARTITION pmax VALUES LESS THAN MAXVALUE
);

-- ============================================
-- INVOICE ITEMS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS invoice_items (
    id VARCHAR(36) NOT NULL,
    invoice_id VARCHAR(36) NOT NULL,
    product_id VARCHAR(36),

    -- Item Details
    description VARCHAR(500) NOT NULL,
    quantity DECIMAL(15,4) NOT NULL,
    unit_price DECIMAL(15,2) NOT NULL,

    -- Calculations
    discount_percent DECIMAL(5,2) DEFAULT 0.00,
    discount_amount DECIMAL(15,2) DEFAULT 0.00,
    tax_rate DECIMAL(5,2) DEFAULT 0.00,
    tax_amount DECIMAL(15,2) DEFAULT 0.00,
    total DECIMAL(15,2) NOT NULL,

    -- Order
    sort_order INT DEFAULT 0,

    -- Timestamps
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id) CLUSTERED,
    KEY idx_invoice (invoice_id),
    KEY idx_product (product_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TRANSACTIONS TABLE (Partitioned by month)
-- ============================================
CREATE TABLE IF NOT EXISTS transactions (
    id VARCHAR(36) NOT NULL,
    organization_id VARCHAR(36) NOT NULL,

    -- References
    customer_id VARCHAR(36),
    invoice_id VARCHAR(36),

    -- Transaction Info
    type ENUM('INCOME', 'EXPENSE', 'TRANSFER', 'REFUND', 'ADJUSTMENT') NOT NULL,
    category VARCHAR(100),

    -- Amount
    amount DECIMAL(15,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'PKR',

    -- Payment Details
    payment_method ENUM('CASH', 'BANK_TRANSFER', 'CARD', 'JAZZCASH', 'EASYPAISA', 'RAAST', 'CHEQUE', 'OTHER'),
    reference VARCHAR(100),

    -- Description
    description TEXT,

    -- Status
    status ENUM('PENDING', 'COMPLETED', 'FAILED', 'CANCELLED') DEFAULT 'COMPLETED',

    -- Metadata
    metadata JSON,

    -- Timestamps
    transaction_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(36) NOT NULL,

    PRIMARY KEY (id, transaction_date) CLUSTERED,
    KEY idx_org (organization_id),
    KEY idx_org_type (organization_id, type),
    KEY idx_org_date (organization_id, transaction_date),
    KEY idx_org_customer (organization_id, customer_id),
    KEY idx_org_category (organization_id, category),
    KEY idx_org_payment_method (organization_id, payment_method)
)
PARTITION BY RANGE (YEAR(transaction_date) * 100 + MONTH(transaction_date)) (
    PARTITION p202401 VALUES LESS THAN (202402),
    PARTITION p202402 VALUES LESS THAN (202403),
    PARTITION p202403 VALUES LESS THAN (202404),
    PARTITION p202404 VALUES LESS THAN (202405),
    PARTITION p202405 VALUES LESS THAN (202406),
    PARTITION p202406 VALUES LESS THAN (202407),
    PARTITION p202407 VALUES LESS THAN (202408),
    PARTITION p202408 VALUES LESS THAN (202409),
    PARTITION p202409 VALUES LESS THAN (202410),
    PARTITION p202410 VALUES LESS THAN (202411),
    PARTITION p202411 VALUES LESS THAN (202412),
    PARTITION p202412 VALUES LESS THAN (202501),
    PARTITION p202501 VALUES LESS THAN (202502),
    PARTITION p202502 VALUES LESS THAN (202503),
    PARTITION p202503 VALUES LESS THAN (202504),
    PARTITION p202504 VALUES LESS THAN (202505),
    PARTITION p202505 VALUES LESS THAN (202506),
    PARTITION p202506 VALUES LESS THAN (202507),
    PARTITION p202507 VALUES LESS THAN (202508),
    PARTITION p202508 VALUES LESS THAN (202509),
    PARTITION p202509 VALUES LESS THAN (202510),
    PARTITION p202510 VALUES LESS THAN (202511),
    PARTITION p202511 VALUES LESS THAN (202512),
    PARTITION p202512 VALUES LESS THAN (202601),
    PARTITION pmax VALUES LESS THAN MAXVALUE
);

-- ============================================
-- INVENTORY LOGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS inventory_logs (
    id VARCHAR(36) NOT NULL,
    organization_id VARCHAR(36) NOT NULL,
    product_id VARCHAR(36) NOT NULL,

    -- Change Info
    type ENUM('PURCHASE', 'SALE', 'ADJUSTMENT', 'RETURN', 'TRANSFER', 'DAMAGE', 'INITIAL') NOT NULL,
    quantity_change INT NOT NULL,
    quantity_before INT NOT NULL,
    quantity_after INT NOT NULL,

    -- Reference
    reference_type VARCHAR(50),
    reference_id VARCHAR(36),

    -- Description
    notes TEXT,

    -- Timestamps
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(36) NOT NULL,

    PRIMARY KEY (id) CLUSTERED,
    KEY idx_org (organization_id),
    KEY idx_product (product_id),
    KEY idx_org_created (organization_id, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- AUDIT LOGS TABLE (Partitioned by quarter)
-- ============================================
CREATE TABLE IF NOT EXISTS audit_logs (
    id VARCHAR(36) NOT NULL,
    organization_id VARCHAR(36),
    user_id VARCHAR(36) NOT NULL,

    -- Action Info
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    entity_id VARCHAR(36),

    -- Changes
    old_values JSON,
    new_values JSON,

    -- Context
    ip_address VARCHAR(45),
    user_agent VARCHAR(500),

    -- Timestamps
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id, created_at) CLUSTERED,
    KEY idx_org (organization_id),
    KEY idx_user (user_id),
    KEY idx_entity (entity_type, entity_id),
    KEY idx_created (created_at)
)
PARTITION BY RANGE (TO_DAYS(created_at)) (
    PARTITION p_history VALUES LESS THAN (TO_DAYS('2024-01-01')),
    PARTITION p_2024_q1 VALUES LESS THAN (TO_DAYS('2024-04-01')),
    PARTITION p_2024_q2 VALUES LESS THAN (TO_DAYS('2024-07-01')),
    PARTITION p_2024_q3 VALUES LESS THAN (TO_DAYS('2024-10-01')),
    PARTITION p_2024_q4 VALUES LESS THAN (TO_DAYS('2025-01-01')),
    PARTITION p_2025_q1 VALUES LESS THAN (TO_DAYS('2025-04-01')),
    PARTITION p_2025_q2 VALUES LESS THAN (TO_DAYS('2025-07-01')),
    PARTITION p_2025_q3 VALUES LESS THAN (TO_DAYS('2025-10-01')),
    PARTITION p_2025_q4 VALUES LESS THAN (TO_DAYS('2026-01-01')),
    PARTITION pmax VALUES LESS THAN MAXVALUE
);

-- ============================================
-- DAILY SALES AGGREGATES (Pre-computed)
-- ============================================
CREATE TABLE IF NOT EXISTS daily_sales_aggregates (
    id VARCHAR(36) NOT NULL,
    organization_id VARCHAR(36) NOT NULL,

    date DATE NOT NULL,

    -- Counts
    invoice_count INT DEFAULT 0,
    item_count INT DEFAULT 0,
    customer_count INT DEFAULT 0,

    -- Amounts
    gross_sales DECIMAL(15,2) DEFAULT 0.00,
    discounts DECIMAL(15,2) DEFAULT 0.00,
    taxes DECIMAL(15,2) DEFAULT 0.00,
    net_sales DECIMAL(15,2) DEFAULT 0.00,

    -- Payments
    amount_received DECIMAL(15,2) DEFAULT 0.00,

    -- Timestamps
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id) CLUSTERED,
    UNIQUE KEY uk_org_date (organization_id, date),
    KEY idx_org (organization_id),
    KEY idx_date (date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- PRODUCT SALES AGGREGATES (Monthly)
-- ============================================
CREATE TABLE IF NOT EXISTS product_sales_aggregates (
    id VARCHAR(36) NOT NULL,
    organization_id VARCHAR(36) NOT NULL,
    product_id VARCHAR(36) NOT NULL,

    period VARCHAR(7) NOT NULL, -- YYYY-MM format

    -- Quantities
    quantity_sold DECIMAL(15,4) DEFAULT 0.0000,

    -- Revenue
    gross_revenue DECIMAL(15,2) DEFAULT 0.00,
    net_revenue DECIMAL(15,2) DEFAULT 0.00,

    -- Cost & Profit
    total_cost DECIMAL(15,2) DEFAULT 0.00,
    profit DECIMAL(15,2) DEFAULT 0.00,

    -- Timestamps
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id) CLUSTERED,
    UNIQUE KEY uk_org_product_period (organization_id, product_id, period),
    KEY idx_org (organization_id),
    KEY idx_product (product_id),
    KEY idx_period (period)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- VIEWS FOR COMMON QUERIES
-- ============================================

-- Overdue invoices view
CREATE OR REPLACE VIEW v_overdue_invoices AS
SELECT
    i.*,
    c.name as customer_name,
    c.email as customer_email,
    DATEDIFF(CURRENT_DATE, i.due_date) as days_overdue
FROM invoices i
JOIN customers c ON i.customer_id = c.id
WHERE i.payment_status IN ('UNPAID', 'PARTIAL')
  AND i.due_date < CURRENT_DATE
  AND i.deleted_at IS NULL;

-- Low stock products view
CREATE OR REPLACE VIEW v_low_stock_products AS
SELECT
    p.*,
    (p.min_quantity - p.quantity) as units_needed
FROM products p
WHERE p.track_inventory = TRUE
  AND p.quantity <= p.min_quantity
  AND p.status = 'ACTIVE'
  AND p.deleted_at IS NULL;

-- Monthly revenue summary view
CREATE OR REPLACE VIEW v_monthly_revenue AS
SELECT
    organization_id,
    DATE_FORMAT(issue_date, '%Y-%m') as month,
    COUNT(*) as invoice_count,
    SUM(total) as gross_revenue,
    SUM(amount_paid) as collected,
    SUM(balance_due) as outstanding
FROM invoices
WHERE status NOT IN ('CANCELLED', 'DRAFT')
  AND deleted_at IS NULL
GROUP BY organization_id, DATE_FORMAT(issue_date, '%Y-%m');

-- ============================================
-- SCHEMA VERSION TRACKING
-- ============================================
CREATE TABLE IF NOT EXISTS schema_migrations (
    version VARCHAR(50) NOT NULL,
    applied_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    description TEXT,
    PRIMARY KEY (version)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert initial version
INSERT INTO schema_migrations (version, description) VALUES
    ('2.0.0', 'Initial TiDB optimized schema with partitioning')
ON DUPLICATE KEY UPDATE applied_at = CURRENT_TIMESTAMP;

-- ============================================
-- Done!
-- ============================================
SELECT 'TiDB Schema created successfully!' as status;
