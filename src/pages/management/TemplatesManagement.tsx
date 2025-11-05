import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useProfile } from '@/hooks/useProfile';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Plus, Pencil, Trash2, Loader2, FileText, Star } from 'lucide-react';
import { RoleGuard } from '@/components/auth/RoleGuard';

interface ProposalTemplate {
  id: string;
  name: string;
  description: string | null;
  content: any;
  is_default: boolean;
  is_active: boolean;
  created_at: string;
}

export default function TemplatesManagement() {
  const { profile } = useProfile();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<ProposalTemplate | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    content: {
      header: '',
      introduction: '',
      terms: '',
      footer: '',
      show_discount: true,
      show_payment_methods: true,
    },
    is_default: false,
    is_active: true,
  });

  const { data: templates = [], isLoading } = useQuery({
    queryKey: ['proposal-templates', profile?.organization_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('proposal_templates')
        .select('*')
        .eq('organization_id', profile?.organization_id!)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as ProposalTemplate[];
    },
    enabled: !!profile?.organization_id,
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await supabase
        .from('proposal_templates')
        .insert({
          ...data,
          organization_id: profile?.organization_id,
        });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proposal-templates'] });
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
    mutationFn: async ({ id, data }: { id: string; data: typeof formData }) => {
      const { error } = await supabase
        .from('proposal_templates')
        .update(data)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proposal-templates'] });
      toast({ title: 'Template atualizado' });
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
        .from('proposal_templates')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proposal-templates'] });
      toast({ title: 'Template excluído' });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao excluir',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const setAsDefaultMutation = useMutation({
    mutationFn: async (id: string) => {
      // First, unset all defaults
      await supabase
        .from('proposal_templates')
        .update({ is_default: false })
        .eq('organization_id', profile?.organization_id!);

      // Then set the selected one as default
      const { error } = await supabase
        .from('proposal_templates')
        .update({ is_default: true })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proposal-templates'] });
      toast({ title: 'Template definido como padrão' });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao definir como padrão',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    if (editingTemplate) {
      updateMutation.mutate({ id: editingTemplate.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (template: ProposalTemplate) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      description: template.description || '',
      content: template.content || {
        header: '',
        introduction: '',
        terms: '',
        footer: '',
        show_discount: true,
        show_payment_methods: true,
      },
      is_default: template.is_default,
      is_active: template.is_active,
    });
    setDialogOpen(true);
  };

  const handleNewTemplate = () => {
    setEditingTemplate(null);
    setFormData({
      name: '',
      description: '',
      content: {
        header: '',
        introduction: '',
        terms: '',
        footer: '',
        show_discount: true,
        show_payment_methods: true,
      },
      is_default: false,
      is_active: true,
    });
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingTemplate(null);
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
            <h1 className="text-3xl font-bold">Templates de Propostas</h1>
            <p className="text-muted-foreground mt-2">
              Crie e gerencie templates para suas propostas comerciais
            </p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleNewTemplate}>
                <Plus className="h-4 w-4 mr-2" />
                Novo Template
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  {editingTemplate ? 'Editar Template' : 'Novo Template'}
                </DialogTitle>
                <DialogDescription>
                  Configure as seções e conteúdo padrão do template
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome do Template</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ex: Proposta Padrão, Proposta Premium"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Quando usar este template?"
                    rows={2}
                  />
                </div>

                <div className="space-y-4 border-t pt-4">
                  <h3 className="font-semibold">Conteúdo do Template</h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="header">Cabeçalho</Label>
                    <Textarea
                      id="header"
                      value={formData.content.header}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        content: { ...formData.content, header: e.target.value }
                      })}
                      placeholder="Texto do cabeçalho da proposta"
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="introduction">Introdução</Label>
                    <Textarea
                      id="introduction"
                      value={formData.content.introduction}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        content: { ...formData.content, introduction: e.target.value }
                      })}
                      placeholder="Texto de introdução da proposta"
                      rows={4}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="terms">Termos e Condições</Label>
                    <Textarea
                      id="terms"
                      value={formData.content.terms}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        content: { ...formData.content, terms: e.target.value }
                      })}
                      placeholder="Termos e condições da proposta"
                      rows={4}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="footer">Rodapé</Label>
                    <Textarea
                      id="footer"
                      value={formData.content.footer}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        content: { ...formData.content, footer: e.target.value }
                      })}
                      placeholder="Informações de rodapé (contato, etc.)"
                      rows={3}
                    />
                  </div>

                  <div className="space-y-3 border-t pt-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="show_discount">Mostrar Descontos</Label>
                      <Switch
                        id="show_discount"
                        checked={formData.content.show_discount}
                        onCheckedChange={(checked) => setFormData({ 
                          ...formData, 
                          content: { ...formData.content, show_discount: checked }
                        })}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="show_payment_methods">Mostrar Formas de Pagamento</Label>
                      <Switch
                        id="show_payment_methods"
                        checked={formData.content.show_payment_methods}
                        onCheckedChange={(checked) => setFormData({ 
                          ...formData, 
                          content: { ...formData.content, show_payment_methods: checked }
                        })}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Switch
                        id="is_active"
                        checked={formData.is_active}
                        onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                      />
                      <Label htmlFor="is_active">Ativo</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        id="is_default"
                        checked={formData.is_default}
                        onCheckedChange={(checked) => setFormData({ ...formData, is_default: checked })}
                      />
                      <Label htmlFor="is_default">Template Padrão</Label>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button type="button" variant="outline" onClick={handleCloseDialog}>
                      Cancelar
                    </Button>
                    <Button type="submit">
                      {editingTemplate ? 'Atualizar' : 'Criar'}
                    </Button>
                  </div>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Templates Cadastrados</CardTitle>
            <CardDescription>
              {templates.length} template(s) criado(s)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {templates.map((template) => (
                  <TableRow key={template.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        {template.name}
                        {template.is_default && (
                          <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {template.description || '-'}
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded text-xs ${template.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                        {template.is_active ? 'Ativo' : 'Inativo'}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {!template.is_default && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setAsDefaultMutation.mutate(template.id)}
                          >
                            <Star className="h-4 w-4 mr-1" />
                            Definir como Padrão
                          </Button>
                        )}
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(template)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        {!template.is_default && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Excluir template</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Tem certeza que deseja excluir "{template.name}"?
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => deleteMutation.mutate(template.id)}
                                  className="bg-destructive hover:bg-destructive/90"
                                >
                                  Excluir
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </RoleGuard>
  );
}