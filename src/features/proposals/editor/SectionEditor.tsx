import { UseFormReturn } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { GripVertical, Eye, EyeOff, Trash2 } from 'lucide-react';
import { ProposalEditorForm } from './proposal-editor-schema';
import { ItemsTable } from './ItemsTable';

interface Props {
  form: UseFormReturn<ProposalEditorForm>;
  sectionIndex: number;
  onRemove: () => void;
}

export function SectionEditor({ form, sectionIndex, onRemove }: Props) {
  const section = form.watch(`sections.${sectionIndex}`);

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1">
            <GripVertical className="w-5 h-5 text-muted-foreground cursor-grab" />
            <Input
              {...form.register(`sections.${sectionIndex}.name`)}
              className="font-semibold text-lg border-none shadow-none px-2"
            />
            {section.excludeFromPayment && (
              <Badge variant="outline" className="text-orange-500 border-orange-500">
                Excluído do pagamento
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() =>
                form.setValue(`sections.${sectionIndex}.visible`, !section.visible, {
                  shouldDirty: true,
                })
              }
            >
              {section.visible ? (
                <Eye className="w-4 h-4" />
              ) : (
                <EyeOff className="w-4 h-4" />
              )}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onRemove}
            >
              <Trash2 className="w-4 h-4 text-destructive" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Items Table */}
        <ItemsTable form={form} sectionIndex={sectionIndex} />

        {/* Special Note */}
        {section.specialNote && (
          <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
            <p className="text-sm text-orange-800">
              <strong>Observação:</strong> {section.specialNote}
            </p>
          </div>
        )}

        {/* Exclude from payment */}
        <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
          <div className="space-y-1">
            <Label htmlFor={`exclude-payment-${sectionIndex}`}>
              Excluir desta seção do cálculo de pagamento
            </Label>
            <p className="text-xs text-muted-foreground">
              Os itens desta seção não serão incluídos nas formas de pagamento
            </p>
          </div>
          <Switch
            id={`exclude-payment-${sectionIndex}`}
            checked={section.excludeFromPayment}
            onCheckedChange={(checked) =>
              form.setValue(`sections.${sectionIndex}.excludeFromPayment`, checked, {
                shouldDirty: true,
              })
            }
          />
        </div>

        {/* Custom Note */}
        <div className="space-y-2">
          <Label>Nota Específica desta Seção (opcional)</Label>
          <Textarea
            {...form.register(`sections.${sectionIndex}.specialNote`)}
            placeholder="Ex: Pagamento direto com parceiro, não incluso nas formas de pagamento..."
            rows={2}
          />
        </div>
      </CardContent>
    </Card>
  );
}
