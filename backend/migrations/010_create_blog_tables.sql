-- Blog Service Database Migration
-- Creates blog_categories and blogs tables

-- ============================================
-- Blog Categories
-- ============================================
CREATE TABLE IF NOT EXISTS blog_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- Blogs
-- ============================================
CREATE TABLE IF NOT EXISTS blogs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(500) NOT NULL,
    slug VARCHAR(500) NOT NULL UNIQUE,
    content TEXT NOT NULL,                   -- HTML content from rich text editor
    excerpt TEXT,                            -- Short summary for listing
    cover_image_url VARCHAR(1000),           -- Cloudinary URL for cover image
    author_id UUID NOT NULL REFERENCES users(id),
    category_id UUID REFERENCES blog_categories(id) ON DELETE SET NULL,
    tags TEXT[] DEFAULT '{}',                -- PostgreSQL array for flexible tagging
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    read_time INT DEFAULT 1,                -- Estimated reading time in minutes
    views_count INT DEFAULT 0,
    published_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- Indexes for performance
-- ============================================
CREATE INDEX IF NOT EXISTS idx_blogs_slug ON blogs(slug);
CREATE INDEX IF NOT EXISTS idx_blogs_status ON blogs(status);
CREATE INDEX IF NOT EXISTS idx_blogs_category ON blogs(category_id);
CREATE INDEX IF NOT EXISTS idx_blogs_author ON blogs(author_id);
CREATE INDEX IF NOT EXISTS idx_blogs_published_at ON blogs(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_blog_categories_slug ON blog_categories(slug);

-- ============================================
-- Seed default categories
-- ============================================
INSERT INTO blog_categories (name, slug, description) VALUES
    ('AI & Technology', 'ai-technology', 'Articles about artificial intelligence and technology trends'),
    ('Career Tips', 'career-tips', 'Professional development and career advice'),
    ('Hiring', 'hiring', 'Recruitment strategies and hiring best practices'),
    ('Company Culture', 'company-culture', 'Building great workplace cultures'),
    ('Industry Trends', 'industry-trends', 'Latest trends in the job market')
ON CONFLICT (slug) DO NOTHING;
