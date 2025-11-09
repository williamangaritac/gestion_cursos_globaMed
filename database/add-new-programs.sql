-- Add 5 new programs: 4 ACTIVE and 1 PUBLISHED
-- Instructor ID: 00000000-0000-0000-0000-000000000002 (John Instructor)

-- 1. ACTIVE - Full Stack Development with MERN
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
  '{"level": "intermediate", "duration": "5 months", "prerequisites": ["JavaScript", "HTML", "CSS"]}',
  NOW(),
  NOW()
);

-- 2. ACTIVE - Python for Data Science
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
  '{"level": "beginner", "duration": "3 months", "tools": ["Pandas", "NumPy", "Matplotlib", "Scikit-learn"]}',
  NOW(),
  NOW()
);

-- 3. ACTIVE - Mobile Development with React Native
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
  '{"level": "intermediate", "duration": "3 months", "prerequisites": ["React", "JavaScript"]}',
  NOW(),
  NOW()
);

-- 4. ACTIVE - DevOps and Cloud Computing
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
  '{"level": "advanced", "duration": "4 months", "tools": ["Docker", "Kubernetes", "Jenkins", "Terraform"]}',
  NOW(),
  NOW()
);

-- 5. PUBLISHED - Cybersecurity Fundamentals
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
  '{"level": "beginner", "duration": "3 months", "topics": ["Network Security", "Cryptography", "Penetration Testing"]}',
  NOW(),
  NOW()
);

