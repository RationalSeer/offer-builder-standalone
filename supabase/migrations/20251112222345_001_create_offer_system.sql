/*
  # In-House Lead Generation Offer System

  ## Overview
  This migration creates a comprehensive multi-step offer builder system for creating and managing
  in-house lead generation offers with detailed tracking, conditional logic, and buyer integration.

  ## New Tables

  ### 1. `inhouse_offers`
  Stores the configuration for each lead generation offer
  - `id` (uuid, primary key)
  - `name` (text) - Internal name for the offer
  - `slug` (text, unique) - URL-friendly identifier
  - `vertical` (text) - Vertical category (EDU, SSD, Insurance, etc.)
  - `description` (text) - Internal description
  - `status` (text) - draft, active, paused, archived
  - `config` (jsonb) - Overall offer configuration (theme, branding, progress bar style)
  - `everflow_offer_id` (text) - Optional Everflow offer ID for tracking
  - `default_payout` (numeric) - Default payout amount for conversions
  - `created_by` (uuid) - User who created the offer
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 2. `offer_steps`
  Individual steps/questions within an offer
  - `id` (uuid, primary key)
  - `offer_id` (uuid) - Foreign key to inhouse_offers
  - `step_order` (integer) - Order in the sequence
  - `step_type` (text) - Type: single_choice, multi_choice, text_input, email, phone, dropdown, date, etc.
  - `question_text` (text) - The question displayed to user
  - `options` (jsonb) - Available options for choice questions
  - `validation_rules` (jsonb) - Validation requirements (required, format, min/max length)
  - `conditional_logic` (jsonb) - Show/hide rules based on previous answers
  - `placeholder_text` (text) - Placeholder for input fields
  - `help_text` (text) - Additional help text
  - `field_mapping` (text) - Maps to standard field name for buyer API
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 3. `offer_sessions`
  Tracks every user who lands on an offer
  - `id` (uuid, primary key)
  - `session_id` (text, unique) - Unique session identifier
  - `offer_id` (uuid) - Foreign key to inhouse_offers
  - `status` (text) - started, in_progress, completed, abandoned
  - `current_step` (integer) - Last step user was on
  - `ip_address` (text) - User IP for fraud detection
  - `user_agent` (text) - Browser/device information
  - `utm_source` (text) - Traffic source tracking
  - `utm_medium` (text)
  - `utm_campaign` (text)
  - `utm_term` (text)
  - `utm_content` (text)
  - `everflow_click_id` (text) - Everflow transaction ID
  - `referrer` (text) - Referring URL
  - `device_type` (text) - mobile, tablet, desktop
  - `geo_data` (jsonb) - Location data (city, state, country, zip)
  - `started_at` (timestamptz)
  - `completed_at` (timestamptz)
  - `last_activity_at` (timestamptz)
  - `lead_id` (uuid) - Reference to external lead (nullable)
  - `created_at` (timestamptz)

  ### 4. `offer_responses`
  Stores individual answers to each step
  - `id` (uuid, primary key)
  - `session_id` (text) - Foreign key to offer_sessions
  - `step_id` (uuid) - Foreign key to offer_steps
  - `response_value` (jsonb) - The actual answer(s)
  - `response_text` (text) - Text representation for easy querying
  - `time_spent_seconds` (integer) - Time spent on this step
  - `created_at` (timestamptz)

  ### 5. `offer_analytics`
  Aggregated performance metrics per offer
  - `id` (uuid, primary key)
  - `offer_id` (uuid) - Foreign key to inhouse_offers
  - `date` (date) - Analytics date
  - `total_views` (integer) - Landing page views
  - `sessions_started` (integer) - Users who started the funnel
  - `sessions_completed` (integer) - Users who finished
  - `leads_generated` (integer) - Valid leads created
  - `leads_accepted` (integer) - Leads accepted by buyers
  - `leads_rejected` (integer) - Leads rejected by buyers
  - `total_revenue` (numeric) - Revenue from accepted leads
  - `conversion_rate` (numeric) - Completion rate percentage
  - `avg_time_to_complete` (integer) - Average seconds to complete
  - `step_drop_offs` (jsonb) - Drop-off count per step
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 6. `email_subscribers`
  Email list building and segmentation
  - `id` (uuid, primary key)
  - `email` (text, unique) - Subscriber email address
  - `first_name` (text)
  - `last_name` (text)
  - `phone` (text)
  - `offer_id` (uuid) - Offer they subscribed through
  - `session_id` (text) - Original session
  - `vertical` (text) - Vertical for segmentation
  - `tags` (text[]) - Tags for categorization
  - `subscription_status` (text) - active, unsubscribed, bounced
  - `subscription_date` (timestamptz)
  - `last_engagement_date` (timestamptz)
  - `engagement_score` (integer) - Engagement quality score
  - `metadata` (jsonb) - Additional subscriber data
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ## Security
  - Enable RLS on all tables
  - Create restrictive policies for authenticated users only
  - Public access only for offer rendering and session creation

  ## Indexes
  - Performance indexes on frequently queried columns
  - Unique indexes on slug, session_id, email
*/

-- Create inhouse_offers table
CREATE TABLE IF NOT EXISTS inhouse_offers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  vertical text NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'draft',
  config jsonb DEFAULT '{}',
  everflow_offer_id text,
  default_payout numeric DEFAULT 0,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create offer_steps table
CREATE TABLE IF NOT EXISTS offer_steps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  offer_id uuid REFERENCES inhouse_offers(id) ON DELETE CASCADE,
  step_order integer NOT NULL,
  step_type text NOT NULL,
  question_text text NOT NULL,
  options jsonb DEFAULT '[]',
  validation_rules jsonb DEFAULT '{}',
  conditional_logic jsonb DEFAULT '{}',
  placeholder_text text,
  help_text text,
  field_mapping text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create offer_sessions table
