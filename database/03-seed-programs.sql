-- ============================================================================
-- COURSE MANAGEMENT SYSTEM - SEED PROGRAMS
-- ============================================================================
-- Version: 1.0.0
-- Description: Initial programs/courses for development and testing
-- Author: Course Management Team
-- Created: 2025-11-09
-- ============================================================================

-- ============================================================================
-- INITIAL PROGRAMS
-- ============================================================================

-- Program 1: Introduction to Web Development (ACTIVE)
-- Students can enroll in this program
INSERT INTO programs (
  id,
  name,
  description,
  start_date,
  end_date,
  status,
  instructor_id,
  max_students,
  current_students,
  metadata,
  created_at,
  updated_at
) VALUES (
  '10000000-0000-0000-0000-000000000001',
  'Introduction to Web Development',
  'Learn the fundamentals of HTML, CSS, and JavaScript to build modern web applications',
  '2025-01-15',
  '2025-04-15',
  'ACTIVE',
  '00000000-0000-0000-0000-000000000002',
  30,
  0,
  '{"level": "beginner", "duration": "3 months", "topics": ["HTML5", "CSS3", "JavaScript", "Responsive Design"]}',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
);

-- Program 2: Advanced React.js (PUBLISHED)
-- Visible but not accepting enrollments yet
INSERT INTO programs (
  id,
  name,
  description,
  start_date,
  end_date,
  status,
  instructor_id,
  max_students,
  current_students,
  metadata,
  created_at,
  updated_at
) VALUES (
  '10000000-0000-0000-0000-000000000002',
  'Advanced React.js',
  'Master React.js with hooks, context, Redux, and advanced patterns for building scalable applications',
  '2025-02-01',
  '2025-05-01',
  'PUBLISHED',
  '00000000-0000-0000-0000-000000000002',
  25,
  0,
  '{"level": "advanced", "duration": "3 months", "prerequisites": ["JavaScript", "React Basics"], "topics": ["Hooks", "Context API", "Redux", "Performance Optimization"]}',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
);

-- Program 3: Backend with Node.js and NestJS (DRAFT)
-- Not visible to students, still in preparation
INSERT INTO programs (
  id,
  name,
  description,
  start_date,
  end_date,
  status,
  instructor_id,
  max_students,
  current_students,
  metadata,
  created_at,
  updated_at
) VALUES (
  '10000000-0000-0000-0000-000000000003',
  'Backend with Node.js and NestJS',
  'Build scalable backend applications using Node.js, NestJS, TypeORM, and PostgreSQL',
  '2025-03-01',
  '2025-06-01',
  'DRAFT',
  '00000000-0000-0000-0000-000000000002',
  20,
  0,
  '{"level": "intermediate", "duration": "3 months", "prerequisites": ["JavaScript", "Node.js Basics"], "topics": ["NestJS", "TypeORM", "PostgreSQL", "REST APIs", "Authentication"]}',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
);

-- ============================================================================
-- COMPLETION MESSAGE
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '============================================================================';
  RAISE NOTICE 'Seed programs inserted successfully!';
  RAISE NOTICE '';
  RAISE NOTICE 'Programs created:';
  RAISE NOTICE '  - Introduction to Web Development (ACTIVE) - 30 students max';
  RAISE NOTICE '  - Advanced React.js (PUBLISHED) - 25 students max';
  RAISE NOTICE '  - Backend with Node.js and NestJS (DRAFT) - 20 students max';
  RAISE NOTICE '';
  RAISE NOTICE 'Program statuses:';
  RAISE NOTICE '  - ACTIVE: Accepting enrollments';
  RAISE NOTICE '  - PUBLISHED: Visible but not accepting enrollments';
  RAISE NOTICE '  - DRAFT: Not visible to students';
  RAISE NOTICE '';
  RAISE NOTICE 'Optional: Run 04-additional-programs.sql for more programs';
  RAISE NOTICE '============================================================================';
END $$;

