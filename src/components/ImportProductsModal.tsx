import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Upload, Download, FileSpreadsheet, Loader2, ArrowLeft, ArrowRight } from 'lucide-react';
import * as XLSX from 'xlsx';

interface ImportProductsModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface ColumnMapping {
  [userColumn: string]: string;
}

interface SheetInfo {
  name: string;
  headers: string[];
}

const SYSTEM_FIELDS = [
  { value: 'name', label: 'Nome do Produto' },
  { value: 'sku', label: 'SKU/Código' },
  { value: 'simple_description', label: 'Descrição Simples' },
  { value: 'full_description', label: 'Descrição Completa' },
  { value: 'cost_price', label: 'Preço de Custo' },
  { value: 'sell_price', label: 'Preço de Venda' },
  { value: 'brand', label: 'Marca' },
  { value: 'unit', label: 'Unidade' },
  { value: 'category_id', label: 'ID da Categoria' },
  { value: 'ignore', label: 'Ignorar esta coluna' }
];

export const ImportProductsModal = ({ open, onClose, onSuccess }: ImportProductsModalProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [step, setStep] = useState<'upload' | 'sheet-selection' | 'mapping'>('upload');
  const [sheets, setSheets] = useState<SheetInfo[]>([]);
  const [selectedSheet, setSelectedSheet] = useState<string>('');
  const [fileHeaders, setFileHeaders] = useState<string[]>([]);
  const [columnMapping, setColumnMapping] = useState<ColumnMapping>({});
  const { toast } = useToast();

  const downloadTemplate = (format: 'csv' | 'xlsx' = 'xlsx') => {
    if (format === 'csv') {
      const csvContent = `name,sku,simple_description,full_description,cost_price,sell_price,brand,unit,category_id
Produto Exemplo,SKU001,Descrição simples,Descrição completa do produto,50.00,100.00,Marca Exemplo,pç,
Produto 2,SKU002,Outra descrição,Descrição detalhada,25.50,60.00,Outra Marca,kg,`;
      
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'modelo_importacao_produtos.csv';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      toast({
        title: 'Modelo baixado',
        description: 'Arquivo modelo_importacao_produtos.csv baixado com sucesso.',
      });
    } else {
      // Create Excel template
      const templateData = [
        ['name', 'sku', 'simple_description', 'full_description', 'cost_price', 'sell_price', 'brand', 'unit', 'category_id'],
        ['Produto Exemplo', 'SKU001', 'Descrição simples', 'Descrição completa do produto', 50.00, 100.00, 'Marca Exemplo', 'pç', ''],
        ['Produto 2', 'SKU002', 'Outra descrição', 'Descrição detalhada', 25.50, 60.00, 'Outra Marca', 'kg', '']
      ];
      
      const worksheet = XLSX.utils.aoa_to_sheet(templateData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Produtos');
      
      // Generate Excel file and download
      XLSX.writeFile(workbook, 'modelo_importacao_produtos.xlsx');
      
      toast({
        title: 'Modelo baixado',
        description: 'Arquivo modelo_importacao_produtos.xlsx baixado com sucesso.',
      });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    const validTypes = [
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];
    
    if (selectedFile && validTypes.includes(selectedFile.type)) {
      setFile(selectedFile);
    } else {
      toast({
        title: 'Arquivo inválido',
        description: 'Por favor, selecione um arquivo .csv, .xls ou .xlsx',
        variant: 'destructive',
      });
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
      } else if (lowerHeader.includes('marca')) {
        mapping[header] = 'brand';
      } else if (lowerHeader.includes('unidade') || lowerHeader.includes('unit')) {
        mapping[header] = 'unit';
      } else {
        // Se não encontrou correspondência, deixa como ignorar
        mapping[header] = 'ignore';
      }
    });
    
    return mapping;
  };

  const preProcessFile = async (file: File): Promise<SheetInfo[]> => {
    try {
      let fileData: string;
      let fileType: string;
      
      if (file.type === 'text/csv') {
        fileData = await file.text();
        fileType = 'csv';
      } else {
        // For Excel files, convert to base64
        const arrayBuffer = await file.arrayBuffer();
        const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
        fileData = base64;
        fileType = 'excel';
      }
      
      const { data, error } = await supabase.functions.invoke('pre-process-sheet', {
        body: { 
          fileData,
          fileType,
          fileName: file.name
        },
      });

      if (error) {
        throw error;
      }

      if (!data.success) {
        throw new Error(data.error || 'Erro ao processar arquivo');
      }

      return data.sheets;
    } catch (error) {
      console.error('Erro ao pré-processar arquivo:', error);
      throw new Error('Erro ao processar arquivo');
    }
  };

  const handleNextStep = async () => {
    if (!file) return;

    try {
      const sheetsData = await preProcessFile(file);
      setSheets(sheetsData);
      
      // If only one sheet, auto-select it and go to mapping
      if (sheetsData.length === 1) {
        setSelectedSheet(sheetsData[0].name);
        setFileHeaders(sheetsData[0].headers);
        setColumnMapping(autoMapColumns(sheetsData[0].headers));
        setStep('mapping');
      } else {
        // Multiple sheets, let user choose
        setStep('sheet-selection');
      }
    } catch (error: any) {
      toast({
        title: 'Erro ao processar arquivo',
        description: error.message || 'Erro ao processar arquivo.',
        variant: 'destructive',
      });
    }
  };

  const handleSheetSelection = (sheetName: string) => {
    setSelectedSheet(sheetName);
    const sheet = sheets.find(s => s.name === sheetName);
    if (sheet) {
      setFileHeaders(sheet.headers);
      setColumnMapping(autoMapColumns(sheet.headers));
      setStep('mapping');
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
      // Convert file to base64 for Excel files or text for CSV
      let fileData: string;
      let fileType: string;
      
      if (file.type === 'text/csv') {
        fileData = await file.text();
        fileType = 'csv';
      } else {
        // For Excel files, convert to base64
        const arrayBuffer = await file.arrayBuffer();
        const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
        fileData = base64;
        fileType = 'excel';
      }
      
      const { data, error } = await supabase.functions.invoke('import-products', {
        body: { 
          fileData,
          fileType,
          fileName: file.name,
          selectedSheet: selectedSheet,
          columnMapping: step === 'mapping' ? columnMapping : undefined
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
    setSheets([]);
    setSelectedSheet('');
    setFileHeaders([]);
    setColumnMapping({});
    onClose();
  };


  return (
    <Dialog open={open} onOpenChange={resetForm}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            {step === 'upload' && 'Importar Produtos'}
            {step === 'sheet-selection' && 'Selecionar Aba'}
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
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => downloadTemplate('xlsx')}
                  className="flex-1"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Baixar Modelo Excel
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => downloadTemplate('csv')}
                  className="flex-1"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Baixar Modelo CSV
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-medium">2. Selecionar sua planilha</h4>
              <p className="text-sm text-muted-foreground">
                Selecione o arquivo com seus produtos (qualquer formato de Excel ou CSV)
              </p>
              <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted hover:bg-muted/80">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-8 h-8 mb-4 text-muted-foreground" />
                    <p className="mb-2 text-sm text-muted-foreground">
                      {file ? file.name : 'Clique para selecionar ou arraste o arquivo'}
                    </p>
                    <p className="text-xs text-muted-foreground">Arquivos .csv, .xls ou .xlsx</p>
                  </div>
                  <Input
                    type="file"
                    className="hidden"
                    accept=".csv,.xls,.xlsx"
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
        ) : step === 'sheet-selection' ? (
          <div className="space-y-6">
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Selecionar aba para importação</h4>
              <p className="text-sm text-muted-foreground">
                Seu arquivo possui múltiplas abas. Selecione a aba que contém os dados dos produtos que você deseja importar.
              </p>
            </div>

            <div className="space-y-4">
              {sheets.map((sheet, index) => (
                <div 
                  key={index} 
                  className="border rounded-lg p-4 hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() => handleSheetSelection(sheet.name)}
                >
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <h5 className="font-medium">{sheet.name}</h5>
                      <p className="text-sm text-muted-foreground">
                        {sheet.headers.length} colunas encontradas
                      </p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="mt-2 text-xs text-muted-foreground">
                    <strong>Colunas:</strong> {sheet.headers.slice(0, 5).join(', ')}{sheet.headers.length > 5 ? '...' : ''}
                  </div>
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
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Mapear colunas da aba "{selectedSheet}"</h4>
              <p className="text-sm text-muted-foreground">
                Associe cada coluna do seu arquivo aos campos do sistema. Deixe em "Ignorar" se não quiser importar uma coluna.
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
                onClick={() => sheets.length > 1 ? setStep('sheet-selection') : setStep('upload')}
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