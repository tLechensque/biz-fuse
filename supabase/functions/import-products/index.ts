import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';
import * as XLSX from 'https://esm.sh/xlsx@0.18.5';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ProductRow {
  name: string;
  sku?: string;
  simple_description: string;
  full_description: string;
  cost_price: number;
  sell_price: number;
  brand?: string;
  unit: string;
  category_id?: string;
}

interface ImportResult {
  success: boolean;
  imported: number;
  failed: number;
  errors: string[];
}

// Simple CSV parser function
function parseCSV(csvText: string): string[][] {
  const lines = csvText.split('\n').filter(line => line.trim() !== '');
  const result: string[][] = [];
  
  for (const line of lines) {
    // Simple CSV parsing - splits by comma but doesn't handle quotes
    const fields = line.split(',').map(field => field.trim());
    result.push(fields);
  }
  
  return result;
}

// Excel parser function
function parseExcel(base64Data: string): string[][] {
  try {
    // Decode base64 to binary
    const binaryString = atob(base64Data);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    
    // Parse Excel file
    const workbook = XLSX.read(bytes, { type: 'array' });
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    
    // Convert to array of arrays
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });
    return jsonData as string[][];
  } catch (error) {
    throw new Error(`Erro ao processar arquivo Excel: ${error.message}`);
  }
}

function validateProductData(row: any): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!row.name || row.name.trim() === '') {
    errors.push('Nome do produto é obrigatório');
  }
  
  if (!row.simple_description || row.simple_description.trim() === '') {
    errors.push('Descrição simples é obrigatória');
  }
  
  if (!row.full_description || row.full_description.trim() === '') {
    errors.push('Descrição completa é obrigatória');
  }
  
  if (!row.cost_price || isNaN(parseFloat(row.cost_price))) {
    errors.push('Preço de custo deve ser um número válido');
  }
  
  if (!row.sell_price || isNaN(parseFloat(row.sell_price))) {
    errors.push('Preço de venda deve ser um número válido');
  }
  
  if (!row.unit || row.unit.trim() === '') {
    row.unit = 'pç'; // Default value
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

async function getUserOrganizationId(supabase: any): Promise<string | null> {
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('organization_id')
    .single();
    
  if (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
  
  return profile?.organization_id || null;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting product import...');
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Get user's organization ID
    const organizationId = await getUserOrganizationId(supabaseClient);
    if (!organizationId) {
      throw new Error('Não foi possível identificar a organização do usuário');
    }

    const { fileData, fileType, fileName } = await req.json();
    
    if (!fileData) {
      throw new Error('Dados do arquivo não fornecidos');
    }

    console.log(`Parsing ${fileType} data from file: ${fileName}...`);
    
    let rows: string[][];
    if (fileType === 'csv') {
      rows = parseCSV(fileData);
    } else if (fileType === 'excel') {
      rows = parseExcel(fileData);
    } else {
      throw new Error('Tipo de arquivo não suportado');
    }
    
    if (rows.length === 0) {
      throw new Error('Arquivo está vazio');
    }

    // Get headers from first row
    const headers = rows[0].map(h => h.toLowerCase());
    const dataRows = rows.slice(1);

    console.log(`Found ${dataRows.length} product rows to import`);
    
    const result: ImportResult = {
      success: true,
      imported: 0,
      failed: 0,
      errors: []
    };

    // Process each row
    for (let i = 0; i < dataRows.length; i++) {
      const row = dataRows[i];
      
      try {
        // Create product object from CSV row
        const productData: any = {};
        
        headers.forEach((header, index) => {
          if (row[index] !== undefined) {
            productData[header] = row[index];
          }
        });

        // Validate the product data
        const validation = validateProductData(productData);
        
        if (!validation.isValid) {
          result.failed++;
          result.errors.push(`Linha ${i + 2}: ${validation.errors.join(', ')}`);
          continue;
        }

        // Prepare the product for insertion
        const product: ProductRow = {
          name: productData.name.trim(),
          sku: productData.sku?.trim() || null,
          simple_description: productData.simple_description.trim(),
          full_description: productData.full_description.trim(),
          cost_price: parseFloat(productData.cost_price),
          sell_price: parseFloat(productData.sell_price),
          brand: productData.brand?.trim() || null,
          unit: productData.unit?.trim() || 'pç',
          category_id: productData.category_id?.trim() || null,
        };

        // Insert product into database
        const { error } = await supabaseClient
          .from('products')
          .insert({
            ...product,
            organization_id: organizationId,
          });

        if (error) {
          console.error(`Error inserting product ${product.name}:`, error);
          result.failed++;
          result.errors.push(`Linha ${i + 2}: ${error.message}`);
        } else {
          result.imported++;
          console.log(`Successfully imported product: ${product.name}`);
        }
        
      } catch (error) {
        console.error(`Error processing row ${i + 2}:`, error);
        result.failed++;
        result.errors.push(`Linha ${i + 2}: ${error.message}`);
      }
    }

    console.log(`Import completed. Success: ${result.imported}, Failed: ${result.failed}`);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in import-products function:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        imported: 0, 
        failed: 0, 
        errors: [error.message] 
      }), 
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});