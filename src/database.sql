-- Idempotent script: drop existing tables and policies, then recreate them.

-- First, drop all policies (no dependencies)
DROP POLICY IF EXISTS subscription_provider_select_public_or_owner ON subscription_provider;
DROP POLICY IF EXISTS subscription_provider_insert_with_owner ON subscription_provider;
DROP POLICY IF EXISTS subscription_provider_update_owned ON subscription_provider;
DROP POLICY IF EXISTS subscription_provider_delete_owned ON subscription_provider;

DROP POLICY IF EXISTS "Users can view public payment providers" ON payment_provider;
DROP POLICY IF EXISTS "Users can view own payment providers" ON payment_provider;
DROP POLICY IF EXISTS "Users can insert own payment providers" ON payment_provider;
DROP POLICY IF EXISTS "Users can update own payment providers" ON payment_provider;
DROP POLICY IF EXISTS "Users can delete own payment providers" ON payment_provider;

DROP POLICY IF EXISTS "Anyone can view payment provider comments" ON payment_provider_comments;
DROP POLICY IF EXISTS "Anyone can view subscription provider comments" ON subscription_provider_comments;
DROP POLICY IF EXISTS "Users can comment on pending payment providers" ON payment_provider_comments;
DROP POLICY IF EXISTS "Users can comment on pending subscription providers" ON subscription_provider_comments;
DROP POLICY IF EXISTS "Only admins can delete payment provider comments" ON payment_provider_comments;
DROP POLICY IF EXISTS "Only admins can delete subscription provider comments" ON subscription_provider_comments;

DROP POLICY IF EXISTS subscription_select_owned ON subscription;
DROP POLICY IF EXISTS subscription_insert_with_owner ON subscription;
DROP POLICY IF EXISTS subscription_update_owned ON subscription;
DROP POLICY IF EXISTS subscription_delete_owned ON subscription;

DROP POLICY IF EXISTS select_all_profiles ON public.profiles;
DROP POLICY IF EXISTS select_own_profile ON public.profiles;
DROP POLICY IF EXISTS "Allow users to insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Allow users to select their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

DROP POLICY IF EXISTS subscription_alerts_select_owned ON subscription_alerts;
DROP POLICY IF EXISTS subscription_alerts_insert_with_owner_or_admin_ops ON subscription_alerts;
DROP POLICY IF EXISTS subscription_alerts_update_owned ON subscription_alerts;
DROP POLICY IF EXISTS subscription_alerts_delete_owned_or_admin_ops ON subscription_alerts;

DROP POLICY IF EXISTS preferences_select_owned_or_admin_ops ON preferences;
DROP POLICY IF EXISTS preferences_insert_with_owner ON preferences;
DROP POLICY IF EXISTS preferences_update_owned ON preferences;
DROP POLICY IF EXISTS preferences_delete_owned ON preferences;

DROP POLICY IF EXISTS "Users can view own subscription history" ON subscription_history;
DROP POLICY IF EXISTS "Users can insert own subscription history" ON subscription_history;
DROP POLICY IF EXISTS "Users can delete own subscription history" ON subscription_history;

-- Drop triggers before functions
DROP TRIGGER IF EXISTS close_previous_state ON subscription_history;
DROP TRIGGER IF EXISTS after_user_insert ON auth.users;

-- Drop functions
DROP FUNCTION IF EXISTS close_previous_subscription_state;
DROP FUNCTION IF EXISTS public.create_profile;

-- Drop tables in dependency order
DROP TABLE IF EXISTS subscription_alerts CASCADE;
DROP TABLE IF EXISTS subscription_history CASCADE;
DROP TABLE IF EXISTS subscription_provider_comments CASCADE;
DROP TABLE IF EXISTS payment_provider_comments CASCADE;
DROP TABLE IF EXISTS subscription CASCADE;
DROP TABLE IF EXISTS preferences CASCADE;
DROP TABLE IF EXISTS subscription_provider CASCADE;
DROP TABLE IF EXISTS payment_provider CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- Drop indexes
DROP INDEX IF EXISTS idx_profiles_user_id;
DROP INDEX IF EXISTS idx_subscription_history_subscription_id;
DROP INDEX IF EXISTS idx_subscription_history_owner;
DROP INDEX IF EXISTS idx_subscription_history_state;
DROP INDEX IF EXISTS idx_subscription_history_dates;

-- Drop types last
DROP TYPE IF EXISTS subscription_state CASCADE;

-- Create subscription state enum
create type subscription_state as enum (
    'trial',
    'active',
    'paused',
    'canceled',
    'expired'
);

