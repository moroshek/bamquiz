/*
  # Add rated questions tracking

  1. New Tables
    - `rated_questions`
      - `id` (uuid, primary key)
      - `question` (text) - The question text
      - `options` (text[]) - Array of answer options
      - `correct_answer` (text) - The correct answer
      - `explanation` (text) - Explanation of the answer
      - `fun_fact` (text, nullable) - Optional fun fact
      - `learn_more` (text, nullable) - Optional learning resources
      - `topic` (text) - The topic this question belongs to
      - `upvotes` (integer) - Number of upvotes
      - `downvotes` (integer) - Number of downvotes
      - `times_shown` (integer) - Number of times the question was shown
      - `created_at` (timestamptz) - When the question was created
      - `created_by` (uuid) - Reference to the user who created/rated the question first

    - `user_ratings`
      - `user_id` (uuid) - Reference to the user
      - `question_id` (uuid) - Reference to the question
      - `rating` (boolean) - true for upvote, false for downvote
      - `created_at` (timestamptz) - When the rating was given

  2. Security
    - Enable RLS on both tables
    - Add policies for:
      - Reading questions (public)
      - Rating questions (authenticated users)
      - Viewing ratings (authenticated users)

  3. Functions
    - `rate_question` - Handles upvoting/downvoting with proper constraints
*/

-- Create rated_questions table
CREATE TABLE IF NOT EXISTS rated_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question text NOT NULL,
  options text[] NOT NULL,
  correct_answer text NOT NULL,
  explanation text NOT NULL,
  fun_fact text,
  learn_more text,
  topic text NOT NULL,
  upvotes integer DEFAULT 0,
  downvotes integer DEFAULT 0,
  times_shown integer DEFAULT 1,
  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id),
  CONSTRAINT valid_options CHECK (array_length(options, 1) = 4),
  CONSTRAINT valid_answer CHECK (correct_answer = ANY(options))
);

-- Create user_ratings table
CREATE TABLE IF NOT EXISTS user_ratings (
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  question_id uuid REFERENCES rated_questions(id) ON DELETE CASCADE,
  rating boolean NOT NULL,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (user_id, question_id)
);

-- Enable RLS
ALTER TABLE rated_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_ratings ENABLE ROW LEVEL SECURITY;

-- Policies for rated_questions
CREATE POLICY "Anyone can read rated questions"
  ON rated_questions
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can insert questions"
  ON rated_questions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

-- Policies for user_ratings
CREATE POLICY "Users can see their own ratings"
  ON user_ratings
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can rate questions"
  ON user_ratings
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their ratings"
  ON user_ratings
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Function to rate a question
CREATE OR REPLACE FUNCTION rate_question(
  question_id uuid,
  is_upvote boolean
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  existing_rating boolean;
BEGIN
  -- Check if user has already rated this question
  SELECT rating INTO existing_rating
  FROM user_ratings
  WHERE user_id = auth.uid()
  AND question_id = rate_question.question_id;

  IF existing_rating IS NULL THEN
    -- Insert new rating
    INSERT INTO user_ratings (user_id, question_id, rating)
    VALUES (auth.uid(), rate_question.question_id, rate_question.is_upvote);

    -- Update question counts
    UPDATE rated_questions
    SET 
      upvotes = CASE WHEN rate_question.is_upvote THEN upvotes + 1 ELSE upvotes END,
      downvotes = CASE WHEN NOT rate_question.is_upvote THEN downvotes + 1 ELSE downvotes END
    WHERE id = rate_question.question_id;
  ELSIF existing_rating != rate_question.is_upvote THEN
    -- Update existing rating
    UPDATE user_ratings
    SET rating = rate_question.is_upvote
    WHERE user_id = auth.uid()
    AND question_id = rate_question.question_id;

    -- Update question counts
    UPDATE rated_questions
    SET 
      upvotes = CASE 
        WHEN rate_question.is_upvote THEN upvotes + 1
        ELSE upvotes - 1
      END,
      downvotes = CASE 
        WHEN NOT rate_question.is_upvote THEN downvotes + 1
        ELSE downvotes - 1
      END
    WHERE id = rate_question.question_id;
  END IF;
END;
$$;
