import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useProfile } from '@/hooks/useProfile';
import { useDebounce } from '@/hooks/useDebounce';
import { useEffect } from 'react';
import { toast } from 'sonner';
import {
  ProposalEditorFormSchema,
  ProposalEditorForm,
  DEFAULT_SECTIONS,
  ProposalSection,
} from './proposal-editor-schema';

export function useProposalEditor(proposalId?: string) {
  const { profile } = useProfile();
  const queryClient = useQueryClient();

  // Form
  const form = useForm<ProposalEditorForm>({
    resolver: zodResolver(ProposalEditorFormSchema),
    defaultValues: {
      clientId: '',
      title: '',
      issueDate: new Date().toISOString().split('T')[0],
      validityDays: 3,
      sections: DEFAULT_SECTIONS.map((s, i) => ({
        id: crypto.randomUUID(),
        name: s.name!,
        order: i,
        visible: true,
        items: [],
        upgrades: [],
        subtotal: 0,
        excludeFromPayment: s.excludeFromPayment || false,
        specialNote: s.name === 'Aspiração Central' 
          ? 'Esse item não está incluso nas formas de pagamento; pagamento direto com parceiro.'
          : undefined,
      })),
      paymentConditions: [],
      notes: {
        generalNotes: '',
        inclusions: [],
        exclusions: [],
      },
      showDetailedDescriptions: false,
    },
  });

  // Load existing proposal
  const { data: existingProposal, isLoading } = useQuery({
    queryKey: ['proposal', proposalId],
    queryFn: async () => {
      if (!proposalId) return null;
      const { data, error } = await supabase
        .from('proposals')
        .select('*, clients(name)')
        .eq('id', proposalId)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !!proposalId,
  });

  // Populate form with existing data
  useEffect(() => {
    if (existingProposal) {
      const items = Array.isArray(existingProposal.items) ? existingProposal.items : [];
      
      // Group items by section
      const sectionMap = new Map<string, any[]>();
      items.forEach((item: any) => {
        const group = item.group || 'Geral';
        if (!sectionMap.has(group)) {
          sectionMap.set(group, []);
        }
        sectionMap.get(group)!.push({
          id: item.id || crypto.randomUUID(),
          productId: item.product_id,
          productName: item.product_name || item.name,
          brandId: item.brand_id,
          brandName: item.brand,
          model: item.model,
          sku: item.sku,
          qty: Number(item.quantity || item.qty || 1),
          unitPrice: Number(item.unit_price || item.unitPrice || 0),
          subtotal: Number(item.subtotal || item.total_price || 0),
          simpleDescription: item.simple_description || item.simpleDescription,
          detailedDescription: item.full_description || item.detailedDescription,
          imageUrl: item.image_url || item.imageUrl,
        });
      });

      // Rebuild sections
      const sections: ProposalSection[] = [];
      let order = 0;
      sectionMap.forEach((items, name) => {
        const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
        sections.push({
          id: crypto.randomUUID(),
          name,
          order: order++,
          visible: true,
          items,
          upgrades: [],
          subtotal,
          excludeFromPayment: name === 'Aspiração Central',
          specialNote: name === 'Aspiração Central'
            ? 'Esse item não está incluso nas formas de pagamento; pagamento direto com parceiro.'
            : undefined,
        });
      });

      form.reset({
        clientId: existingProposal.client_id || '',
        title: existingProposal.title,
        code: existingProposal.id.substring(0, 8).toUpperCase(),
        issueDate: new Date(existingProposal.created_at).toISOString().split('T')[0],
        validityDays: 3,
        sections: sections.length > 0 ? sections : form.getValues('sections'),
        paymentConditions: [],
        notes: {
          generalNotes: '',
          inclusions: [],
          exclusions: [],
        },
        showDetailedDescriptions: false,
      });
    }
  }, [existingProposal, form]);

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: async (data: ProposalEditorForm) => {
      // Flatten all items from all sections
      const allItems = data.sections.flatMap((section) =>
        section.items.map((item) => ({
          id: item.id,
          group: section.name,
          product_id: item.productId,
          product_name: item.productName,
          brand_id: item.brandId,
          brand: item.brandName,
          model: item.model,
          sku: item.sku,
          quantity: item.qty,
          unit_price: item.unitPrice,
          subtotal: item.subtotal,
          simple_description: item.simpleDescription,
          full_description: item.detailedDescription,
          image_url: item.imageUrl,
        }))
      );

      const totalValue = data.sections
        .filter((s) => !s.excludeFromPayment)
        .reduce((sum, s) => sum + s.subtotal, 0);

      const proposalData = {
        title: data.title,
        client_id: data.clientId,
        client_name: '', // será preenchido pelo trigger
        organization_id: profile!.organization_id,
        user_id: profile!.user_id,
        items: allItems,
        value: totalValue,
        status: 'DRAFT',
        description: data.notes.generalNotes,
      };

      if (proposalId) {
        const { data: updated, error } = await supabase
          .from('proposals')
          .update(proposalData)
          .eq('id', proposalId)
          .select()
          .single();
        if (error) throw error;
        return updated;
      } else {
        const { data: created, error } = await supabase
          .from('proposals')
          .insert(proposalData)
          .select()
          .single();
        if (error) throw error;
        return created;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proposals'] });
      queryClient.invalidateQueries({ queryKey: ['proposal', proposalId] });
      toast.success('Proposta salva com sucesso!');
    },
    onError: (error) => {
      console.error('Erro ao salvar proposta:', error);
      toast.error('Erro ao salvar proposta');
    },
  });

  // Autosave (debounced)
  const formValues = form.watch();
  const debouncedValues = useDebounce(formValues, 2000);

  useEffect(() => {
    if (debouncedValues && form.formState.isDirty && !form.formState.isSubmitting) {
      const isValid = form.formState.isValid;
      if (isValid) {
        saveMutation.mutate(debouncedValues);
      }
    }
  }, [debouncedValues]);

  // Calculate totals
  const calculateTotals = () => {
    const sections = form.getValues('sections');
    const subtotal = sections
      .filter((s) => !s.excludeFromPayment)
      .reduce((sum, s) => sum + s.subtotal, 0);
    
    const upgradesTotal = sections
      .flatMap((s) => s.upgrades)
      .reduce((sum, u) => sum + u.upgradeValue, 0);

    return {
      subtotal,
      upgradesTotal,
      total: subtotal + upgradesTotal,
    };
  };

  return {
    form,
    isLoading,
    saveMutation,
    calculateTotals,
    existingProposal,
  };
}
