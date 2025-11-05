-- Refatorar payment_methods para suportar maquininhas e bandeiras
ALTER TABLE public.payment_methods
  ADD COLUMN IF NOT EXISTS provider_type TEXT DEFAULT 'other',
  ADD COLUMN IF NOT EXISTS provider_name TEXT,
  ADD COLUMN IF NOT EXISTS card_brands_config JSONB DEFAULT '{}'::jsonb;

-- Comentário explicativo da estrutura card_brands_config:
-- {
--   "visa": {
--     "debit_fee": 2.5,
--     "credit_max_installments": 12,
--     "credit_interest_free": 3,
--     "credit_fees": [
--       {"installment": 1, "fee": 3.5},
--       {"installment": 2, "fee": 4.0}
--     ]
--   },
--   "mastercard": { ... },
--   "elo": { ... }
-- }