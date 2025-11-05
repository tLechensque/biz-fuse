import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Upload, Download, FileText, Loader2, ArrowRight, ArrowLeft } from 'lucide-react';
import * as XLSX from 'xlsx';

interface ImportProductsModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface ColumnMapping {
  [userColumn: string]: string;
}

const SYSTEM_FIELDS = [
  { value: 'name', label: 'Nome do Produto' },
  { value: 'sku', label: 'SKU/Código' },
  { value: 'simple_description', label: 'Descrição Simples' },
  { value: 'full_description', label: 'Descrição Completa' },
  { value: 'cost_price', label: 'Preço de Custo' },
  { value: 'sell_price', label: 'Preço de Venda' },
  { value: 'brand_name', label: 'Marca' },
  { value: 'unit_name', label: 'Unidade' },
  { value: 'category_name', label: 'Categoria' },
  { value: 'image_urls', label: 'URLs de Imagens' },
  { value: 'ignore', label: 'Ignorar esta coluna' }
];

export const ImportProductsModal = ({ open, onClose, onSuccess }: ImportProductsModalProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [step, setStep] = useState<'upload' | 'mapping'>('upload');
  const [fileHeaders, setFileHeaders] = useState<string[]>([]);
  const [columnMapping, setColumnMapping] = useState<ColumnMapping>({});
  const { toast } = useToast();

  const downloadTemplate = () => {
    const wb = XLSX.utils.book_new();
    const wsData = [
      ['name', 'sku', 'simple_description', 'full_description', 'cost_price', 'sell_price', 'brand_name', 'unit_name', 'category_name', 'image_urls'],
      ['Produto Exemplo', 'SKU001', 'Descrição simples', 'Descrição completa do produto', 50.00, 100.00, 'Marca Exemplo', 'Peça', 'Eletrônicos', 'https://exemplo.com/imagem1.jpg'],
      ['Produto 2', 'SKU002', 'Outra descrição', 'Descrição detalhada', 25.50, 60.00, 'Outra Marca', 'Quilograma', 'Casa e Jardim', 'https://exemplo.com/imagem2.jpg;https://exemplo.com/imagem3.jpg']
    ];
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    
    // Ajustar largura das colunas
    ws['!cols'] = [
      { wch: 20 }, { wch: 12 }, { wch: 20 }, { wch: 30 }, 
      { wch: 12 }, { wch: 12 }, { wch: 15 }, { wch: 8 }, 
      { wch: 15 }, { wch: 40 }, { wch: 10 }
    ];
    
    XLSX.utils.book_append_sheet(wb, ws, 'Produtos');
    XLSX.writeFile(wb, 'modelo_importacao_produtos.xlsx');
    
    toast({
      title: 'Modelo baixado',
      description: 'Arquivo modelo_importacao_produtos.xlsx baixado com sucesso.',
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    
    if (selectedFile) {
      const validTypes = [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
        'application/vnd.ms-excel', // .xls
        'text/csv'
      ];
      
      const fileExtension = selectedFile.name.split('.').pop()?.toLowerCase();
      const validExtensions = ['xlsx', 'xls', 'csv'];
      
      if (validTypes.includes(selectedFile.type) || validExtensions.includes(fileExtension || '')) {
        setFile(selectedFile);
      } else {
        toast({
          title: 'Arquivo inválido',
          description: 'Por favor, selecione apenas arquivos .xlsx, .xls ou .csv',
          variant: 'destructive',
        });
      }
    }
  };

  // Auto-mapeamento inteligente baseado em similaridade de nomes
  const autoMapColumns = (headers: string[]): ColumnMapping => {
    const mapping: ColumnMapping = {};
    
    headers.forEach(header => {
      const lowerHeader = header.toLowerCase();
      
      // Mapeamento inteligente baseado em palavras-chave
      if (lowerHeader.includes('nome') || lowerHeader.includes('produto') || lowerHeader.includes('name')) {
        mapping[header] = 'name';
      } else if (lowerHeader.includes('sku') || lowerHeader.includes('código') || lowerHeader.includes('codigo')) {
        mapping[header] = 'sku';
      } else if (lowerHeader.includes('descrição') && (lowerHeader.includes('simples') || lowerHeader.includes('curta'))) {
        mapping[header] = 'simple_description';
      } else if (lowerHeader.includes('descrição') && (lowerHeader.includes('completa') || lowerHeader.includes('detalhada'))) {
        mapping[header] = 'full_description';
      } else if (lowerHeader.includes('custo') || lowerHeader.includes('compra')) {
        mapping[header] = 'cost_price';
      } else if (lowerHeader.includes('venda') || lowerHeader.includes('preço') || lowerHeader.includes('preco') || lowerHeader.includes('valor')) {
        mapping[header] = 'sell_price';
      } else if (lowerHeader.includes('marca') || lowerHeader.includes('brand')) {
        mapping[header] = 'brand_name';
      } else if (lowerHeader.includes('unidade') || lowerHeader.includes('unit')) {
        mapping[header] = 'unit_name';
      } else if (lowerHeader.includes('categoria') || lowerHeader.includes('category')) {
        mapping[header] = 'category_name';
      } else if (lowerHeader.includes('imagem') || lowerHeader.includes('image')) {
        mapping[header] = 'image_urls';
      } else {
        // Se não encontrou correspondência, deixa como ignorar
        mapping[header] = 'ignore';
      }
    });
    
    return mapping;
  };

  const preProcessFile = async (file: File) => {
    try {
      const fileExtension = file.name.split('.').pop()?.toLowerCase();
      
      if (fileExtension === 'csv') {
        // Processar CSV
        const fileData = await file.text();
        const lines = fileData.split('\n').filter(line => line.trim());
        
        if (lines.length < 1) {
          throw new Error('O arquivo está vazio ou não contém dados válidos');
        }

        const headers = lines[0].split(',').map(h => h.trim().replace(/['"]/g, ''));
        return headers;
      } else {
        // Processar Excel
        const data = await file.arrayBuffer();
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });
        
        if (jsonData.length < 1) {
          throw new Error('A planilha está vazia ou não contém dados válidos');
        }

        const headers = (jsonData[0] as any[]).map(h => String(h || '').trim());
        return headers;
      }
    } catch (error) {
      console.error('Erro ao processar arquivo:', error);
      throw new Error('Erro ao processar arquivo. Verifique se o formato está correto.');
    }
  };

  const handleNextStep = async () => {
    if (!file) return;

    try {
      const headers = await preProcessFile(file);
      setFileHeaders(headers);
      setColumnMapping(autoMapColumns(headers));
      setStep('mapping');
    } catch (error: any) {
      toast({
        title: 'Erro ao processar arquivo',
        description: error.message || 'Erro ao processar arquivo.',
        variant: 'destructive',
      });
    }
  };

  const handleMappingChange = (userColumn: string, systemField: string) => {
    setColumnMapping(prev => ({
      ...prev,
      [userColumn]: systemField
    }));
  };

  const handleImport = async () => {
    if (!file) {
      toast({
        title: 'Nenhum arquivo selecionado',
        description: 'Por favor, selecione um arquivo para importar.',
        variant: 'destructive',
      });
      return;
    }

    setIsUploading(true);

    try {
      const fileExtension = file.name.split('.').pop()?.toLowerCase();
      let fileData: string;
      let fileType: string;
      
      if (fileExtension === 'csv') {
        fileData = await file.text();
        fileType = 'csv';
      } else {
        // Para Excel, converter para JSON
        const data = await file.arrayBuffer();
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1, raw: false });
        fileData = JSON.stringify(jsonData);
        fileType = 'excel';
      }
      
      const { data, error } = await supabase.functions.invoke('import-products', {
        body: { 
          fileData,
          fileType,
          columnMapping: columnMapping
        },
      });

      if (error) {
        throw error;
      }

      toast({
        title: 'Importação concluída',
        description: `${data.imported} produtos importados com sucesso! ${data.failed > 0 ? `${data.failed} falhas.` : ''}`,
      });

      onSuccess();
      resetForm();
    } catch (error: any) {
      console.error('Erro na importação:', error);
      toast({
        title: 'Erro na importação',
        description: error.message || 'Erro ao importar produtos.',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const resetForm = () => {
    setFile(null);
    setStep('upload');
    setFileHeaders([]);
    setColumnMapping({});
    onClose();
  };


  return (
    <Dialog open={open} onOpenChange={resetForm}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {step === 'upload' && 'Importar Produtos'}
            {step === 'mapping' && 'Mapear Colunas'}
          </DialogTitle>
        </DialogHeader>

        {step === 'upload' ? (
          <div className="space-y-6">
            <div className="space-y-2">
              <h4 className="text-sm font-medium">1. Baixar modelo de planilha (opcional)</h4>
              <p className="text-sm text-muted-foreground">
                Baixe um arquivo modelo se você não tem uma planilha pronta
              </p>
              <Button 
                variant="outline" 
                onClick={downloadTemplate}
                className="w-full"
              >
                <Download className="h-4 w-4 mr-2" />
                Baixar Modelo Excel
              </Button>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-medium">2. Selecionar sua planilha</h4>
              <p className="text-sm text-muted-foreground">
                Selecione o arquivo Excel ou CSV com seus produtos
              </p>
              <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted hover:bg-muted/80">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-8 h-8 mb-4 text-muted-foreground" />
                    <p className="mb-2 text-sm text-muted-foreground">
                      {file ? file.name : 'Clique para selecionar ou arraste o arquivo'}
                    </p>
                    <p className="text-xs text-muted-foreground">Arquivos .xlsx, .xls ou .csv</p>
                  </div>
                  <Input
                    type="file"
                    className="hidden"
                    accept=".xlsx,.xls,.csv"
                    onChange={handleFileChange}
                  />
                </label>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Button 
                onClick={handleNextStep} 
                disabled={!file}
                className="w-full"
              >
                <ArrowRight className="h-4 w-4 mr-2" />
                Próximo: Analisar Planilha
              </Button>
              <Button variant="outline" onClick={resetForm}>
                Cancelar
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Mapear colunas da planilha</h4>
              <p className="text-sm text-muted-foreground">
                Associe cada coluna do seu arquivo aos campos do sistema. Deixe em "Ignorar" se não quiser importar uma coluna. Para URLs de imagens, use vírgulas para separar múltiplas URLs.
              </p>
            </div>

            <div className="max-h-96 overflow-y-auto space-y-3 border rounded-lg p-4">
              {fileHeaders.map((header, index) => (
                <div key={index} className="grid grid-cols-2 gap-4 items-center py-2 border-b border-border/50 last:border-b-0">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-foreground">
                      Coluna: {header}
                    </label>
                  </div>
                  <Select
                    value={columnMapping[header] || ''}
                    onValueChange={(value) => handleMappingChange(header, value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecione o campo correspondente" />
                    </SelectTrigger>
                    <SelectContent>
                      {SYSTEM_FIELDS.map((field) => (
                        <SelectItem key={field.value} value={field.value}>
                          {field.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <Button 
                variant="outline"
                onClick={() => setStep('upload')}
                className="flex-1"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
              <Button 
                onClick={handleImport} 
                disabled={isUploading}
                className="flex-1"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Importando...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Importar Produtos
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};