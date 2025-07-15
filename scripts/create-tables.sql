-- Create users table to store TPH assessment results
CREATE TABLE IF NOT EXISTS tph_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  age INTEGER,
  score INTEGER NOT NULL CHECK (score >= 0 AND score <= 100),
  persona VARCHAR(100) NOT NULL,
  referral_code VARCHAR(20) UNIQUE,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create referral_codes table for tracking referral relationships
CREATE TABLE IF NOT EXISTS referral_codes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code VARCHAR(20) UNIQUE NOT NULL,
  owner_id UUID REFERENCES tph_users(id) ON DELETE CASCADE,
  owner_name VARCHAR(255) NOT NULL,
  owner_score INTEGER NOT NULL,
  is_valid BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_tph_users_referral_code ON tph_users(referral_code);
CREATE INDEX IF NOT EXISTS idx_referral_codes_code ON referral_codes(code);
CREATE INDEX IF NOT EXISTS idx_tph_users_score ON tph_users(score);

-- Add RLS (Row Level Security) policies
ALTER TABLE tph_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_codes ENABLE ROW LEVEL SECURITY;

-- Allow public read access to referral codes for verification
CREATE POLICY "Allow public read access to referral codes" ON referral_codes
  FOR SELECT USING (true);

-- Allow public insert access to both tables
CREATE POLICY "Allow public insert access to tph_users" ON tph_users
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public insert access to referral_codes" ON referral_codes
  FOR INSERT WITH CHECK (true);

-- Allow public read access to user data (for leaderboards, etc.)
CREATE POLICY "Allow public read access to tph_users" ON tph_users
  FOR SELECT USING (true);
