-- Migration: Stripe Integration
-- Date: 2025-09-30
-- Add Stripe IDs to support payment processing

-- Add Stripe fields to organizations table
ALTER TABLE organizations
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT UNIQUE;

CREATE INDEX IF NOT EXISTS idx_organizations_stripe_customer
ON organizations(stripe_customer_id);

-- Add Stripe fields to subscriptions table
ALTER TABLE subscriptions
ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS stripe_price_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_payment_method_id TEXT;

CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_subscription
ON subscriptions(stripe_subscription_id);

-- Add Stripe fields to subscription_plans table
ALTER TABLE subscription_plans
ADD COLUMN IF NOT EXISTS stripe_product_id TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS stripe_price_id_monthly TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS stripe_price_id_yearly TEXT UNIQUE;

CREATE INDEX IF NOT EXISTS idx_subscription_plans_stripe_product
ON subscription_plans(stripe_product_id);

-- Add Stripe fields to invoices table
ALTER TABLE invoices
ADD COLUMN IF NOT EXISTS stripe_invoice_id TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS stripe_payment_intent_id TEXT;

CREATE INDEX IF NOT EXISTS idx_invoices_stripe_invoice
ON invoices(stripe_invoice_id);

-- ⚠️ CRITICAL: Grant permissions
GRANT ALL ON TABLE organizations TO service_role;
GRANT ALL ON TABLE organizations TO authenticated;
GRANT ALL ON TABLE subscriptions TO service_role;
GRANT ALL ON TABLE subscriptions TO authenticated;
GRANT ALL ON TABLE subscription_plans TO service_role;
GRANT ALL ON TABLE subscription_plans TO authenticated;
GRANT ALL ON TABLE invoices TO service_role;
GRANT ALL ON TABLE invoices TO authenticated;

-- Comments
COMMENT ON COLUMN organizations.stripe_customer_id IS 'Stripe Customer ID for payment processing';
COMMENT ON COLUMN subscriptions.stripe_subscription_id IS 'Stripe Subscription ID';
COMMENT ON COLUMN subscriptions.stripe_price_id IS 'Stripe Price ID used for this subscription';
COMMENT ON COLUMN subscription_plans.stripe_product_id IS 'Stripe Product ID';
COMMENT ON COLUMN subscription_plans.stripe_price_id_monthly IS 'Stripe Price ID for monthly billing';
COMMENT ON COLUMN subscription_plans.stripe_price_id_yearly IS 'Stripe Price ID for yearly billing';