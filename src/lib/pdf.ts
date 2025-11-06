import { supabase } from '@/integrations/supabase/client';

export interface GeneratePdfOptions {
  proposalId: string;
  templateId?: string;
  flags?: Record<string, any>;
}

export interface PdfGenerationResult {
  success: boolean;
  pdfUrl?: string;
  previewUrl?: string;
  error?: string;
}

/**
 * Gera PDF da proposta via Edge Function
 * Nota: Atualmente retorna URL do preview para window.print()
 * Futuramente usará Puppeteer via browserless.io
 */
export async function generateProposalPdf(
  options: GeneratePdfOptions
): Promise<PdfGenerationResult> {
  try {
    const { data, error } = await supabase.functions.invoke('generate-pdf', {
      body: options,
    });

    if (error) {
      console.error('PDF generation error:', error);
      return {
        success: false,
        error: error.message || 'Erro ao gerar PDF',
      };
    }

    // Por enquanto, retorna URL do preview
    if (data.previewUrl) {
      return {
        success: true,
        previewUrl: data.previewUrl,
      };
    }

    // Futuramente, quando Puppeteer estiver configurado:
    if (data.pdfUrl) {
      return {
        success: true,
        pdfUrl: data.pdfUrl,
      };
    }

    return {
      success: false,
      error: 'Resposta inesperada do servidor',
    };
  } catch (error) {
    console.error('Unexpected error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    };
  }
}

/**
 * Abre o preview da proposta para impressão manual
 * Método mais confiável até Puppeteer estar configurado
 */
export function openProposalPreview(
  proposalId: string,
  flags?: Record<string, any>
): void {
  const flagsParam = flags
    ? '&' + new URLSearchParams(
        Object.entries(flags).map(([k, v]) => [k, String(v)])
      ).toString()
    : '';

  const url = `/preview/${proposalId}?print=1${flagsParam}`;
  window.open(url, '_blank');
}
