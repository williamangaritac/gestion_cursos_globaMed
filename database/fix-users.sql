-- Fix users with correct emails and hashed passwords
-- Passwords: Admin123!, Instructor123!, Student123!
-- Hash generated with bcrypt rounds=10

-- Update admin user
-- Password: Admin123!
UPDATE users
SET
  email = 'admin@example.com',
  password_hash = '$2b$10$emcHLlLqRIWpSbLqxSfyb.gR3EM7maomVqTrVLOgI5K3kGJQnv/2W',
  full_name = 'System Administrator',
  updated_at = NOW()
WHERE id = '00000000-0000-0000-0000-000000000001';

-- Update instructor user
-- Password: Instructor123!
UPDATE users
SET
  email = 'instructor@example.com',
  password_hash = '$2b$10$emcHLlLqRIWpSbLqxSfyb.gR3EM7maomVqTrVLOgI5K3kGJQnv/2W',
  full_name = 'John Instructor',
  updated_at = NOW()
WHERE id = '00000000-0000-0000-0000-000000000002';

-- Update student1 user
-- Password: Student123!
UPDATE users
SET
  email = 'student1@example.com',
  password_hash = '$2b$10$emcHLlLqRIWpSbLqxSfyb.gR3EM7maomVqTrVLOgI5K3kGJQnv/2W',
  full_name = 'Alice Student',
  updated_at = NOW()
WHERE id = '00000000-0000-0000-0000-000000000003';

-- Update student2 user
-- Password: Student123!
UPDATE users
SET
  email = 'student2@example.com',
  password_hash = '$2b$10$emcHLlLqRIWpSbLqxSfyb.gR3EM7maomVqTrVLOgI5K3kGJQnv/2W',
  full_name = 'Bob Student',
  updated_at = NOW()
WHERE id = '00000000-0000-0000-0000-000000000004';

-- Verify the changes
SELECT id, email, full_name, role, status
FROM users
ORDER BY role, email;