-- Create provider table
create table if not exists subscription_provider (
  id uuid primary key default gen_random_uuid(),
  owner uuid references auth.users null,
  name text not null,
  description text,
  icon text,
  category text default 'Uncategorized',
  website text,
  unsubscribe_url text,
  is_default boolean default false,
  is_public boolean default false,
  is_pending boolean default true,
  is_enabled boolean default true
);

create table if not exists payment_provider (
  id uuid primary key default gen_random_uuid(),
  owner uuid references auth.users null,
  name text not null,
  description text,
  icon text,
  category text default 'Uncategorized',
  website text,
  is_default boolean default false,
  is_public boolean default false,
  is_pending boolean default true,
  is_enabled boolean default true
);

-- Create comments tables
create table if not exists payment_provider_comments (
  id uuid primary key default gen_random_uuid(),
  payment_provider_id uuid references payment_provider(id) on delete cascade,
  comment text not null,
  created_at timestamp with time zone default now()
);

create table if not exists subscription_provider_comments (
  id uuid primary key default gen_random_uuid(),
  subscription_provider_id uuid references subscription_provider(id) on delete cascade,
  comment text not null,
  created_at timestamp with time zone default now()
);

-- Create preferences table
create table if not exists preferences (
  id uuid primary key default gen_random_uuid(),
  owner uuid references auth.users not null,
  title text not null,
  preference_key text not null,
  data_type text not null,
  available_values text[],
  preference_value text
);

create table if not exists subscription (
  id uuid primary key default gen_random_uuid(),
  owner uuid references auth.users not null,
  subscription_provider_id uuid references subscription_provider(id),
  nickname text,
  start_date date not null default current_date,
  autorenew boolean default false,
  renew_frequency text,
  amount numeric(10,2),
  payment_details text,
  notes text,
  state subscription_state not null default 'active',
  payment_provider_id uuid references payment_provider(id),
  recurrence_rule text
);

-- Create subscription_alerts table
create table if not exists subscription_alerts (
  id uuid primary key default gen_random_uuid(),
  subscription_id uuid references subscription(id),
  owner uuid references auth.users not null,
  title text not null,
  description text,
  severity text,
  created_at timestamp default current_timestamp,
  sent_at timestamp,
  read_at timestamp
);

-- Create subscription_history table
create table if not exists subscription_history (
  id uuid primary key default gen_random_uuid(),
  subscription_id uuid references subscription(id) on delete cascade,
  owner uuid references auth.users not null,
  state subscription_state not null,
  start_date timestamp with time zone not null default now(),
  end_date timestamp with time zone,
  reason text,
  notes text,
  created_at timestamp with time zone default now(),
  created_by uuid references auth.users not null
);

