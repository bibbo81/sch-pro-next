-- Step 1: Create notifications table and basic structure

-- =====================================================
-- 1. DROP existing table if needed (to recreate cleanly)
-- =====================================================
DROP TABLE IF EXISTS notifications CASCADE;

-- =====================================================
-- 2. CREATE NOTIFICATIONS TABLE
-- =====================================================
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Recipient
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  -- Notification content
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  notification_type VARCHAR(50) NOT NULL, -- 'ticket_response', 'ticket_status', 'system', 'broadcast', etc.

  -- Related entity
  related_type VARCHAR(50), -- 'ticket', 'shipment', 'invoice', etc.
  related_id UUID, -- ID of related entity

  -- Action link
  action_url VARCHAR(500), -- Deep link to related page

  -- Status
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMP WITH TIME ZONE,

  -- Email sending
  email_sent BOOLEAN DEFAULT false,
  email_sent_at TIMESTAMP WITH TIME ZONE,

  -- Metadata
  metadata JSONB DEFAULT '{}',

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 3. CREATE INDEXES
-- =====================================================
CREATE INDEX idx_notifications_user ON notifications(user_id, is_read);
CREATE INDEX idx_notifications_org ON notifications(organization_id);
CREATE INDEX idx_notifications_type ON notifications(notification_type);
CREATE INDEX idx_notifications_created ON notifications(created_at DESC);
CREATE INDEX idx_notifications_related ON notifications(related_type, related_id);

-- =====================================================
-- 4. GRANT PERMISSIONS
-- =====================================================
GRANT ALL ON TABLE notifications TO service_role;
GRANT SELECT, UPDATE ON TABLE notifications TO authenticated;
GRANT SELECT, UPDATE ON TABLE notifications TO anon;
