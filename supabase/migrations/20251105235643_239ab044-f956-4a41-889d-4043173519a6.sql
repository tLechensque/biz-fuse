-- Adicionar coluna brand_ids em suppliers para armazenar marcas associadas
ALTER TABLE public.suppliers ADD COLUMN brand_ids uuid[] DEFAULT '{}';

-- Comentário: Esta coluna permite que um fornecedor esteja associado a múltiplas marcas