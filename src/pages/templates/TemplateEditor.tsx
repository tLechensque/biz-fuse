import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useProfile } from '@/hooks/useProfile';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Save, Eye, ArrowLeft, Sparkles } from 'lucide-react';
import { TemplateLayout, Block, Theme } from '@/features/templates/engine/schema';
import { BLOCK_METADATA } from '@/features/templates/engine/registry';
import { BlocksPalette } from '@/components/templates/BlocksPalette';
import { CanvasEditor } from '@/components/templates/CanvasEditor';
import { PropertiesPanel } from '@/components/templates/PropertiesPanel';
import { ThemeCustomizer } from '@/components/templates/ThemeCustomizer';
import { PreviewDialog } from '@/components/templates/PreviewDialog';
import defaultTemplate from '@/features/templates/sample/starvai-clean-a4.json';
import { useDebounce } from '@/hooks/useDebounce';

export default function TemplateEditor() {
  const { templateId } = useParams<{ templateId: string }>();
  const navigate = useNavigate();
  const { profile } = useProfile();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const isNewTemplate = templateId === 'new';

  const [layout, setLayout] = useState<TemplateLayout>(defaultTemplate as TemplateLayout);
  const [selectedBlockIndex, setSelectedBlockIndex] = useState<number | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Debounce do layout para autosave
  const debouncedLayout = useDebounce(layout, 2000);

  // Buscar template existente
  const { data: template, isLoading } = useQuery({
    queryKey: ['template', templateId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('proposal_templates')
        .select('*')
        .eq('id', templateId!)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !isNewTemplate && !!templateId,
  });

  // Carregar template existente
  useEffect(() => {
    if (template && template.content) {
      setLayout(template.content as TemplateLayout);
    }
  }, [template]);

  // Mutation para salvar
  const saveMutation = useMutation({
    mutationFn: async () => {
      if (isNewTemplate) {
        throw new Error('Use o botão "Criar Template" na página anterior');
      }

      const { error } = await supabase
        .from('proposal_templates')
        .update({ content: layout, updated_at: new Date().toISOString() })
        .eq('id', templateId!);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['template', templateId] });
      queryClient.invalidateQueries({ queryKey: ['proposal-templates-blocks'] });
      setHasChanges(false);
      toast({ title: 'Template salvo com sucesso' });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao salvar template',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Autosave
  useEffect(() => {
    if (hasChanges && !isNewTemplate && debouncedLayout) {
      saveMutation.mutate();
    }
  }, [debouncedLayout, hasChanges, isNewTemplate]);

  const handleAddBlock = useCallback((blockType: string) => {
    const metadata = BLOCK_METADATA.find((b) => b.type === blockType);
    if (!metadata) return;

    const newBlock: Block = {
      type: blockType as any,
      props: metadata.defaultProps || {},
    };

    setLayout((prev) => ({
      ...prev,
      blocks: [...prev.blocks, newBlock],
    }));
    setSelectedBlockIndex(layout.blocks.length);
    setHasChanges(true);
  }, [layout.blocks.length]);

  const handleRemoveBlock = useCallback((index: number) => {
    setLayout((prev) => ({
      ...prev,
      blocks: prev.blocks.filter((_, i) => i !== index),
    }));
    setSelectedBlockIndex(null);
    setHasChanges(true);
  }, []);

  const handleReorderBlocks = useCallback((newBlocks: Block[]) => {
    setLayout((prev) => ({
      ...prev,
      blocks: newBlocks,
    }));
    setHasChanges(true);
  }, []);

  const handleUpdateBlockProps = useCallback((index: number, props: any) => {
    setLayout((prev) => ({
      ...prev,
      blocks: prev.blocks.map((block, i) =>
        i === index ? { ...block, props: { ...block.props, ...props } } : block
      ),
    }));
    setHasChanges(true);
  }, []);

  const handleUpdateTheme = useCallback((theme: Theme) => {
    setLayout((prev) => ({
      ...prev,
      theme,
    }));
    setHasChanges(true);
  }, []);

  const handleSave = () => {
    saveMutation.mutate();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isNewTemplate && !template) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Template não encontrado</h1>
          <Button onClick={() => navigate('/templates')}>Voltar</Button>
        </div>
      </div>
    );
  }

  const selectedBlock = selectedBlockIndex !== null ? layout.blocks[selectedBlockIndex] : null;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/templates')}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar
            </Button>
            <div>
              <h1 className="font-semibold text-lg">
                {template?.name || 'Novo Template'}
              </h1>
              <p className="text-xs text-muted-foreground">
                {hasChanges ? 'Salvando automaticamente...' : 'Todas as alterações salvas'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPreviewOpen(true)}
              className="gap-2"
            >
              <Eye className="w-4 h-4" />
              Preview
            </Button>
            <Button
              size="sm"
              onClick={handleSave}
              disabled={!hasChanges || saveMutation.isPending}
              className="gap-2"
            >
              {saveMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              Salvar Agora
            </Button>
          </div>
        </div>
      </div>

      {/* Editor Layout */}
      <div className="flex h-[calc(100vh-73px)]">
        {/* Paleta de Blocos - Esquerda */}
        <div className="w-64 border-r border-border overflow-y-auto bg-card">
          <BlocksPalette onAddBlock={handleAddBlock} />
        </div>

        {/* Canvas Central */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto space-y-4">
            <Card className="bg-primary/5 border-primary/20">
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  Editor Visual de Templates
                </CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground space-y-1">
                <p>• Arraste blocos para reordenar</p>
                <p>• Clique em um bloco para editar suas propriedades</p>
                <p>• Use variáveis {'{{nome}}'} nos campos de texto</p>
                <p>• Autosave ativado (2 segundos após última alteração)</p>
              </CardContent>
            </Card>

            <CanvasEditor
              blocks={layout.blocks}
              selectedIndex={selectedBlockIndex}
              onSelectBlock={setSelectedBlockIndex}
              onReorder={handleReorderBlocks}
              onRemove={handleRemoveBlock}
            />
          </div>
        </div>

        {/* Painel de Propriedades - Direita */}
        <div className="w-80 border-l border-border overflow-y-auto bg-card">
          {selectedBlock ? (
            <PropertiesPanel
              block={selectedBlock}
              blockIndex={selectedBlockIndex!}
              onUpdateProps={handleUpdateBlockProps}
            />
          ) : (
            <ThemeCustomizer
              theme={layout.theme || defaultTemplate.theme}
              onUpdateTheme={handleUpdateTheme}
            />
          )}
        </div>
      </div>

      {/* Preview Dialog */}
      <PreviewDialog
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        layout={layout}
      />
    </div>
  );
}
