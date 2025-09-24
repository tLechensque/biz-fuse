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
  image_urls?: string[];
  stock?: number;
}

interface ImportResult {
  success: boolean;
  imported: number;
  failed: number;
  errors: string[];
}

interface ColumnMapping {
  [userColumn: string]: string;
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

// Excel parser function with sheet selection
function parseExcel(base64Data: string, selectedSheet?: string): string[][] {
  try {
    // Decode base64 to binary
    const binaryString = atob(base64Data);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    
    // Parse Excel file
    const workbook = XLSX.read(bytes, { type: 'array' });
    
    // Use selected sheet or first sheet if not specified
    const sheetName = selectedSheet && workbook.SheetNames.includes(selectedSheet) 
      ? selectedSheet 
      : workbook.SheetNames[0];
    
    const worksheet = workbook.Sheets[sheetName];
    
    // Convert to array of arrays
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });
    return jsonData as string[][];
  } catch (error) {
    throw new Error(`Erro ao processar arquivo Excel: ${error.message}`);
  }
}

// Create flexible column mapping for user-friendly column names
function createFlexibleColumnMapping(headers: string[]): ColumnMapping {
  const mapping: ColumnMapping = {};
  
  // Define flexible column name patterns (case-insensitive)
  const columnPatterns: { [key: string]: string[] } = {
    'name': ['nome', 'name', 'produto', 'product'],
    'sku': ['sku', 'codigo', 'code'],
    'simple_description': ['descricao_simples', 'desc_simples', 'simple_description', 'description'],
    'full_description': ['descricao_completa', 'desc_completa', 'full_description', 'descricao'],
    'cost_price': ['preco_custo', 'custo', 'cost_price', 'cost'],
    'sell_price': ['preco_venda', 'venda', 'sell_price', 'price', 'preco'],
    'brand': ['marca', 'brand'],
    'unit': ['unidade', 'unit', 'un'],
    'image_urls': ['imagens', 'images', 'image_urls', 'fotos'],
    'stock': ['estoque', 'stock', 'quantidade', 'qty'],
    'category_name': ['categoria', 'category', 'cat']
  };
  
  headers.forEach(header => {
    const normalizedHeader = header.toLowerCase().trim();
    
    // Find matching system field for this header
    for (const [systemField, patterns] of Object.entries(columnPatterns)) {
      if (patterns.some(pattern => normalizedHeader.includes(pattern))) {
        mapping[header] = systemField;
        break;
      }
    }
  });
  
  console.log('Created flexible column mapping:', mapping);
  return mapping;
}

