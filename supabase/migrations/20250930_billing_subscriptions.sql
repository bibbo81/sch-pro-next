-- Migration: Billing & Subscriptions System
-- Date: 2025-09-30
-- Phase: 2.1 - Business Intelligence

-- ============================================================================
-- 1. SUBSCRIPTION PLANS
-- ============================================================================
CREATE TABLE subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  price_monthly DECIMAL(10, 2) NOT NULL DEFAULT 0,
  price_yearly DECIMAL(10, 2) NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'EUR',
  features JSONB DEFAULT '[]'::jsonb,
  limits JSONB DEFAULT '{}'::jsonb,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_subscription_plans_slug ON subscription_plans(slug);
CREATE INDEX idx_subscription_plans_active ON subscription_plans(is_active);

-- Trigger for updated_at
CREATE TRIGGER update_subscription_plans_updated_at
  BEFORE UPDATE ON subscription_plans
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ⚠️ CRITICAL: Grant permissions
GRANT ALL ON TABLE subscription_plans TO service_role;
GRANT ALL ON TABLE subscription_plans TO authenticated;

-- ============================================================================
-- 2. SUBSCRIPTIONS
-- ============================================================================
CREATE TYPE subscription_status AS ENUM ('active', 'cancelled', 'suspended', 'trial', 'expired');
CREATE TYPE billing_cycle AS ENUM ('monthly', 'yearly', 'lifetime');

CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES subscription_plans(id) ON DELETE RESTRICT,
  status subscription_status NOT NULL DEFAULT 'trial',
  billing_cycle billing_cycle NOT NULL DEFAULT 'monthly',
  current_period_start TIMESTAMP WITH TIME ZONE NOT NULL,
  current_period_end TIMESTAMP WITH TIME ZONE NOT NULL,
  trial_start TIMESTAMP WITH TIME ZONE,
  trial_end TIMESTAMP WITH TIME ZONE,
  cancelled_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_subscriptions_organization ON subscriptions(organization_id);
CREATE INDEX idx_subscriptions_plan ON subscriptions(plan_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_subscriptions_period_end ON subscriptions(current_period_end);

-- Trigger for updated_at
CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ⚠️ CRITICAL: Grant permissions
GRANT ALL ON TABLE subscriptions TO service_role;
GRANT ALL ON TABLE subscriptions TO authenticated;

-- ============================================================================
-- 3. USAGE TRACKING
-- ============================================================================
CREATE TABLE usage_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  subscription_id UUID NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
  tracking_date DATE NOT NULL DEFAULT CURRENT_DATE,
  metrics JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(organization_id, tracking_date)
);

CREATE INDEX idx_usage_tracking_organization ON usage_tracking(organization_id);
CREATE INDEX idx_usage_tracking_subscription ON usage_tracking(subscription_id);
CREATE INDEX idx_usage_tracking_date ON usage_tracking(tracking_date);

-- Trigger for updated_at
CREATE TRIGGER update_usage_tracking_updated_at
  BEFORE UPDATE ON usage_tracking
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ⚠️ CRITICAL: Grant permissions
GRANT ALL ON TABLE usage_tracking TO service_role;
GRANT ALL ON TABLE usage_tracking TO authenticated;

-- ============================================================================
-- 4. INVOICES
-- ============================================================================
CREATE TYPE invoice_status AS ENUM ('draft', 'pending', 'paid', 'failed', 'refunded', 'void');

CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  subscription_id UUID NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
  invoice_number TEXT NOT NULL UNIQUE,
  amount DECIMAL(10, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'EUR',
  status invoice_status NOT NULL DEFAULT 'draft',
  billing_period_start TIMESTAMP WITH TIME ZONE NOT NULL,
  billing_period_end TIMESTAMP WITH TIME ZONE NOT NULL,
  due_date DATE NOT NULL,
  paid_at TIMESTAMP WITH TIME ZONE,
  payment_method TEXT,
  line_items JSONB DEFAULT '[]'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_invoices_organization ON invoices(organization_id);
CREATE INDEX idx_invoices_subscription ON invoices(subscription_id);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_due_date ON invoices(due_date);
CREATE INDEX idx_invoices_number ON invoices(invoice_number);

-- Trigger for updated_at
CREATE TRIGGER update_invoices_updated_at
  BEFORE UPDATE ON invoices
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ⚠️ CRITICAL: Grant permissions
GRANT ALL ON TABLE invoices TO service_role;
GRANT ALL ON TABLE invoices TO authenticated;

-- ============================================================================
-- 5. PAYMENT METHODS
-- ============================================================================
CREATE TYPE payment_method_type AS ENUM ('card', 'bank_transfer', 'paypal', 'stripe', 'other');

CREATE TABLE payment_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  type payment_method_type NOT NULL,
  is_default BOOLEAN DEFAULT false,
  details JSONB DEFAULT '{}'::jsonb, -- Store encrypted/tokenized data
  last_4 TEXT,
  expiry_date TEXT,
  cardholder_name TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_payment_methods_organization ON payment_methods(organization_id);
CREATE INDEX idx_payment_methods_default ON payment_methods(organization_id, is_default) WHERE is_default = true;

-- Trigger for updated_at
CREATE TRIGGER update_payment_methods_updated_at
  BEFORE UPDATE ON payment_methods
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ⚠️ CRITICAL: Grant permissions
GRANT ALL ON TABLE payment_methods TO service_role;
GRANT ALL ON TABLE payment_methods TO authenticated;

-- ============================================================================
-- 6. INSERT DEFAULT PLANS
-- ============================================================================
INSERT INTO subscription_plans (name, slug, description, price_monthly, price_yearly, limits, features, sort_order) VALUES
(
  'Free',
  'free',
  'Perfect for getting started with basic shipment tracking',
  0.00,
  0.00,
  '{
    "max_shipments_per_month": 10,
    "max_products": 50,
    "max_users": 2,
    "max_trackings_per_day": 10,
    "max_storage_mb": 100,
    "api_calls_per_month": 1000
  }'::jsonb,
  '{
    "basic_tracking": true,
    "email_notifications": true,
    "standard_support": true,
    "advanced_analytics": false,
    "priority_support": false,
    "custom_branding": false,
    "api_access": false,
    "export_data": false,
    "multi_carrier": false
  }'::jsonb,
  1
),
(
  'Pro',
  'pro',
  'For growing businesses with advanced tracking needs',
  49.00,
  490.00,
  '{
    "max_shipments_per_month": 100,
    "max_products": 500,
    "max_users": 10,
    "max_trackings_per_day": 100,
    "max_storage_mb": 5000,
    "api_calls_per_month": 50000
  }'::jsonb,
  '{
    "basic_tracking": true,
    "email_notifications": true,
    "standard_support": true,
    "advanced_analytics": true,
    "priority_support": true,
    "custom_branding": false,
    "api_access": true,
    "export_data": true,
    "multi_carrier": true,
    "bulk_operations": true
  }'::jsonb,
  2
),
(
  'Enterprise',
  'enterprise',
  'Unlimited power for large scale operations',
  199.00,
  1990.00,
  '{
    "max_shipments_per_month": -1,
    "max_products": -1,
    "max_users": -1,
    "max_trackings_per_day": -1,
    "max_storage_mb": -1,
    "api_calls_per_month": -1
  }'::jsonb,
  '{
    "basic_tracking": true,
    "email_notifications": true,
    "standard_support": true,
    "advanced_analytics": true,
    "priority_support": true,
    "custom_branding": true,
    "api_access": true,
    "export_data": true,
    "multi_carrier": true,
    "bulk_operations": true,
    "dedicated_account_manager": true,
    "sla_guarantee": true,
    "custom_integrations": true,
    "white_label": true
  }'::jsonb,
  3
);

-- ============================================================================
-- 7. HELPER FUNCTIONS
-- ============================================================================

