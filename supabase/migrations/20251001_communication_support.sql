-- Migration: Communication & Support System
-- Description: Complete communication center and support helpdesk infrastructure
-- Date: 2025-10-01

-- =====================================================
-- 1. EMAIL TEMPLATES TABLE
-- =====================================================
-- Store reusable email templates for broadcast and notifications
CREATE TABLE IF NOT EXISTS email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Template details
  name VARCHAR(255) NOT NULL,
  subject VARCHAR(500) NOT NULL,
  body TEXT NOT NULL, -- HTML or plain text

  -- Template type
  template_type VARCHAR(50) NOT NULL, -- 'broadcast', 'notification', 'transactional', 'system'

  -- Styling
  template_style JSONB DEFAULT '{}', -- CSS styles, colors, fonts

  -- Variables
  available_variables JSONB DEFAULT '[]', -- Array of {{variable}} placeholders

  -- Status
  is_active BOOLEAN DEFAULT true,

  -- Ownership (NULL = system template, UUID = organization template)
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  created_by UUID REFERENCES auth.users(id),

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for email_templates
CREATE INDEX idx_email_templates_org ON email_templates(organization_id);
CREATE INDEX idx_email_templates_type ON email_templates(template_type);
CREATE INDEX idx_email_templates_active ON email_templates(is_active) WHERE is_active = true;

-- =====================================================
-- 2. BROADCAST MESSAGES TABLE
-- =====================================================
-- Manage broadcast communications to users/organizations
CREATE TABLE IF NOT EXISTS broadcast_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Message details
  subject VARCHAR(500) NOT NULL,
  content TEXT NOT NULL,
  template_id UUID REFERENCES email_templates(id) ON DELETE SET NULL,

  -- Targeting
  target_type VARCHAR(50) NOT NULL, -- 'all', 'organization', 'user_role', 'custom'
  target_filter JSONB DEFAULT '{}', -- Filters for custom targeting

  -- Specific targets
  target_organizations UUID[], -- Array of organization IDs
  target_users UUID[], -- Array of user IDs

  -- Scheduling
  scheduled_at TIMESTAMP WITH TIME ZONE,
  send_immediately BOOLEAN DEFAULT false,

  -- Status
  status VARCHAR(20) DEFAULT 'draft', -- 'draft', 'scheduled', 'sending', 'sent', 'failed'

  -- Delivery tracking
  total_recipients INTEGER DEFAULT 0,
  sent_count INTEGER DEFAULT 0,
  delivered_count INTEGER DEFAULT 0,
  opened_count INTEGER DEFAULT 0,
  clicked_count INTEGER DEFAULT 0,
  failed_count INTEGER DEFAULT 0,

  -- Timestamps
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID NOT NULL REFERENCES auth.users(id)
);

-- Indexes for broadcast_messages
CREATE INDEX idx_broadcast_messages_status ON broadcast_messages(status);
CREATE INDEX idx_broadcast_messages_scheduled ON broadcast_messages(scheduled_at) WHERE status = 'scheduled';
CREATE INDEX idx_broadcast_messages_creator ON broadcast_messages(created_by);

-- =====================================================
-- 3. MESSAGE DELIVERIES TABLE
-- =====================================================
-- Track individual message deliveries
CREATE TABLE IF NOT EXISTS message_deliveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  broadcast_message_id UUID NOT NULL REFERENCES broadcast_messages(id) ON DELETE CASCADE,

  -- Recipient
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,

  -- Delivery status
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'sent', 'delivered', 'opened', 'clicked', 'bounced', 'failed'

  -- Tracking
  sent_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  opened_at TIMESTAMP WITH TIME ZONE,
  clicked_at TIMESTAMP WITH TIME ZONE,

  -- Error tracking
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,

  -- Metadata
  metadata JSONB DEFAULT '{}', -- IP, user agent, etc.

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for message_deliveries
CREATE INDEX idx_message_deliveries_broadcast ON message_deliveries(broadcast_message_id);
CREATE INDEX idx_message_deliveries_user ON message_deliveries(user_id);
CREATE INDEX idx_message_deliveries_status ON message_deliveries(status);
CREATE INDEX idx_message_deliveries_org ON message_deliveries(organization_id);

-- =====================================================
-- 4. SUPPORT TICKETS TABLE
-- =====================================================
-- Customer support ticket management
CREATE TABLE IF NOT EXISTS support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_number VARCHAR(20) NOT NULL UNIQUE, -- e.g., "TICKET-001234"

  -- Ticket details
  subject VARCHAR(500) NOT NULL,
  description TEXT NOT NULL,

  -- Categorization
  category VARCHAR(50) NOT NULL, -- 'technical', 'billing', 'feature_request', 'bug', 'other'
  priority VARCHAR(20) NOT NULL DEFAULT 'medium', -- 'low', 'medium', 'high', 'urgent'

  -- Status
  status VARCHAR(20) NOT NULL DEFAULT 'open', -- 'open', 'in_progress', 'waiting_customer', 'resolved', 'closed'

  -- Assignment
  assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- Support agent

  -- Relationships
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES auth.users(id),

  -- SLA tracking
  first_response_at TIMESTAMP WITH TIME ZONE,
  resolved_at TIMESTAMP WITH TIME ZONE,
  closed_at TIMESTAMP WITH TIME ZONE,

  -- Tags
  tags TEXT[], -- Array of tags

  -- Metadata
  metadata JSONB DEFAULT '{}', -- Browser info, system info, etc.

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for support_tickets
CREATE INDEX idx_support_tickets_number ON support_tickets(ticket_number);
CREATE INDEX idx_support_tickets_org ON support_tickets(organization_id);
CREATE INDEX idx_support_tickets_status ON support_tickets(status);
CREATE INDEX idx_support_tickets_priority ON support_tickets(priority);
CREATE INDEX idx_support_tickets_assigned ON support_tickets(assigned_to);
CREATE INDEX idx_support_tickets_created_by ON support_tickets(created_by);
CREATE INDEX idx_support_tickets_category ON support_tickets(category);

