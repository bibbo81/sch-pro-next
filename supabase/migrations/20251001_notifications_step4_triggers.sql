-- Step 4: Create triggers for automatic notifications

-- =====================================================
-- 1. TRIGGER: Notify on agent response to ticket
-- =====================================================
CREATE OR REPLACE FUNCTION notify_ticket_response()
RETURNS TRIGGER AS $$
DECLARE
  v_ticket RECORD;
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

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS trigger_notify_ticket_response ON ticket_messages;

-- Create trigger
CREATE TRIGGER trigger_notify_ticket_response
  AFTER INSERT ON ticket_messages
  FOR EACH ROW
  EXECUTE FUNCTION notify_ticket_response();

-- =====================================================
-- 2. TRIGGER: Notify on ticket status change
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

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS trigger_notify_ticket_status_change ON support_tickets;

-- Create trigger
CREATE TRIGGER trigger_notify_ticket_status_change
  AFTER UPDATE ON support_tickets
  FOR EACH ROW
  EXECUTE FUNCTION notify_ticket_status_change();
