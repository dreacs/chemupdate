-- Create the news table
CREATE TABLE news (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text UNIQUE NOT NULL,
  summary text,
  sentiment text,
  commodity text,
  source text,
  link text,
  published_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Note: Depending on your RLS (Row Level Security) settings, you might need to enable policies.
-- For a simple MVP without auth, you can disable RLS or allow anon inserts/selects:
-- ALTER TABLE news DISABLE ROW LEVEL SECURITY;
