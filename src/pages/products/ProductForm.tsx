import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ImageUpload } from '@/components/ui/image-upload';
import { TagsInput } from '@/components/ui/tags-input';
import { Combobox, ComboboxOption } from '@/components/ui/combobox';
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
    video_url: product?.video_url || '',
    category_id: product?.category_id || '',
    brand_id: product?.brand_id || '',
    unit_id: product?.unit_id || '',
    use_fixed_pricing: product?.use_fixed_pricing || false,
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

  const { data: brands = [] } = useQuery({
    queryKey: ['brands'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('brands')
        .select('*')
        .order('name');

      if (error) throw error;
      return data;
    },
  });

  // Buscar desconto da marca selecionada e calcular custo automaticamente
  const selectedBrand = brands.find((b: any) => b.id === formData.brand_id);
  
  useEffect(() => {
    if (!formData.use_fixed_pricing && selectedBrand && formData.sell_price > 0) {
      const discountPercentage = selectedBrand.discount_percentage || 0;
      const calculatedCost = formData.sell_price * (1 - discountPercentage / 100);
      setFormData(prev => ({ ...prev, cost_price: Number(calculatedCost.toFixed(2)) }));
    }
  }, [formData.sell_price, formData.brand_id, formData.use_fixed_pricing, selectedBrand]);

  const { data: units = [] } = useQuery({
    queryKey: ['units'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('units')
        .select('*')
        .order('name');

      if (error) throw error;
      return data;
    },
  });

  const createCategory = async (name: string) => {
    if (!profile?.organization_id) return;
    
    const { data, error } = await supabase
      .from('categories')
      .insert({ name, organization_id: profile.organization_id })
      .select()
      .single();

    if (error) {
      toast({
        title: 'Erro ao criar categoria',
        description: error.message,
        variant: 'destructive',
      });
      return;
    }

    queryClient.invalidateQueries({ queryKey: ['categories'] });
    handleInputChange('category_id', data.id);
    toast({
      title: 'Categoria criada',
      description: 'A categoria foi criada com sucesso.',
    });
  };

  const createBrand = async (name: string) => {
    if (!profile?.organization_id) return;
    
    const { data, error } = await supabase
      .from('brands')
      .insert({ name, organization_id: profile.organization_id })
      .select()
      .single();

    if (error) {
      toast({
        title: 'Erro ao criar marca',
        description: error.message,
        variant: 'destructive',
      });
      return;
    }

    queryClient.invalidateQueries({ queryKey: ['brands'] });
    handleInputChange('brand_id', data.id);
    toast({
      title: 'Marca criada',
      description: 'A marca foi criada com sucesso.',
    });
  };

  const createUnit = async (name: string) => {
    if (!profile?.organization_id) return;
    
    const { data, error } = await supabase
      .from('units')
      .insert({ name, organization_id: profile.organization_id })
      .select()
      .single();

    if (error) {
      toast({
        title: 'Erro ao criar unidade',
        description: error.message,
        variant: 'destructive',
      });
      return;
    }

    queryClient.invalidateQueries({ queryKey: ['units'] });
    handleInputChange('unit_id', data.id);
    toast({
      title: 'Unidade criada',
      description: 'A unidade foi criada com sucesso.',
    });
  };

  const mutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      if (!profile?.organization_id) {
        throw new Error('Organização não encontrada');
      }

      const payload = {
        name: data.name,
        sku: data.sku || null,
        full_description: data.full_description || null,
        simple_description: data.simple_description || null,
        cost_price: Number(data.cost_price),
        sell_price: Number(data.sell_price),
        category_id: data.category_id || null,
        brand_id: data.brand_id || null,
        unit_id: data.unit_id || null,
        video_url: data.video_url || null,
        organization_id: profile.organization_id,
        image_urls: imageUrls,
        use_fixed_pricing: data.use_fixed_pricing,
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
          <Combobox
            options={brands.map((brand): ComboboxOption => ({
              value: brand.id,
              label: brand.name,
            }))}
            value={formData.brand_id}
            onValueChange={(value) => handleInputChange('brand_id', value)}
            onCreateNew={createBrand}
            placeholder="Selecione ou crie uma marca"
            emptyText="Nenhuma marca encontrada"
            createNewText="Criar marca"
            searchPlaceholder="Buscar marca..."
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">Categoria</Label>
          <Combobox
            options={categories.map((category): ComboboxOption => ({
              value: category.id,
              label: category.name,
            }))}
            value={formData.category_id}
            onValueChange={(value) => handleInputChange('category_id', value)}
            onCreateNew={createCategory}
            placeholder="Selecione ou crie uma categoria"
            emptyText="Nenhuma categoria encontrada"
            createNewText="Criar categoria"
            searchPlaceholder="Buscar categoria..."
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
            disabled={!formData.use_fixed_pricing && !!selectedBrand}
          />
          {!formData.use_fixed_pricing && selectedBrand && (
            <p className="text-xs text-muted-foreground">
              Calculado automaticamente: {selectedBrand.discount_percentage}% de desconto
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label>Margem</Label>
          <div className={`p-2 rounded border ${parseFloat(margin) < 35 ? 'bg-destructive/10 text-destructive' : 'bg-accent/10 text-accent'}`}>
            {margin}%
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-2 p-4 bg-muted/50 rounded-lg">
        <input
          type="checkbox"
          id="use_fixed_pricing"
          checked={formData.use_fixed_pricing}
          onChange={(e) => setFormData(prev => ({ ...prev, use_fixed_pricing: e.target.checked }))}
          className="h-4 w-4 rounded border-input"
        />
        <div>
          <Label htmlFor="use_fixed_pricing" className="cursor-pointer font-medium">
            Usar preço fixo
          </Label>
          <p className="text-xs text-muted-foreground mt-1">
            Marque esta opção se o custo for fixo. Caso contrário, será calculado automaticamente com base no desconto da marca.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="unit">Unidade</Label>
          <Combobox
            options={units.map((unit): ComboboxOption => ({
              value: unit.id,
              label: unit.name,
            }))}
            value={formData.unit_id}
            onValueChange={(value) => handleInputChange('unit_id', value)}
            onCreateNew={createUnit}
            placeholder="Selecione ou crie uma unidade"
            emptyText="Nenhuma unidade encontrada"
            createNewText="Criar unidade"
            searchPlaceholder="Buscar unidade..."
          />
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