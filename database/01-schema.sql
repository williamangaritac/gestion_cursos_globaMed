-- ============================================================================
-- COURSE MANAGEMENT SYSTEM - DATABASE SCHEMA
-- ============================================================================
-- Version: 1.0.0
-- Database: PostgreSQL 16
-- Description: Complete schema with tables, indexes, triggers, and views
-- Author: Course Management Team
-- Created: 2025-11-09
-- ============================================================================

-- ============================================================================
-- EXTENSIONS
-- ============================================================================

-- Enable UUID extension for generating UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable pg_trgm for full-text search capabilities
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ============================================================================
-- ENUM TYPES
-- ============================================================================

-- User Role Enum
CREATE TYPE user_role AS ENUM ('ADMIN', 'INSTRUCTOR', 'STUDENT');

-- User Status Enum
CREATE TYPE user_status AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED');

-- Program Status Enum
CREATE TYPE program_status AS ENUM ('DRAFT', 'PUBLISHED', 'ACTIVE', 'COMPLETED', 'ARCHIVED');

-- Enrollment Status Enum
CREATE TYPE enrollment_status AS ENUM ('PENDING', 'ACTIVE', 'COMPLETED', 'DROPPED');

-- ============================================================================
-- TABLES
-- ============================================================================

-- Users Table
-- Stores all system users (admins, instructors, students)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  role user_role NOT NULL DEFAULT 'STUDENT',
  status user_status NOT NULL DEFAULT 'ACTIVE',
  refresh_token TEXT,
  last_login_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP WITH TIME ZONE,
  
  -- Email format validation
  CONSTRAINT email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$')
);

-- Programs Table
-- Stores courses/programs offered by the institution
CREATE TABLE programs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  start_date DATE NOT NULL,
  end_date DATE,
  status program_status NOT NULL DEFAULT 'DRAFT',
  instructor_id UUID REFERENCES users(id) ON DELETE SET NULL,
  max_students INTEGER DEFAULT 30 CHECK (max_students > 0),
  current_students INTEGER DEFAULT 0 CHECK (current_students >= 0),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP WITH TIME ZONE,
  
  -- Date validation
  CONSTRAINT valid_dates CHECK (end_date IS NULL OR end_date >= start_date),
  -- Student capacity validation
  CONSTRAINT student_capacity CHECK (current_students <= max_students)
);

