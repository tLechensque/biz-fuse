import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ImageUpload } from '@/components/ui/image-upload';
import { TagsInput } from '@/components/ui/tags-input';
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
  
  const [imageUrls, setImageUrls] = useState<string[]>(product?.image_urls || []);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { profile } = useProfile();

  // Load existing tags when editing a product
  const { data: existingProductTags = [] } = useQuery({
    queryKey: ['product-tags', product?.id],
    queryFn: async () => {
      if (!product?.id) return [];
      
      const { data, error } = await supabase
        .from('product_tags')
        .select(`
          tag_id,
          tags!inner(name)
        `)
        .eq('product_id', product.id);

      if (error) throw error;
      return data.map((pt: any) => pt.tags.name);
    },
    enabled: !!product?.id,
  });

  // Update selected tags when existing tags are loaded
  useEffect(() => {
    if (product && existingProductTags.length > 0) {
      setSelectedTags(existingProductTags);
    } else if (!product) {
      setSelectedTags([]);
    }
  }, [product, existingProductTags]);

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
        image_urls: imageUrls,
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

      // Handle tags - first get or create product to get its ID
      let productId = product?.id;
      if (!product) {
        const { data: newProduct, error: productError } = await supabase
          .from('products')
          .select('id')
          .eq('organization_id', profile.organization_id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();
        
        if (productError) throw productError;
        productId = newProduct.id;
      }

      // Remove existing product tags
      if (productId) {
        await supabase
          .from('product_tags')
          .delete()
          .eq('product_id', productId);

        // Add new tags
        if (selectedTags.length > 0) {
          // Get or create tags
          const tagIds = [];
          for (const tagName of selectedTags) {
            let { data: existingTag } = await supabase
              .from('tags')
              .select('id')
              .eq('name', tagName)
              .eq('organization_id', profile.organization_id)
              .maybeSingle();

            if (!existingTag) {
              const { data: newTag, error: tagError } = await supabase
                .from('tags')
                .insert({
                  name: tagName,
                  organization_id: profile.organization_id
                })
                .select('id')
                .single();

              if (tagError) throw tagError;
              existingTag = newTag;
            }

            tagIds.push(existingTag.id);
          }

          // Link tags to product
          const productTags = tagIds.map(tagId => ({
            product_id: productId,
            tag_id: tagId
          }));

          const { error: linkError } = await supabase
            .from('product_tags')
            .insert(productTags);

          if (linkError) throw linkError;
        }
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

  // Input validation and sanitization functions
  const sanitizeInput = (input: string): string => {
    return input.trim().replace(/[<>"/]/g, '');
  };

  const validateUrl = (url: string): boolean => {
    if (!url) return true; // Optional field
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Sanitize text inputs
    const sanitizedName = sanitizeInput(formData.name);
    const sanitizedDescription = sanitizeInput(formData.simple_description);
    const sanitizedFullDescription = sanitizeInput(formData.full_description);
    const sanitizedBrand = sanitizeInput(formData.brand || '');
    const sanitizedSku = sanitizeInput(formData.sku || '');
    
    if (!sanitizedName.trim()) {
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

    if (formData.video_url && !validateUrl(formData.video_url)) {
      toast({
        title: 'URL de vídeo inválida',
        description: 'Por favor, insira uma URL válida para o vídeo.',
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

    // Update form data with sanitized values
    const sanitizedFormData = {
      ...formData,
      name: sanitizedName,
      simple_description: sanitizedDescription,
      full_description: sanitizedFullDescription,
      brand: sanitizedBrand,
      sku: sanitizedSku
    };
    
    mutation.mutate(sanitizedFormData);
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
          <Select value={formData.category_id || "none"} onValueChange={(value) => handleInputChange('category_id', value === "none" ? "" : value)}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione uma categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Sem categoria</SelectItem>
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

      <ImageUpload
        images={imageUrls}
        onImagesChange={setImageUrls}
        maxImages={5}
      />

      <TagsInput
        selectedTags={selectedTags}
        onTagsChange={setSelectedTags}
        placeholder="Digite uma tag e pressione Enter..."
      />

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