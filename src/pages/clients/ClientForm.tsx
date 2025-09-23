import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useProfile } from '@/hooks/useProfile';
import { Client } from './ClientsPage';

interface ClientFormProps {
  client?: Client | null;
  onClose: () => void;
}

export const ClientForm: React.FC<ClientFormProps> = ({ client, onClose }) => {
  const [formData, setFormData] = useState({
    name: client?.name || '',
    email: client?.email || '',
    phone: client?.phone || '',
    address: client?.address || '',
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { profile } = useProfile();

  const mutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      if (!profile?.organization_id) {
        throw new Error('Organização não encontrada');
      }

      const payload = {
        ...data,
        email: data.email || null,
        phone: data.phone || null,
        address: data.address || null,
        organization_id: profile.organization_id,
      };

      if (client) {
        const { error } = await supabase
          .from('clients')
          .update(payload)
          .eq('id', client.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('clients')
          .insert(payload);

        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      toast({
        title: client ? 'Cliente atualizado' : 'Cliente criado',
        description: client 
          ? 'O cliente foi atualizado com sucesso.'
          : 'O cliente foi criado com sucesso.',
      });
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao salvar cliente',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Input validation and sanitization functions
  const sanitizeInput = (input: string): string => {
    return input.trim().replace(/[<>"/]/g, '');
  };

  const validateEmail = (email: string): boolean => {
    if (!email) return true; // Optional field
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone: string): boolean => {
    if (!phone) return true; // Optional field
    const phoneRegex = /^[\d\s\-\(\)\+]+$/;
    return phoneRegex.test(phone);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Sanitize inputs
    const sanitizedName = sanitizeInput(formData.name);
    const sanitizedEmail = sanitizeInput(formData.email || '');
    const sanitizedPhone = sanitizeInput(formData.phone || '');
    const sanitizedAddress = sanitizeInput(formData.address || '');
    
    if (!sanitizedName.trim()) {
      toast({
        title: 'Erro de validação',
        description: 'O nome do cliente é obrigatório.',
        variant: 'destructive',
      });
      return;
    }

    if (sanitizedEmail && !validateEmail(sanitizedEmail)) {
      toast({
        title: 'E-mail inválido',
        description: 'Por favor, insira um e-mail válido.',
        variant: 'destructive',
      });
      return;
    }

    if (sanitizedPhone && !validatePhone(sanitizedPhone)) {
      toast({
        title: 'Telefone inválido',
        description: 'Por favor, insira um telefone válido.',
        variant: 'destructive',
      });
      return;
    }
    
    // Update form data with sanitized values
    const sanitizedFormData = {
      ...formData,
      name: sanitizedName,
      email: sanitizedEmail,
      phone: sanitizedPhone,
      address: sanitizedAddress
    };
    
    mutation.mutate(sanitizedFormData);
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nome do Cliente *</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => handleInputChange('name', e.target.value)}
          placeholder="Nome completo"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => handleInputChange('email', e.target.value)}
          placeholder="email@exemplo.com"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Telefone</Label>
        <Input
          id="phone"
          type="tel"
          value={formData.phone}
          onChange={(e) => handleInputChange('phone', e.target.value)}
          placeholder="(11) 99999-9999"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">Endereço</Label>
        <Textarea
          id="address"
          value={formData.address}
          onChange={(e) => handleInputChange('address', e.target.value)}
          placeholder="Endereço completo"
          rows={3}
        />
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancelar
        </Button>
        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending 
            ? (client ? 'Atualizando...' : 'Criando...') 
            : (client ? 'Atualizar' : 'Criar')
          }
        </Button>
      </div>
    </form>
  );
};