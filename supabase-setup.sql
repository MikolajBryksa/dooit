-- ============================================
-- SUPABASE JWT SECURITY SETUP
-- ============================================
-- This script configures JWT-based authentication for the Dooit app
-- Prerequisites: Enable "Anonymous sign-ins" in Supabase Dashboard
-- (Authentication -> Settings -> Auth Providers -> Anonymous sign-ins)


-- ============================================
-- 0. CLEANUP - REMOVE EXISTING TABLES AND POLICIES
-- ============================================

-- Drop existing tables with CASCADE (automatically removes all policies, indexes, constraints)
DROP TABLE IF EXISTS public."Users" CASCADE;
DROP TABLE IF EXISTS public."Errors" CASCADE;
DROP TABLE IF EXISTS public."Contact" CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;
DROP TABLE IF EXISTS public.errors CASCADE;
DROP TABLE IF EXISTS public.contact CASCADE;


-- ============================================
-- 1. CREATE TABLES
-- ============================================

-- users table - stores user data and habits summary
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE SET NULL,
    user_name TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    habits_json JSONB,
    ai_summary TEXT
);

-- errors table - stores application errors for tracking
CREATE TABLE IF NOT EXISTS public.errors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    user_name TEXT,
    error_message TEXT NOT NULL,
    error_stack TEXT,
    context TEXT,
    app_version TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- contact table - stores user contact form submissions
CREATE TABLE IF NOT EXISTS public.contact (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    user_name TEXT,
    email TEXT NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_users_user_id ON public.users(user_id);
CREATE INDEX IF NOT EXISTS idx_users_updated_at ON public.users(updated_at);
CREATE INDEX IF NOT EXISTS idx_errors_user_id ON public.errors(user_id);
CREATE INDEX IF NOT EXISTS idx_errors_created_at ON public.errors(created_at);
CREATE INDEX IF NOT EXISTS idx_contact_created_at ON public.contact(created_at);


-- ============================================
-- 2. ROW LEVEL SECURITY - USERS TABLE
-- ============================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can insert their own data"
    ON public.users FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own data"
    ON public.users FOR SELECT TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own data"
    ON public.users FOR UPDATE TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);


-- ============================================
-- 3. ROW LEVEL SECURITY - ERRORS TABLE
-- ============================================
ALTER TABLE public.errors ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Authenticated users can insert errors"
    ON public.errors FOR INSERT TO authenticated
    WITH CHECK (true);

CREATE POLICY "Users can view their own errors"
    ON public.errors FOR SELECT TO authenticated
    USING (auth.uid() = user_id);


-- ============================================
-- 4. ROW LEVEL SECURITY - CONTACT TABLE
-- ============================================
ALTER TABLE public.contact ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Authenticated users can insert contact messages"
    ON public.contact FOR INSERT TO authenticated
    WITH CHECK (true);

CREATE POLICY "Users can view their own contact messages"
    ON public.contact FOR SELECT TO authenticated
    USING (auth.uid() = user_id);


-- ============================================
-- 5. VERIFICATION QUERIES
-- ============================================
-- Check if RLS is enabled on all tables
SELECT tablename, rowsecurity as "RLS Enabled"
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('users', 'errors', 'contact')
ORDER BY tablename;

-- Check if user_id column exists in users table
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'users'
AND column_name = 'user_id';

-- Check policies
SELECT tablename, policyname, cmd
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN ('users', 'errors', 'contact')
ORDER BY tablename, policyname;
