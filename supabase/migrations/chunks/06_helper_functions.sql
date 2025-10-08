-- =====================================================
-- CHUNK 6/6: Helper Functions & Triggers
-- =====================================================

-- Function: Get best provider for tracking type
CREATE OR REPLACE FUNCTION get_best_tracking_provider(
    p_tracking_type TEXT,
    p_organization_id UUID
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_provider_id UUID;
    v_provider_type TEXT;
BEGIN
    -- Map tracking type to provider type
    CASE p_tracking_type
        WHEN 'container', 'bl', 'booking' THEN v_provider_type := 'ocean';
        WHEN 'awb' THEN v_provider_type := 'air';
        WHEN 'parcel' THEN v_provider_type := 'parcel';
        ELSE v_provider_type := 'ocean';
    END CASE;

    -- Get highest priority active provider
    SELECT id INTO v_provider_id
    FROM tracking_providers
    WHERE type = v_provider_type
      AND is_active = true
    ORDER BY priority ASC, success_rate DESC
    LIMIT 1;

    RETURN v_provider_id;
END;
$$;

-- Function: Log tracking request
CREATE OR REPLACE FUNCTION log_tracking_request(
    p_organization_id UUID,
    p_provider_id UUID,
    p_tracking_number TEXT,
    p_tracking_type TEXT,
    p_carrier_name TEXT,
    p_status TEXT,
    p_response_time_ms INTEGER,
    p_error_message TEXT DEFAULT NULL,
    p_fallback_provider_id UUID DEFAULT NULL,
    p_raw_response JSONB DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_log_id UUID;
BEGIN
    INSERT INTO tracking_requests_log (
        organization_id,
        provider_id,
        tracking_number,
        tracking_type,
        carrier_name,
        status,
        response_time_ms,
        error_message,
        fallback_provider_id,
        raw_response
    ) VALUES (
        p_organization_id,
        p_provider_id,
        p_tracking_number,
        p_tracking_type,
        p_carrier_name,
        p_status,
        p_response_time_ms,
        p_error_message,
        p_fallback_provider_id,
        p_raw_response
    )
    RETURNING id INTO v_log_id;

    RETURN v_log_id;
END;
$$;

-- Function: Update provider statistics
CREATE OR REPLACE FUNCTION update_provider_stats()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Update success rate and avg response time
    UPDATE tracking_providers
    SET
        success_rate = (
            SELECT ROUND(
                (COUNT(*) FILTER (WHERE status = 'success')::NUMERIC / COUNT(*)::NUMERIC) * 100,
                2
            )
            FROM tracking_requests_log
            WHERE provider_id = NEW.provider_id
              AND created_at > NOW() - INTERVAL '7 days'
        ),
        avg_response_time_ms = (
            SELECT ROUND(AVG(response_time_ms))
            FROM tracking_requests_log
            WHERE provider_id = NEW.provider_id
              AND status = 'success'
              AND created_at > NOW() - INTERVAL '7 days'
        ),
        updated_at = NOW()
    WHERE id = NEW.provider_id;

    RETURN NEW;
END;
$$;

-- Trigger: Auto-update provider stats on new tracking request
CREATE TRIGGER trigger_update_provider_stats
AFTER INSERT ON tracking_requests_log
FOR EACH ROW
EXECUTE FUNCTION update_provider_stats();