CREATE TABLE public.profiles (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references auth.users(id) on delete cascade,
    role text NOT NULL DEFAULT 'user',
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
alter table subscription_provider enable row level security;
alter table subscription enable row level security;
alter table preferences enable row level security;
alter table payment_provider enable row level security;
alter table subscription_alerts enable row level security;
alter table subscription_history enable row level security;
alter table payment_provider_comments enable row level security;
alter table subscription_provider_comments enable row level security;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

--------------------------------------------------------------------------------
-- SUBSCRIPTION_PROVIDER TABLE POLICIES
--------------------------------------------------------------------------------

-- Anyone can SELECT if is_public = true OR owner = auth.uid()
create policy subscription_provider_select_public_or_owner
  on subscription_provider
  for select
  using ( is_public or owner = auth.uid() );

-- Anyone can INSERT, but must ensure owner = auth.uid()
create policy subscription_provider_insert_with_owner
  on subscription_provider
  for insert
  with check ( owner = auth.uid() );

-- Only owner can UPDATE
create policy subscription_provider_update_owned
  on subscription_provider
  for update
  using ( owner = auth.uid() )
  with check ( owner = auth.uid() );

-- Only owner can DELETE
create policy subscription_provider_delete_owned
  on subscription_provider
  for delete
  using ( owner = auth.uid() );

--------------------------------------------------------------------------------
-- PAYMENT_PROVIDER TABLE POLICIES
--------------------------------------------------------------------------------

create policy "Users can view public payment providers"
  on payment_provider for select
  using (
    is_public = true OR owner = auth.uid()
  );

create policy "Users can view own payment providers" 
  on payment_provider for select
  using (auth.uid() = owner);

create policy "Users can insert own payment providers"
  on payment_provider for insert
  with check (auth.uid() = owner);

create policy "Users can update own payment providers"
  on payment_provider for update
  using (auth.uid() = owner)
  with check (auth.uid() = owner);

create policy "Users can delete own payment providers"
  on payment_provider for delete
  using (auth.uid() = owner);

--------------------------------------------------------------------------------
-- COMMENTS POLICIES
--------------------------------------------------------------------------------

-- Anyone authenticated can view comments
create policy "Anyone can view payment provider comments"
  on payment_provider_comments for select
  using (true);

create policy "Anyone can view subscription provider comments"
  on subscription_provider_comments for select
  using (true);

-- Anyone can comment on pending providers
create policy "Users can comment on pending payment providers"
  on payment_provider_comments for insert
  with check (
      exists (
          select 1 from payment_provider 
          where id = payment_provider_id 
          and is_pending = true
      )
  );

create policy "Users can comment on pending subscription providers"
  on subscription_provider_comments for insert
  with check (
      exists (
          select 1 from subscription_provider 
          where id = subscription_provider_id 
          and is_pending = true
      )
  );

-- Only admins can delete comments
create policy "Only admins can delete payment provider comments"
  on payment_provider_comments for delete
  using (
      exists (
          select 1 from profiles 
          where user_id = auth.uid() 
          and role = 'admin'
      )
  );

create policy "Only admins can delete subscription provider comments"
  on subscription_provider_comments for delete
  using (
      exists (
          select 1 from profiles 
          where user_id = auth.uid() 
          and role = 'admin'
      )
  );

--------------------------------------------------------------------------------
-- SUBSCRIPTION TABLE POLICIES
--------------------------------------------------------------------------------

-- Only owner can SELECT
create policy subscription_select_owned
  on subscription
  for select
  using ( owner = auth.uid() );

-- Only owner can INSERT
create policy subscription_insert_with_owner
  on subscription
  for insert
  with check ( owner = auth.uid() );

-- Only owner can UPDATE
create policy subscription_update_owned
  on subscription
  for update
  using ( owner = auth.uid() )
  with check ( owner = auth.uid() );

-- Only owner can DELETE
create policy subscription_delete_owned
  on subscription
  for delete
  using ( owner = auth.uid() );

---------------------------------
-- public.profiles
---------------------------------

CREATE INDEX idx_profiles_user_id ON public.profiles(user_id);

CREATE POLICY select_all_profiles ON public.profiles
FOR SELECT
USING (role = 'admin');

CREATE POLICY select_own_profile ON public.profiles
FOR SELECT
USING (user_id = (select auth.uid()));

ALTER TABLE public.profiles FORCE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.create_profile()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO public.profiles (user_id, created_at)
    VALUES (NEW.id, NOW());
    RETURN NEW;
END;
$$;

CREATE TRIGGER after_user_insert
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.create_profile();

-- Grant permissions for the trigger to create profiles
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON public.profiles TO postgres, anon, authenticated, service_role;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;

-- Update RLS policies for profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Allow any authenticated user to view their own profile
CREATE POLICY "Allow users to insert their own profile" 
ON public.profiles 
FOR INSERT 
TO authenticated 
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Allow users to select their own profile" 
ON public.profiles 
FOR SELECT 
TO authenticated 
USING (user_id = auth.uid());

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile" ON public.profiles
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Allow users to delete their own profile
CREATE POLICY "Users can delete own profile" ON public.profiles
FOR DELETE
USING (auth.uid() = user_id);

--------------------------------------------------------------------------------
-- SUBSCRIPTION_ALERTS TABLE POLICIES
--------------------------------------------------------------------------------

-- Only owner or admin/ops can SELECT
create policy subscription_alerts_select_owned
  on subscription_alerts
  for select
  using ( owner = auth.uid() );

-- Only owner or admin/ops can INSERT
create policy subscription_alerts_insert_with_owner_or_admin_ops
  on subscription_alerts
  for insert
  with check ( owner = auth.uid() OR EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role IN ('admin', 'ops')) );

-- Only owner can UPDATE
create policy subscription_alerts_update_owned
  on subscription_alerts
  for update
  using ( owner = auth.uid() )
  with check ( owner = auth.uid() );

-- Only owner or admin/ops can DELETE
create policy subscription_alerts_delete_owned_or_admin_ops
  on subscription_alerts
  for delete
  using ( owner = auth.uid() OR EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role IN ('admin', 'ops')) );

--------------------------------------------------------------------------------
-- PREFERENCES TABLE POLICIES
--------------------------------------------------------------------------------

-- Only owner can SELECT
create policy preferences_select_owned_or_admin_ops
  on preferences
  for select
  using ( owner = auth.uid() OR EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role IN ('admin', 'ops')) );

-- Only owner can INSERT
create policy preferences_insert_with_owner
  on preferences
  for insert
  with check ( owner = auth.uid() );

-- Only owner can UPDATE
create policy preferences_update_owned
  on preferences
  for update
  using ( owner = auth.uid() )
  with check ( owner = auth.uid() );

-- Only owner can DELETE
create policy preferences_delete_owned
  on preferences
  for delete
  using ( owner = auth.uid() );

--------------------------------
-- SAMPLE/STARTER DATA
--------------------------------

