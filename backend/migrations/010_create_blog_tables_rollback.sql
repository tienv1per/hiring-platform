-- Rollback: Blog Service Database Migration
-- Drops blogs and blog_categories tables

DROP INDEX IF EXISTS idx_blogs_published_at;
DROP INDEX IF EXISTS idx_blogs_author;
DROP INDEX IF EXISTS idx_blogs_category;
DROP INDEX IF EXISTS idx_blogs_status;
DROP INDEX IF EXISTS idx_blogs_slug;
DROP INDEX IF EXISTS idx_blog_categories_slug;

DROP TABLE IF EXISTS blogs;
DROP TABLE IF EXISTS blog_categories;
