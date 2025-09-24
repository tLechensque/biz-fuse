import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { corsHeaders } from '../_shared/cors.ts'
import * as xlsx from 'https://deno.land/x/sheetjs/xlsx.mjs'

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const formData = await req.formData()
    const file = formData.get('file') as File

    if (!file) {
      throw new Error('Nenhum ficheiro encontrado no pedido.')
    }

    // --- Bloco de Teste 1: Ler o Ficheiro ---
    let workbook;
    try {
      const buffer = await file.arrayBuffer();
      workbook = xlsx.read(buffer, { type: 'buffer' });
    } catch (e) {
      console.error('Erro na leitura do ficheiro:', e);
      return new Response(JSON.stringify({ error: `Falha ao ler o ficheiro. O formato pode ser inválido ou corrompido. Detalhe: ${e.message}` }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    // --- Bloco de Teste 2: Converter para JSON ---
    let jsonData;
    try {
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      jsonData = xlsx.utils.sheet_to_json(worksheet);
    } catch (e) {
      console.error('Erro na conversão para JSON:', e);
      return new Response(JSON.stringify({ error: `Falha ao converter a planilha para JSON. Verifique se a primeira aba contém dados tabulares simples. Detalhe: ${e.message}` }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    // --- Bloco de Sucesso: Retornar Amostra ---
    return new Response(JSON.stringify({ 
        message: 'Leitura e conversão da planilha bem-sucedidas!', 
        data_sample: jsonData.slice(0, 5) 
    }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})