import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { corsHeaders } from '../_shared/cors.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const supabase = createClient(supabaseUrl, supabaseKey)

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { fileData, columnMapping } = await req.json()

    if (!fileData) {
      throw new Error('Nenhum conteúdo de ficheiro encontrado.')
    }

    // --- Bloco 1: Ler o ficheiro CSV ---
    let lines: string[];
    try {
      lines = fileData.split('\n').filter((line: string) => line.trim());
      if (lines.length < 2) {
        throw new Error('O ficheiro deve conter pelo menos uma linha de cabeçalho e uma linha de dados.');
      }
    } catch (e) {
      console.error('Erro ao processar linhas do CSV:', e);
      return new Response(JSON.stringify({ error: `Falha ao processar o ficheiro CSV. Verifique se o formato está correto. Detalhe: ${e.message}` }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    // --- Bloco 2: Processar cabeçalho e dados ---
    let headers: string[];
    let dataRows: string[][];
    try {
      headers = lines[0].split(',').map(h => h.trim().replace(/['"]/g, ''));
      dataRows = lines.slice(1).map(line => 
        line.split(',').map(cell => cell.trim().replace(/['"]/g, ''))
      );
    } catch (e) {
      console.error('Erro ao processar cabeçalho e dados:', e);
      return new Response(JSON.stringify({ error: `Falha ao processar dados do CSV. Verifique se as colunas estão separadas por vírgulas. Detalhe: ${e.message}` }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    // --- Bloco 3: Obter organização do utilizador ---
    let userOrgId: string;
    try {
      const authHeader = req.headers.get('authorization');
      if (!authHeader) {
        throw new Error('Token de autorização não fornecido.');
      }

      const token = authHeader.replace('Bearer ', '');
      const { data: { user }, error: userError } = await supabase.auth.getUser(token);
      
      if (userError || !user) {
        throw new Error('Utilizador não autenticado.');
      }

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('user_id', user.id)
        .single();

      if (profileError || !profile) {
        throw new Error('Perfil do utilizador não encontrado.');
      }

      userOrgId = profile.organization_id;
    } catch (e) {
      console.error('Erro ao obter organização:', e);
      return new Response(JSON.stringify({ error: `Erro de autenticação: ${e.message}` }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      });
    }

    // --- Bloco 4: Processar produtos ---
    const productsToInsert = [];
    const categoriesCache: { [name: string]: string } = {};
    
    for (const row of dataRows) {
      try {
        const product: any = {
          organization_id: userOrgId,
          name: '',
          simple_description: '',
          full_description: '',
          cost_price: 0,
          sell_price: 0,
          unit: 'pç',
          stock: 0
        };

        // Mapear colunas baseado no columnMapping
        for (let i = 0; i < headers.length; i++) {
          const header = headers[i];
          const mappedField = columnMapping[header];
          const value = row[i] || '';

          if (!mappedField || mappedField === 'ignore' || !value) continue;

          if (mappedField === 'cost_price' || mappedField === 'sell_price') {
            // Limpeza de preços
            const cleanPrice = value.replace(/,/g, '');
            product[mappedField] = parseFloat(cleanPrice) || 0;
          } else if (mappedField === 'stock') {
            product[mappedField] = parseInt(value) || 0;
          } else if (mappedField === 'category_name') {
            // Gestão de categorias
            if (value && !categoriesCache[value]) {
              // Verificar se categoria já existe
              const { data: existingCategory } = await supabase
                .from('categories')
                .select('id')
                .eq('name', value)
                .eq('organization_id', userOrgId)
                .single();

              if (existingCategory) {
                categoriesCache[value] = existingCategory.id;
              } else {
                // Criar nova categoria
                const { data: newCategory, error: categoryError } = await supabase
                  .from('categories')
                  .insert({
                    name: value,
                    organization_id: userOrgId
                  })
                  .select('id')
                  .single();

                if (!categoryError && newCategory) {
                  categoriesCache[value] = newCategory.id;
                }
              }
            }
            if (categoriesCache[value]) {
              product.category_id = categoriesCache[value];
            }
          } else {
            product[mappedField] = value;
          }
        }

        // Validação básica
        if (product.name) {
          productsToInsert.push(product);
        }
      } catch (e) {
        console.error('Erro ao processar linha:', e);
        // Continua com a próxima linha
      }
    }

    // --- Bloco 5: Inserir produtos na base de dados ---
    try {
      if (productsToInsert.length === 0) {
        throw new Error('Nenhum produto válido encontrado para importar.');
      }

      const { data, error: insertError } = await supabase
        .from('products')
        .insert(productsToInsert)
        .select('id');

      if (insertError) {
        throw new Error(`Erro ao inserir produtos: ${insertError.message}`);
      }

      return new Response(JSON.stringify({ 
        imported: productsToInsert.length,
        failed: dataRows.length - productsToInsert.length,
        message: `${productsToInsert.length} produtos importados com sucesso!`
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });

    } catch (e) {
      console.error('Erro na inserção:', e);
      return new Response(JSON.stringify({ error: `Erro ao guardar produtos na base de dados: ${e.message}` }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }

  } catch (error) {
    console.error('Erro geral:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})