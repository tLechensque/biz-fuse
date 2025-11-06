import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useProfile } from '@/hooks/useProfile';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowLeft, Save, Eye, Undo, Redo } from 'lucide-react';
import { composeProposalView } from '@/features/templates/engine/adapters/composeProposalView';
import { DroppableCanvas } from '@/features/templates-v2/editor/DroppableCanvas';
import { LayersPanel } from '@/features/templates-v2/editor/LayersPanel';
import { InspectorPanel } from '@/features/templates-v2/editor/InspectorPanel';
import { DataPanel } from '@/features/templates-v2/editor/DataPanel';
import { TokensPanel } from '@/features/templates-v2/editor/TokensPanel';
import { ElementsPalette } from '@/features/templates-v2/editor/ElementsPalette';
import { useTemplateState } from '@/features/templates-v2/hooks/useTemplateState';
import { useKeyboardShortcuts } from '@/features/templates-v2/hooks/useKeyboardShortcuts';
import { createElementByType } from '@/features/templates-v2/utils/element-factory';
import exampleTemplate from '@/features/templates-v2/sample/creative-a4.json';
import { TemplateV2, Element } from '@/features/templates-v2/runtime/props-schema';
import { DEFAULT_TOKENS, DesignTokens } from '@/features/templates-v2/runtime/design-tokens';
import { useDebounce } from '@/hooks/useDebounce';

