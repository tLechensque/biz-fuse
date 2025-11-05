-- Adicionar campo para permitir entrada + parcelamento
ALTER TABLE public.payment_methods
  ADD COLUMN IF NOT EXISTS allow_down_payment BOOLEAN DEFAULT false;