// Map row data based on column mapping
function mapRowData(
  headers: string[], 
  rowValues: string[], 
  columnMapping: ColumnMapping
): any {
  const mappedData: any = {};
  
  headers.forEach((header, index) => {
    const systemField = columnMapping[header];
    if (systemField && systemField !== 'ignore' && rowValues[index] !== undefined && rowValues[index] !== '') {
      mappedData[systemField] = rowValues[index];
    }
  });
  
  return mappedData;
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

async function findOrCreateCategory(supabase: any, categoryName: string, organizationId: string): Promise<string | null> {
  if (!categoryName || categoryName.trim() === '') return null;
  
  const trimmedName = categoryName.trim();
  
  // First, try to find existing category
  const { data: existingCategory } = await supabase
    .from('categories')
    .select('id')
    .eq('name', trimmedName)
    .eq('organization_id', organizationId)
    .maybeSingle();
  
  if (existingCategory) {
    return existingCategory.id;
  }
  
  // If not found, create new category
  const { data: newCategory, error } = await supabase
    .from('categories')
    .insert({
      name: trimmedName,
      organization_id: organizationId
    })
    .select('id')
    .single();
  
  if (error) {
    console.error('Error creating category:', error);
    return null;
  }
  
  return newCategory?.id || null;
}

function processImageUrls(imageData: string): string[] {
  if (!imageData || imageData.trim() === '') return [];
  
  // Split by common separators and filter valid URLs
  const urls = imageData
    .split(/[,;\n\r\t]+/)
    .map(url => url.trim())
    .filter(url => url.length > 0);
  
  return urls;
}

async function getUserOrganizationId(supabase: any): Promise<string | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.error('No authenticated user found');
      return null;
    }

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('organization_id')
      .eq('user_id', user.id)
      .limit(1)
      .single();
      
    if (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
    
    return profile?.organization_id || null;
  } catch (err) {
    console.error('Error in getUserOrganizationId:', err);
    return null;
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting product import...');
    
    // DEBUG: Skip organization ID check for now to focus on file reading
    // const supabaseClient = createClient(
    //   Deno.env.get('SUPABASE_URL') ?? '',
    //   Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    //   {
    //     global: {
    //       headers: { Authorization: req.headers.get('Authorization')! },
    //     },
    //   }
    // );

    // const organizationId = await getUserOrganizationId(supabaseClient);
    // if (!organizationId) {
    //   throw new Error('Não foi possível identificar a organização do usuário');
    // }
    
    const { fileData, fileType, fileName, selectedSheet, columnMapping } = await req.json();
    
    if (!fileData) {
      throw new Error('Dados do arquivo não fornecidos');
    }

    console.log(`Parsing ${fileType} data from file: ${fileName}...`);
    console.log('Selected sheet:', selectedSheet || 'Default/First sheet');
    console.log('Column mapping provided:', columnMapping ? 'Yes' : 'No');
    
    // DEBUG: Add specific try-catch around file reading
    let rows: string[][];
    try {
      console.log('Starting file parsing...');
      if (fileType === 'csv') {
        rows = parseCSV(fileData);
      } else if (fileType === 'excel') {
        rows = parseExcel(fileData, selectedSheet);
      } else {
        throw new Error('Tipo de arquivo não suportado');
      }
      console.log('File parsing successful! Got', rows.length, 'rows');
    } catch (e) {
      console.error('Error during file parsing:', e);
      throw new Error(`Falha ao ler o ficheiro. O formato pode ser inválido ou corrompido. Detalhes: ${e.message}`);
    }
    
    // DEBUG: Add specific try-catch around data conversion
    let headers: string[];
    let jsonData: string[][];
    try {
      console.log('Starting data conversion...');
      if (rows.length === 0) {
        throw new Error('Arquivo está vazio');
      }

      // Get headers from first row (keep original case for mapping)
      headers = rows[0].map(h => h.toString().trim());
      jsonData = rows.slice(1);
      
      console.log(`Data conversion successful! Found ${jsonData.length} product rows to import`);
      console.log('Headers found:', headers);
    } catch (e) {
      console.error('Error during data conversion:', e);
      throw new Error(`Falha ao converter a planilha para JSON. Verifique se a primeira aba contém dados tabulares simples. Detalhes: ${e.message}`);
    }

    // DEBUG: Return sample data for debugging (comment out all database operations)
    console.log('File reading and conversion successful! Returning sample data...');
    
    return new Response(JSON.stringify({ 
      success: true,
      message: 'Leitura e conversão da planilha bem-sucedidas!', 
      file_info: {
        file_name: fileName,
        file_type: fileType,
        selected_sheet: selectedSheet,
        total_rows: jsonData.length,
        headers: headers
      },
      data_sample: jsonData.slice(0, 5) 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

    // ===== ALL DATABASE OPERATIONS COMMENTED OUT FOR DEBUGGING =====
    /*
    // Create flexible column mapping if none provided
    let effectiveMapping: ColumnMapping;
    
    if (columnMapping && Object.keys(columnMapping).length > 0) {
      // Use provided mapping
      effectiveMapping = columnMapping;
      console.log('Using provided column mapping:', effectiveMapping);
    } else {
      // Create automatic flexible mapping based on headers
      effectiveMapping = createFlexibleColumnMapping(headers);
      console.log('Created automatic flexible column mapping:', effectiveMapping);
    }

    const result: ImportResult = {
      success: true,
      imported: 0,
      failed: 0,
      errors: []
    };

    // Process each row
    for (let i = 0; i < jsonData.length; i++) {
      const row = jsonData[i];
      
      try {
        // Map row data using flexible mapping
        const productData = mapRowData(headers, row, effectiveMapping);
        
        console.log(`Processing row ${i + 2} with data:`, productData);

        // Validate the product data
        const validation = validateProductData(productData);
        
        if (!validation.isValid) {
          result.failed++;
          result.errors.push(`Linha ${i + 2}: ${validation.errors.join(', ')}`);
          continue;
        }

        // Handle category intelligently - find or create by name
        let categoryId = null;
        if (productData.category_name) {
          console.log(`Processing category: "${productData.category_name}"`);
          categoryId = await findOrCreateCategory(supabaseClient, productData.category_name, organizationId);
          if (categoryId) {
            console.log(`Category processed successfully. ID: ${categoryId}`);
          }
        }

        // Process image URLs intelligently
        let imageUrls: string[] = [];
        if (productData.image_urls) {
          imageUrls = processImageUrls(productData.image_urls);
          console.log(`Processed ${imageUrls.length} image URLs`);
        }

        // Process stock with validation
        let stock = 0;
        if (productData.stock) {
          const stockValue = parseInt(productData.stock.toString());
          if (!isNaN(stockValue)) {
            stock = Math.max(0, stockValue); // Ensure non-negative
            console.log(`Processed stock: ${stock}`);
          }
        }

        // Helper function to clean and parse price values
        const cleanPrice = (value: any): number => {
          if (!value) return 0;
          const cleanedValue = String(value).replace(/,/g, '').trim();
          const parsed = parseFloat(cleanedValue);
          return isNaN(parsed) ? 0 : parsed;
        };

        // Prepare the product for insertion with all processed data
        const product: ProductRow = {
          name: productData.name.trim(),
          sku: productData.sku?.trim() || null,
          simple_description: productData.simple_description.trim(),
          full_description: productData.full_description.trim(),
          cost_price: cleanPrice(productData.cost_price),
          sell_price: cleanPrice(productData.sell_price),
          brand: productData.brand?.trim() || null,
          unit: productData.unit?.trim() || 'pç',
          category_id: categoryId,
          image_urls: imageUrls,
          stock: stock,
        };

        console.log(`Inserting product:`, { ...product, image_urls: `${imageUrls.length} URLs` });

        // Insert product into database with final error handling
        try {
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
        } catch (dbError) {
          console.error(`Database error for product ${product.name}:`, dbError);
          result.failed++;
          result.errors.push(`Linha ${i + 2}: Erro na base de dados - ${dbError.message}`);
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
    */

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