export default function TemplateEditorV2() {
  const { templateId } = useParams<{ templateId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { profile } = useProfile();
  const queryClient = useQueryClient();

  const isNewTemplate = templateId === 'new';

  const [selectedPath, setSelectedPath] = useState<string | null>(null);
  const [rightPanel, setRightPanel] = useState<'inspector' | 'data' | 'tokens'>('inspector');

  const {
    template,
    tokens,
    canUndo,
    canRedo,
    undo,
    redo,
    updateTokens,
    updateElementAtPath,
    addElementAtPath,
    removeElementAtPath,
  } = useTemplateState(exampleTemplate as TemplateV2, DEFAULT_TOKENS);

  // Debounce para autosave
  const debouncedTemplate = useDebounce(template, 2000);
  const debouncedTokens = useDebounce(tokens, 2000);

  // Mock data para preview
  const { data: mockData } = useQuery({
    queryKey: ['mock-proposal'],
    queryFn: async () => {
      const { data: proposals } = await supabase
        .from('proposals')
        .select('id')
        .limit(1)
        .single();
      
      if (proposals?.id) {
        return composeProposalView(proposals.id);
      }
      throw new Error('No proposals found');
    },
  });

  // Buscar template existente
  const { data: existingTemplate, isLoading } = useQuery({
    queryKey: ['template-v2', templateId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('proposal_templates_v2')
        .select('*')
        .eq('id', templateId!)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !isNewTemplate && !!templateId,
  });

  // Mutation para salvar
  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        name: template.name,
        template_json: template,
        tokens_json: tokens,
        organization_id: profile?.organization_id,
      };

      if (isNewTemplate) {
        const { data, error } = await supabase
          .from('proposal_templates_v2')
          .insert(payload)
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        const { error } = await supabase
          .from('proposal_templates_v2')
          .update({
            template_json: template,
            tokens_json: tokens,
            updated_at: new Date().toISOString(),
          })
          .eq('id', templateId!);

        if (error) throw error;
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['template-v2'] });
      toast({ title: 'Template salvo com sucesso' });
      
      if (isNewTemplate && data) {
        navigate(`/templates-v2/editor/${data.id}`, { replace: true });
      }
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao salvar',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleDrop = useCallback((type: string) => {
    const newElement = createElementByType(type);
    if (!newElement) {
      toast({ title: 'Tipo não suportado', variant: 'destructive' });
      return;
    }

    // Adicionar ao root ou ao elemento selecionado
    const targetPath = selectedPath || '';
    addElementAtPath(targetPath, newElement);
    toast({ title: `${type} adicionado` });
  }, [selectedPath, addElementAtPath, toast]);

  const handleUpdateElement = useCallback((updates: Partial<Element>) => {
    if (!selectedPath) return;
    updateElementAtPath(selectedPath, updates);
  }, [selectedPath, updateElementAtPath]);

  const handleDeleteElement = useCallback(() => {
    if (!selectedPath) return;
    removeElementAtPath(selectedPath);
    setSelectedPath(null);
    toast({ title: 'Elemento removido' });
  }, [selectedPath, removeElementAtPath, toast]);

  const getSelectedElement = useCallback((): Element | null => {
    if (!selectedPath) return null;
    
    const parts = selectedPath.split('.');
    let current: any = template.root;

    for (const part of parts) {
      if (part === 'children') continue;
      
      const indexMatch = part.match(/\[(\d+)\]/);
      if (indexMatch) {
        const index = parseInt(indexMatch[1], 10);
        if (current.children && current.children[index]) {
          current = current.children[index];
        } else {
          return null;
        }
      }
    }

    return current;
  }, [template.root, selectedPath]);

  // Keyboard shortcuts
  useKeyboardShortcuts({
    onUndo: undo,
    onRedo: redo,
    onSave: () => saveMutation.mutate(),
    onDelete: selectedPath ? handleDeleteElement : undefined,
  });

  // Autosave
  useEffect(() => {
    if (!isNewTemplate && templateId && debouncedTemplate && debouncedTokens) {
      saveMutation.mutate();
    }
  }, [debouncedTemplate, debouncedTokens]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <DndProvider backend={HTML5Backend}>
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
                  {template.name}
                </h1>
                <p className="text-xs text-muted-foreground">
                  Editor Visual v2
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={undo}
                disabled={!canUndo}
                title="Desfazer (Ctrl+Z)"
              >
                <Undo className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={redo}
                disabled={!canRedo}
                title="Refazer (Ctrl+Y)"
              >
                <Redo className="w-4 h-4" />
              </Button>
              
              <div className="w-px h-6 bg-border mx-2" />

              <Button
                variant={rightPanel === 'inspector' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setRightPanel('inspector')}
              >
                Inspector
              </Button>
              <Button
                variant={rightPanel === 'data' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setRightPanel('data')}
              >
                Data
              </Button>
              <Button
                variant={rightPanel === 'tokens' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setRightPanel('tokens')}
              >
                Tokens
              </Button>
              
              <div className="w-px h-6 bg-border mx-2" />
              
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => window.open('/preview-v2/mock', '_blank')}
              >
                <Eye className="w-4 h-4" />
                Preview
              </Button>
              <Button
                size="sm"
                className="gap-2"
                onClick={() => saveMutation.mutate()}
                disabled={saveMutation.isPending}
              >
                {saveMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Salvar
              </Button>
            </div>
          </div>
        </div>

        {/* Editor Layout */}
        <div className="flex h-[calc(100vh-73px)]">
          {/* Left Sidebar - Elements + Layers */}
          <div className="w-64 border-r border-border bg-card flex flex-col">
            <div className="flex-1 overflow-hidden">
              <ElementsPalette onAddElement={handleDrop} />
            </div>
            <div className="flex-1 border-t overflow-hidden">
              <LayersPanel
                root={template.root}
                selectedPath={selectedPath}
                onSelect={setSelectedPath}
              />
            </div>
          </div>

          {/* Canvas - Center */}
          <div className="flex-1 overflow-auto bg-muted">
            {mockData ? (
              <DroppableCanvas
                root={template.root}
                data={mockData}
                tokens={tokens}
                selectedPath={selectedPath}
                onSelect={setSelectedPath}
                onDrop={handleDrop}
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            )}
          </div>

          {/* Right Panel - Inspector/Data/Tokens */}
          <div className="w-80 border-l border-border bg-card">
            {rightPanel === 'inspector' && (
              <InspectorPanel
                element={getSelectedElement()}
                onUpdate={handleUpdateElement}
                onDelete={handleDeleteElement}
              />
            )}
            {rightPanel === 'data' && (
              <DataPanel 
                onInsertBinding={(path) => {
                  const element = getSelectedElement();
                  if (element && element.type === 'Text') {
                    updateElementAtPath(selectedPath!, {
                      binding: { path }
                    });
                    toast({ title: 'Binding adicionado', description: `{{${path}}}` });
                  }
                }}
              />
            )}
            {rightPanel === 'tokens' && (
              <TokensPanel tokens={tokens} onUpdate={updateTokens} />
            )}
          </div>
        </div>
      </div>
    </DndProvider>
  );
}
