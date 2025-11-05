import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useProfile } from '@/hooks/useProfile';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Pencil, Trash2, Loader2, Image as ImageIcon, Video, Package } from 'lucide-react';
import { RoleGuard } from '@/components/auth/RoleGuard';

interface PortfolioItem {
  id: string;
  title: string;
  description: string | null;
  media_urls: string[];
  media_type: 'image' | 'video' | null;
  product_ids: string[];
  brand_ids: string[];
  is_active: boolean;
  created_at: string;
}

export default function PortfolioManagement() {
  const { profile } = useProfile();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PortfolioItem | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    media_urls: [''],
    media_type: 'image' as 'image' | 'video',
    product_ids: [] as string[],
    brand_ids: [] as string[],
    is_active: true,
  });

  const { data: products = [] } = useQuery({
    queryKey: ['products-list'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('id, name')
        .order('name');
      if (error) throw error;
      return data;
    },
  });

  const { data: brands = [] } = useQuery({
    queryKey: ['brands-list'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('brands')
        .select('id, name')
        .order('name');
      if (error) throw error;
      return data;
    },
  });

  const { data: portfolioItems = [], isLoading } = useQuery({
    queryKey: ['portfolio-items', profile?.organization_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('portfolio_items')
        .select('*')
        .eq('organization_id', profile?.organization_id!)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as PortfolioItem[];
    },
    enabled: !!profile?.organization_id,
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await supabase
        .from('portfolio_items')
        .insert({
          ...data,
          media_urls: data.media_urls.filter(url => url.trim()),
          organization_id: profile?.organization_id,
        });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolio-items'] });
      toast({ title: 'Item de portfólio criado' });
      handleCloseDialog();
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao criar item',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof formData }) => {
      const { error } = await supabase
        .from('portfolio_items')
        .update({
          ...data,
          media_urls: data.media_urls.filter(url => url.trim()),
        })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolio-items'] });
      toast({ title: 'Item atualizado' });
      handleCloseDialog();
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao atualizar',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('portfolio_items')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolio-items'] });
      toast({ title: 'Item excluído' });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao excluir',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    if (editingItem) {
      updateMutation.mutate({ id: editingItem.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (item: PortfolioItem) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      description: item.description || '',
      media_urls: item.media_urls.length > 0 ? item.media_urls : [''],
      media_type: item.media_type || 'image',
      product_ids: item.product_ids || [],
      brand_ids: item.brand_ids || [],
      is_active: item.is_active,
    });
    setDialogOpen(true);
  };

  const handleNewItem = () => {
    setEditingItem(null);
    setFormData({
      title: '',
      description: '',
      media_urls: [''],
      media_type: 'image',
      product_ids: [],
      brand_ids: [],
      is_active: true,
    });
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingItem(null);
  };

  const addMediaUrl = () => {
    setFormData({ ...formData, media_urls: [...formData.media_urls, ''] });
  };

  const removeMediaUrl = (index: number) => {
    const newUrls = formData.media_urls.filter((_, i) => i !== index);
    setFormData({ ...formData, media_urls: newUrls.length > 0 ? newUrls : [''] });
  };

  const updateMediaUrl = (index: number, value: string) => {
    const newUrls = [...formData.media_urls];
    newUrls[index] = value;
    setFormData({ ...formData, media_urls: newUrls });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <RoleGuard requireManager>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Portfólio</h1>
            <p className="text-muted-foreground mt-2">
              Monte catálogos visuais com imagens, vídeos e produtos
            </p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleNewItem}>
                <Plus className="h-4 w-4 mr-2" />
                Novo Item
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <ImageIcon className="h-5 w-5" />
                  {editingItem ? 'Editar Item do Portfólio' : 'Novo Item do Portfólio'}
                </DialogTitle>
                <DialogDescription>
                  Adicione imagens, vídeos e vincule produtos ou marcas
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Título</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Nome do item do portfólio"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Descreva este item do portfólio"
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="media_type">Tipo de Mídia</Label>
                  <Select
                    value={formData.media_type}
                    onValueChange={(value: 'image' | 'video') => setFormData({ ...formData, media_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="image">Imagens</SelectItem>
                      <SelectItem value="video">Vídeos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>URLs de Mídia</Label>
                    <Button type="button" variant="outline" size="sm" onClick={addMediaUrl}>
                      <Plus className="h-3 w-3 mr-1" />
                      Adicionar URL
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {formData.media_urls.map((url, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          value={url}
                          onChange={(e) => updateMediaUrl(index, e.target.value)}
                          placeholder={`URL da ${formData.media_type === 'image' ? 'imagem' : 'vídeo'} ${index + 1}`}
                        />
                        {formData.media_urls.length > 1 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => removeMediaUrl(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Produtos Vinculados</Label>
                    <Select
                      value=""
                      onValueChange={(value) => {
                        if (!formData.product_ids.includes(value)) {
                          setFormData({ ...formData, product_ids: [...formData.product_ids, value] });
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Adicionar produto..." />
                      </SelectTrigger>
                      <SelectContent>
                        {products.map((p) => (
                          <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {formData.product_ids.map((id) => {
                        const product = products.find(p => p.id === id);
                        return product ? (
                          <span key={id} className="px-2 py-1 bg-secondary rounded text-xs flex items-center gap-1">
                            {product.name}
                            <button
                              type="button"
                              onClick={() => setFormData({ ...formData, product_ids: formData.product_ids.filter(pid => pid !== id) })}
                              className="hover:text-destructive"
                            >
                              ×
                            </button>
                          </span>
                        ) : null;
                      })}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Marcas Vinculadas</Label>
                    <Select
                      value=""
                      onValueChange={(value) => {
                        if (!formData.brand_ids.includes(value)) {
                          setFormData({ ...formData, brand_ids: [...formData.brand_ids, value] });
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Adicionar marca..." />
                      </SelectTrigger>
                      <SelectContent>
                        {brands.map((b) => (
                          <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {formData.brand_ids.map((id) => {
                        const brand = brands.find(b => b.id === id);
                        return brand ? (
                          <span key={id} className="px-2 py-1 bg-secondary rounded text-xs flex items-center gap-1">
                            {brand.name}
                            <button
                              type="button"
                              onClick={() => setFormData({ ...formData, brand_ids: formData.brand_ids.filter(bid => bid !== id) })}
                              className="hover:text-destructive"
                            >
                              ×
                            </button>
                          </span>
                        ) : null;
                      })}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="flex items-center gap-2">
                    <Switch
                      id="is_active"
                      checked={formData.is_active}
                      onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                    />
                    <Label htmlFor="is_active">Ativo</Label>
                  </div>

                  <div className="flex gap-2">
                    <Button type="button" variant="outline" onClick={handleCloseDialog}>
                      Cancelar
                    </Button>
                    <Button type="submit">
                      {editingItem ? 'Atualizar' : 'Criar'}
                    </Button>
                  </div>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {portfolioItems.map((item) => (
            <Card key={item.id} className="overflow-hidden">
              <div className="aspect-video bg-muted relative">
                {item.media_urls && item.media_urls.length > 0 && item.media_urls[0] ? (
                  item.media_type === 'video' ? (
                    <video src={item.media_urls[0]} className="w-full h-full object-cover" controls />
                  ) : (
                    <img src={item.media_urls[0]} alt={item.title} className="w-full h-full object-cover" />
                  )
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    {item.media_type === 'video' ? (
                      <Video className="h-12 w-12 text-muted-foreground" />
                    ) : (
                      <ImageIcon className="h-12 w-12 text-muted-foreground" />
                    )}
                  </div>
                )}
                {item.media_urls && item.media_urls.length > 1 && (
                  <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                    +{item.media_urls.length - 1}
                  </div>
                )}
              </div>
              <CardHeader>
                <CardTitle className="text-lg line-clamp-1">{item.title}</CardTitle>
                {item.description && (
                  <CardDescription className="line-clamp-2">{item.description}</CardDescription>
                )}
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {item.product_ids && item.product_ids.length > 0 && (
                    <div className="text-xs text-muted-foreground">
                      <Package className="h-3 w-3 inline mr-1" />
                      {item.product_ids.length} produto(s)
                    </div>
                  )}
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleEdit(item)} className="flex-1">
                      <Pencil className="h-3 w-3 mr-1" />
                      Editar
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Trash2 className="h-3 w-3 text-destructive" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Excluir item</AlertDialogTitle>
                          <AlertDialogDescription>
                            Tem certeza que deseja excluir "{item.title}"?
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => deleteMutation.mutate(item.id)}
                            className="bg-destructive hover:bg-destructive/90"
                          >
                            Excluir
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {portfolioItems.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">Nenhum item no portfólio</p>
              <Button onClick={handleNewItem}>
                <Plus className="h-4 w-4 mr-2" />
                Criar Primeiro Item
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </RoleGuard>
  );
}