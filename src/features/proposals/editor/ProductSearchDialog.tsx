import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useProfile } from '@/hooks/useProfile';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Package } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Props {
  open: boolean;
  onClose: () => void;
  onSelect: (product: any) => void;
}

export function ProductSearchDialog({ open, onClose, onSelect }: Props) {
  const { profile } = useProfile();
  const [searchTerm, setSearchTerm] = useState('');

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products-search', profile?.organization_id, searchTerm],
    queryFn: async () => {
      let query = supabase
        .from('products')
        .select(`
          *,
          brands (id, name),
          categories (name)
        `)
        .eq('organization_id', profile!.organization_id);

      if (searchTerm) {
        query = query.or(`name.ilike.%${searchTerm}%,sku.ilike.%${searchTerm}%`);
      }

      const { data, error } = await query.order('name').limit(50);
      if (error) throw error;
      return data;
    },
    enabled: open && !!profile?.organization_id,
  });

  const handleSelect = (product: any) => {
    onSelect({
      productId: product.id,
      productName: product.name,
      brandId: product.brands?.id,
      brandName: product.brands?.name,
      model: product.unit,
      sku: product.sku,
      qty: 1,
      unitPrice: Number(product.sell_price || 0),
      subtotal: Number(product.sell_price || 0),
      simpleDescription: product.simple_description,
      detailedDescription: product.full_description,
      imageUrl: product.image_url,
    });
    onClose();
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Buscar Produto</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome ou SKU..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
              autoFocus
            />
          </div>

          <ScrollArea className="h-[400px]">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <p className="text-muted-foreground">Carregando produtos...</p>
              </div>
            ) : products.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Package className="w-12 h-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  {searchTerm ? 'Nenhum produto encontrado' : 'Digite para buscar produtos'}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {products.map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted cursor-pointer transition-colors"
                    onClick={() => handleSelect(product)}
                  >
                    {product.image_url && (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-16 h-16 object-cover rounded"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium truncate">{product.name}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        {product.brands && (
                          <Badge variant="outline" className="text-xs">
                            {product.brands.name}
                          </Badge>
                        )}
                        {product.sku && (
                          <span className="text-xs text-muted-foreground font-mono">
                            {product.sku}
                          </span>
                        )}
                      </div>
                      {product.simple_description && (
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                          {product.simple_description}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg">
                        {formatCurrency(Number(product.sell_price || 0))}
                      </p>
                      {product.stock !== null && (
                        <p className="text-xs text-muted-foreground">
                          Estoque: {product.stock}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}
