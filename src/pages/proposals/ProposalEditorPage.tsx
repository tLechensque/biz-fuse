import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Loader2, Save, Eye, ArrowLeft, Send } from 'lucide-react';
import { FormProvider } from 'react-hook-form';
import { useProposalEditor } from '@/features/proposals/editor/useProposalEditor';
import { ProposalHeaderForm } from '@/features/proposals/editor/ProposalHeaderForm';
import { ProposalSectionsManager } from '@/features/proposals/editor/ProposalSectionsManager';
import { PaymentConditionsEditor } from '@/features/proposals/editor/PaymentConditionsEditor';
import { NotesEditor } from '@/features/proposals/editor/NotesEditor';
import { TaxesAndShippingEditor } from '@/features/proposals/editor/TaxesAndShippingEditor';
import { TotalsCard } from '@/features/proposals/editor/TotalsCard';
import { toast } from 'sonner';

export default function ProposalEditorPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isNew = id === 'new';
  const proposalId = isNew ? undefined : id;

  const { form, isLoading, saveMutation, existingProposal } = useProposalEditor(proposalId);

  const handleSave = () => {
    form.handleSubmit((data) => {
      saveMutation.mutate(data);
    })();
  };

  const handlePreview = () => {
    if (existingProposal) {
      navigate(`/preview/${existingProposal.id}`);
    }
  };

  const handleSend = () => {
    form.handleSubmit((data) => {
      const updatedData = { ...data, status: 'SENT' as const };
      saveMutation.mutate(updatedData, {
        onSuccess: () => {
          toast.success('Proposta enviada com sucesso!');
        },
      });
    })();
  };

  const status = form.watch('status');
  const getStatusBadge = () => {
    const variants: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' }> = {
      DRAFT: { label: 'Rascunho', variant: 'secondary' },
      SENT: { label: 'Enviada', variant: 'default' },
      APPROVED: { label: 'Aprovada', variant: 'default' },
      REJECTED: { label: 'Rejeitada', variant: 'destructive' },
    };
    const config = variants[status] || variants.DRAFT;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <FormProvider {...form}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/propostas')}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold">
                  {isNew ? 'Nova Proposta' : 'Editar Proposta'}
                </h1>
                {!isNew && getStatusBadge()}
              </div>
              <p className="text-muted-foreground mt-1">
                {isNew
                  ? 'Preencha os dados para criar uma nova proposta'
                  : 'Atualize as informações da proposta'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Show detailed descriptions toggle */}
            <div className="flex items-center gap-2">
              <Switch
                id="show-details"
                checked={form.watch('showDetailedDescriptions')}
                onCheckedChange={(checked) =>
                  form.setValue('showDetailedDescriptions', checked, { shouldDirty: true })
                }
              />
              <Label htmlFor="show-details" className="text-sm cursor-pointer">
                Mostrar descrições detalhadas
              </Label>
            </div>

            {!isNew && (
              <>
                <Button variant="outline" onClick={handlePreview}>
                  <Eye className="w-4 h-4 mr-2" />
                  Preview
                </Button>

                {status === 'DRAFT' && (
                  <Button variant="default" onClick={handleSend} disabled={saveMutation.isPending}>
                    {saveMutation.isPending ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4 mr-2" />
                    )}
                    Enviar
                  </Button>
                )}
              </>
            )}

            <Button variant="secondary" onClick={handleSave} disabled={saveMutation.isPending}>
              {saveMutation.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Salvar
            </Button>
          </div>
        </div>

        <Separator />

        {/* Layout: Main content + Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
          {/* Main Content */}
          <div className="space-y-6">
            {/* Header Form */}
            <ProposalHeaderForm form={form} />

            {/* Sections */}
            <ProposalSectionsManager form={form} />

            {/* Taxes and Shipping */}
            <TaxesAndShippingEditor form={form} />

            {/* Payment Conditions */}
            <PaymentConditionsEditor form={form} />

            {/* Notes */}
            <NotesEditor form={form} />
          </div>

          {/* Sidebar */}
          <div>
            <TotalsCard form={form} />
          </div>
        </div>

        {/* Auto-save indicator */}
        {form.formState.isDirty && !saveMutation.isPending && (
          <div className="fixed bottom-4 right-4 bg-muted text-muted-foreground px-4 py-2 rounded-lg shadow-lg text-sm">
            Salvando automaticamente...
          </div>
        )}

        {saveMutation.isSuccess && (
          <div className="fixed bottom-4 right-4 bg-success text-success-foreground px-4 py-2 rounded-lg shadow-lg text-sm">
            ✓ Salvo com sucesso
          </div>
        )}
      </div>
    </FormProvider>
  );
}
