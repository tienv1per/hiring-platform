-- Step 1: Add 'admin' to the user_role enum type
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'admin';

-- Step 2: Seed admin user
-- Password: admin123 (bcrypt hash with default cost)
-- IMPORTANT: Change the password after first login!

INSERT INTO users (name, email, password_hash, role, phone)
VALUES (
    'Admin',
    'admin@hireai.com',
    '$2a$10$OPgqm1xLemI2heMwwAlzkOkUtDHQe28GXmw23JPzkMlyRVKWqzhq2',
    'admin',
    ''
)
ON CONFLICT (email) DO NOTHING;
