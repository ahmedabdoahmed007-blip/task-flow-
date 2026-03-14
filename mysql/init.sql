USE taskflow_db;

INSERT INTO tasks (title, done) VALUES
  ('Complete Lab 1 - Explore containers',     TRUE),
  ('Complete Lab 2 - Containerize backend',   TRUE),
  ('Complete Lab 3 - Multi-stage build',      TRUE),
  ('Complete Lab 4 - Custom networking',      TRUE),
  ('Complete Lab 5 - Docker Compose',         FALSE),
  ('Complete Lab 6 - Why Kubernetes?',        FALSE),
  ('Deploy TaskFlow on Kubernetes',           FALSE);