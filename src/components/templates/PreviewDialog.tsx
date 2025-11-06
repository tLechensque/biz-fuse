import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { TemplateLayout } from '@/features/templates/engine/schema';
import { TemplateRenderer } from '@/features/templates/engine/render';
import { AlertCircle } from 'lucide-react';

interface PreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  layout: TemplateLayout;
}

// Dados mock para preview
const MOCK_DATA = {
  proposal: {
    id: 'preview-id',
    code: 'PREV123',
    title: 'Proposta Comercial - Exemplo',
    issueDate: new Date().toISOString().split('T')[0],
    validityDays: 15,
    status: 'DRAFT',
    version: 1,
  },
  organization: {
    name: 'Sua Empresa Ltda',
    email: 'contato@suaempresa.com',
    phone: '(11) 9999-9999',
    whatsapp: '(11) 99999-9999',
    cnpj: '00.000.000/0001-00',
    address: 'Rua Exemplo, 123 - São Paulo, SP',
  },
  client: {
    name: 'Cliente Exemplo',
    email: 'cliente@exemplo.com',
    phone: '(11) 8888-8888',
    address: 'Rua do Cliente, 456',
    city: 'São Paulo',
    state: 'SP',
  },
  salesperson: {
    name: 'Vendedor Exemplo',
    email: 'vendedor@suaempresa.com',
    phone: '(11) 7777-7777',
  },
  items: [
    {
      id: '1',
      group: 'Automação',
      brand: { id: '1', name: 'Marca A' },
      product: { id: '1', name: 'Produto Exemplo 1', model: 'Modelo X' },
      qty: 2,
      unitPrice: 500.0,
      subtotal: 1000.0,
      simpleDescription: 'Descrição simples do produto',
      detailedDescription: 'Descrição detalhada com especificações técnicas',
    },
    {
      id: '2',
      group: 'Automação',
      brand: { id: '2', name: 'Marca B' },
      product: { id: '2', name: 'Produto Exemplo 2', model: 'Modelo Y' },
      qty: 1,
      unitPrice: 1200.0,
      subtotal: 1200.0,
      simpleDescription: 'Descrição simples do produto',
    },
    {
      id: '3',
      group: 'Iluminação',
      brand: { id: '1', name: 'Marca A' },
      product: { id: '3', name: 'Produto Exemplo 3' },
      qty: 5,
      unitPrice: 150.0,
      subtotal: 750.0,
    },
  ],
  upgrades: [
    { name: 'Instalação Premium', delta: 500.0, selected: true },
    { name: 'Garantia Estendida', delta: 300.0, selected: false },
  ],
  payments: [
    { label: 'À Vista', amount: 2950.0, details: 'Desconto de 5%' },
    { label: 'Parcelado 3x', amount: 3100.0, details: 'Sem juros' },
  ],
  notes: [
    'Validade da proposta: 15 dias úteis',
    'Valores sujeitos a alteração sem aviso prévio',
    'Instalação não inclusa',
  ],
  totals: {
    subtotal: 2950.0,
    upgradesTotal: 500.0,
    total: 3450.0,
    margin: 35.5,
  },
};

export function PreviewDialog({ open, onOpenChange, layout }: PreviewDialogProps) {
  const [showDetails, setShowDetails] = useState(false);

  const context = {
    data: MOCK_DATA as any,
    flags: { showDetails },
    theme: layout.theme,
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Preview do Template</DialogTitle>
        </DialogHeader>

        <Alert className="my-2">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-xs">
            Este preview usa dados fictícios. O template final usará dados reais das
            propostas.
          </AlertDescription>
        </Alert>

        <div className="flex items-center gap-4 py-2">
          <div className="flex items-center gap-2">
            <Switch
              id="preview-details"
              checked={showDetails}
              onCheckedChange={setShowDetails}
            />
            <Label htmlFor="preview-details" className="text-sm cursor-pointer">
              Mostrar Detalhes
            </Label>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto border rounded-lg bg-background p-6">
          <div className="max-w-4xl mx-auto">
            <TemplateRenderer layout={layout} context={context} />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
