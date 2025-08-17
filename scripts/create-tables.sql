-- Create the assessment_results table
CREATE TABLE IF NOT EXISTS assessment_results (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  company VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  host_name VARCHAR(255) NOT NULL,
  score INTEGER NOT NULL,
  passed BOOLEAN NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create an index on completed_at for better query performance
CREATE INDEX IF NOT EXISTS idx_assessment_results_completed_at 
ON assessment_results(completed_at);

-- Create an index on host_name for filtering results by host
CREATE INDEX IF NOT EXISTS idx_assessment_results_host_name 
ON assessment_results(host_name);

-- Create an index on passed status for reporting
CREATE INDEX IF NOT EXISTS idx_assessment_results_passed 
ON assessment_results(passed);
