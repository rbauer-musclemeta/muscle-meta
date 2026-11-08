-- Reconstructed from production's supabase_migrations.schema_migrations
-- (version 20250425191103). The recorded statements carried literal "\n"
-- sequences and split the plpgsql body of get_activity_summary at its inner
-- semicolons, so they cannot be replayed verbatim. This file is the same SQL
-- with real newlines and the function body rejoined; nothing else changed.
-- Every table it creates is moved to the `legacy` schema by
-- 20260912224651_archive_legacy_schema, and get_activity_summary is dropped
-- by 20260912225020_security_hardening.

-- Create custom types
CREATE TYPE ability_level AS ENUM ('beginner', 'intermediate', 'advanced');
CREATE TYPE activity_type AS ENUM ('indoor', 'outdoor', 'work', 'travel', 'sport');
CREATE TYPE goal_type AS ENUM ('performance', 'health', 'fitness', 'rehabilitation');

-- Users table extending auth.users
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  full_name text,
  ability_level ability_level DEFAULT 'beginner',
  has_completed_assessment boolean DEFAULT false,
  daily_activity_goal interval DEFAULT '3 minutes'::interval,
  preferred_activity_types activity_type[] DEFAULT '{indoor}'::activity_type[]
);

-- Assessments table
CREATE TABLE IF NOT EXISTS assessments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  joint_pain jsonb DEFAULT '{}',
  medical_conditions text[],
  functional_capacity int CHECK (functional_capacity BETWEEN 1 AND 10),
  daily_challenges text[],
  preferred_activities activity_type[],
  sport_specific_goals text[]
);

-- Goals table
CREATE TABLE IF NOT EXISTS goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  goal_type goal_type NOT NULL,
  description text NOT NULL,
  target_value numeric,
  target_date date,
  is_achieved boolean DEFAULT false,
  progress numeric DEFAULT 0
);

-- Activity logs table
CREATE TABLE IF NOT EXISTS activity_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) NOT NULL,
  created_at timestamptz DEFAULT now(),
  activity_type activity_type NOT NULL,
  duration interval NOT NULL,
  intensity_level int CHECK (intensity_level BETWEEN 1 AND 10),
  notes text,
  related_goal_id uuid REFERENCES goals(id)
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can read own assessments"
  ON assessments FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own assessments"
  ON assessments FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can read own goals"
  ON goals FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own goals"
  ON goals FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can read own activity logs"
  ON activity_logs FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own activity logs"
  ON activity_logs FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- Create functions for analytics
CREATE OR REPLACE FUNCTION get_activity_summary(user_id uuid, time_range interval)
RETURNS TABLE (
  total_duration interval,
  total_sessions bigint,
  avg_intensity numeric
) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
  SELECT 
    sum(duration) as total_duration,
    count(*) as total_sessions,
    avg(intensity_level)::numeric as avg_intensity
  FROM activity_logs
  WHERE 
    activity_logs.user_id = get_activity_summary.user_id
    AND created_at > now() - time_range;
END;
$$;
