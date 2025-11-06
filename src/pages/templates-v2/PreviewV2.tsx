import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { composeProposalView } from '@/features/templates/engine/adapters/composeProposalView';
import { ProposalView } from '@/features/templates/engine/schema';
import { renderTemplate } from '@/features/templates-v2/runtime/render-html';
import { DEFAULT_TOKENS } from '@/features/templates-v2/runtime/design-tokens';
import { TemplateV2 } from '@/features/templates-v2/runtime/props-schema';
import exampleTemplate from '@/features/templates-v2/sample/creative-a4.json';
import sampleData from '@/features/templates-v2/sample/sample-data.json';
import '@/features/templates-v2/runtime/print.css';

export default function PreviewV2() {
  const { proposalId } = useParams<{ proposalId: string }>();

  // Buscar dados da proposta (ou usar mock)
  const { data: proposalData, isLoading } = useQuery({
    queryKey: ['proposal-view', proposalId],
    queryFn: async () => {
      if (proposalId === 'mock') {
        return sampleData as unknown as ProposalView;
      }
      return composeProposalView(proposalId!);
    },
    enabled: !!proposalId,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!proposalData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Proposta não encontrada</p>
      </div>
    );
  }

  // Por enquanto usa template de exemplo
  const template = exampleTemplate as TemplateV2;
  const tokens = DEFAULT_TOKENS;

  return (
    <div className="min-h-screen bg-white p-8">
      {renderTemplate(template.root, proposalData, tokens)}
    </div>
  );
}