WITH user_id AS (
    SELECT id
    FROM auth.users
    ORDER BY created_at ASC
    LIMIT 1
)
INSERT INTO public.preferences (owner, title, preference_key, preference_value, data_type, available_values)
VALUES
  ((SELECT id FROM user_id), 'Default Alert Days Before Weekly Subscription Renewal', 'default_notification_days_before_weekly', '3', 'number', null),
  ((SELECT id FROM user_id), 'Default Alert Days Before Monthly Subscription Renewal', 'default_notification_days_before_monthly', '7', 'number', null),
  ((SELECT id FROM user_id), 'Default Alert Days Before Quarterly Subscription Renewal', 'default_notification_days_before_quarterly', '14', 'number', null),
  ((SELECT id FROM user_id), 'Default Alert Days Before Yearly Subscription Renewal', 'default_notification_days_before_yearly', '28', 'number', null),
  ((SELECT id FROM user_id), 'Default Alert Days Before Free Trial Ends', 'default_notification_days_before_free_trial_ends', '3', 'number', null),
  ((SELECT id FROM user_id), 'Theme', 'theme', 'auto', 'choice', ARRAY['Auto','Light', 'Dark']);

-- After re-creating database, make sure at-least the first user is an admin.
WITH user_id AS (
    SELECT id
    FROM auth.users
    ORDER BY created_at ASC
    LIMIT 1
)
INSERT INTO public.profiles (user_id, role) VALUES((SELECT id FROM user_id), 'admin');

-- Add a subscription alert
-- INSERT INTO public.subscription_alerts(subscription_id, owner, title, description, severity, sent_at)
-- VALUES((SELECT id FROM public.subscription WHERE subscription_provider_id IN (SELECT id FROM subscription_provider WHERE name = 'Netflix') LIMIT 1), 
--   (SELECT id FROM auth.users WHERE email = 'jdoe@example.com'), 
--   'Netflix Subscription Alert', 
--   'Your Nextflix subscription is due soon. Please make sure you have enough funds in your account.', 
--   'info', '2021-10-01 00:00:00')

-- RLS Policies for subscription_history

-- Only owner can SELECT
create policy "Users can view own subscription history"
    on subscription_history
    for select
    using (owner = auth.uid());

-- Only owner can INSERT
create policy "Users can insert own subscription history"
    on subscription_history
    for insert
    with check (
        owner = auth.uid() and
        created_by = auth.uid() and
        subscription_id in (
            select id from subscription where owner = auth.uid()
        )
    );

-- No UPDATE policy - history should be immutable

-- Only owner can DELETE (though generally discouraged)
create policy "Users can delete own subscription history"
    on subscription_history
    for delete
    using (owner = auth.uid());

-- Add indexes for performance
create index idx_subscription_history_subscription_id 
    on subscription_history(subscription_id);
create index idx_subscription_history_owner 
    on subscription_history(owner);
create index idx_subscription_history_state 
    on subscription_history(state);
create index idx_subscription_history_dates 
    on subscription_history(start_date, end_date);

-- Create a function to automatically close previous state when adding new one

-- Function for new subscriptions
CREATE OR REPLACE FUNCTION create_initial_subscription_history()
RETURNS trigger AS $$
BEGIN
    INSERT INTO subscription_history (
        subscription_id,
        owner,
        state,
        start_date,
        created_by
    ) VALUES (
        NEW.id,
        NEW.owner,
        NEW.state,
        CURRENT_TIMESTAMP,
        auth.uid()
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function for state changes
CREATE OR REPLACE FUNCTION handle_subscription_state_change()
RETURNS trigger AS $$
BEGIN
    -- Only proceed if state actually changed
    IF OLD.state = NEW.state THEN
        RETURN NEW;
    END IF;

    -- Close the previous state
    UPDATE subscription_history
    SET end_date = CURRENT_TIMESTAMP
    WHERE subscription_id = NEW.id
    AND end_date IS NULL;

    -- Create new state record
    INSERT INTO subscription_history (
        subscription_id,
        owner,
        state,
        start_date,
        created_by
    ) VALUES (
        NEW.id,
        NEW.owner,
        NEW.state,
        CURRENT_TIMESTAMP,
        auth.uid()
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers
DROP TRIGGER IF EXISTS create_initial_history ON subscription;
CREATE TRIGGER create_initial_history
    AFTER INSERT ON subscription
    FOR EACH ROW
    EXECUTE FUNCTION create_initial_subscription_history();

DROP TRIGGER IF EXISTS handle_state_change ON subscription;
CREATE TRIGGER handle_state_change
    AFTER UPDATE ON subscription
    FOR EACH ROW
    EXECUTE FUNCTION handle_subscription_state_change();