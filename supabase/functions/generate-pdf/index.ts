import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GeneratePdfRequest {
  proposalId: string;
  templateId?: string;
  flags?: Record<string, any>;
}

// Rate limiting simples em memória (por instância)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 10; // 10 PDFs por minuto
const RATE_WINDOW = 60 * 1000; // 1 minuto

function checkRateLimit(organizationId: string): boolean {
  const now = Date.now();
  const limit = rateLimitMap.get(organizationId);

  if (!limit || now > limit.resetAt) {
    rateLimitMap.set(organizationId, { count: 1, resetAt: now + RATE_WINDOW });
    return true;
  }

  if (limit.count >= RATE_LIMIT) {
    return false;
  }

  limit.count++;
  return true;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Auth obrigatório
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Não autorizado' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    // Verificar usuário
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Usuário não autenticado' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse request
    const { proposalId, flags = {} }: GeneratePdfRequest = await req.json();

    if (!proposalId) {
      return new Response(
        JSON.stringify({ error: 'proposalId obrigatório' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Buscar proposta e verificar tenant ownership
    const { data: proposal, error: proposalError } = await supabase
      .from('proposals')
      .select('id, organization_id, title')
      .eq('id', proposalId)
      .single();

    if (proposalError || !proposal) {
      return new Response(
        JSON.stringify({ error: 'Proposta não encontrada' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verificar se usuário pertence à mesma organização
    const { data: profile } = await supabase
      .from('profiles')
      .select('organization_id')
      .eq('user_id', user.id)
      .single();

    if (!profile || profile.organization_id !== proposal.organization_id) {
      return new Response(
        JSON.stringify({ error: 'Acesso negado a esta proposta' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Rate limiting
    if (!checkRateLimit(proposal.organization_id)) {
      return new Response(
        JSON.stringify({ error: 'Limite de geração de PDFs excedido. Tente novamente em 1 minuto.' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Construir URL do preview com flags
    const baseUrl = Deno.env.get('SUPABASE_URL')?.replace('.supabase.co', '.lovable.app') || 
                    'https://loving-swamp-7m98g0w.lovable.app';
    
    const flagsParam = Object.keys(flags).length > 0 
      ? '&' + new URLSearchParams(Object.entries(flags).map(([k, v]) => [k, String(v)])).toString()
      : '';
    
    const previewUrl = `${baseUrl}/preview/${proposalId}?print=1${flagsParam}`;

    console.log('Generating PDF for:', { proposalId, previewUrl });

    // Usar Puppeteer via browserless.io (Deno Deploy não suporta Puppeteer diretamente)
    // Alternativa: usar API de conversão HTML-to-PDF
    
    // IMPORTANTE: Puppeteer não funciona em Deno Deploy devido a limitações de runtime
    // Solução: usar serviço externo (browserless.io) ou implementar fallback com jsPDF
    
    // Por enquanto, vamos retornar a URL do preview para download manual
    // Em produção, você pode usar:
    // 1. Browserless.io (serviço pago de Puppeteer as a Service)
    // 2. Self-hosted Puppeteer em servidor Node.js
    // 3. Biblioteca jsPDF no frontend (menos fidelidade visual)

    // Fallback temporário: retornar URL para o usuário fazer window.print()
    return new Response(
      JSON.stringify({
        message: 'Use o preview para gerar PDF via navegador',
        previewUrl,
        note: 'Em produção, configure Puppeteer via browserless.io ou servidor Node.js'
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

    // IMPLEMENTAÇÃO FUTURA com Browserless.io:
    /*
    const browserlessToken = Deno.env.get('BROWSERLESS_TOKEN');
    if (!browserlessToken) {
      throw new Error('BROWSERLESS_TOKEN não configurado');
    }

    const response = await fetch('https://chrome.browserless.io/pdf?token=' + browserlessToken, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url: previewUrl,
        options: {
          format: 'A4',
          margin: { top: '18mm', right: '18mm', bottom: '18mm', left: '18mm' },
          printBackground: true,
          preferCSSPageSize: true,
        },
      }),
    });

    if (!response.ok) {
      throw new Error('Falha ao gerar PDF: ' + response.statusText);
    }

    const pdfBytes = await response.arrayBuffer();

    return new Response(pdfBytes, {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="proposta-${proposalId}.pdf"`,
      },
    });
    */

  } catch (error) {
    console.error('Error generating PDF:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Erro ao gerar PDF' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
