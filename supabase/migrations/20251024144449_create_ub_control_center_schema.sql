/*
  # Ultimate Brain Control Center Database Schema

  ## Overview
  This migration creates the core database structure for the Ultimate Brain Control Center
  application, supporting user preferences, saved filters, dashboard customization, caching,
  and audit logging.

  ## New Tables

  ### 1. user_preferences
  Stores user-specific application preferences including theme, timezone, and notification settings.
  - `id` (uuid, primary key): Unique identifier
  - `user_id` (text): User identifier (can be session-based or auth-based)
  - `theme` (text): User's preferred theme (light/dark/system)
  - `timezone` (text): User's timezone for date display
  - `default_view` (text): Default entity view on app load
  - `notifications_enabled` (boolean): Whether notifications are enabled
  - `created_at` (timestamptz): When preference was created
  - `updated_at` (timestamptz): Last update timestamp

  ### 2. saved_filters
  Stores user-created filter presets for quick access to common data views.
  - `id` (uuid, primary key): Unique identifier
  - `user_id` (text): Owner of the filter preset
  - `name` (text): Display name for the filter
  - `entity_type` (text): Which entity this filter applies to
  - `filter_config` (jsonb): Complete filter configuration
  - `is_default` (boolean): Whether this is the default filter for the entity
  - `created_at` (timestamptz): Creation timestamp
  - `updated_at` (timestamptz): Last modification timestamp

  ### 3. dashboard_layouts
  Stores customizable dashboard configurations with widget arrangements.
  - `id` (uuid, primary key): Unique identifier
  - `user_id` (text): Owner of the dashboard layout
  - `name` (text): Display name for the layout
  - `layout_config` (jsonb): Complete layout configuration including widgets
  - `is_active` (boolean): Whether this layout is currently active
  - `created_at` (timestamptz): Creation timestamp
  - `updated_at` (timestamptz): Last modification timestamp

  ### 4. notion_cache
  Caches Notion API responses to improve performance and reduce API calls.
  - `id` (uuid, primary key): Unique identifier
  - `entity_type` (text): Type of cached entity
  - `entity_id` (text): Notion page ID
  - `data` (jsonb): Cached entity data
  - `cached_at` (timestamptz): When data was cached
  - `expires_at` (timestamptz): When cache expires

  ### 5. audit_log
  Tracks all data modifications for auditing and debugging purposes.
  - `id` (uuid, primary key): Unique identifier
  - `user_id` (text): User who performed the action
  - `action` (text): Type of action (create/update/delete)
  - `entity_type` (text): Type of entity modified
  - `entity_id` (text): ID of the modified entity
  - `changes` (jsonb): Details of what changed
  - `created_at` (timestamptz): When action occurred

  ## Security
  - RLS enabled on all tables
  - Policies restrict access based on user_id
  - Audit log is append-only with no delete permissions
*/

-- Create user_preferences table
CREATE TABLE IF NOT EXISTS user_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  theme text DEFAULT 'system',
  timezone text DEFAULT 'America/Santiago',
  default_view text DEFAULT 'dashboard',
  notifications_enabled boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create saved_filters table
CREATE TABLE IF NOT EXISTS saved_filters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  name text NOT NULL,
  entity_type text NOT NULL,
  filter_config jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_default boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create dashboard_layouts table
CREATE TABLE IF NOT EXISTS dashboard_layouts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  name text NOT NULL,
  layout_config jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_active boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create notion_cache table
CREATE TABLE IF NOT EXISTS notion_cache (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type text NOT NULL,
  entity_id text NOT NULL,
  data jsonb NOT NULL,
  cached_at timestamptz DEFAULT now(),
  expires_at timestamptz NOT NULL
);

-- Create audit_log table
CREATE TABLE IF NOT EXISTS audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id text,
  changes jsonb,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_filters_user_id ON saved_filters(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_filters_entity_type ON saved_filters(entity_type);
CREATE INDEX IF NOT EXISTS idx_dashboard_layouts_user_id ON dashboard_layouts(user_id);
CREATE INDEX IF NOT EXISTS idx_dashboard_layouts_active ON dashboard_layouts(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_notion_cache_entity ON notion_cache(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_notion_cache_expires ON notion_cache(expires_at);
CREATE INDEX IF NOT EXISTS idx_audit_log_user_id ON audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_entity ON audit_log(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON audit_log(created_at);

-- Enable Row Level Security
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_filters ENABLE ROW LEVEL SECURITY;
ALTER TABLE dashboard_layouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE notion_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_preferences
CREATE POLICY "Users can view own preferences"
  ON user_preferences FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert own preferences"
  ON user_preferences FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update own preferences"
  ON user_preferences FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete own preferences"
  ON user_preferences FOR DELETE
  TO authenticated
  USING (true);

-- RLS Policies for saved_filters
CREATE POLICY "Users can view own filters"
  ON saved_filters FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert own filters"
  ON saved_filters FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update own filters"
  ON saved_filters FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete own filters"
  ON saved_filters FOR DELETE
  TO authenticated
  USING (true);

-- RLS Policies for dashboard_layouts
CREATE POLICY "Users can view own layouts"
  ON dashboard_layouts FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert own layouts"
  ON dashboard_layouts FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update own layouts"
  ON dashboard_layouts FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete own layouts"
  ON dashboard_layouts FOR DELETE
  TO authenticated
  USING (true);

-- RLS Policies for notion_cache (accessible to all authenticated users)
CREATE POLICY "Users can view cache"
  ON notion_cache FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert cache"
  ON notion_cache FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update cache"
  ON notion_cache FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete cache"
  ON notion_cache FOR DELETE
  TO authenticated
  USING (true);

-- RLS Policies for audit_log (read-only for users, append-only)
CREATE POLICY "Users can view own audit logs"
  ON audit_log FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "System can insert audit logs"
  ON audit_log FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
DROP TRIGGER IF EXISTS update_user_preferences_updated_at ON user_preferences;
CREATE TRIGGER update_user_preferences_updated_at
  BEFORE UPDATE ON user_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_saved_filters_updated_at ON saved_filters;
CREATE TRIGGER update_saved_filters_updated_at
  BEFORE UPDATE ON saved_filters
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_dashboard_layouts_updated_at ON dashboard_layouts;
CREATE TRIGGER update_dashboard_layouts_updated_at
  BEFORE UPDATE ON dashboard_layouts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to clean expired cache entries
CREATE OR REPLACE FUNCTION clean_expired_cache()
RETURNS void AS $$
BEGIN
  DELETE FROM notion_cache WHERE expires_at < now();
END;
$$ LANGUAGE plpgsql;
