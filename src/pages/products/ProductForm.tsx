import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useProfile } from '@/hooks/useProfile';
import { Product } from './ProductsPage';

interface ProductFormProps {
  product?: Product | null;
  onClose: () => void;
}

export const ProductForm: React.FC<ProductFormProps> = ({ product, onClose }) => {
  const [formData, setFormData] = useState({
    name: product?.name || '',
    sku: product?.sku || '',
    full_description: product?.full_description || '',
    simple_description: product?.simple_description || '',
    cost_price: product?.cost_price || 0,
    sell_price: product?.sell_price || 0,
    brand: product?.brand || '',
    unit: product?.unit || 'pç',
    video_url: product?.video_url || '',
    category_id: product?.category_id || '',
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { profile } = useProfile();

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (error) throw error;
      return data;
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      if (!profile?.organization_id) {
        throw new Error('Organização não encontrada');
      }

      const payload = {
        ...data,
        cost_price: Number(data.cost_price),
        sell_price: Number(data.sell_price),
        category_id: data.category_id || null,
        organization_id: profile.organization_id,
      };

      if (product) {
        const { error } = await supabase
          .from('products')
          .update(payload)
          .eq('id', product.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('products')
          .insert(payload);

        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast({
        title: product ? 'Produto atualizado' : 'Produto criado',
        description: product 
          ? 'O produto foi atualizado com sucesso.'
          : 'O produto foi criado com sucesso.',
      });
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao salvar produto',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast({
        title: 'Erro de validação',
        description: 'O nome do produto é obrigatório.',
        variant: 'destructive',
      });
      return;
    }

    if (formData.cost_price <= 0 || formData.sell_price <= 0) {
      toast({
        title: 'Erro de validação',
        description: 'Os preços devem ser maiores que zero.',
        variant: 'destructive',
      });
      return;
    }

    if (formData.sell_price <= formData.cost_price) {
      toast({
        title: 'Atenção',
        description: 'O preço de venda é menor ou igual ao custo. Verifique os valores.',
        variant: 'destructive',
      });
    }

    mutation.mutate(formData);
  };

  const handleInputChange = (field: keyof typeof formData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const margin = formData.sell_price > 0 && formData.cost_price > 0 
    ? (((formData.sell_price - formData.cost_price) / formData.sell_price) * 100).toFixed(1)
    : '0.0';

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nome do Produto *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            placeholder="Nome do produto"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="sku">SKU</Label>
          <Input
            id="sku"
            value={formData.sku}
            onChange={(e) => handleInputChange('sku', e.target.value)}
            placeholder="Código do produto"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="simple_description">Descrição Simples *</Label>
        <Input
          id="simple_description"
          value={formData.simple_description}
          onChange={(e) => handleInputChange('simple_description', e.target.value)}
          placeholder="Descrição resumida do produto"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="full_description">Descrição Completa *</Label>
        <Textarea
          id="full_description"
          value={formData.full_description}
          onChange={(e) => handleInputChange('full_description', e.target.value)}
          placeholder="Descrição detalhada do produto"
          rows={3}
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="brand">Marca</Label>
          <Input
            id="brand"
            value={formData.brand}
            onChange={(e) => handleInputChange('brand', e.target.value)}
            placeholder="Marca do produto"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">Categoria</Label>
          <Select value={formData.category_id} onValueChange={(value) => handleInputChange('category_id', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione uma categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Sem categoria</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="cost_price">Preço de Custo *</Label>
          <Input
            id="cost_price"
            type="number"
            step="0.01"
            min="0"
            value={formData.cost_price}
            onChange={(e) => handleInputChange('cost_price', parseFloat(e.target.value) || 0)}
            placeholder="0,00"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="sell_price">Preço de Venda *</Label>
          <Input
            id="sell_price"
            type="number"
            step="0.01"
            min="0"
            value={formData.sell_price}
            onChange={(e) => handleInputChange('sell_price', parseFloat(e.target.value) || 0)}
            placeholder="0,00"
            required
          />
        </div>

        <div className="space-y-2">
          <Label>Margem</Label>
          <div className={`p-2 rounded border ${parseFloat(margin) < 35 ? 'bg-destructive/10 text-destructive' : 'bg-accent/10 text-accent'}`}>
            {margin}%
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="unit">Unidade</Label>
          <Select value={formData.unit} onValueChange={(value) => handleInputChange('unit', value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pç">Peça</SelectItem>
              <SelectItem value="m">Metro</SelectItem>
              <SelectItem value="m²">Metro²</SelectItem>
              <SelectItem value="m³">Metro³</SelectItem>
              <SelectItem value="kg">Quilograma</SelectItem>
              <SelectItem value="l">Litro</SelectItem>
              <SelectItem value="cx">Caixa</SelectItem>
              <SelectItem value="par">Par</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="video_url">URL do Vídeo</Label>
          <Input
            id="video_url"
            type="url"
            value={formData.video_url}
            onChange={(e) => handleInputChange('video_url', e.target.value)}
            placeholder="https://youtube.com/watch?v=..."
          />
        </div>
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancelar
        </Button>
        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending 
            ? (product ? 'Atualizando...' : 'Criando...') 
            : (product ? 'Atualizar' : 'Criar')
          }
        </Button>
      </div>
    </form>
  );
};