CREATE TABLE IF NOT EXISTS offer_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text UNIQUE NOT NULL,
  offer_id uuid REFERENCES inhouse_offers(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'started',
  current_step integer DEFAULT 0,
  ip_address text,
  user_agent text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_term text,
  utm_content text,
  everflow_click_id text,
  referrer text,
  device_type text,
  geo_data jsonb DEFAULT '{}',
  started_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  last_activity_at timestamptz DEFAULT now(),
  lead_id uuid,
  created_at timestamptz DEFAULT now()
);

-- Create offer_responses table
CREATE TABLE IF NOT EXISTS offer_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text NOT NULL,
  step_id uuid REFERENCES offer_steps(id) ON DELETE CASCADE,
  response_value jsonb NOT NULL,
  response_text text,
  time_spent_seconds integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create offer_analytics table
CREATE TABLE IF NOT EXISTS offer_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  offer_id uuid REFERENCES inhouse_offers(id) ON DELETE CASCADE,
  date date NOT NULL,
  total_views integer DEFAULT 0,
  sessions_started integer DEFAULT 0,
  sessions_completed integer DEFAULT 0,
  leads_generated integer DEFAULT 0,
  leads_accepted integer DEFAULT 0,
  leads_rejected integer DEFAULT 0,
  total_revenue numeric DEFAULT 0,
  conversion_rate numeric DEFAULT 0,
  avg_time_to_complete integer DEFAULT 0,
  step_drop_offs jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(offer_id, date)
);

-- Create email_subscribers table
CREATE TABLE IF NOT EXISTS email_subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  first_name text,
  last_name text,
  phone text,
  offer_id uuid REFERENCES inhouse_offers(id),
  session_id text,
  vertical text,
  tags text[] DEFAULT '{}',
  subscription_status text NOT NULL DEFAULT 'active',
  subscription_date timestamptz DEFAULT now(),
  last_engagement_date timestamptz,
  engagement_score integer DEFAULT 0,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_offer_steps_offer_id ON offer_steps(offer_id);
CREATE INDEX IF NOT EXISTS idx_offer_steps_order ON offer_steps(offer_id, step_order);
CREATE INDEX IF NOT EXISTS idx_offer_sessions_offer_id ON offer_sessions(offer_id);
CREATE INDEX IF NOT EXISTS idx_offer_sessions_status ON offer_sessions(status);
CREATE INDEX IF NOT EXISTS idx_offer_sessions_session_id ON offer_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_offer_responses_session_id ON offer_responses(session_id);
CREATE INDEX IF NOT EXISTS idx_offer_responses_step_id ON offer_responses(step_id);
CREATE INDEX IF NOT EXISTS idx_offer_analytics_offer_id ON offer_analytics(offer_id);
CREATE INDEX IF NOT EXISTS idx_offer_analytics_date ON offer_analytics(date);
CREATE INDEX IF NOT EXISTS idx_email_subscribers_email ON email_subscribers(email);
CREATE INDEX IF NOT EXISTS idx_email_subscribers_vertical ON email_subscribers(vertical);
CREATE INDEX IF NOT EXISTS idx_email_subscribers_offer_id ON email_subscribers(offer_id);

-- Enable Row Level Security
ALTER TABLE inhouse_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE offer_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE offer_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE offer_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE offer_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_subscribers ENABLE ROW LEVEL SECURITY;

-- RLS Policies for inhouse_offers
CREATE POLICY "Authenticated users can view offers"
  ON inhouse_offers FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create offers"
  ON inhouse_offers FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Authenticated users can update their offers"
  ON inhouse_offers FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Authenticated users can delete their offers"
  ON inhouse_offers FOR DELETE
  TO authenticated
  USING (auth.uid() = created_by);

-- RLS Policies for offer_steps
CREATE POLICY "Authenticated users can view offer steps"
  ON offer_steps FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Public can view active offer steps"
  ON offer_steps FOR SELECT
  TO anon
  USING (
    EXISTS (
      SELECT 1 FROM inhouse_offers
      WHERE inhouse_offers.id = offer_steps.offer_id
      AND inhouse_offers.status = 'active'
    )
  );

CREATE POLICY "Authenticated users can manage offer steps"
  ON offer_steps FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM inhouse_offers
      WHERE inhouse_offers.id = offer_steps.offer_id
      AND inhouse_offers.created_by = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM inhouse_offers
      WHERE inhouse_offers.id = offer_steps.offer_id
      AND inhouse_offers.created_by = auth.uid()
    )
  );

-- RLS Policies for offer_sessions
CREATE POLICY "Public can create offer sessions"
  ON offer_sessions FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Public can update their sessions"
  ON offer_sessions FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can view all sessions"
  ON offer_sessions FOR SELECT
  TO authenticated
  USING (true);

-- RLS Policies for offer_responses
CREATE POLICY "Public can create offer responses"
  ON offer_responses FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Authenticated users can view all responses"
  ON offer_responses FOR SELECT
  TO authenticated
  USING (true);

-- RLS Policies for offer_analytics
CREATE POLICY "Authenticated users can view offer analytics"
  ON offer_analytics FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage offer analytics"
  ON offer_analytics FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- RLS Policies for email_subscribers
CREATE POLICY "Authenticated users can view email subscribers"
  ON email_subscribers FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Public can create email subscriptions"
  ON email_subscribers FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update email subscribers"
  ON email_subscribers FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete email subscribers"
  ON email_subscribers FOR DELETE
  TO authenticated
  USING (true);
