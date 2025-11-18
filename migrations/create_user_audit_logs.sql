-- Create user_audit_logs table for timeline feature
-- This table tracks all profile and settings changes for timeline and auditability

CREATE TABLE IF NOT EXISTS "user_audit_logs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "changed_by" UUID NOT NULL,
    "field_name" TEXT NOT NULL,
    "old_value" TEXT,
    "new_value" TEXT,
    "change_type" TEXT NOT NULL DEFAULT 'profile',
    "metadata" JSONB,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_audit_logs_pkey" PRIMARY KEY ("id")
);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS "idx_user_audit_logs_user_id" ON "user_audit_logs"("user_id");
CREATE INDEX IF NOT EXISTS "idx_user_audit_logs_changed_by" ON "user_audit_logs"("changed_by");
CREATE INDEX IF NOT EXISTS "idx_user_audit_logs_field_name" ON "user_audit_logs"("field_name");
CREATE INDEX IF NOT EXISTS "idx_user_audit_logs_change_type" ON "user_audit_logs"("change_type");
CREATE INDEX IF NOT EXISTS "idx_user_audit_logs_created_at" ON "user_audit_logs"("created_at");
CREATE INDEX IF NOT EXISTS "idx_user_audit_logs_user_created" ON "user_audit_logs"("user_id", "created_at" DESC);
CREATE INDEX IF NOT EXISTS "idx_user_audit_logs_user_field_created" ON "user_audit_logs"("user_id", "field_name", "created_at" DESC);

-- Add foreign key constraints
ALTER TABLE "user_audit_logs" ADD CONSTRAINT "user_audit_logs_user_id_fkey" 
    FOREIGN KEY ("user_id") REFERENCES "AppUser"("id") ON DELETE CASCADE;

ALTER TABLE "user_audit_logs" ADD CONSTRAINT "user_audit_logs_changed_by_fkey" 
    FOREIGN KEY ("changed_by") REFERENCES "AppUser"("id") ON DELETE CASCADE;

