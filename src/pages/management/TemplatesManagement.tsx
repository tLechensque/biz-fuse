import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useProfile } from '@/hooks/useProfile';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Plus, Pencil, Trash2, Loader2, Star, Copy, Eye, Layers } from 'lucide-react';
import { RoleGuard } from '@/components/auth/RoleGuard';
import { TemplateLayout } from '@/features/templates/engine/schema';
import { BLOCK_METADATA } from '@/features/templates/engine/registry';
import defaultTemplate from '@/features/templates/sample/starvai-clean-a4.json';
import { useNavigate } from 'react-router-dom';

interface ProposalTemplate {
  id: string;
  name: string;
  description: string | null;
  content: TemplateLayout;
  is_default: boolean;
  is_active: boolean;
  template_type: string;
  created_at: string;
}

export default function TemplatesManagement() {
  const { profile } = useProfile();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<ProposalTemplate | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    is_active: true,
  });

  // Buscar templates do tipo 'blocks'
  const { data: templates = [], isLoading } = useQuery({
    queryKey: ['proposal-templates-blocks', profile?.organization_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('proposal_templates')
        .select('*')
        .eq('organization_id', profile?.organization_id!)
        .eq('template_type', 'blocks')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as ProposalTemplate[];
    },
    enabled: !!profile?.organization_id,
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      // Usar template padrão como base
      const layout: TemplateLayout = defaultTemplate as TemplateLayout;
      
      const { error } = await supabase
        .from('proposal_templates')
        .insert({
          name: data.name,
          description: data.description,
          content: layout,
          template_type: 'blocks',
          is_active: data.is_active,
          is_default: false,
          organization_id: profile?.organization_id,
        });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proposal-templates-blocks'] });
      toast({ title: 'Template criado com sucesso' });
      handleCloseDialog();
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao criar template',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<ProposalTemplate> }) => {
      const { error } = await supabase
        .from('proposal_templates')
        .update(data)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proposal-templates-blocks'] });
      toast({ title: 'Template atualizado' });
      handleCloseDialog();
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao atualizar template',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('proposal_templates')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proposal-templates-blocks'] });
      toast({ title: 'Template excluído' });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao excluir template',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const setAsDefaultMutation = useMutation({
    mutationFn: async (id: string) => {
      // Primeiro, remover is_default de todos
      await supabase
        .from('proposal_templates')
        .update({ is_default: false })
        .eq('organization_id', profile?.organization_id!);

      // Depois, setar o escolhido como padrão
      const { error } = await supabase
        .from('proposal_templates')
        .update({ is_default: true })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proposal-templates-blocks'] });
      toast({ title: 'Template padrão definido' });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao definir template padrão',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const duplicateMutation = useMutation({
    mutationFn: async (template: ProposalTemplate) => {
      const { error } = await supabase
        .from('proposal_templates')
        .insert({
          name: `${template.name} (Cópia)`,
          description: template.description,
          content: template.content,
          template_type: 'blocks',
          is_active: true,
          is_default: false,
          organization_id: profile?.organization_id,
        });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proposal-templates-blocks'] });
      toast({ title: 'Template duplicado com sucesso' });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao duplicar template',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingTemplate) {
      updateMutation.mutate({
        id: editingTemplate.id,
        data: {
          name: formData.name,
          description: formData.description,
          is_active: formData.is_active,
        },
      });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleNewTemplate = () => {
    setEditingTemplate(null);
    setFormData({
      name: '',
      description: '',
      is_active: true,
    });
    setDialogOpen(true);
  };

  const handleEdit = (template: ProposalTemplate) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      description: template.description || '',
      is_active: template.is_active,
    });
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingTemplate(null);
  };

  const getBlockCount = (template: ProposalTemplate) => {
    return template.content?.blocks?.length || 0;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <RoleGuard requireManager>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Templates de Proposta</h1>
            <p className="text-muted-foreground mt-2">
              Sistema modular de templates por blocos com variáveis dinâmicas
            </p>
          </div>
          <Button onClick={handleNewTemplate} className="gap-2">
            <Plus className="w-4 h-4" />
            Novo Template
          </Button>
        </div>

        {/* Info Card */}
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Layers className="w-5 h-5 text-primary" />
              Sistema de Templates por Blocos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>
              <strong>7 blocos disponíveis:</strong> Cover, ItemsTable, Upgrades, Totals, Payment, Notes, Acceptance
            </p>
            <p>
              <strong>50+ variáveis:</strong> Dados automapeados de produtos, marcas, clientes, organização, etc.
            </p>
            <p>
              <strong>Editor Visual (Fase 4):</strong> Em breve - drag & drop de blocos e inserção de variáveis
            </p>
          </CardContent>
        </Card>

        {templates.length === 0 ? (
          <Card>
            <CardContent className="pt-12 pb-12 text-center">
              <Layers className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Nenhum template criado</h3>
              <p className="text-muted-foreground mb-4">
                Crie seu primeiro template baseado no modelo padrão "Starvai Clean A4"
              </p>
              <Button onClick={handleNewTemplate} className="gap-2">
                <Plus className="w-4 h-4" />
                Criar Primeiro Template
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead className="text-center">Blocos</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {templates.map((template) => (
                  <TableRow key={template.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {template.is_default && (
                          <Star className="w-4 h-4 fill-primary text-primary" />
                        )}
                        <span className="font-medium">{template.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {template.description || '—'}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline" className="gap-1">
                        <Layers className="w-3 h-3" />
                        {getBlockCount(template)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      {template.is_active ? (
                        <Badge variant="default">Ativo</Badge>
                      ) : (
                        <Badge variant="secondary">Inativo</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {!template.is_default && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setAsDefaultMutation.mutate(template.id)}
                            title="Definir como padrão"
                          >
                            <Star className="w-4 h-4" />
                          </Button>
                        )}
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => duplicateMutation.mutate(template)}
                          title="Duplicar"
                        >
                          <Copy className="w-4 h-4" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/templates/editor/${template.id}`)}
                          title="Editar no Editor Visual"
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              disabled={template.is_default}
                              title={template.is_default ? 'Não é possível excluir o template padrão' : 'Excluir'}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Excluir Template</AlertDialogTitle>
                              <AlertDialogDescription>
                                Tem certeza que deseja excluir o template "{template.name}"?
                                Esta ação não pode ser desfeita.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deleteMutation.mutate(template.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
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
          </Card>
        )}

        {/* Dialog para Criar/Editar */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>
                {editingTemplate ? 'Editar Template' : 'Novo Template'}
              </DialogTitle>
              <DialogDescription>
                {editingTemplate 
                  ? 'Altere as informações básicas do template'
                  : 'Novo template será criado baseado no modelo "Starvai Clean A4"'
                }
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Nome do Template</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Proposta Comercial 2025"
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Descrição (Opcional)</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Descreva o propósito deste template..."
                  rows={3}
                />
              </div>

              <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                <Label htmlFor="is_active" className="flex-1 cursor-pointer">
                  Template Ativo
                  <p className="text-xs text-muted-foreground font-normal">
                    Templates inativos não aparecem para seleção
                  </p>
                </Label>
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-4 h-4"
                />
              </div>

              {!editingTemplate && (
                <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 space-y-2">
                  <p className="text-sm font-medium">Blocos Incluídos:</p>
                  <div className="flex flex-wrap gap-2">
                    {BLOCK_METADATA.map((block) => (
                      <Badge key={block.type} variant="secondary" className="text-xs">
                        {block.label}
                      </Badge>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Edição visual de blocos estará disponível na Fase 4
                  </p>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={handleCloseDialog}>
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  {(createMutation.isPending || updateMutation.isPending) && (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  )}
                  {editingTemplate ? 'Salvar' : 'Criar Template'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </RoleGuard>
  );
}
