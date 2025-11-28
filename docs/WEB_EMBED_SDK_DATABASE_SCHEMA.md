# Web-Embed SDK Database Schema

## Overview

This document defines the database schema for the Web-Embed SDK feature, including tables, indexes, and relationships.

**Database**: PostgreSQL (via Supabase)

---

## Tables

### 1. `canopi_embed_instances`

Stores Canopi embed instance configurations.

```sql
CREATE TABLE canopi_embed_instances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  community_id UUID NOT NULL REFERENCES communities(id) ON DELETE RESTRICT,
  
  -- Basic info
  name VARCHAR(255) NOT NULL,
  description TEXT,
  
  -- Security
  domain_whitelist TEXT[] NOT NULL DEFAULT '{}',
  
  -- Configuration
  page_rules JSONB NOT NULL DEFAULT '{"type": "all"}',
  trigger_config JSONB NOT NULL DEFAULT '{"type": "corner-tab", "position": "bottom-right"}',
  
  -- Status
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'archived')),
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT name_not_empty CHECK (char_length(trim(name)) > 0),
  CONSTRAINT domain_whitelist_not_empty CHECK (array_length(domain_whitelist, 1) > 0)
);

-- Indexes
CREATE INDEX idx_embed_instances_user_id ON canopi_embed_instances(user_id);
CREATE INDEX idx_embed_instances_community_id ON canopi_embed_instances(community_id);
CREATE INDEX idx_embed_instances_status ON canopi_embed_instances(status);
CREATE INDEX idx_embed_instances_created_at ON canopi_embed_instances(created_at DESC);

-- Full text search
CREATE INDEX idx_embed_instances_search ON canopi_embed_instances USING gin(to_tsvector('english', name || ' ' || COALESCE(description, '')));

-- Update timestamp trigger
CREATE TRIGGER update_embed_instances_updated_at
  BEFORE UPDATE ON canopi_embed_instances
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

**JSONB Schema - `page_rules`:**
```json
{
  "type": "all" | "specific" | "patterns",
  "urls": ["/help", "/docs"],           // For type: "specific"
  "patterns": ["/help/*", "/docs/*"]   // For type: "patterns"
}
```

**JSONB Schema - `trigger_config`:**
```json
{
  "type": "corner-tab" | "bouncing-icon",
  "position": "top-left" | "top-right" | "bottom-left" | "bottom-right",
  "offset": {
    "x": 0,    // Pixels from corner
    "y": 0
  },
  "message": "Need help? Chat with us!",
  "icon": "chat" | "support" | "help" | "custom",
  "customIconUrl": "https://...",  // If icon: "custom"
  "color": "#007bff",
  "size": "small" | "medium" | "large",
  "autoShowDelay": 0,              // Seconds
  "hideAfterClick": false,
  "showOnMobile": true,
  "bounceIntensity": "subtle" | "normal" | "aggressive"  // For bouncing-icon
}
```

---

### 2. `canopi_embed_analytics`

Stores analytics events from embed instances.

```sql
CREATE TABLE canopi_embed_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instance_id UUID NOT NULL REFERENCES canopi_embed_instances(id) ON DELETE CASCADE,
  
  -- Event data
  event_type VARCHAR(50) NOT NULL,
  page_url TEXT NOT NULL,
  user_agent TEXT,
  
  -- Session tracking
  session_id UUID,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  
  -- Additional metadata
  metadata JSONB DEFAULT '{}',
  
  -- Timestamp
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_event_type CHECK (event_type IN (
    'page_view',
    'trigger_impression',
    'trigger_hover',
    'sidebar_open',
    'sidebar_close',
    'message_post',
    'auth_prompt',
    'auth_complete'
  ))
);

