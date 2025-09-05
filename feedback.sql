-- -- Create the feedback table in Supabase
-- -- Run this in your Supabase SQL Editor

-- CREATE TABLE feedback (
--   id SERIAL PRIMARY KEY,
--   role VARCHAR(20) NOT NULL CHECK (role IN ('creator', 'promoter', 'other')),
--   name VARCHAR(255) NOT NULL,
--   email VARCHAR(255) NOT NULL,
--   instagram VARCHAR(255) NOT NULL,
--   last_campaign TEXT NOT NULL,
--   platform_help VARCHAR(50) CHECK (platform_help IN ('yes', 'no', 'maybe', 'not_sure')),
--   why_join TEXT NOT NULL,
--   created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
--   updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
-- );

-- -- Create indexes for better query performance
-- CREATE INDEX idx_feedback_email ON feedback(email);
-- CREATE INDEX idx_feedback_role ON feedback(role);
-- CREATE INDEX idx_feedback_created_at ON feedback(created_at);

-- -- Enable Row Level Security (RLS) - Optional but recommended
-- ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

-- -- Create a policy to allow inserts from your backend
-- -- This allows your backend service to insert data
-- CREATE POLICY "Enable insert access for service role" ON feedback
-- FOR INSERT WITH CHECK (true);

-- -- Create a policy to allow reads for service role (for analytics/admin)
-- CREATE POLICY "Enable read access for service role" ON feedback
-- FOR SELECT USING (true);

-- -- Function to update the updated_at column automatically
-- CREATE OR REPLACE FUNCTION update_updated_at_column()
-- RETURNS TRIGGER AS $$
-- BEGIN
--     NEW.updated_at = NOW();
--     RETURN NEW;
-- END;
-- $$ LANGUAGE plpgsql;

-- -- Trigger to automatically update updated_at
-- CREATE TRIGGER update_feedback_updated_at 
--     BEFORE UPDATE ON feedback 
--     FOR EACH ROW 
--     EXECUTE FUNCTION update_updated_at_column();

-- -- Insert some sample data for testing (optional)
-- INSERT INTO feedback (role, name, email, instagram, last_campaign, platform_help, why_join) VALUES
-- ('creator', 'Test Creator', 'test@example.com', '@testcreator', 'Sample campaign description', 'yes', 'Want to test the platform'),
-- ('promoter', 'Test Brand', 'brand@example.com', '@testbrand', 'Brand campaign example', 'yes', 'Need better creator discovery');

-- -- Query to view all feedback entries
-- -- SELECT * FROM feedback ORDER BY created_at DESC;