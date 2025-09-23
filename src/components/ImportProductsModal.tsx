import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Upload, Download, FileSpreadsheet, Loader2 } from 'lucide-react';

interface ImportProductsModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const ImportProductsModal = ({ open, onClose, onSuccess }: ImportProductsModalProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const downloadTemplate = () => {
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
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === 'text/csv') {
      setFile(selectedFile);
    } else {
      toast({
        title: 'Arquivo inválido',
        description: 'Por favor, selecione um arquivo .csv',
        variant: 'destructive',
      });
    }
  };

  const handleImport = async () => {
    if (!file) {
      toast({
        title: 'Nenhum arquivo selecionado',
        description: 'Por favor, selecione um arquivo CSV para importar.',
        variant: 'destructive',
      });
      return;
    }

    setIsUploading(true);

    try {
      const fileText = await file.text();
      
      const { data, error } = await supabase.functions.invoke('import-products', {
        body: { csvData: fileText },
      });

      if (error) {
        throw error;
      }

      toast({
        title: 'Importação concluída',
        description: `${data.imported} produtos importados com sucesso! ${data.failed > 0 ? `${data.failed} falhas.` : ''}`,
      });

      onSuccess();
      onClose();
      setFile(null);
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
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={resetForm}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            Importar Produtos
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-2">
            <h4 className="text-sm font-medium">1. Baixar modelo de planilha</h4>
            <p className="text-sm text-muted-foreground">
              Baixe o arquivo modelo com os cabeçalhos corretos
            </p>
            <Button 
              variant="outline" 
              onClick={downloadTemplate}
              className="w-full"
            >
              <Download className="h-4 w-4 mr-2" />
              Baixar Modelo CSV
            </Button>
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-medium">2. Selecionar arquivo preenchido</h4>
            <p className="text-sm text-muted-foreground">
              Selecione o arquivo CSV com os produtos preenchidos
            </p>
            <div className="flex items-center justify-center w-full">
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted hover:bg-muted/80">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-8 h-8 mb-4 text-muted-foreground" />
                  <p className="mb-2 text-sm text-muted-foreground">
                    {file ? file.name : 'Clique para selecionar ou arraste o arquivo CSV'}
                  </p>
                  <p className="text-xs text-muted-foreground">Apenas arquivos .csv</p>
                </div>
                <Input
                  type="file"
                  className="hidden"
                  accept=".csv"
                  onChange={handleFileChange}
                />
              </label>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Button 
              onClick={handleImport} 
              disabled={!file || isUploading}
              className="w-full"
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
            <Button variant="outline" onClick={resetForm}>
              Cancelar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};