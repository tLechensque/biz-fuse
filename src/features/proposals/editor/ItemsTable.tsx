import { UseFormReturn, useFieldArray } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Trash2, Plus, Copy } from 'lucide-react';
import { ProposalEditorForm } from './proposal-editor-schema';
import { ProductSearchDialog } from './ProductSearchDialog';
import { useState, useEffect } from 'react';

interface Props {
  form: UseFormReturn<ProposalEditorForm>;
  sectionIndex: number;
}

export function ItemsTable({ form, sectionIndex }: Props) {
  const [showProductSearch, setShowProductSearch] = useState(false);

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: `sections.${sectionIndex}.items`,
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const handleAddProduct = (product: any) => {
    append({
      ...product,
      id: crypto.randomUUID(),
    });
    updateSectionSubtotal();
  };

  const handleDuplicate = (index: number) => {
    const item = form.getValues(`sections.${sectionIndex}.items.${index}`);
    append({ ...item, id: crypto.randomUUID() });
    updateSectionSubtotal();
  };

  const handleRemove = (index: number) => {
    remove(index);
    updateSectionSubtotal();
  };

  const updateItemSubtotal = (itemIndex: number) => {
    const item = form.getValues(`sections.${sectionIndex}.items.${itemIndex}`);
    const subtotal = item.qty * item.unitPrice;
    form.setValue(`sections.${sectionIndex}.items.${itemIndex}.subtotal`, subtotal, {
      shouldDirty: true,
    });
    updateSectionSubtotal();
  };

  const updateSectionSubtotal = () => {
    const items = form.getValues(`sections.${sectionIndex}.items`);
    const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
    form.setValue(`sections.${sectionIndex}.subtotal`, subtotal, { shouldDirty: true });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-medium">Itens</h4>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setShowProductSearch(true)}
        >
          <Plus className="w-4 h-4 mr-2" />
          Adicionar Produto
        </Button>
      </div>

      {fields.length === 0 ? (
        <div className="text-center py-8 border rounded-lg border-dashed">
          <p className="text-muted-foreground mb-4">Nenhum item adicionado</p>
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowProductSearch(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Primeiro Item
          </Button>
        </div>
      ) : (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12"></TableHead>
                <TableHead>Produto</TableHead>
                <TableHead>Marca</TableHead>
                <TableHead className="w-24">Qtd</TableHead>
                <TableHead className="w-32">Unitário</TableHead>
                <TableHead className="w-32">Subtotal</TableHead>
                <TableHead className="w-24 text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {fields.map((field, index) => {
                const item = form.watch(`sections.${sectionIndex}.items.${index}`);
                return (
                  <TableRow key={field.id}>
                    <TableCell>
                      {item.imageUrl && (
                        <img
                          src={item.imageUrl}
                          alt={item.productName}
                          className="w-10 h-10 object-cover rounded"
                        />
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <p className="font-medium">{item.productName}</p>
                        {item.simpleDescription && (
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {item.simpleDescription}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {item.brandName && (
                        <Badge variant="outline">{item.brandName}</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min={0.01}
                        step={0.01}
                        {...form.register(
                          `sections.${sectionIndex}.items.${index}.qty`,
                          { valueAsNumber: true }
                        )}
                        onChange={() => updateItemSubtotal(index)}
                        className="w-20"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min={0}
                        step={0.01}
                        {...form.register(
                          `sections.${sectionIndex}.items.${index}.unitPrice`,
                          { valueAsNumber: true }
                        )}
                        onChange={() => updateItemSubtotal(index)}
                        className="w-28"
                      />
                    </TableCell>
                    <TableCell className="font-semibold">
                      {formatCurrency(item.subtotal)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDuplicate(index)}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemove(index)}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
              <TableRow className="bg-muted/50">
                <TableCell colSpan={5} className="text-right font-semibold">
                  Subtotal da Seção:
                </TableCell>
                <TableCell className="font-bold text-lg">
                  {formatCurrency(form.watch(`sections.${sectionIndex}.subtotal`) || 0)}
                </TableCell>
                <TableCell></TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      )}

      <ProductSearchDialog
        open={showProductSearch}
        onClose={() => setShowProductSearch(false)}
        onSelect={handleAddProduct}
      />
    </div>
  );
}
