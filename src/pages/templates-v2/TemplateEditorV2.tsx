import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowLeft, Save, Eye } from 'lucide-react';
import { TemplateV2, Element } from '@/features/templates-v2/runtime/props-schema';
import { DesignTokens, DEFAULT_TOKENS } from '@/features/templates-v2/runtime/design-tokens';
import { composeProposalView } from '@/features/templates/engine/adapters/composeProposalView';
import { Canvas } from '@/features/templates-v2/editor/Canvas';
import { LayersPanel } from '@/features/templates-v2/editor/LayersPanel';
import { InspectorPanel } from '@/features/templates-v2/editor/InspectorPanel';
import { DataPanel } from '@/features/templates-v2/editor/DataPanel';
import { TokensPanel } from '@/features/templates-v2/editor/TokensPanel';
import { ElementsPalette } from '@/features/templates-v2/editor/ElementsPalette';
import exampleTemplate from '@/features/templates-v2/sample/creative-a4.json';

export default function TemplateEditorV2() {
  const { templateId } = useParams<{ templateId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const isNewTemplate = templateId === 'new';

  const [template, setTemplate] = useState<TemplateV2>(exampleTemplate as TemplateV2);
  const [tokens, setTokens] = useState<DesignTokens>(DEFAULT_TOKENS);
  const [selectedPath, setSelectedPath] = useState<string | null>(null);
  const [rightPanel, setRightPanel] = useState<'inspector' | 'data' | 'tokens'>('inspector');

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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

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
                Editor Visual v2 (BETA)
              </h1>
              <p className="text-xs text-muted-foreground">
                Sistema experimental de edição visual
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
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
            >
              <Save className="w-4 h-4" />
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
            <ElementsPalette onAddElement={(type) => toast({ title: `Adicionar ${type}` })} />
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
          {mockData && (
            <Canvas
              root={template.root}
              data={mockData}
              tokens={tokens}
              selectedPath={selectedPath}
              onSelect={setSelectedPath}
            />
          )}
          {!mockData && (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          )}
        </div>

        {/* Right Panel - Inspector/Data/Tokens */}
        <div className="w-80 border-l border-border bg-card">
          {rightPanel === 'inspector' && (
            <InspectorPanel
              element={null}
              onUpdate={() => {}}
            />
          )}
          {rightPanel === 'data' && (
            <DataPanel onInsertBinding={(path) => toast({ title: 'Binding', description: path })} />
          )}
          {rightPanel === 'tokens' && (
            <TokensPanel tokens={tokens} onUpdate={setTokens} />
          )}
        </div>
      </div>
    </div>
  );
}
