import { UseFormReturn, useFieldArray } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Trash2, Plus, ArrowUpCircle } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ProposalEditorForm } from './proposal-editor-schema';
import { ProductSearchDialog } from './ProductSearchDialog';
import { useState } from 'react';

interface Props {
  form: UseFormReturn<ProposalEditorForm>;
  sectionIndex: number;
}

export function ItemsTable({ form, sectionIndex }: Props) {
  const [showProductSearch, setShowProductSearch] = useState(false);
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);
  const [upgradeTargetIndex, setUpgradeTargetIndex] = useState<number | null>(null);

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
    // Aceita tanto o objeto 'raw' do banco quanto o objeto mapeado
    const sellPrice = Number(
      product.sell_price ?? product.unitPrice ?? 0
    );
    const costPrice = Number(product.cost_price ?? product.costPrice ?? 0);
    const brandId = product.brand_id ?? product.brandId ?? product.brands?.id ?? '';
    const brandName = product.brand ?? product.brandName ?? product.brands?.name ?? '';
    const imageUrl = product.image_urls?.[0] ?? product.image_url ?? product.imageUrl ?? '';

    append({
      id: crypto.randomUUID(),
      productId: product.id ?? product.productId,
      productName: product.name ?? product.productName ?? 'Produto',
      brandId,
      brandName,
      model: product.model ?? product.unit ?? '',
      sku: product.sku ?? '',
      qty: 1,
      unitPrice: sellPrice,
      costPrice,
      discountEnabled: false,
      discountType: 'percentage',
      discountValue: 0,
      subtotal: sellPrice,
      simpleDescription: product.simple_description ?? product.simpleDescription ?? '',
      detailedDescription: product.full_description ?? product.detailedDescription ?? '',
      imageUrl,
    });

    setShowProductSearch(false);

    // Atualiza subtotal da seção logo após inserir
    setTimeout(() => {
      updateSectionSubtotal();
    }, 0);
  };

  const handleRemove = (index: number) => {
    remove(index);
    setTimeout(() => updateSectionSubtotal(), 50);
  };

  const updateItemSubtotal = (itemIndex: number) => {
    const item = form.getValues(`sections.${sectionIndex}.items.${itemIndex}`);
    const baseSubtotal = item.qty * item.unitPrice;
    
    let discountAmount = 0;
    if (item.discountEnabled) {
      if (item.discountType === 'percentage') {
        discountAmount = baseSubtotal * (item.discountValue / 100);
      } else {
        discountAmount = item.discountValue;
      }
    }
    
    const upgradeValue = item.upgradeDelta || 0;
    const subtotal = baseSubtotal - discountAmount + upgradeValue;
    
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

  const handleOpenUpgradeDialog = (index: number) => {
    setUpgradeTargetIndex(index);
    setShowUpgradeDialog(true);
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
                <TableHead className="w-48">Desconto</TableHead>
                <TableHead className="w-32">Subtotal</TableHead>
                <TableHead className="w-16 text-center">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {fields.map((field, index) => {
                const item = form.watch(`sections.${sectionIndex}.items.${index}`) || field;
                return (
                  <TableRow key={field.id}>
                    <TableCell>
                      {item?.imageUrl && (
                        <img
                          src={item.imageUrl}
                          alt={item.productName || 'Produto'}
                          className="w-10 h-10 object-cover rounded"
                        />
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <p className="font-medium">{item?.productName || 'Sem nome'}</p>
                        {item?.simpleDescription && (
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {item.simpleDescription}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {item?.brandName && (
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
                    <TableCell>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Checkbox
                            checked={item.discountEnabled}
                            onCheckedChange={(checked) => {
                              form.setValue(
                                `sections.${sectionIndex}.items.${index}.discountEnabled`,
                                !!checked
                              );
                              if (!checked) {
                                form.setValue(
                                  `sections.${sectionIndex}.items.${index}.discountValue`,
                                  0
                                );
                              }
                              updateItemSubtotal(index);
                            }}
                          />
                          <Label className="text-xs">Aplicar desconto</Label>
                        </div>
                        {item.discountEnabled && (
                          <div className="flex gap-2">
                            <Select
                              value={item.discountType || 'percentage'}
                              onValueChange={(value) => {
                                form.setValue(
                                  `sections.${sectionIndex}.items.${index}.discountType`,
                                  value as 'percentage' | 'fixed'
                                );
                                updateItemSubtotal(index);
                              }}
                            >
                              <SelectTrigger className="w-20">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="percentage">%</SelectItem>
                                <SelectItem value="fixed">R$</SelectItem>
                              </SelectContent>
                            </Select>
                            <Input
                              type="number"
                              min={0}
                              step={0.01}
                              placeholder={item.discountType === 'percentage' ? '0' : '0,00'}
                              {...form.register(
                                `sections.${sectionIndex}.items.${index}.discountValue`,
                                { valueAsNumber: true }
                              )}
                              onChange={() => updateItemSubtotal(index)}
                              className="w-24"
                            />
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-semibold">
                        {formatCurrency(item?.subtotal || 0)}
                      </div>
                      {item?.upgradeProductName && (
                        <div className="text-xs text-muted-foreground mt-1">
                          + Upgrade: {item.upgradeProductName} (+{formatCurrency(item.upgradeDelta || 0)})
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenUpgradeDialog(index)}
                          title="Adicionar Upgrade"
                        >
                          <ArrowUpCircle className="w-4 h-4 text-primary" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemove(index)}
                          title="Remover Item"
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
              <TableRow className="bg-muted/50">
                <TableCell colSpan={6} className="text-right font-semibold">
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

      {upgradeTargetIndex !== null && (
        <ProductSearchDialog
          open={showUpgradeDialog}
          onClose={() => {
            setShowUpgradeDialog(false);
            setUpgradeTargetIndex(null);
          }}
          onSelect={(product) => {
            const currentItem = form.getValues(`sections.${sectionIndex}.items.${upgradeTargetIndex}`);
            const delta = product.sell_price - currentItem.unitPrice;
            
            form.setValue(`sections.${sectionIndex}.items.${upgradeTargetIndex}.upgradeProductId`, product.id);
            form.setValue(`sections.${sectionIndex}.items.${upgradeTargetIndex}.upgradeProductName`, product.name);
            form.setValue(`sections.${sectionIndex}.items.${upgradeTargetIndex}.upgradeUnitPrice`, product.sell_price);
            form.setValue(`sections.${sectionIndex}.items.${upgradeTargetIndex}.upgradeDelta`, delta);
            
            updateItemSubtotal(upgradeTargetIndex);
            
            setShowUpgradeDialog(false);
            setUpgradeTargetIndex(null);
          }}
        />
      )}
    </div>
  );
}
