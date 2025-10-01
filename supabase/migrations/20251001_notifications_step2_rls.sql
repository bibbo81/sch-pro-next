-- Step 2: Enable RLS and create policies

-- =====================================================
-- 1. ENABLE RLS
-- =====================================================
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 2. CREATE RLS POLICIES
-- =====================================================

-- Users can only see their own notifications
CREATE POLICY notifications_select_own ON notifications
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can update (mark as read) their own notifications
CREATE POLICY notifications_update_own ON notifications
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Only system can insert notifications (via triggers or service role)
-- This policy blocks direct inserts from users
CREATE POLICY notifications_insert_system ON notifications
  FOR INSERT
  WITH CHECK (false);
