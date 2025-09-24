import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import * as XLSX from 'https://esm.sh/xlsx@0.18.5';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SheetInfo {
  name: string;
  headers: string[];
}

interface PreProcessResult {
  success: boolean;
  sheets: SheetInfo[];
  error?: string;
}

function parseExcelSheets(base64Data: string): SheetInfo[] {
  try {
    // Decode base64 to binary
    const binaryString = atob(base64Data);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    
    // Parse Excel file
    const workbook = XLSX.read(bytes, { type: 'array' });
    const sheets: SheetInfo[] = [];
    
    // Extract headers from each sheet
    workbook.SheetNames.forEach(sheetName => {
      const worksheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });
      
      // Get headers (first row) and filter out empty ones
      const headers = data.length > 0 
        ? (data[0] as string[]).filter(h => h && h.toString().trim().length > 0)
        : [];
      
      sheets.push({
        name: sheetName,
        headers: headers
      });
    });
    
    return sheets;
  } catch (error) {
    throw new Error(`Erro ao processar arquivo Excel: ${error.message}`);
  }
}

function parseCSVHeaders(csvText: string): string[] {
  const lines = csvText.split('\n').filter(line => line.trim() !== '');
  if (lines.length === 0) return [];
  
  const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
  return headers.filter(h => h.length > 0);
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting sheet pre-processing...');
    
    const { fileData, fileType, fileName } = await req.json();
    
    if (!fileData) {
      throw new Error('Dados do arquivo não fornecidos');
    }

    console.log(`Pre-processing ${fileType} file: ${fileName}...`);
    
    let sheets: SheetInfo[] = [];
    
    if (fileType === 'csv') {
      // For CSV, create a single "sheet" with the headers
      const headers = parseCSVHeaders(fileData);
      sheets = [{
        name: 'CSV',
        headers: headers
      }];
    } else if (fileType === 'excel') {
      // For Excel, extract all sheets and their headers
      sheets = parseExcelSheets(fileData);
    } else {
      throw new Error('Tipo de arquivo não suportado');
    }
    
    console.log(`Found ${sheets.length} sheet(s)`);
    sheets.forEach(sheet => {
      console.log(`Sheet "${sheet.name}": ${sheet.headers.length} headers`);
    });
    
    const result: PreProcessResult = {
      success: true,
      sheets: sheets
    };

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in pre-process-sheet function:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        sheets: [],
        error: error.message 
      }), 
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});