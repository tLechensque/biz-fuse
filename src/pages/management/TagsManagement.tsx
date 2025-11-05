import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useProfile } from '@/hooks/useProfile';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import { Plus, Pencil, Trash2, Loader2, Tag } from 'lucide-react';

interface TagItem {
  id: string;
  name: string;
  created_at: string;
}

export default function TagsManagement() {
  const { profile } = useProfile();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTag, setEditingTag] = useState<TagItem | null>(null);
  const [tagName, setTagName] = useState('');

  const { data: tags = [], isLoading } = useQuery({
    queryKey: ['tags', profile?.organization_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tags')
        .select('*')
        .eq('organization_id', profile?.organization_id!)
        .order('name');
      
      if (error) throw error;
      return data as TagItem[];
    },
    enabled: !!profile?.organization_id,
  });

  const createMutation = useMutation({
    mutationFn: async (name: string) => {
      const { error } = await supabase
        .from('tags')
        .insert({ name, organization_id: profile?.organization_id });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags'] });
      toast({ title: 'Tag criada com sucesso' });
      setDialogOpen(false);
      setTagName('');
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao criar tag',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, name }: { id: string; name: string }) => {
      const { error } = await supabase
        .from('tags')
        .update({ name })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags'] });
      toast({ title: 'Tag atualizada com sucesso' });
      setDialogOpen(false);
      setEditingTag(null);
      setTagName('');
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao atualizar tag',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('tags')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags'] });
      toast({ title: 'Tag excluída com sucesso' });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao excluir tag',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tagName.trim()) return;

    if (editingTag) {
      updateMutation.mutate({ id: editingTag.id, name: tagName });
    } else {
      createMutation.mutate(tagName);
    }
  };

  const handleEdit = (tag: TagItem) => {
    setEditingTag(tag);
    setTagName(tag.name);
    setDialogOpen(true);
  };

  const handleNewTag = () => {
    setEditingTag(null);
    setTagName('');
    setDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Tags</h1>
          <p className="text-muted-foreground mt-2">Gerencie as tags para organização de produtos</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleNewTag}>
              <Plus className="h-4 w-4 mr-2" />
              Nova Tag
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Tag className="h-5 w-5" />
                {editingTag ? 'Editar Tag' : 'Nova Tag'}
              </DialogTitle>
              <DialogDescription>
                {editingTag ? 'Altere o nome da tag' : 'Adicione uma nova tag para categorizar produtos'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome da Tag</Label>
                <Input
                  id="name"
                  value={tagName}
                  onChange={(e) => setTagName(e.target.value)}
                  placeholder="Ex: Promoção, Novo, Destaque"
                  required
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingTag ? 'Atualizar' : 'Criar'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Tags</CardTitle>
          <CardDescription>
            {tags.length} tag(s) cadastrada(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Data de Criação</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tags.map((tag) => (
                <TableRow key={tag.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <Tag className="h-4 w-4 text-muted-foreground" />
                      {tag.name}
                    </div>
                  </TableCell>
                  <TableCell>
                    {new Date(tag.created_at).toLocaleDateString('pt-BR')}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(tag)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Excluir tag</AlertDialogTitle>
                            <AlertDialogDescription>
                              Tem certeza que deseja excluir "{tag.name}"? Esta ação não pode ser desfeita.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deleteMutation.mutate(tag.id)}
                              className="bg-destructive hover:bg-destructive/90"
                            >
                              Excluir
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}