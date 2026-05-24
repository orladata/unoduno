-- ============================================================================
-- SQL SCHEMA FOR PREPAID CREDIT SYSTEM (PAY-AS-YOU-GO) & PROFILES SETUP
-- ============================================================================

-- 1. Create public.profiles table (linked to Supabase auth.users) if it doesn't exist
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    credit_balance INTEGER NOT NULL DEFAULT 0, -- em centavos (ex: R$ 10.00 = 1000)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS) on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
DROP POLICY IF EXISTS "Allow public read access to profiles" ON public.profiles;
CREATE POLICY "Allow public read access to profiles" 
ON public.profiles FOR SELECT 
USING (true);

DROP POLICY IF EXISTS "Allow users to update their own profiles" ON public.profiles;
CREATE POLICY "Allow users to update their own profiles" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = id);

-- 2. Trigger to automatically create a profile when a new user signs up in auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, credit_balance)
    VALUES (new.id, new.email, 0)
    ON CONFLICT (id) DO NOTHING;
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger (safely dropping first if it exists to prevent duplicate execution errors)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. Backfill existing users from auth.users to public.profiles
INSERT INTO public.profiles (id, email, credit_balance)
SELECT id, email, 0 FROM auth.users
ON CONFLICT (id) DO NOTHING;

-- 4. Create transactions table to track payment histories
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    stripe_session_id TEXT UNIQUE NOT NULL,
    amount INTEGER NOT NULL, -- em centavos (ex: R$ 10.00 = 1000)
    status TEXT NOT NULL CHECK (status IN ('pending', 'completed', 'failed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS) on transactions
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Create policies for transactions
DROP POLICY IF EXISTS "Users can view their own transactions" ON public.transactions;
CREATE POLICY "Users can view their own transactions" 
ON public.transactions 
FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);

-- 5. Create SECURE database function (RPC) to atomically increment credits
CREATE OR REPLACE FUNCTION public.increment_credits(
    target_user_id UUID, 
    amount_cents INTEGER
)
RETURNS VOID AS $$
BEGIN
    UPDATE public.profiles
    SET credit_balance = COALESCE(credit_balance, 0) + amount_cents
    WHERE id = target_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Create SECURE database function (RPC) to atomically decrement credits (prevents race conditions!)
CREATE OR REPLACE FUNCTION public.decrement_credits(
    target_user_id UUID, 
    amount_cents INTEGER
)
RETURNS BOOLEAN AS $$
DECLARE
    current_balance INTEGER;
BEGIN
    -- Fetch the balance using Row locking to avoid concurrent double-spending issues
    SELECT COALESCE(credit_balance, 0) INTO current_balance
    FROM public.profiles 
    WHERE id = target_user_id
    FOR UPDATE;

    IF current_balance >= amount_cents THEN
        UPDATE public.profiles
        SET credit_balance = credit_balance - amount_cents
        WHERE id = target_user_id;
        RETURN TRUE;
    ELSE
        RETURN FALSE;
    END If;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
