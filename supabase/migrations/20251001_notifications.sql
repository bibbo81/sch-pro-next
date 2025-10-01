-- Migration: Notifications System
-- Description: In-app and email notifications for user actions
-- Date: 2025-10-01

-- =====================================================
-- 1. NOTIFICATIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS notifications (
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

-- Indexes
CREATE INDEX idx_notifications_user ON notifications(user_id, is_read);
CREATE INDEX idx_notifications_org ON notifications(organization_id);
CREATE INDEX idx_notifications_type ON notifications(notification_type);
CREATE INDEX idx_notifications_created ON notifications(created_at DESC);
CREATE INDEX idx_notifications_related ON notifications(related_type, related_id);

-- RLS Policies
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Users can only see their own notifications
CREATE POLICY notifications_select_own ON notifications
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can update (mark as read) their own notifications
CREATE POLICY notifications_update_own ON notifications
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Only system can insert notifications (via triggers or service role)
CREATE POLICY notifications_insert_system ON notifications
  FOR INSERT
  WITH CHECK (false); -- Will be done via triggers or service_role API

-- =====================================================
-- 2. GRANT PERMISSIONS
-- =====================================================
GRANT ALL ON TABLE notifications TO service_role;
GRANT SELECT, UPDATE ON TABLE notifications TO authenticated;

-- =====================================================
-- 3. FUNCTION: Create notification
-- =====================================================
CREATE OR REPLACE FUNCTION create_notification(
  p_user_id UUID,
  p_organization_id UUID,
  p_title VARCHAR,
  p_message TEXT,
  p_type VARCHAR,
  p_related_type VARCHAR DEFAULT NULL,
  p_related_id UUID DEFAULT NULL,
  p_action_url VARCHAR DEFAULT NULL,
  p_send_email BOOLEAN DEFAULT false
)
RETURNS UUID AS $$
DECLARE
  v_notification_id UUID;
BEGIN
  INSERT INTO notifications (
    user_id,
    organization_id,
    title,
    message,
    notification_type,
    related_type,
    related_id,
    action_url,
    email_sent
  ) VALUES (
    p_user_id,
    p_organization_id,
    p_title,
    p_message,
    p_type,
    p_related_type,
    p_related_id,
    p_action_url,
    p_send_email
  )
  RETURNING id INTO v_notification_id;

  -- If email should be sent, mark timestamp
  IF p_send_email THEN
    UPDATE notifications
    SET email_sent_at = NOW()
    WHERE id = v_notification_id;
  END IF;

  RETURN v_notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 4. TRIGGER: Notify on agent response to ticket
-- =====================================================
CREATE OR REPLACE FUNCTION notify_ticket_response()
RETURNS TRIGGER AS $$
DECLARE
  v_ticket RECORD;
  v_ticket_creator UUID;
BEGIN
  -- Only notify on agent responses (not customer or internal notes)
  IF NEW.sender_type = 'agent' AND NEW.is_internal = false THEN

    -- Get ticket details
    SELECT
      t.ticket_number,
      t.subject,
      t.created_by,
      t.organization_id
    INTO v_ticket
    FROM support_tickets t
    WHERE t.id = NEW.ticket_id;

    -- Create notification for ticket creator
    PERFORM create_notification(
      p_user_id := v_ticket.created_by,
      p_organization_id := v_ticket.organization_id,
      p_title := 'Nuova Risposta al Ticket #' || v_ticket.ticket_number,
      p_message := 'Il supporto ha risposto al tuo ticket "' || v_ticket.subject || '"',
      p_type := 'ticket_response',
      p_related_type := 'ticket',
      p_related_id := NEW.ticket_id,
      p_action_url := '/dashboard/support/' || NEW.ticket_id,
      p_send_email := true
    );

  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS trigger_notify_ticket_response ON ticket_messages;
CREATE TRIGGER trigger_notify_ticket_response
  AFTER INSERT ON ticket_messages
  FOR EACH ROW
  EXECUTE FUNCTION notify_ticket_response();

-- =====================================================
-- 5. TRIGGER: Notify on ticket status change
-- =====================================================
CREATE OR REPLACE FUNCTION notify_ticket_status_change()
RETURNS TRIGGER AS $$
DECLARE
  v_ticket RECORD;
  v_status_label TEXT;
BEGIN
  -- Only notify if status actually changed
  IF NEW.status IS DISTINCT FROM OLD.status THEN

    -- Get ticket details
    SELECT
      ticket_number,
      subject,
      created_by,
      organization_id
    INTO v_ticket
    FROM support_tickets
    WHERE id = NEW.id;

    -- Get friendly status label
    v_status_label := CASE NEW.status
      WHEN 'open' THEN 'Aperto'
      WHEN 'in_progress' THEN 'In Lavorazione'
      WHEN 'resolved' THEN 'Risolto'
      WHEN 'closed' THEN 'Chiuso'
      ELSE NEW.status
    END;

    -- Create notification for ticket creator
    PERFORM create_notification(
      p_user_id := v_ticket.created_by,
      p_organization_id := v_ticket.organization_id,
      p_title := 'Ticket #' || v_ticket.ticket_number || ' - Cambio Stato',
      p_message := 'Il tuo ticket "' || v_ticket.subject || '" è ora: ' || v_status_label,
      p_type := 'ticket_status',
      p_related_type := 'ticket',
      p_related_id := NEW.id,
      p_action_url := '/dashboard/support/' || NEW.id,
      p_send_email := (NEW.status IN ('resolved', 'closed')) -- Email only for resolved/closed
    );

  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS trigger_notify_ticket_status_change ON support_tickets;
CREATE TRIGGER trigger_notify_ticket_status_change
  AFTER UPDATE ON support_tickets
  FOR EACH ROW
  EXECUTE FUNCTION notify_ticket_status_change();

-- =====================================================
-- 6. FUNCTION: Mark notification as read
-- =====================================================
CREATE OR REPLACE FUNCTION mark_notification_read(p_notification_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE notifications
  SET
    is_read = true,
    read_at = NOW()
  WHERE id = p_notification_id
    AND user_id = auth.uid();

  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 7. FUNCTION: Mark all notifications as read
-- =====================================================
CREATE OR REPLACE FUNCTION mark_all_notifications_read()
RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER;
BEGIN
  UPDATE notifications
  SET
    is_read = true,
    read_at = NOW()
  WHERE user_id = auth.uid()
    AND is_read = false;

  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 8. FUNCTION: Get unread notification count
-- =====================================================
CREATE OR REPLACE FUNCTION get_unread_notification_count()
RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER;
BEGIN
  SELECT COUNT(*)
  INTO v_count
  FROM notifications
  WHERE user_id = auth.uid()
    AND is_read = false;

  RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
