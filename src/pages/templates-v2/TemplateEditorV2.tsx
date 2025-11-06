import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, ArrowLeft, Save, Eye } from 'lucide-react';
import { TemplateV2 } from '@/features/templates-v2/runtime/props-schema';
import { DesignTokens, DEFAULT_TOKENS } from '@/features/templates-v2/runtime/design-tokens';
import exampleTemplate from '@/features/templates-v2/sample/creative-a4.json';

export default function TemplateEditorV2() {
  const { templateId } = useParams<{ templateId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const isNewTemplate = templateId === 'new';

  const [template, setTemplate] = useState<TemplateV2>(exampleTemplate as TemplateV2);
  const [tokens, setTokens] = useState<DesignTokens>(DEFAULT_TOKENS);

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
              variant="outline"
              size="sm"
              className="gap-2"
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

      {/* Content */}
      <div className="container mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>Editor Visual v2 - Em Desenvolvimento</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              O sistema de Editor Visual v2 está sendo implementado com:
            </p>
            
            <ul className="list-disc list-inside space-y-2 text-sm">
              <li>✅ Design Tokens personalizáveis (cores, tipografia, espaçamentos)</li>
              <li>✅ Primitivos básicos (Frame, Stack, Grid, Text, Image, Table, Divider)</li>
              <li>✅ Data-binding com variáveis {'{{path}}'}</li>
              <li>✅ Repeaters para arrays (items, payments, etc.)</li>
              <li>✅ Condições de visibilidade</li>
              <li>✅ Formatters (brl, date, upper, lower, round)</li>
              <li>✅ Nova tabela no banco (proposal_templates_v2)</li>
              <li>🚧 Canvas visual com drag & drop</li>
              <li>🚧 Layers panel</li>
              <li>🚧 Inspector panel (propriedades e estilos)</li>
              <li>🚧 Tokens panel</li>
              <li>🚧 Data panel (explorar variáveis)</li>
              <li>🚧 Preview e Print v2</li>
            </ul>

            <div className="pt-4">
              <p className="text-sm font-medium mb-2">Próximos Passos:</p>
              <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                <li>Implementar Canvas com drag & drop</li>
                <li>Criar Layers panel para hierarquia</li>
                <li>Criar Inspector panel para edição de propriedades</li>
                <li>Implementar Preview e Print v2</li>
                <li>Adicionar componentes complexos (ItemCard, etc.)</li>
              </ol>
            </div>

            <div className="pt-4 border-t">
              <p className="text-xs text-muted-foreground">
                Template de exemplo carregado: {template.name}
              </p>
              <p className="text-xs text-muted-foreground">
                Elementos no template: {JSON.stringify(template.root.type)}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