-- Indexes
CREATE INDEX idx_embed_analytics_instance_id ON canopi_embed_analytics(instance_id);
CREATE INDEX idx_embed_analytics_event_type ON canopi_embed_analytics(event_type);
CREATE INDEX idx_embed_analytics_timestamp ON canopi_embed_analytics(timestamp DESC);
CREATE INDEX idx_embed_analytics_session_id ON canopi_embed_analytics(session_id);
CREATE INDEX idx_embed_analytics_user_id ON canopi_embed_analytics(user_id);

-- Composite index for common queries
CREATE INDEX idx_embed_analytics_instance_time ON canopi_embed_analytics(instance_id, timestamp DESC);

-- Partitioning (optional, for high volume)
-- CREATE TABLE canopi_embed_analytics_2024_01 PARTITION OF canopi_embed_analytics
--   FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');
```

---

### 3. `canopi_embed_sessions` (Optional)

Track user sessions across embed instances for better analytics.

```sql
CREATE TABLE canopi_embed_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instance_id UUID NOT NULL REFERENCES canopi_embed_instances(id) ON DELETE CASCADE,
  
  -- Session info
  first_page_url TEXT NOT NULL,
  user_agent TEXT,
  referrer TEXT,
  
  -- User tracking
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  anonymous_id UUID,  -- For guest users
  
  -- Timestamps
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ended_at TIMESTAMP WITH TIME ZONE,
  
  -- Metrics
  page_views INTEGER DEFAULT 1,
  sidebar_opens INTEGER DEFAULT 0,
  messages_posted INTEGER DEFAULT 0
);

-- Indexes
CREATE INDEX idx_embed_sessions_instance_id ON canopi_embed_sessions(instance_id);
CREATE INDEX idx_embed_sessions_user_id ON canopi_embed_sessions(user_id);
CREATE INDEX idx_embed_sessions_anonymous_id ON canopi_embed_sessions(anonymous_id);
CREATE INDEX idx_embed_sessions_started_at ON canopi_embed_sessions(started_at DESC);
```

---

## Row Level Security (RLS)

### `canopi_embed_instances`

```sql
-- Enable RLS
ALTER TABLE canopi_embed_instances ENABLE ROW LEVEL SECURITY;

-- Users can only see their own instances
CREATE POLICY "Users can view own instances"
  ON canopi_embed_instances
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own instances
CREATE POLICY "Users can insert own instances"
  ON canopi_embed_instances
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own instances
CREATE POLICY "Users can update own instances"
  ON canopi_embed_instances
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own instances
CREATE POLICY "Users can delete own instances"
  ON canopi_embed_instances
  FOR DELETE
  USING (auth.uid() = user_id);

-- Public read access for active instances (for SDK config endpoint)
CREATE POLICY "Public can view active instances"
  ON canopi_embed_instances
  FOR SELECT
  USING (status = 'active');
```

### `canopi_embed_analytics`

```sql
-- Enable RLS
ALTER TABLE canopi_embed_analytics ENABLE ROW LEVEL SECURITY;

-- Users can view analytics for their instances
CREATE POLICY "Users can view own instance analytics"
  ON canopi_embed_analytics
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM canopi_embed_instances
      WHERE canopi_embed_instances.id = canopi_embed_analytics.instance_id
      AND canopi_embed_instances.user_id = auth.uid()
    )
  );

-- Public insert for analytics events (from SDK)
CREATE POLICY "Public can insert analytics events"
  ON canopi_embed_analytics
  FOR INSERT
  WITH CHECK (true);
```

---

## Functions

### Update Updated At Column

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

### Generate Embed Code

```sql
CREATE OR REPLACE FUNCTION generate_embed_code(instance_id UUID)
RETURNS TEXT AS $$
DECLARE
  instance_record canopi_embed_instances%ROWTYPE;
  embed_code TEXT;
BEGIN
  SELECT * INTO instance_record
  FROM canopi_embed_instances
  WHERE id = instance_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Instance not found';
  END IF;
  
  embed_code := format(
    '<script src="https://cdn.canopi.live/embed/v1.js" data-canopi-id="%s" async></script>',
    instance_id
  );
  
  RETURN embed_code;