-- =====================================================
-- 5. TICKET MESSAGES TABLE
-- =====================================================
-- Conversation thread for support tickets
CREATE TABLE IF NOT EXISTS ticket_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,

  -- Message content
  message TEXT NOT NULL,

  -- Sender
  sender_id UUID NOT NULL REFERENCES auth.users(id),
  sender_type VARCHAR(20) NOT NULL, -- 'customer', 'agent', 'system'

  -- Visibility
  is_internal BOOLEAN DEFAULT false, -- Internal notes not visible to customer

  -- Attachments
  attachments JSONB DEFAULT '[]', -- Array of file URLs

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for ticket_messages
CREATE INDEX idx_ticket_messages_ticket ON ticket_messages(ticket_id, created_at);
CREATE INDEX idx_ticket_messages_sender ON ticket_messages(sender_id);

-- =====================================================
-- 6. KNOWLEDGE BASE ARTICLES TABLE
-- =====================================================
-- FAQ and help documentation
CREATE TABLE IF NOT EXISTS kb_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Article details
  title VARCHAR(500) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  content TEXT NOT NULL, -- Markdown or HTML
  excerpt TEXT, -- Short summary

  -- Categorization
  category VARCHAR(100) NOT NULL,
  tags TEXT[], -- Array of tags

  -- SEO
  meta_description TEXT,
  meta_keywords TEXT[],

  -- Visibility
  is_published BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,

  -- Targeting
  visibility VARCHAR(20) DEFAULT 'public', -- 'public', 'authenticated', 'organization'
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE, -- NULL = public

  -- Statistics
  view_count INTEGER DEFAULT 0,
  helpful_count INTEGER DEFAULT 0,
  not_helpful_count INTEGER DEFAULT 0,

  -- Search optimization
  search_vector tsvector, -- Full-text search

  -- Authorship
  author_id UUID NOT NULL REFERENCES auth.users(id),

  -- Timestamps
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for kb_articles
CREATE INDEX idx_kb_articles_slug ON kb_articles(slug);
CREATE INDEX idx_kb_articles_category ON kb_articles(category);
CREATE INDEX idx_kb_articles_published ON kb_articles(is_published) WHERE is_published = true;
CREATE INDEX idx_kb_articles_featured ON kb_articles(is_featured) WHERE is_featured = true;
CREATE INDEX idx_kb_articles_org ON kb_articles(organization_id);
CREATE INDEX idx_kb_articles_search ON kb_articles USING GIN(search_vector);

-- Full-text search trigger
CREATE OR REPLACE FUNCTION kb_articles_search_trigger() RETURNS trigger AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', COALESCE(NEW.title, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.excerpt, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(NEW.content, '')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER kb_articles_search_update
  BEFORE INSERT OR UPDATE ON kb_articles
  FOR EACH ROW
  EXECUTE FUNCTION kb_articles_search_trigger();

-- =====================================================
-- 7. GRANT PERMISSIONS
-- =====================================================
GRANT ALL ON TABLE email_templates TO service_role;
GRANT ALL ON TABLE email_templates TO authenticated;

GRANT ALL ON TABLE broadcast_messages TO service_role;
GRANT ALL ON TABLE broadcast_messages TO authenticated;

GRANT ALL ON TABLE message_deliveries TO service_role;
GRANT ALL ON TABLE message_deliveries TO authenticated;

GRANT ALL ON TABLE support_tickets TO service_role;
GRANT ALL ON TABLE support_tickets TO authenticated;

GRANT ALL ON TABLE ticket_messages TO service_role;
GRANT ALL ON TABLE ticket_messages TO authenticated;

GRANT ALL ON TABLE kb_articles TO service_role;
GRANT ALL ON TABLE kb_articles TO authenticated;

-- =====================================================
-- 8. POSTGRESQL FUNCTIONS
-- =====================================================

-- Function: Generate unique ticket number
CREATE OR REPLACE FUNCTION generate_ticket_number()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  new_number TEXT;
  counter INTEGER;
BEGIN
  SELECT COALESCE(MAX(CAST(SUBSTRING(ticket_number FROM 8) AS INTEGER)), 0) + 1
  INTO counter
  FROM support_tickets;

  new_number := 'TICKET-' || LPAD(counter::TEXT, 6, '0');

  RETURN new_number;
END;
$$;

-- Function: Update ticket statistics
CREATE OR REPLACE FUNCTION update_ticket_stats()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Update first_response_at if this is first agent response
  IF NEW.sender_type = 'agent' AND OLD.sender_type IS NULL THEN
    UPDATE support_tickets
    SET first_response_at = NOW()
    WHERE id = NEW.ticket_id
      AND first_response_at IS NULL;
  END IF;

  -- Update ticket updated_at
  UPDATE support_tickets
  SET updated_at = NOW()
  WHERE id = NEW.ticket_id;

  RETURN NEW;
END;
$$;

CREATE TRIGGER ticket_messages_stats_trigger
  AFTER INSERT ON ticket_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_ticket_stats();
