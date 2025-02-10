/*
  # Add question history tracking

  1. New Tables
    - `question_history`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `session_id` (uuid) - for tracking anonymous sessions
      - `question_id` (uuid, references rated_questions)
      - `selected_answer` (text)
      - `was_correct` (boolean)
      - `answered_at` (timestamptz)
      - `topic` (text)

  2. Security
    - Enable RLS
    - Add policies for authenticated and anonymous users
*/

-- Create question_history table
CREATE TABLE IF NOT EXISTS question_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  session_id uuid NOT NULL DEFAULT gen_random_uuid(),
  question_id uuid REFERENCES rated_questions(id),
  selected_answer text NOT NULL,
  was_correct boolean NOT NULL,
  answered_at timestamptz DEFAULT now(),
  topic text NOT NULL
);

-- Enable RLS
ALTER TABLE question_history ENABLE ROW LEVEL SECURITY;

-- Policies for question_history
CREATE POLICY "Users can see their own history"
  ON question_history
  FOR SELECT
  TO public
  USING (
    (auth.uid() IS NULL AND session_id IN (
      SELECT session_id FROM question_history 
      WHERE answered_at > now() - interval '24 hours'
      GROUP BY session_id 
      HAVING count(*) <= 20
    ))
    OR 
    (auth.uid() = user_id)
  );

CREATE POLICY "Anyone can insert history"
  ON question_history
  FOR INSERT
  TO public
  WITH CHECK (
    (auth.uid() IS NULL AND session_id IS NOT NULL) OR
    (auth.uid() = user_id)
  );

-- Function to get recent question history
CREATE OR REPLACE FUNCTION get_recent_questions(
  p_count integer DEFAULT 10,
  p_session_id uuid DEFAULT NULL
)
RETURNS TABLE (
  question text,
  selected_answer text,
  correct_answer text,
  was_correct boolean,
  topic text,
  answered_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    rq.question,
    qh.selected_answer,
    rq.correct_answer,
    qh.was_correct,
    qh.topic,
    qh.answered_at
  FROM question_history qh
  JOIN rated_questions rq ON qh.question_id = rq.id
  WHERE 
    (auth.uid() IS NOT NULL AND qh.user_id = auth.uid()) OR
    (auth.uid() IS NULL AND qh.session_id = p_session_id)
  ORDER BY qh.answered_at DESC
  LIMIT p_count;
END;
$$;
