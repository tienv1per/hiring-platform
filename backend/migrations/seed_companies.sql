-- Seed 10 sample companies
-- First, create a system user for seed data if it doesn't exist

-- Insert a system/seed user (will be skipped if already exists)
INSERT INTO users (id, name, email, password_hash, role)
VALUES (
    '00000000-0000-0000-0000-000000000001',
    'System Seed User',
    'seed@jobportal.system',
    '$2a$10$dummyhashvalue1234567890123456789012345678901234',
    'recruiter'
)
ON CONFLICT (id) DO NOTHING;

-- Now insert the companies with the seed user as recruiter
INSERT INTO companies (id, name, description, website, industry, company_size, founded_year, headquarters, rating, recruiter_id) VALUES
(
    '1a1a1a1a-1a1a-1a1a-1a1a-1a1a1a1a1a1a',
    'Google',
    'Google is a multinational corporation that specializes in Internet-related services and products, which include online advertising technologies, search engine, cloud computing, software, and hardware.

Our mission is to organize the world''s information and make it universally accessible and useful.',
    'https://careers.google.com',
    'Technology',
    '100,000+ employees',
    1998,
    'Mountain View, California',
    4.5,
    '00000000-0000-0000-0000-000000000001'
),
(
    '2b2b2b2b-2b2b-2b2b-2b2b-2b2b2b2b2b2b',
    'Meta',
    'Meta builds technologies that help people connect, find communities, and grow businesses. When Facebook launched in 2004, it changed the way people connect. Apps like Messenger, Instagram and WhatsApp further empowered billions around the world.',
    'https://www.metacareers.com',
    'Social Media',
    '50,000+ employees',
    2004,
    'Menlo Park, California',
    4.1,
    '00000000-0000-0000-0000-000000000001'
),
(
    '3c3c3c3c-3c3c-3c3c-3c3c-3c3c3c3c3c3c',
    'Amazon',
    'Amazon is guided by four principles: customer obsession rather than competitor focus, passion for invention, commitment to operational excellence, and long-term thinking.

We are building the future of e-commerce, cloud computing, digital streaming, and artificial intelligence.',
    'https://www.amazon.jobs',
    'E-commerce & Cloud',
    '1,000,000+ employees',
    1994,
    'Seattle, Washington',
    3.8,
    '00000000-0000-0000-0000-000000000001'
),
(
    '4d4d4d4d-4d4d-4d4d-4d4d-4d4d4d4d4d4d',
    'Netflix',
    'Netflix is the world''s leading streaming entertainment service with over 200 million paid memberships in over 190 countries enjoying TV series, documentaries and feature films across a wide variety of genres and languages.',
    'https://jobs.netflix.com',
    'Entertainment',
    '10,000+ employees',
    1997,
    'Los Gatos, California',
    4.3,
    '00000000-0000-0000-0000-000000000001'
),
(
    '5e5e5e5e-5e5e-5e5e-5e5e-5e5e5e5e5e5e',
    'Binance',
    'Binance is the world''s leading blockchain ecosystem and cryptocurrency infrastructure provider with a financial product suite that includes the largest digital asset exchange by volume.',
    'https://www.binance.com/en/careers',
    'Fintech & Crypto',
    '5,000+ employees',
    2017,
    'Remote / Global',
    4.0,
    '00000000-0000-0000-0000-000000000001'
),
(
    '6f6f6f6f-6f6f-6f6f-6f6f-6f6f6f6f6f6f',
    'Grab',
    'Grab is Southeast Asia''s leading superapp. We provide everyday services like Deliveries, Mobility, Financial Services, and More.

We believe that when we work together, we can drive Southeast Asia forward.',
    'https://grab.careers',
    'Technology',
    '10,000+ employees',
    2012,
    'Singapore',
    4.2,
    '00000000-0000-0000-0000-000000000001'
),
(
    '70707070-7070-7070-7070-707070707070',
    'Shopee',
    'Shopee is the leading e-commerce platform in Southeast Asia and Taiwan. It is a platform tailored for the region, providing customers with an easy, secure and fast online shopping experience.',
    'https://careers.shopee.com',
    'E-commerce',
    '20,000+ employees',
    2015,
    'Singapore',
    3.9,
    '00000000-0000-0000-0000-000000000001'
),
(
    '80808080-8080-8080-8080-808080808080',
    'Microsoft',
    'Microsoft enables digital transformation for the era of an intelligent cloud and an intelligent edge. Its mission is to empower every person and every organization on the planet to achieve more.',
    'https://careers.microsoft.com',
    'Software & Cloud',
    '200,000+ employees',
    1975,
    'Redmond, Washington',
    4.6,
    '00000000-0000-0000-0000-000000000001'
),
(
    '90909090-9090-9090-9090-909090909090',
    'Spotify',
    'Spotify is the world''s most popular audio streaming subscription service with a community of more than 500 million users and 200 million subscribers across 180 markets.',
    'https://www.lifeatspotify.com',
    'Music Streaming',
    '5,000+ employees',
    2006,
    'Stockholm, Sweden',
    4.4,
    '00000000-0000-0000-0000-000000000001'
),
(
    'a0a0a0a0-a0a0-a0a0-a0a0-a0a0a0a0a0a0',
    'Airbnb',
    'Airbnb was born in 2007 when two Hosts welcomed three guests to their San Francisco home, and has since grown to over 4 million Hosts who have welcomed more than 1.4 billion guest arrivals.',
    'https://careers.airbnb.com',
    'Travel & Hospitality',
    '5,000+ employees',
    2008,
    'San Francisco, California',
    4.3,
    '00000000-0000-0000-0000-000000000001'
)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    website = EXCLUDED.website,
    industry = EXCLUDED.industry,
    company_size = EXCLUDED.company_size,
    founded_year = EXCLUDED.founded_year,
    headquarters = EXCLUDED.headquarters,
    rating = EXCLUDED.rating;
