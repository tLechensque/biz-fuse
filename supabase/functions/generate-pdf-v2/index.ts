import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { proposalId, templateId, flags } = await req.json()

    if (!proposalId) {
      return new Response(
        JSON.stringify({ error: 'proposalId é obrigatório' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Construir URL do preview
    const previewUrl = `${req.headers.get('origin')}/preview-v2/${proposalId}?print=1${
      templateId ? `&templateId=${templateId}` : ''
    }${flags ? `&${new URLSearchParams(flags).toString()}` : ''}`

    // TODO: Integrar com Browserless.io ou Puppeteer
    // Por enquanto, retornar URL do preview para impressão manual
    return new Response(
      JSON.stringify({
        success: true,
        previewUrl,
        message: 'Abra o preview e use Ctrl+P para gerar PDF',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )

    /* 
    // Futura implementação com Browserless
    const browserlessKey = Deno.env.get('BROWSERLESS_API_KEY')
    
    if (!browserlessKey) {
      throw new Error('BROWSERLESS_API_KEY não configurado')
    }

    const pdfResponse = await fetch(`https://chrome.browserless.io/pdf?token=${browserlessKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url: previewUrl,
        options: {
          format: 'A4',
          margin: {
            top: '18mm',
            right: '18mm',
            bottom: '18mm',
            left: '18mm',
          },
          printBackground: true,
        },
      }),
    })

    if (!pdfResponse.ok) {
      throw new Error('Erro ao gerar PDF')
    }

    const pdfBuffer = await pdfResponse.arrayBuffer()
    
    // Upload para storage
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const fileName = `proposal-${proposalId}-${Date.now()}.pdf`
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('pdfs')
      .upload(fileName, pdfBuffer, {
        contentType: 'application/pdf',
        upsert: false,
      })

    if (uploadError) throw uploadError

    const { data: urlData } = supabase.storage
      .from('pdfs')
      .getPublicUrl(fileName)

    return new Response(
      JSON.stringify({
        success: true,
        pdfUrl: urlData.publicUrl,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
    */
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
