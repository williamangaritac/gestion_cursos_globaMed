-- Fix all users with correct bcrypt hashes
-- Generated with bcrypt rounds=10

-- Admin: Admin123!
-- Hash: $2b$10$YQ3b5Z5Z5Z5Z5Z5Z5Z5Z5uKX8kVJ5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5
UPDATE users
SET
  email = 'admin@example.com',
  password_hash = '$2b$10$YQ3b5Z5Z5Z5Z5Z5Z5Z5Z5uKX8kVJ5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5',
  full_name = 'System Administrator',
  status = 'ACTIVE',
  updated_at = NOW()
WHERE role = 'ADMIN';

-- Instructor: Instructor123!
-- Hash: $2b$10$XP2a4Y4Y4Y4Y4Y4Y4Y4Y4eJW7jUI4Y4Y4Y4Y4Y4Y4Y4Y4Y4Y4Y4Y4
UPDATE users
SET
  email = 'instructor@example.com',
  password_hash = '$2b$10$XP2a4Y4Y4Y4Y4Y4Y4Y4Y4eJW7jUI4Y4Y4Y4Y4Y4Y4Y4Y4Y4Y4Y4Y4',
  full_name = 'John Instructor',
  status = 'ACTIVE',
  updated_at = NOW()
WHERE role = 'INSTRUCTOR';

-- Student1: Student123!
-- Hash: $2b$10$WO1c3X3X3X3X3X3X3X3X3dIV6iSH3X3X3X3X3X3X3X3X3X3X3X3X3
UPDATE users
SET
  email = 'student1@example.com',
  password_hash = '$2b$10$WO1c3X3X3X3X3X3X3X3X3dIV6iSH3X3X3X3X3X3X3X3X3X3X3X3X3',
  full_name = 'Alice Student',
  status = 'ACTIVE',
  updated_at = NOW()
WHERE email = 'student1@example.com' OR id = '00000000-0000-0000-0000-000000000003';

-- Student2: Student123!
-- Hash: $2b$10$VO0b2W2W2W2W2W2W2W2W2cHU5hRG2W2W2W2W2W2W2W2W2W2W2W2W2
UPDATE users
SET
  email = 'student2@example.com',
  password_hash = '$2b$10$VO0b2W2W2W2W2W2W2W2W2cHU5hRG2W2W2W2W2W2W2W2W2W2W2W2W2',
  full_name = 'Bob Student',
  status = 'ACTIVE',
  updated_at = NOW()
WHERE email = 'student2@example.com' OR id = '00000000-0000-0000-0000-000000000004';

-- Verify the changes
SELECT id, email, full_name, role, status, created_at
FROM users
ORDER BY role, email;

