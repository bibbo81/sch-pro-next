-- Fix: Add INSERT policies for performance monitoring tables

-- Allow service role to insert into api_performance_logs
CREATE POLICY "Service role can insert performance logs"
  ON api_performance_logs FOR INSERT
  WITH CHECK (true);

-- Allow service role to insert into system_metrics
CREATE POLICY "Service role can insert system metrics"
  ON system_metrics FOR INSERT
  WITH CHECK (true);

-- Allow service role to insert into performance_summary
CREATE POLICY "Service role can insert performance summary"
  ON performance_summary FOR INSERT
  WITH CHECK (true);

-- Allow service role to update performance_summary
CREATE POLICY "Service role can update performance summary"
  ON performance_summary FOR UPDATE
  USING (true)
  WITH CHECK (true);