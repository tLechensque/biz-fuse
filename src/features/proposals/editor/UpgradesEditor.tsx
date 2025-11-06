import { UseFormReturn, useFieldArray } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Plus, Trash2 } from 'lucide-react';
import { ProposalEditorForm } from './proposal-editor-schema';

interface Props {
  form: UseFormReturn<ProposalEditorForm>;
  sectionIndex: number;
}

export function UpgradesEditor({ form, sectionIndex }: Props) {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: `sections.${sectionIndex}.upgrades`,
  });

  const sectionSubtotal = form.watch(`sections.${sectionIndex}.subtotal`) || 0;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const handleAdd = () => {
    append({
      id: crypto.randomUUID(),
      description: '',
      upgradeValue: 0,
      totalWithUpgrade: sectionSubtotal,
    });
  };

  const updateUpgradeTotal = (upgradeIndex: number) => {
    const upgradeValue =
      form.getValues(`sections.${sectionIndex}.upgrades.${upgradeIndex}.upgradeValue`) || 0;
    const total = sectionSubtotal + upgradeValue;
    form.setValue(
      `sections.${sectionIndex}.upgrades.${upgradeIndex}.totalWithUpgrade`,
      total,
      { shouldDirty: true }
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-medium">Opções de Upgrade de Rede</h4>
          <p className="text-sm text-muted-foreground">
            Adicione opções de upgrade que somam ao subtotal da rede
          </p>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={handleAdd}>
          <Plus className="w-4 h-4 mr-2" />
          Adicionar Upgrade
        </Button>
      </div>

      {fields.length > 0 && (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Descrição</TableHead>
                <TableHead className="w-40">Valor do Upgrade</TableHead>
                <TableHead className="w-40">Total com Upgrade</TableHead>
                <TableHead className="w-20 text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {fields.map((field, index) => {
                const upgrade = form.watch(`sections.${sectionIndex}.upgrades.${index}`);
                return (
                  <TableRow key={field.id}>
                    <TableCell>
                      <Input
                        {...form.register(`sections.${sectionIndex}.upgrades.${index}.description`)}
                        placeholder="Ex: Wi-Fi 7 com 2.5 GbE"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min={0}
                        step={0.01}
                        {...form.register(
                          `sections.${sectionIndex}.upgrades.${index}.upgradeValue`,
                          { valueAsNumber: true }
                        )}
                        onChange={() => updateUpgradeTotal(index)}
                        className="text-right"
                      />
                    </TableCell>
                    <TableCell className="font-semibold">
                      {formatCurrency(upgrade.totalWithUpgrade)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => remove(index)}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {fields.length > 0 && (
        <div className="p-4 bg-muted rounded-lg space-y-2">
          <div className="flex justify-between text-sm">
            <span>Subtotal Rede (Base):</span>
            <span className="font-semibold">{formatCurrency(sectionSubtotal)}</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Os valores dos upgrades serão somados ao subtotal base para calcular o total com upgrade
          </p>
        </div>
      )}
    </div>
  );
}
