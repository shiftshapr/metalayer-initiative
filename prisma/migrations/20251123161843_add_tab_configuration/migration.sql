-- Migration: Add tab_configuration column to AppUser
-- Date: 2025-11-23
-- Description: Adds tab_configuration JSONB column to store tab manager configuration
--              (tab order, visibility, currentTab, previousTab, etc.)

-- AlterTable
ALTER TABLE "AppUser" ADD COLUMN IF NOT EXISTS "tab_configuration" JSONB;

-- Add comment for documentation
COMMENT ON COLUMN "AppUser"."tab_configuration" IS 'Tab manager configuration (order, visibility, currentTab, previousTab, etc.)';
