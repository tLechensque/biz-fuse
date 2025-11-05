import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search, Edit, Trash2, Package, FileUp } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useDebounce } from '@/hooks/useDebounce';
import { ProductForm } from './ProductForm';
import { ImportProductsModal } from '@/components/ImportProductsModal';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

export interface Product {
  id: string;
  name: string;
  sku?: string;
  full_description: string;
  simple_description: string;
  cost_price: number;
  sell_price: number;
  brand?: string;
  brand_id?: string;
  unit?: string;
  unit_id?: string;
  video_url?: string;
  image_urls?: string[];
  category_id?: string;
  stock?: number;
  organization_id: string;
  created_at: string;
  updated_at: string;
}

const ProductsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 400);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [brandFilter, setBrandFilter] = useState<string>('');
  const [tagFilter, setTagFilter] = useState<string>('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('id, name')
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
        .select('id, name')
        .order('name');
      if (error) throw error;
      return data;
    },
  });

  const { data: tags = [] } = useQuery({
    queryKey: ['tags'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tags')
        .select('id, name')
        .order('name');
      if (error) throw error;
      return data;
    },
  });

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products', debouncedSearchTerm, categoryFilter, brandFilter, tagFilter],
    queryFn: async () => {
      let query = supabase
        .from('products')
        .select('*')
        .order('name');

      if (debouncedSearchTerm) {
        query = query.or(`name.ilike.%${debouncedSearchTerm}%,sku.ilike.%${debouncedSearchTerm}%,brand.ilike.%${debouncedSearchTerm}%`);
      }

      if (categoryFilter) {
        query = query.eq('category_id', categoryFilter);
      }

      if (brandFilter) {
        query = query.eq('brand_id', brandFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      
      let filteredData = data as Product[];
      
      // Apply tag filter if selected
      if (tagFilter) {
        const { data: productTags, error: tagError } = await supabase
          .from('product_tags')
          .select('product_id')
          .eq('tag_id', tagFilter);
        
        if (!tagError && productTags) {
          const productIds = productTags.map(pt => pt.product_id);
          filteredData = filteredData.filter(p => productIds.includes(p.id));
        }
      }
      
      return filteredData;
    },
  });

  const deleteProductMutation = useMutation({
    mutationFn: async (productId: string) => {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast({
        title: 'Produto excluído',
        description: 'O produto foi excluído com sucesso.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao excluir produto',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);
    setIsFormOpen(true);
  };

  const handleNewProduct = () => {
    setSelectedProduct(null);
    setIsFormOpen(true);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setSelectedProduct(null);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Produtos</h1>
          <p className="text-muted-foreground">Gerencie seu catálogo de produtos</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => setIsImportModalOpen(true)}
            className="border-primary text-primary hover:bg-primary/10"
          >
            <FileUp className="h-4 w-4 mr-2" />
            Importar Produtos
          </Button>
          <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleNewProduct} className="bg-primary hover:bg-primary/90">
                <Plus className="h-4 w-4 mr-2" />
                Novo Produto
              </Button>
            </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {selectedProduct ? 'Editar Produto' : 'Novo Produto'}
              </DialogTitle>
            </DialogHeader>
            <ProductForm
              product={selectedProduct}
              onClose={handleFormClose}
            />
          </DialogContent>
        </Dialog>
        </div>

        <ImportProductsModal 
          open={isImportModalOpen}
          onClose={() => setIsImportModalOpen(false)}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
            setIsImportModalOpen(false);
          }}
        />
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar produtos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Categorias" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Todas categorias</SelectItem>
            {categories.map((cat: any) => (
              <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={brandFilter} onValueChange={setBrandFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Marcas" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Todas marcas</SelectItem>
            {brands.map((brand: any) => (
              <SelectItem key={brand.id} value={brand.id}>{brand.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={tagFilter} onValueChange={setTagFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Tags" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Todas tags</SelectItem>
            {tags.map((tag: any) => (
              <SelectItem key={tag.id} value={tag.id}>{tag.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <Card key={product.id} className="group hover:shadow-md transition-all duration-200 overflow-hidden">
            {/* Product Image */}
            <div className="aspect-video bg-muted relative">
              {product.image_urls && product.image_urls.length > 0 ? (
                <img
                  src={product.image_urls[0]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Package className="h-12 w-12 text-muted-foreground" />
                </div>
              )}
              {/* Image count indicator */}
              {product.image_urls && product.image_urls.length > 1 && (
                <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                  +{product.image_urls.length - 1}
                </div>
              )}
              {/* Action buttons overlay */}
              <div className="absolute top-2 left-2 flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleEditProduct(product)}
                  className="h-8 w-8 p-0"
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="secondary" size="sm" className="h-8 w-8 p-0">
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Excluir produto</AlertDialogTitle>
                      <AlertDialogDescription>
                        Tem certeza que deseja excluir o produto "{product.name}"? 
                        Esta ação não pode ser desfeita.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => deleteProductMutation.mutate(product.id)}
                        className="bg-destructive hover:bg-destructive/90"
                      >
                        Excluir
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>

            <CardHeader className="pb-3">
              <CardTitle className="text-lg line-clamp-1">{product.name}</CardTitle>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                {product.sku && (
                  <span>SKU: {product.sku}</span>
                )}
                {product.brand && (
                  <>
                    {product.sku && <span>•</span>}
                    <span>{product.brand}</span>
                  </>
                )}
              </div>
            </CardHeader>

            <CardContent>
              <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                {product.simple_description}
              </p>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Custo:</span>
                  <span className="font-medium">{formatCurrency(product.cost_price)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Venda:</span>
                  <span className="font-semibold text-primary">
                    {formatCurrency(product.sell_price)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Margem:</span>
                  <span className={`font-medium ${(((product.sell_price - product.cost_price) / product.sell_price) * 100) < 35 ? 'text-destructive' : 'text-green-600'}`}>
                    {(((product.sell_price - product.cost_price) / product.sell_price) * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Estoque:</span>
                  <span className="font-medium">{product.stock || 0} un</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {products.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground text-lg mb-4">
            {debouncedSearchTerm ? 'Nenhum produto encontrado' : 'Nenhum produto cadastrado'}
          </p>
          <Button onClick={handleNewProduct}>
            <Plus className="h-4 w-4 mr-2" />
            Cadastrar primeiro produto
          </Button>
        </div>
      )}
    </div>
  );
};

export default ProductsPage;