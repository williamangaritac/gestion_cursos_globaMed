-- ============================================================================
-- COURSE MANAGEMENT SYSTEM - ADDITIONAL PROGRAMS
-- ============================================================================
-- Version: 1.0.0
-- Description: Additional programs to expand the course catalog
-- Author: Course Management Team
-- Created: 2025-11-09
-- Note: This is optional. Run after 03-seed-programs.sql
-- ============================================================================

-- ============================================================================
-- ADDITIONAL PROGRAMS (5 programs: 4 ACTIVE, 1 PUBLISHED)
-- ============================================================================

-- Program 4: Full Stack Development with MERN (ACTIVE)
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
  '20000000-0000-0000-0000-000000000001',
  'Full Stack Development with MERN',
  'Master MongoDB, Express, React, and Node.js to build complete web applications from scratch',
  '2025-01-20',
  '2025-06-20',
  'ACTIVE',
  '00000000-0000-0000-0000-000000000002',
  35,
  0,
  '{"level": "intermediate", "duration": "5 months", "prerequisites": ["JavaScript", "HTML", "CSS"], "topics": ["MongoDB", "Express.js", "React", "Node.js", "REST APIs"]}',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
);

-- Program 5: Python for Data Science (ACTIVE)
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
  '20000000-0000-0000-0000-000000000002',
  'Python for Data Science',
  'Learn Python programming with focus on data analysis, visualization, and machine learning fundamentals',
  '2025-02-01',
  '2025-05-01',
  'ACTIVE',
  '00000000-0000-0000-0000-000000000002',
  40,
  0,
  '{"level": "beginner", "duration": "3 months", "tools": ["Pandas", "NumPy", "Matplotlib", "Scikit-learn"], "topics": ["Python Basics", "Data Analysis", "Data Visualization", "Machine Learning Intro"]}',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
);

-- Program 6: Mobile Development with React Native (ACTIVE)
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
  '20000000-0000-0000-0000-000000000003',
  'Mobile Development with React Native',
  'Build cross-platform mobile applications for iOS and Android using React Native and Expo',
  '2025-01-25',
  '2025-04-25',
  'ACTIVE',
  '00000000-0000-0000-0000-000000000002',
  30,
  0,
  '{"level": "intermediate", "duration": "3 months", "prerequisites": ["React", "JavaScript"], "topics": ["React Native", "Expo", "Mobile UI/UX", "Native APIs", "App Deployment"]}',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
);

-- Program 7: DevOps and Cloud Computing (ACTIVE)
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
  '20000000-0000-0000-0000-000000000004',
  'DevOps and Cloud Computing',
  'Master Docker, Kubernetes, CI/CD pipelines, and cloud platforms (AWS, Azure, GCP)',
  '2025-02-10',
  '2025-06-10',
  'ACTIVE',
  '00000000-0000-0000-0000-000000000002',
  25,
  0,
  '{"level": "advanced", "duration": "4 months", "tools": ["Docker", "Kubernetes", "Jenkins", "Terraform", "AWS"], "topics": ["Containerization", "Orchestration", "CI/CD", "Infrastructure as Code", "Cloud Services"]}',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
);

-- Program 8: Cybersecurity Fundamentals (PUBLISHED)
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
  '20000000-0000-0000-0000-000000000005',
  'Cybersecurity Fundamentals',
  'Learn essential cybersecurity concepts, network security, ethical hacking, and security best practices',
  '2025-03-01',
  '2025-06-01',
  'PUBLISHED',
  '00000000-0000-0000-0000-000000000002',
  30,
  0,
  '{"level": "beginner", "duration": "3 months", "topics": ["Network Security", "Cryptography", "Penetration Testing", "Security Best Practices", "Ethical Hacking"]}',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
);

-- ============================================================================
-- COMPLETION MESSAGE
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '============================================================================';
  RAISE NOTICE 'Additional programs inserted successfully!';
  RAISE NOTICE '';
  RAISE NOTICE 'Programs created:';
  RAISE NOTICE '  - Full Stack Development with MERN (ACTIVE) - 35 students max';
  RAISE NOTICE '  - Python for Data Science (ACTIVE) - 40 students max';
  RAISE NOTICE '  - Mobile Development with React Native (ACTIVE) - 30 students max';
  RAISE NOTICE '  - DevOps and Cloud Computing (ACTIVE) - 25 students max';
  RAISE NOTICE '  - Cybersecurity Fundamentals (PUBLISHED) - 30 students max';
  RAISE NOTICE '';
  RAISE NOTICE 'Total programs in system: 8';
  RAISE NOTICE '  - 5 ACTIVE (accepting enrollments)';
  RAISE NOTICE '  - 2 PUBLISHED (visible, not accepting enrollments)';
  RAISE NOTICE '  - 1 DRAFT (not visible to students)';
  RAISE NOTICE '============================================================================';
END $$;

