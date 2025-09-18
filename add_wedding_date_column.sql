-- Add wedding_date column to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS wedding_date TIMESTAMP WITH TIME ZONE;

-- Add comment to the column
COMMENT ON COLUMN profiles.wedding_date IS 'Wedding date set by the user';

-- Update the updated_at timestamp when wedding_date is modified
CREATE OR REPLACE FUNCTION update_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger if it doesn't exist
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_profiles_updated_at();
