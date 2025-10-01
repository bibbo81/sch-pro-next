-- Step 3: Create PostgreSQL functions

-- =====================================================
-- 1. FUNCTION: Create notification
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
-- 2. FUNCTION: Mark notification as read
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
-- 3. FUNCTION: Mark all notifications as read
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
-- 4. FUNCTION: Get unread notification count
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
