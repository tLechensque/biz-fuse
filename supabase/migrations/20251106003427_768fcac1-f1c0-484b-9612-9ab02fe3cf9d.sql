-- Adicionar campo de desconto padrão nas marcas
ALTER TABLE public.brands 
ADD COLUMN discount_percentage numeric DEFAULT 0 CHECK (discount_percentage >= 0 AND discount_percentage <= 100);

COMMENT ON COLUMN public.brands.discount_percentage IS 'Porcentagem de desconto padrão da marca sobre o valor de venda';

-- Adicionar campo para indicar se o produto usa precificação fixa ou percentual
ALTER TABLE public.products 
ADD COLUMN use_fixed_pricing boolean DEFAULT false;

COMMENT ON COLUMN public.products.use_fixed_pricing IS 'Se true, usa cost_price fixo. Se false, calcula automaticamente baseado no desconto da marca';