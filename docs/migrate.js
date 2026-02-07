#!/usr/bin/env node

/**
 * Database Migration Script for Neon DB
 * Runs the PostgreSQL schema to set up all tables, indexes, and triggers
 */

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function runMigration() {
  console.log('🚀 Starting database migration...\n');

  // Check if DATABASE_URL is set
  if (!process.env.DATABASE_URL) {
    console.error('❌ ERROR: DATABASE_URL is not set in .env file');
    console.error('Please create a .env file with your Neon DB connection string');
    console.error('Example: DATABASE_URL=postgresql://user:pass@host.region.neon.tech/db?sslmode=require');
    process.exit(1);
  }

  // Create PostgreSQL client
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false, // Required for Neon DB
    },
  });

  try {
    // Connect to database
    console.log('📡 Connecting to Neon DB...');
    await client.connect();
    console.log('✅ Connected successfully!\n');

    // Read schema file
    const schemaPath = path.join(__dirname, 'database-schema.sql');
    console.log('📄 Reading schema file:', schemaPath);
    const schema = fs.readFileSync(schemaPath, 'utf8');

    // Execute schema
    console.log('⚙️  Executing database schema...\n');
    await client.query(schema);

    console.log('✅ Migration completed successfully!\n');

    // Verify tables
    console.log('🔍 Verifying database setup...');
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);

    console.log('\n📊 Tables created:');
    tablesResult.rows.forEach((row, index) => {
      console.log(`   ${index + 1}. ${row.table_name}`);
    });

    // Verify ENUM types
    const enumsResult = await client.query(`
      SELECT typname 
      FROM pg_type 
      WHERE typtype = 'e'
      ORDER BY typname;
    `);

    console.log('\n🏷️  ENUM types created:');
    enumsResult.rows.forEach((row, index) => {
      console.log(`   ${index + 1}. ${row.typname}`);
    });

    // Verify indexes
    const indexesResult = await client.query(`
      SELECT indexname 
      FROM pg_indexes 
      WHERE schemaname = 'public'
      AND indexname LIKE 'idx_%'
      ORDER BY indexname;
    `);

    console.log('\n🔍 Indexes created:');
    indexesResult.rows.forEach((row, index) => {
      console.log(`   ${index + 1}. ${row.indexname}`);
    });

    console.log('\n✨ Database setup complete!');

  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    console.error('\nFull error:', error);
    process.exit(1);
  } finally {
    await client.end();
    console.log('\n👋 Database connection closed');
  }
}

// Run migration
runMigration();