-- Function to get current usage for an organization
CREATE OR REPLACE FUNCTION get_organization_usage(org_id UUID, start_date DATE DEFAULT CURRENT_DATE)
RETURNS JSONB AS $$
DECLARE
  usage JSONB;
BEGIN
  SELECT jsonb_build_object(
    'shipments_created', (SELECT COUNT(*) FROM shipments WHERE organization_id = org_id AND created_at::date >= start_date),
    'products_total', (SELECT COUNT(*) FROM products WHERE organization_id = org_id AND active = true),
    'users_active', (SELECT COUNT(*) FROM user_profiles WHERE organization_id = org_id),
    'trackings_performed', (SELECT COUNT(*) FROM trackings WHERE organization_id = org_id AND created_at::date >= start_date),
    'documents_uploaded', (SELECT COUNT(*) FROM documents WHERE organization_id = org_id AND created_at::date >= start_date),
    'api_calls', (SELECT COUNT(*) FROM api_logs WHERE user_id IN (SELECT user_id FROM user_profiles WHERE organization_id = org_id) AND created_at::date >= start_date)
  ) INTO usage;

  RETURN usage;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if organization has exceeded limits
CREATE OR REPLACE FUNCTION check_usage_limits(org_id UUID)
RETURNS JSONB AS $$
DECLARE
  sub_record RECORD;
  plan_limits JSONB;
  current_usage JSONB;
  violations JSONB DEFAULT '[]'::jsonb;
BEGIN
  -- Get active subscription and plan limits
  SELECT s.*, sp.limits INTO sub_record
  FROM subscriptions s
  JOIN subscription_plans sp ON s.plan_id = sp.id
  WHERE s.organization_id = org_id AND s.status = 'active'
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('error', 'No active subscription found');
  END IF;

  plan_limits := sub_record.limits;
  current_usage := get_organization_usage(org_id, DATE_TRUNC('month', CURRENT_DATE)::date);

  -- Check each limit (-1 means unlimited)
  IF (plan_limits->>'max_shipments_per_month')::int != -1 AND
     (current_usage->>'shipments_created')::int > (plan_limits->>'max_shipments_per_month')::int THEN
    violations := violations || jsonb_build_object('limit', 'max_shipments_per_month', 'current', current_usage->>'shipments_created', 'max', plan_limits->>'max_shipments_per_month');
  END IF;

  IF (plan_limits->>'max_products')::int != -1 AND
     (current_usage->>'products_total')::int > (plan_limits->>'max_products')::int THEN
    violations := violations || jsonb_build_object('limit', 'max_products', 'current', current_usage->>'products_total', 'max', plan_limits->>'max_products');
  END IF;

  RETURN jsonb_build_object(
    'has_violations', jsonb_array_length(violations) > 0,
    'violations', violations,
    'current_usage', current_usage,
    'plan_limits', plan_limits
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ⚠️ CRITICAL: Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION get_organization_usage(UUID, DATE) TO service_role;
GRANT EXECUTE ON FUNCTION get_organization_usage(UUID, DATE) TO authenticated;
GRANT EXECUTE ON FUNCTION check_usage_limits(UUID) TO service_role;
GRANT EXECUTE ON FUNCTION check_usage_limits(UUID) TO authenticated;

-- ============================================================================
-- 8. COMMENTS FOR DOCUMENTATION
-- ============================================================================
COMMENT ON TABLE subscription_plans IS 'Available subscription plans with pricing and limits';
COMMENT ON TABLE subscriptions IS 'Active subscriptions for organizations';
COMMENT ON TABLE usage_tracking IS 'Daily usage metrics per organization';
COMMENT ON TABLE invoices IS 'Billing invoices for subscriptions';
COMMENT ON TABLE payment_methods IS 'Payment methods for organizations';
COMMENT ON FUNCTION get_organization_usage IS 'Calculate current usage for an organization';
COMMENT ON FUNCTION check_usage_limits IS 'Check if organization has exceeded plan limits';