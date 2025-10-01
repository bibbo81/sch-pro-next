-- Step 5: Add tracking update notifications

-- =====================================================
-- TRIGGER: Notify on tracking update
-- =====================================================
CREATE OR REPLACE FUNCTION notify_tracking_update()
RETURNS TRIGGER AS $$
DECLARE
  v_shipment RECORD;
  v_organization_members UUID[];
BEGIN
  -- Only notify if status changed
  IF NEW.status IS DISTINCT FROM OLD.status THEN

    -- Get shipment details
    SELECT
      s.shipment_number,
      s.organization_id,
      s.created_by
    INTO v_shipment
    FROM shipments s
    WHERE s.id = NEW.shipment_id;/

    -- Get all members of the organization to notify
    SELECT ARRAY_AGG(user_id)
    INTO v_organization_members
    FROM organization_members
    WHERE organization_id = v_shipment.organization_id;

    -- Create notification for each organization member
    IF v_organization_members IS NOT NULL THEN
      FOR i IN 1..array_length(v_organization_members, 1) LOOP
        PERFORM create_notification(
          p_user_id := v_organization_members[i],
          p_organization_id := v_shipment.organization_id,
          p_title := 'Aggiornamento Tracking #' || v_shipment.shipment_number,
          p_message := 'Nuovo stato: ' || COALESCE(NEW.status, 'N/A') || ' - ' || COALESCE(NEW.location, 'Posizione non disponibile'),
          p_type := 'tracking_update',
          p_related_type := 'shipment',
          p_related_id := NEW.shipment_id,
          p_action_url := '/dashboard/tracking',
          p_send_email := false  -- No email for tracking updates
        );
      END LOOP;
    END IF;

  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS trigger_notify_tracking_update ON trackings;

-- Create trigger
CREATE TRIGGER trigger_notify_tracking_update
  AFTER UPDATE ON trackings
  FOR EACH ROW
  EXECUTE FUNCTION notify_tracking_update();
