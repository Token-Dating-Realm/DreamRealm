-- 008_wallets_and_transactions.sql
-- Phase 5 ready — DreamCoin ledger

CREATE TYPE transaction_type AS ENUM (
    'deposit',
    'withdrawal',
    'tip',
    'gift',
    'unlock',
    'subscription',
    'stream_payment',
    'creator_payout',
    'referral_bonus',
    'adjustment'
);

CREATE TABLE public.wallets (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    balance integer NOT NULL DEFAULT 0 CHECK (balance >= 0),
    lifetime_earned integer NOT NULL DEFAULT 0 CHECK (lifetime_earned >= 0),
    lifetime_spent integer NOT NULL DEFAULT 0 CHECK (lifetime_spent >= 0),
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),

    CONSTRAINT one_wallet_per_user UNIQUE (user_id)
);

CREATE TRIGGER wallets_updated_at
    BEFORE UPDATE ON public.wallets
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.transactions (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    wallet_id uuid NOT NULL REFERENCES public.wallets(id) ON DELETE CASCADE,
    type transaction_type NOT NULL,
    amount integer NOT NULL,
    description text CHECK (char_length(description) <= 500),
    reference_id uuid,
    reference_table text CHECK (char_length(reference_table) <= 64),
    metadata jsonb,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_transactions_wallet ON public.transactions(wallet_id);
CREATE INDEX idx_transactions_type ON public.transactions(type);
CREATE INDEX idx_transactions_created ON public.transactions(created_at);

ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Users can view their own wallet
CREATE POLICY wallets_self_read ON public.wallets
    FOR SELECT USING (auth.uid() = user_id);

-- Users can view their own transactions
CREATE POLICY transactions_self_read ON public.transactions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.wallets w
            WHERE w.id = transactions.wallet_id AND w.user_id = auth.uid()
        )
    );

-- Admin full access
CREATE POLICY wallets_admin_all ON public.wallets
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users u
            WHERE u.id = auth.uid() AND u.role IN ('admin', 'system')
        )
    );

CREATE POLICY transactions_admin_all ON public.transactions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users u
            WHERE u.id = auth.uid() AND u.role IN ('admin', 'system')
        )
    );

-- Trigger: auto-create wallet on user creation
CREATE OR REPLACE FUNCTION public.handle_new_wallet()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.wallets (user_id) VALUES (NEW.id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_user_created_wallet
    AFTER INSERT ON public.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_wallet();
