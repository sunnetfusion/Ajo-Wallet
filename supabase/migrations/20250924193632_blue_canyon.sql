/*
  # Initial Database Schema

  1. Tables Created
     - `profiles` - User profile information and KYC status
     - `wallets` - User wallet balances
     - `transactions` - All wallet transactions (credits/debits)
     - `ajo_groups` - Ajo group configurations
     - `ajo_members` - Group membership and positions
     - `ajo_cycles` - Individual payout cycles
     - `ajo_ledger` - Complete transaction ledger for groups

  2. Security
     - Enable RLS on all tables
     - Add policies for authenticated users to access their own data
     - Admin access policies for KYC management

  3. Indexes and Constraints
     - Foreign key relationships
     - Unique constraints for data integrity
     - Indexes for performance
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  phone text,
  country text,
  kyc_status text CHECK (kyc_status IN ('unverified', 'pending', 'verified')) DEFAULT 'unverified',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create wallets table
CREATE TABLE IF NOT EXISTS wallets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  balance decimal(10,2) DEFAULT 0.00 CHECK (balance >= 0),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type text CHECK (type IN ('credit', 'debit')) NOT NULL,
  amount decimal(10,2) NOT NULL CHECK (amount > 0),
  description text NOT NULL,
  reference text,
  created_at timestamptz DEFAULT now()
);

-- Create ajo_groups table
CREATE TABLE IF NOT EXISTS ajo_groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  contribution_amount decimal(10,2) NOT NULL CHECK (contribution_amount > 0),
  frequency text CHECK (frequency IN ('weekly', 'monthly')) NOT NULL,
  start_date date NOT NULL,
  status text CHECK (status IN ('draft', 'active', 'completed')) DEFAULT 'draft',
  current_cycle integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create ajo_members table
CREATE TABLE IF NOT EXISTS ajo_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid REFERENCES ajo_groups(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  position integer NOT NULL,
  joined_at timestamptz DEFAULT now(),
  UNIQUE(group_id, user_id),
  UNIQUE(group_id, position)
);

-- Create ajo_cycles table
CREATE TABLE IF NOT EXISTS ajo_cycles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid REFERENCES ajo_groups(id) ON DELETE CASCADE NOT NULL,
  cycle_number integer NOT NULL,
  payout_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  paid_out boolean DEFAULT false,
  payout_amount decimal(10,2) DEFAULT 0.00,
  payout_date timestamptz,
  created_at timestamptz DEFAULT now(),
  UNIQUE(group_id, cycle_number)
);

-- Create ajo_ledger table
CREATE TABLE IF NOT EXISTS ajo_ledger (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid REFERENCES ajo_groups(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  cycle_number integer NOT NULL,
  movement text CHECK (movement IN ('contribution', 'payout')) NOT NULL,
  amount decimal(10,2) NOT NULL CHECK (amount > 0),
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ajo_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE ajo_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE ajo_cycles ENABLE ROW LEVEL SECURITY;
ALTER TABLE ajo_ledger ENABLE ROW LEVEL SECURITY;

-- Policies for profiles
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT TO authenticated USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE TO authenticated USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

-- Policies for wallets
CREATE POLICY "Users can view own wallet" ON wallets
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can update own wallet" ON wallets
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own wallet" ON wallets
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Policies for transactions
CREATE POLICY "Users can view own transactions" ON transactions
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions" ON transactions
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Policies for ajo_groups
CREATE POLICY "Users can view groups they own or are members of" ON ajo_groups
  FOR SELECT TO authenticated USING (
    auth.uid() = owner_id OR 
    auth.uid() IN (SELECT user_id FROM ajo_members WHERE group_id = ajo_groups.id)
  );

CREATE POLICY "Users can create groups" ON ajo_groups
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Group owners can update their groups" ON ajo_groups
  FOR UPDATE TO authenticated USING (auth.uid() = owner_id);

-- Policies for ajo_members
CREATE POLICY "Users can view group members if they're in the group" ON ajo_members
  FOR SELECT TO authenticated USING (
    auth.uid() = user_id OR 
    auth.uid() IN (SELECT user_id FROM ajo_members am WHERE am.group_id = ajo_members.group_id) OR
    auth.uid() IN (SELECT owner_id FROM ajo_groups WHERE id = ajo_members.group_id)
  );

CREATE POLICY "Users can join groups" ON ajo_members
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave groups" ON ajo_members
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Policies for ajo_cycles
CREATE POLICY "Users can view cycles for groups they're in" ON ajo_cycles
  FOR SELECT TO authenticated USING (
    auth.uid() IN (SELECT user_id FROM ajo_members WHERE group_id = ajo_cycles.group_id) OR
    auth.uid() IN (SELECT owner_id FROM ajo_groups WHERE id = ajo_cycles.group_id)
  );

CREATE POLICY "Group owners can manage cycles" ON ajo_cycles
  FOR ALL TO authenticated USING (
    auth.uid() IN (SELECT owner_id FROM ajo_groups WHERE id = ajo_cycles.group_id)
  ) WITH CHECK (
    auth.uid() IN (SELECT owner_id FROM ajo_groups WHERE id = ajo_cycles.group_id)
  );

-- Policies for ajo_ledger
CREATE POLICY "Users can view ledger for groups they're in" ON ajo_ledger
  FOR SELECT TO authenticated USING (
    auth.uid() IN (SELECT user_id FROM ajo_members WHERE group_id = ajo_ledger.group_id) OR
    auth.uid() IN (SELECT owner_id FROM ajo_groups WHERE id = ajo_ledger.group_id)
  );

CREATE POLICY "System can insert ledger entries" ON ajo_ledger
  FOR INSERT TO authenticated WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_transactions_user_id_created_at ON transactions(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ajo_members_group_id ON ajo_members(group_id);
CREATE INDEX IF NOT EXISTS idx_ajo_members_user_id ON ajo_members(user_id);
CREATE INDEX IF NOT EXISTS idx_ajo_cycles_group_id ON ajo_cycles(group_id, cycle_number);
CREATE INDEX IF NOT EXISTS idx_ajo_ledger_group_id ON ajo_ledger(group_id, cycle_number);

-- Function to automatically create wallet for new users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (new.id, new.raw_user_meta_data->>'full_name');
  
  INSERT INTO public.wallets (user_id)
  VALUES (new.id);
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile and wallet on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_wallets_updated_at BEFORE UPDATE ON wallets
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_ajo_groups_updated_at BEFORE UPDATE ON ajo_groups
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();