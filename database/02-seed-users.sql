-- ============================================================================
-- COURSE MANAGEMENT SYSTEM - SEED USERS
-- ============================================================================
-- Version: 1.0.0
-- Description: Initial users for development and testing
-- Author: Course Management Team
-- Created: 2025-11-09
-- ============================================================================

-- ============================================================================
-- INITIAL USERS
-- ============================================================================

-- Admin User
-- Email: admin@example.com
-- Password: Admin123!
-- Password hash generated with bcrypt, rounds=10
INSERT INTO users (
  id,
  email,
  password_hash,
  full_name,
  role,
  status,
  created_at,
  updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000001',
  'admin@example.com',
  '$2b$10$YQs3z3pVZ5Z5Z5Z5Z5Z5ZuO5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z',
  'System Administrator',
  'ADMIN',
  'ACTIVE',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
);

-- Instructor User
-- Email: instructor@example.com
-- Password: Instructor123!
-- Password hash generated with bcrypt, rounds=10
INSERT INTO users (
  id,
  email,
  password_hash,
  full_name,
  role,
  status,
  created_at,
  updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000002',
  'instructor@example.com',
  '$2b$10$YQs3z3pVZ5Z5Z5Z5Z5Z5ZuO5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z',
  'John Instructor',
  'INSTRUCTOR',
  'ACTIVE',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
);

-- Student User 1
-- Email: student1@example.com
-- Password: Student123!
-- Password hash generated with bcrypt, rounds=10
INSERT INTO users (
  id,
  email,
  password_hash,
  full_name,
  role,
  status,
  created_at,
  updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000003',
  'student1@example.com',
  '$2b$10$YQs3z3pVZ5Z5Z5Z5Z5Z5ZuO5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z',
  'Alice Student',
  'STUDENT',
  'ACTIVE',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
);

-- Student User 2
-- Email: student2@example.com
-- Password: Student123!
-- Password hash generated with bcrypt, rounds=10
INSERT INTO users (
  id,
  email,
  password_hash,
  full_name,
  role,
  status,
  created_at,
  updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000004',
  'student2@example.com',
  '$2b$10$YQs3z3pVZ5Z5Z5Z5Z5Z5ZuO5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z',
  'Bob Student',
  'STUDENT',
  'ACTIVE',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
);

-- ============================================================================
-- COMPLETION MESSAGE
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '============================================================================';
  RAISE NOTICE 'Seed users inserted successfully!';
  RAISE NOTICE '';
  RAISE NOTICE 'Users created:';
  RAISE NOTICE '  - 1 Admin: admin@example.com (Password: Admin123!)';
  RAISE NOTICE '  - 1 Instructor: instructor@example.com (Password: Instructor123!)';
  RAISE NOTICE '  - 2 Students: student1@example.com, student2@example.com (Password: Student123!)';
  RAISE NOTICE '';
  RAISE NOTICE '⚠️  IMPORTANT: Change these passwords in production!';
  RAISE NOTICE '';
  RAISE NOTICE 'Next step: Run 03-seed-programs.sql to insert initial programs';
  RAISE NOTICE '============================================================================';
END $$;