-- Enrollments Table
-- Stores student enrollments in programs
CREATE TABLE enrollments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  program_id UUID NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
  status enrollment_status NOT NULL DEFAULT 'ACTIVE',
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  -- Prevent duplicate enrollments
  UNIQUE(user_id, program_id)
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Users Indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_deleted ON users(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_created_at ON users(created_at DESC);

-- Programs Indexes
CREATE INDEX idx_programs_status ON programs(status);
CREATE INDEX idx_programs_start_date ON programs(start_date);
CREATE INDEX idx_programs_instructor ON programs(instructor_id);
CREATE INDEX idx_programs_deleted ON programs(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX idx_programs_created_at ON programs(created_at DESC);

-- Full-text search indexes for program names and descriptions
CREATE INDEX idx_programs_name_gin ON programs USING gin(to_tsvector('english', name));
CREATE INDEX idx_programs_description_gin ON programs USING gin(to_tsvector('english', description));

-- Enrollments Indexes
CREATE INDEX idx_enrollments_user ON enrollments(user_id);
CREATE INDEX idx_enrollments_program ON enrollments(program_id);
CREATE INDEX idx_enrollments_status ON enrollments(status);
CREATE INDEX idx_enrollments_created_at ON enrollments(created_at DESC);
CREATE INDEX idx_enrollments_user_program ON enrollments(user_id, program_id);

-- ============================================================================
-- TRIGGERS AND FUNCTIONS
-- ============================================================================

-- Function: Update updated_at timestamp automatically
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger: Users updated_at
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger: Programs updated_at
CREATE TRIGGER update_programs_updated_at
  BEFORE UPDATE ON programs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger: Enrollments updated_at
CREATE TRIGGER update_enrollments_updated_at
  BEFORE UPDATE ON enrollments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function: Update program students count automatically
CREATE OR REPLACE FUNCTION update_program_students_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.status = 'ACTIVE' THEN
    UPDATE programs 
    SET current_students = current_students + 1 
    WHERE id = NEW.program_id;
  ELSIF TG_OP = 'DELETE' AND OLD.status = 'ACTIVE' THEN
    UPDATE programs 
    SET current_students = GREATEST(current_students - 1, 0)
    WHERE id = OLD.program_id;
  ELSIF TG_OP = 'UPDATE' AND OLD.status = 'ACTIVE' AND NEW.status != 'ACTIVE' THEN
    UPDATE programs 
    SET current_students = GREATEST(current_students - 1, 0)
    WHERE id = OLD.program_id;
  ELSIF TG_OP = 'UPDATE' AND OLD.status != 'ACTIVE' AND NEW.status = 'ACTIVE' THEN
    UPDATE programs 
    SET current_students = current_students + 1 
    WHERE id = NEW.program_id;
  END IF;
  
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$ language 'plpgsql';

-- Trigger: Update program students count on enrollment changes
CREATE TRIGGER trigger_update_program_students
  AFTER INSERT OR UPDATE OR DELETE ON enrollments
  FOR EACH ROW
  EXECUTE FUNCTION update_program_students_count();

-- Function: Validate enrollment capacity before insert/update
CREATE OR REPLACE FUNCTION validate_enrollment_capacity()
RETURNS TRIGGER AS $$
DECLARE
  program_max_students INTEGER;
  program_current_students INTEGER;
  program_status_value program_status;
BEGIN
  -- Get program details
  SELECT max_students, current_students, status 
  INTO program_max_students, program_current_students, program_status_value
  FROM programs 
  WHERE id = NEW.program_id;
  
  -- Check if program exists
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Program with id % does not exist', NEW.program_id;
  END IF;
  
  -- Check if program is active
  IF program_status_value != 'ACTIVE' THEN
    RAISE EXCEPTION 'Cannot enroll in program with status %', program_status_value;
  END IF;
  
  -- Check capacity only for new active enrollments
  IF NEW.status = 'ACTIVE' AND (TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND OLD.status != 'ACTIVE')) THEN
    IF program_current_students >= program_max_students THEN
      RAISE EXCEPTION 'Program is full. Maximum capacity: %, Current: %', 
        program_max_students, program_current_students;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger: Validate enrollment capacity before insert/update
CREATE TRIGGER trigger_validate_enrollment_capacity
  BEFORE INSERT OR UPDATE ON enrollments
  FOR EACH ROW
  EXECUTE FUNCTION validate_enrollment_capacity();

-- Function: Auto-complete enrollment when progress reaches 100%
CREATE OR REPLACE FUNCTION auto_complete_enrollment()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.progress = 100 AND (OLD.progress IS NULL OR OLD.progress < 100) THEN
    NEW.status = 'COMPLETED';
    NEW.completed_at = CURRENT_TIMESTAMP;
  END IF;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger: Auto-complete enrollment when progress reaches 100%
CREATE TRIGGER trigger_auto_complete_enrollment
  BEFORE UPDATE ON enrollments
  FOR EACH ROW
  EXECUTE FUNCTION auto_complete_enrollment();

-- ============================================================================
-- VIEWS FOR REPORTING
-- ============================================================================

-- View: Active Programs with Enrollment Statistics
CREATE OR REPLACE VIEW v_active_programs_stats AS
SELECT 
  p.id,
  p.name,
  p.description,
  p.start_date,
  p.end_date,
  p.status,
  p.max_students,
  p.current_students,
  ROUND((p.current_students::NUMERIC / p.max_students::NUMERIC) * 100, 2) as capacity_percentage,
  u.full_name as instructor_name,
  COUNT(DISTINCT e.id) as total_enrollments,
  COUNT(DISTINCT CASE WHEN e.status = 'ACTIVE' THEN e.id END) as active_enrollments,
  COUNT(DISTINCT CASE WHEN e.status = 'COMPLETED' THEN e.id END) as completed_enrollments
FROM programs p
LEFT JOIN users u ON p.instructor_id = u.id
LEFT JOIN enrollments e ON p.id = e.program_id
WHERE p.deleted_at IS NULL
GROUP BY p.id, p.name, p.description, p.start_date, p.end_date, p.status, 
         p.max_students, p.current_students, u.full_name;

-- ============================================================================
-- COMPLETION MESSAGE
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '============================================================================';
  RAISE NOTICE 'Database schema created successfully!';
  RAISE NOTICE 'Tables: users, programs, enrollments';
  RAISE NOTICE 'Triggers: updated_at, student_count, enrollment_validation, auto_complete';
  RAISE NOTICE 'Views: v_active_programs_stats';
  RAISE NOTICE 'Next step: Run 02-seed-users.sql to insert initial users';
  RAISE NOTICE '============================================================================';
END $$;

