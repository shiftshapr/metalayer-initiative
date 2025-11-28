-- Migration: Add provenance_artifacts table for digital provenance storage
-- Follows Digital Vellum Note #3 specification

CREATE TABLE IF NOT EXISTS provenance_artifacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL,
  artifact JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_provenance_artifacts_message_id 
  ON provenance_artifacts(message_id);

CREATE INDEX IF NOT EXISTS idx_provenance_artifacts_created_at 
  ON provenance_artifacts(created_at);

CREATE INDEX IF NOT EXISTS idx_provenance_artifacts_message_created 
  ON provenance_artifacts(message_id, created_at DESC);

-- Add comment
COMMENT ON TABLE provenance_artifacts IS 'Stores JSON-LD provenance artifacts for messages following Digital Vellum Note #3 specification';
COMMENT ON COLUMN provenance_artifacts.message_id IS 'References Post.id or messages.id';
COMMENT ON COLUMN provenance_artifacts.artifact IS 'Full JSON-LD provenance artifact with @id, timestamp, scope, claim, actor, and signature';













