-- Add new columns to companies table for detailed profile
-- Removed CEO and Revenue fields per user request
ALTER TABLE companies
ADD COLUMN IF NOT EXISTS industry VARCHAR(255),
ADD COLUMN IF NOT EXISTS company_size VARCHAR(100),
ADD COLUMN IF NOT EXISTS founded_year INTEGER,
ADD COLUMN IF NOT EXISTS headquarters VARCHAR(255),
ADD COLUMN IF NOT EXISTS rating DECIMAL(3, 2);

-- Add index on industry for filtering
CREATE INDEX IF NOT EXISTS idx_companies_industry ON companies(industry);
