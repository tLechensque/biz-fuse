import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Loader2, Download } from 'lucide-react';
import { composeProposalView } from '@/features/templates/engine/adapters/composeProposalView';
import { TemplateRenderer } from '@/features/templates/engine/render';
import { TemplateLayout } from '@/features/templates/engine/schema';
import { getDefaultTemplate, getTemplateById } from '@/lib/templates';
import { useProfile } from '@/hooks/useProfile';
import '@/features/templates/engine/print.css';

export default function ProposalPreview() {
  const { proposalId } = useParams<{ proposalId: string }>();
  const { profile } = useProfile();
  const [searchParams, setSearchParams] = useSearchParams();
  const [showDetails, setShowDetails] = useState(
    searchParams.get('showDetails') === 'true'
  );
  const isPrintMode = searchParams.get('print') === '1';
  const templateId = searchParams.get('templateId') || undefined;

  // Buscar dados da proposta
  const { data: proposalView, isLoading: loadingProposal } = useQuery({
    queryKey: ['proposal-preview', proposalId],
    queryFn: () => composeProposalView(proposalId!),
    enabled: !!proposalId,
  });

  // Buscar template (específico ou padrão)
  const { data: template, isLoading: loadingTemplate } = useQuery({
    queryKey: ['template-for-preview', profile?.organization_id, templateId],
    queryFn: async () => {
      if (templateId) {
        const tmpl = await getTemplateById(templateId);
        if (tmpl) return tmpl;
      }
      // Fallback para template padrão da organização
      return getDefaultTemplate(profile?.organization_id!);
    },
    enabled: !!profile?.organization_id,
  });

  const isLoading = loadingProposal || loadingTemplate;

  // Atualizar URL quando alterar showDetails
  useEffect(() => {
    if (!isPrintMode) {
      const params = new URLSearchParams(searchParams);
      if (showDetails) {
        params.set('showDetails', 'true');
      } else {
        params.delete('showDetails');
      }
      setSearchParams(params, { replace: true });
    }
  }, [showDetails, isPrintMode, searchParams, setSearchParams]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!proposalView || !template) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Proposta não encontrada</h1>
          <p className="text-muted-foreground">
            A proposta solicitada não existe ou você não tem permissão para visualizá-la.
          </p>
        </div>
      </div>
    );
  }

  const context = {
    data: proposalView,
    flags: { showDetails },
    theme: template.theme,
  };

  const handleExportPdf = async () => {
    // Usar window.print() diretamente é mais confiável que Edge Function
    // A Edge Function está pronta para quando Puppeteer for configurado
    window.print();
    
    // Alternativa: chamar Edge Function (quando Puppeteer estiver configurado)
    // import { generateProposalPdf } from '@/lib/pdf';
    // const result = await generateProposalPdf({ proposalId: proposalId!, flags: { showDetails } });
    // if (result.success && result.pdfUrl) {
    //   window.open(result.pdfUrl, '_blank');
    // }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Toolbar (não imprimível) */}
      {!isPrintMode && (
        <div className="no-print sticky top-0 z-50 bg-background border-b border-border">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-lg font-semibold">Preview da Proposta</h1>
              <div className="flex items-center gap-2">
                <Switch
                  id="show-details"
                  checked={showDetails}
                  onCheckedChange={setShowDetails}
                />
                <Label htmlFor="show-details" className="cursor-pointer">
                  Mostrar Detalhes
                </Label>
              </div>
            </div>
            <Button onClick={handleExportPdf} className="gap-2">
              <Download className="w-4 h-4" />
              Exportar PDF
            </Button>
          </div>
        </div>
      )}

      {/* Preview do Template */}
      <div className="container mx-auto max-w-4xl py-8">
        <TemplateRenderer layout={template} context={context} />
      </div>
    </div>
  );
}