END;
$$ LANGUAGE plpgsql;
```

### Get Analytics Summary

```sql
CREATE OR REPLACE FUNCTION get_embed_analytics_summary(
  p_instance_id UUID,
  p_start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW() - INTERVAL '30 days',
  p_end_date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
)
RETURNS TABLE (
  total_page_views BIGINT,
  total_trigger_impressions BIGINT,
  total_sidebar_opens BIGINT,
  open_rate NUMERIC,
  total_messages BIGINT,
  unique_users BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*) FILTER (WHERE event_type = 'page_view')::BIGINT as total_page_views,
    COUNT(*) FILTER (WHERE event_type = 'trigger_impression')::BIGINT as total_trigger_impressions,
    COUNT(*) FILTER (WHERE event_type = 'sidebar_open')::BIGINT as total_sidebar_opens,
    CASE
      WHEN COUNT(*) FILTER (WHERE event_type = 'trigger_impression') > 0 THEN
        ROUND(
          COUNT(*) FILTER (WHERE event_type = 'sidebar_open')::NUMERIC /
          COUNT(*) FILTER (WHERE event_type = 'trigger_impression')::NUMERIC,
          3
        )
      ELSE 0
    END as open_rate,
    COUNT(*) FILTER (WHERE event_type = 'message_post')::BIGINT as total_messages,
    COUNT(DISTINCT COALESCE(user_id::TEXT, session_id::TEXT))::BIGINT as unique_users
  FROM canopi_embed_analytics
  WHERE instance_id = p_instance_id
    AND timestamp >= p_start_date
    AND timestamp <= p_end_date;
END;
$$ LANGUAGE plpgsql;
```

---

## Migrations

### Initial Migration

```sql
-- Migration: 001_create_embed_tables.sql

BEGIN;

-- Create tables
-- (Include all CREATE TABLE statements from above)

-- Create indexes
-- (Include all CREATE INDEX statements from above)

-- Enable RLS
-- (Include all RLS policies from above)

-- Create functions
-- (Include all function definitions from above)

COMMIT;
```

### Add Session Tracking (Future)

```sql
-- Migration: 002_add_session_tracking.sql

BEGIN;

CREATE TABLE canopi_embed_sessions (
  -- (Include table definition from above)
);

-- (Include indexes and RLS policies)

COMMIT;
```

---

## Data Retention

### Analytics Retention Policy

```sql
-- Delete analytics older than 2 years
CREATE OR REPLACE FUNCTION cleanup_old_analytics()
RETURNS void AS $$
BEGIN
  DELETE FROM canopi_embed_analytics
  WHERE timestamp < NOW() - INTERVAL '2 years';
END;
$$ LANGUAGE plpgsql;

-- Schedule via pg_cron (if available)
-- SELECT cron.schedule('cleanup-embed-analytics', '0 2 * * *', 'SELECT cleanup_old_analytics()');
```

---

## Backup & Recovery

### Backup Strategy
- Daily full backups
- Point-in-time recovery enabled
- Analytics table can be archived to cold storage after 1 year

### Recovery Procedures
1. Restore from latest backup
2. Replay transaction logs to desired point
3. Verify data integrity
4. Re-enable RLS policies if needed

---

## Performance Considerations

### Query Optimization
- Use indexes for common query patterns
- Partition analytics table by date for large datasets
- Use materialized views for complex analytics queries

### Monitoring
- Monitor query performance
- Track table sizes
- Alert on slow queries (>1s)
- Monitor index usage

---

## Security Considerations

1. **RLS Policies**: Ensure proper access control
2. **Input Validation**: Validate all JSONB data
3. **Rate Limiting**: Implement at application level
4. **Domain Whitelisting**: Validate domains on insert/update
5. **SQL Injection**: Use parameterized queries only






