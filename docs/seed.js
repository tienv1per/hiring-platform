#!/usr/bin/env node

/**
 * Database Seed Script
 * Populates the database with sample data for testing
 */

const { Client } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function seedDatabase() {
  console.log('🌱 Seeding database with sample data...\n');

  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    console.log('✅ Connected to database\n');

    // Insert sample skills
    console.log('📝 Adding skills...');
    const skillsQuery = `
      INSERT INTO skills (name) VALUES
      ('JavaScript'), ('TypeScript'), ('React'), ('Node.js'), ('Go'),
      ('PostgreSQL'), ('Docker'), ('Kubernetes'), ('AWS'), ('Python')
      ON CONFLICT (name) DO NOTHING
      RETURNING name;
    `;
    const skillsResult = await client.query(skillsQuery);
    console.log(`   ✓ Added ${skillsResult.rowCount} skills\n`);

    // Insert sample users
    console.log('👥 Adding sample users...');
    const usersQuery = `
      INSERT INTO users (name, email, password_hash, phone, role, bio) VALUES
      ('John Doe', 'john@example.com', '$2a$10$abcdefghijklmnopqrstuvwxyz', '+1234567890', 'jobseeker', 'Experienced software developer'),
      ('Jane Smith', 'jane@example.com', '$2a$10$abcdefghijklmnopqrstuvwxyz', '+1234567891', 'recruiter', 'Tech recruiter at top companies'),
      ('Bob Wilson', 'bob@example.com', '$2a$10$abcdefghijklmnopqrstuvwxyz', '+1234567892', 'jobseeker', 'Frontend specialist')
      ON CONFLICT (email) DO NOTHING
      RETURNING name, role;
    `;
    const usersResult = await client.query(usersQuery);
    console.log(`   ✓ Added ${usersResult.rowCount} users\n`);

    // Get recruiter ID for creating company
    const recruiterQuery = `SELECT id FROM users WHERE role = 'recruiter' LIMIT 1`;
    const recruiterResult = await client.query(recruiterQuery);
    
    if (recruiterResult.rows.length > 0) {
      const recruiterId = recruiterResult.rows[0].id;

      // Insert sample company
      console.log('🏢 Adding sample company...');
      const companyQuery = `
        INSERT INTO companies (name, description, website, recruiter_id) VALUES
        ('Tech Innovators Inc', 'Leading technology company specializing in AI and cloud solutions', 'https://techinnovators.example.com', $1)
        RETURNING name;
      `;
      const companyResult = await client.query(companyQuery, [recruiterId]);
      console.log(`   ✓ Added company: ${companyResult.rows[0].name}\n`);

      // Get company ID for creating jobs
      const companyIdQuery = `SELECT id FROM companies LIMIT 1`;
      const companyIdResult = await client.query(companyIdQuery);
      const companyId = companyIdResult.rows[0].id;

      // Insert sample jobs
      console.log('💼 Adding sample jobs...');
      const jobsQuery = `
        INSERT INTO jobs (title, description, salary, location, job_type, work_location, openings, required_skills, company_id, recruiter_id) VALUES
        ('Senior Full Stack Developer', 
         '# Job Description\n\nWe are looking for an experienced Full Stack Developer...\n\n## Requirements\n- 5+ years experience\n- Proficient in React and Node.js',
         '$120,000 - $150,000',
         'San Francisco, CA',
         'full-time',
         'hybrid',
         2,
         ARRAY['JavaScript', 'TypeScript', 'React', 'Node.js'],
         $1, $2),
        ('Junior Frontend Developer',
         '# Join Our Team!\n\nGreat opportunity for a junior developer to grow...',
         '$60,000 - $80,000',
         'Remote',
         'full-time',
         'remote',
         1,
         ARRAY['JavaScript', 'React'],
         $1, $2)
        RETURNING title;
      `;
      const jobsResult = await client.query(jobsQuery, [companyId, recruiterId]);
      console.log(`   ✓ Added ${jobsResult.rowCount} jobs\n`);
    }

    console.log('✨ Database seeded successfully!');
    console.log('\n📊 Summary:');
    console.log('   - Skills: Sample programming languages and technologies');
    console.log('   - Users: Job seekers and recruiters');
    console.log('   - Companies: Tech Innovators Inc');
    console.log('   - Jobs: Multiple positions with markdown descriptions');

  } catch (error) {
    console.error('\n❌ Seeding failed:', error.message);
    process.exit(1);
  } finally {
    await client.end();
    console.log('\n👋 Done!');
  }
}

seedDatabase();
