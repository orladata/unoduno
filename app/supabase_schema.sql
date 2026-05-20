-- ============================================================================
-- SQL SCHEMA FOR PREPAID CREDIT SYSTEM (PAY-AS-YOU-GO)
-- ============================================================================

-- 1. Alter profiles table to add credit balance in cents (default is 0)
ALTER TABLE IF EXISTS public.profiles 
ADD COLUMN IF NOT EXISTS credit_balance INTEGER NOT NULL DEFAULT 0;

-- 2. Create transactions table to track payment histories
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
CREATE POLICY "Users can view their own transactions" 
ON public.transactions 
FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);

-- 3. Create SECURE database function (RPC) to atomically increment credits
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

-- 4. Create SECURE database function (RPC) to atomically decrement credits (prevents race conditions!)
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
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
