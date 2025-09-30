-- Migration: Fix Analytics Functions
-- Description: Correct column names and improve error handling in analytics functions
-- Date: 2025-09-30

-- =====================================================
-- FIX: calculate_organization_metrics
-- =====================================================
-- Corrected column names:
-- - shipments: actual_delivery, date_of_arrival, arrival_date (not delivered_at)
-- - products: active (not is_active), no quantity column
-- - additional_costs: use organization_id directly (not via shipments JOIN)

DROP FUNCTION IF EXISTS calculate_organization_metrics(UUID, DATE, DATE);

CREATE OR REPLACE FUNCTION calculate_organization_metrics(
  org_id UUID,
  start_date DATE,
  end_date DATE
)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
  result JSONB;
  shipments_data JSONB;
  products_data JSONB;
  costs_data JSONB;
  total_cost NUMERIC;
  avg_cost NUMERIC;
  cost_by_type_json JSONB;
BEGIN
  -- Shipments metrics
  SELECT jsonb_build_object(
    'total_shipments', COUNT(*),
    'pending', COUNT(*) FILTER (WHERE status = 'pending'),
    'in_transit', COUNT(*) FILTER (WHERE status = 'in_transit' OR status = 'in transit'),
    'delivered', COUNT(*) FILTER (WHERE status = 'delivered'),
    'avg_delivery_days', COALESCE(
      AVG(
        EXTRACT(DAY FROM (
          COALESCE(actual_delivery, date_of_arrival, arrival_date) - created_at
        ))
      ) FILTER (WHERE COALESCE(actual_delivery, date_of_arrival, arrival_date) IS NOT NULL),
      0
    )
  ) INTO shipments_data
  FROM shipments
  WHERE organization_id = org_id
    AND created_at::DATE BETWEEN start_date AND end_date;

  -- Products metrics
  SELECT jsonb_build_object(
    'total_products', COUNT(*),
    'active_products', COUNT(*) FILTER (WHERE active = true),
    'total_quantity', COUNT(*)
  ) INTO products_data
  FROM products
  WHERE organization_id = org_id
    AND created_at::DATE <= end_date;

  -- Costs metrics - calcola separatamente per evitare problemi di scope
  SELECT
    COALESCE(SUM(ac.amount), 0),
    COALESCE(SUM(ac.amount) / NULLIF(COUNT(DISTINCT ac.shipment_id), 0), 0)
  INTO total_cost, avg_cost
  FROM additional_costs ac
  WHERE ac.organization_id = org_id
    AND ac.created_at::DATE BETWEEN start_date AND end_date;

  -- Cost by type
  SELECT COALESCE(jsonb_object_agg(cost_type, cost_sum), '{}'::jsonb)
  INTO cost_by_type_json
  FROM (
    SELECT
      ac.cost_type,
      SUM(ac.amount) as cost_sum
    FROM additional_costs ac
    WHERE ac.organization_id = org_id
      AND ac.created_at::DATE BETWEEN start_date AND end_date
    GROUP BY ac.cost_type
  ) costs_grouped;

  -- Build costs data
  costs_data := jsonb_build_object(
    'total_cost', total_cost,
    'avg_cost_per_shipment', avg_cost,
    'cost_by_type', cost_by_type_json
  );

  -- Combine all metrics
  result := jsonb_build_object(
    'shipments', shipments_data,
    'products', products_data,
    'costs', costs_data,
    'period', jsonb_build_object(
      'start', start_date,
      'end', end_date
    )
  );

  RETURN result;
END;
$$;

-- =====================================================
-- FIX: get_trending_metrics
-- =====================================================

DROP FUNCTION IF EXISTS get_trending_metrics(UUID, DATE, DATE, DATE, DATE);

CREATE OR REPLACE FUNCTION get_trending_metrics(
  org_id UUID,
  current_start DATE,
  current_end DATE,
  previous_start DATE,
  previous_end DATE
)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
  current_metrics JSONB;
  previous_metrics JSONB;
  result JSONB;
  shipments_change NUMERIC;
  costs_change NUMERIC;
BEGIN
  current_metrics := calculate_organization_metrics(org_id, current_start, current_end);
  previous_metrics := calculate_organization_metrics(org_id, previous_start, previous_end);

  -- Calculate shipments change percentage
  IF (previous_metrics->'shipments'->>'total_shipments')::INTEGER > 0 THEN
    shipments_change := ((current_metrics->'shipments'->>'total_shipments')::DECIMAL /
                         (previous_metrics->'shipments'->>'total_shipments')::DECIMAL - 1) * 100;
  ELSE
    shipments_change := 0;
  END IF;

  -- Calculate costs change percentage
  IF (previous_metrics->'costs'->>'total_cost')::NUMERIC > 0 THEN
    costs_change := ((current_metrics->'costs'->>'total_cost')::NUMERIC /
                     (previous_metrics->'costs'->>'total_cost')::NUMERIC - 1) * 100;
  ELSE
    costs_change := 0;
  END IF;

  result := jsonb_build_object(
    'current', current_metrics,
    'previous', previous_metrics,
    'trends', jsonb_build_object(
      'shipments_change', shipments_change,
      'costs_change', costs_change
    )
  );

  RETURN result;
END;
$$;

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================
