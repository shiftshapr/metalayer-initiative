-- Fix RLS policies for reactions table
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON reactions;
DROP POLICY IF EXISTS "Enable read access for all users" ON reactions;
DROP POLICY IF EXISTS "Enable update for users based on user_email" ON reactions;
DROP POLICY IF EXISTS "Enable delete for users based on user_email" ON reactions;

-- Create new RLS policies for reactions table
CREATE POLICY "Enable insert for authenticated users only" ON reactions
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable read access for all users" ON reactions
    FOR SELECT USING (true);

CREATE POLICY "Enable update for users based on user_email" ON reactions
    FOR UPDATE USING (auth.jwt() ->> 'email' = user_email);

CREATE POLICY "Enable delete for users based on user_email" ON reactions
    FOR DELETE USING (auth.jwt() ->> 'email' = user_email);