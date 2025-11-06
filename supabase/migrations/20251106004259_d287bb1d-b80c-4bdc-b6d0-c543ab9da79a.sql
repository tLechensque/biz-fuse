-- Atualizar configuração do bucket price-lists para suportar arquivos maiores
UPDATE storage.buckets
SET file_size_limit = 104857600  -- 100MB em bytes
WHERE id = 'price-lists';

-- Verificar a configuração atual
SELECT id, name, file_size_limit, public 
FROM storage.buckets 
WHERE id = 'price-lists';