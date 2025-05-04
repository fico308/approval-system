CREATE TABLE IF NOT EXISTS plans (
  id CHAR(12) PRIMARY KEY,
  submit_date DATE NOT NULL,
  plan_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  description TEXT NOT NULL,
  alternative TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  feedback TEXT DEFAULT ''
);