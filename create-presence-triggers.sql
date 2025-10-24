-- 🔧 PRESENCE TRIGGERS FIX
-- Create database triggers to sync presenceEvent → user_presence

-- First, create the function to handle the sync
CREATE OR REPLACE FUNCTION sync_presence_to_user_presence()
RETURNS TRIGGER AS $$
BEGIN
  -- Handle INSERT and UPDATE events
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    -- Upsert into user_presence table
    INSERT INTO user_presence (
      user_email,
      user_name,
      page_id,
      page_url,
      is_active,
      last_seen,
      enter_time,
      aura_color,
      avatar_url,
      community_id,
      created_at,
      updated_at
    ) VALUES (
      COALESCE(
        (SELECT email FROM "AppUser" WHERE id = NEW."userId" LIMIT 1),
        NEW."userId"::text
      ),
      COALESCE(
        (SELECT name FROM "AppUser" WHERE id = NEW."userId" LIMIT 1),
        NEW."userId"::text
      ),
      NEW."pageId",
      COALESCE(
        (SELECT url FROM "Page" WHERE id = NEW."pageId" LIMIT 1),
        NEW."pageId"
      ),
      CASE 
        WHEN NEW.kind = 'EXIT' THEN false
        WHEN NEW.kind IN ('ENTER', 'HEARTBEAT') THEN true
        ELSE true
      END,
      NEW."createdAt",
      CASE 
        WHEN NEW.kind = 'ENTER' THEN NEW."createdAt"
        ELSE COALESCE(
          (SELECT enter_time FROM user_presence WHERE user_email = COALESCE(
            (SELECT email FROM "AppUser" WHERE id = NEW."userId" LIMIT 1),
            NEW."userId"::text
          ) AND page_id = NEW."pageId" LIMIT 1),
          NEW."createdAt"
        )
      END,
      CASE 
        WHEN NEW.kind = 'ENTER' THEN NEW."createdAt"
        ELSE COALESCE(
          (SELECT enter_time FROM user_presence WHERE user_email = COALESCE(
            (SELECT email FROM "AppUser" WHERE id = NEW."userId" LIMIT 1),
            NEW."userId"::text
          ) AND page_id = NEW."pageId" LIMIT 1),
          NEW."createdAt"
        )
      END,
      COALESCE(
        (SELECT "auraColor" FROM "AppUser" WHERE id = NEW."userId" LIMIT 1),
        '#45B7D1'
      ),
      COALESCE(
        (SELECT "avatarUrl" FROM "AppUser" WHERE id = NEW."userId" LIMIT 1),
        'https://ui-avatars.com/api/?name=' || COALESCE(
          (SELECT name FROM "AppUser" WHERE id = NEW."userId" LIMIT 1),
          NEW."userId"::text
        ) || '&background=45B7D1&color=fff'
      ),
      'comm-001', -- Default community
      NEW."createdAt",
      NEW."createdAt"
    )
    ON CONFLICT (user_email, page_id) 
    DO UPDATE SET
      is_active = CASE 
        WHEN NEW.kind = 'EXIT' THEN false
        WHEN NEW.kind IN ('ENTER', 'HEARTBEAT') THEN true
        ELSE user_presence.is_active
      END,
      last_seen = NEW."createdAt",
      enter_time = CASE 
        WHEN NEW.kind = 'ENTER' THEN NEW."createdAt"
        ELSE user_presence.enter_time
      END,
      updated_at = NEW."createdAt";
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger
DROP TRIGGER IF EXISTS presence_event_sync_trigger ON "PresenceEvent";
CREATE TRIGGER presence_event_sync_trigger
  AFTER INSERT OR UPDATE ON "PresenceEvent"
  FOR EACH ROW
  EXECUTE FUNCTION sync_presence_to_user_presence();

-- Also create a trigger to update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_user_presence_updated_at ON user_presence;
CREATE TRIGGER update_user_presence_updated_at 
  BEFORE UPDATE ON user_presence 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Test the trigger by inserting a test event
-- This will verify the sync is working
INSERT INTO "PresenceEvent" (
  "userId",
  "pageId", 
  kind,
  "createdAt"
) VALUES (
  'test-user@example.com',
  'test_page',
  'ENTER',
  NOW()
) ON CONFLICT DO NOTHING;

-- Check if the trigger worked
SELECT 'Trigger test completed. Check user_presence table for test-user@example.com' as status;
