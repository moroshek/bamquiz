/*
  # Add quiz sharing functionality

  1. New Tables
    - `shared_quizzes`
      - `id` (uuid, primary key)
      - `creator_id` (uuid, references auth.users)
      - `share_code` (text, unique)
      - `created_at` (timestamptz)
      - `expires_at` (timestamptz)
      - `question_count` (integer)
      - `topic` (text)

    - `shared_quiz_attempts`
      - `id` (uuid, primary key)
      - `shared_quiz_id` (uuid, references shared_quizzes)
      - `user_id` (uuid, references auth.users)
      - `player_name` (text)
      - `score` (integer)
      - `completed_at` (timestamptz)

  2. Security
    - Enable RLS
    - Add policies for public access to shared quizzes
*/

-- Create shared_quizzes table
CREATE TABLE IF NOT EXISTS shared_quizzes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id uuid REFERENCES auth.users(id),
  share_code text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz NOT NULL,
  question_count integer NOT NULL,
  topic text NOT NULL,
  questions uuid[] NOT NULL,
  CONSTRAINT valid_question_count CHECK (array_length(questions, 1) = question_count)
);

-- Create shared_quiz_attempts table
CREATE TABLE IF NOT EXISTS shared_quiz_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shared_quiz_id uuid REFERENCES shared_quizzes(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id),
  player_name text NOT NULL,
  score integer NOT NULL,
  completed_at timestamptz DEFAULT now(),
  answers jsonb NOT NULL
);

-- Enable RLS
ALTER TABLE shared_quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE shared_quiz_attempts ENABLE ROW LEVEL SECURITY;

-- Policies for shared_quizzes
CREATE POLICY "Anyone can read shared quizzes"
  ON shared_quizzes
  FOR SELECT
  TO public
  USING (expires_at > now());

CREATE POLICY "Users can create shared quizzes"
  ON shared_quizzes
  FOR INSERT
  TO authenticated
  WITH CHECK (creator_id = auth.uid());

-- Policies for shared_quiz_attempts
CREATE POLICY "Anyone can read quiz attempts"
  ON shared_quiz_attempts
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can create quiz attempts"
  ON shared_quiz_attempts
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Function to create a shared quiz
CREATE OR REPLACE FUNCTION create_shared_quiz(
  p_question_count integer,
  p_topic text
)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_share_code text;
  v_quiz_id uuid;
  v_questions uuid[];
BEGIN
  -- Generate a random 6-character share code
  v_share_code := upper(substring(md5(random()::text) from 1 for 6));
  
  -- Get the most recent questions for the user/session
  SELECT array_agg(question_id)
  INTO v_questions
  FROM (
    SELECT DISTINCT question_id
    FROM question_history
    WHERE user_id = auth.uid()
    ORDER BY answered_at DESC
    LIMIT p_question_count
  ) sq;

  -- Create the shared quiz
  INSERT INTO shared_quizzes (
    creator_id,
    share_code,
    expires_at,
    question_count,
    topic,
    questions
  ) VALUES (
    auth.uid(),
    v_share_code,
    now() + interval '7 days',
    p_question_count,
    p_topic,
    v_questions
  );

  RETURN v_share_code;
END;
$$;

-- Function to get shared quiz details
CREATE OR REPLACE FUNCTION get_shared_quiz(
  p_share_code text
)
RETURNS TABLE (
  quiz_id uuid,
  creator_name text,
  topic text,
  question_count integer,
  questions json[],
  attempts json[]
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    sq.id,
    p.email as creator_name,
    sq.topic,
    sq.question_count,
    array_agg(DISTINCT jsonb_build_object(
      'id', rq.id,
      'question', rq.question,
      'options', rq.options,
      'correct_answer', rq.correct_answer,
      'explanation', rq.explanation,
      'fun_fact', rq.fun_fact,
      'learn_more', rq.learn_more
    )::json) as questions,
    array_agg(DISTINCT jsonb_build_object(
      'player_name', sqa.player_name,
      'score', sqa.score,
      'completed_at', sqa.completed_at
    )::json) as attempts
  FROM shared_quizzes sq
  JOIN profiles p ON sq.creator_id = p.id
  JOIN rated_questions rq ON rq.id = ANY(sq.questions)
  LEFT JOIN shared_quiz_attempts sqa ON sqa.shared_quiz_id = sq.id
  WHERE sq.share_code = p_share_code
  AND sq.expires_at > now()
  GROUP BY sq.id, p.email;
END;
$$;
