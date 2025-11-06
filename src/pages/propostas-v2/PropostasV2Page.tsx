import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useProfile } from '@/hooks/useProfile';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Loader2, Plus, Eye, Pencil, FileText, Search, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ProposalV2 {
  id: string;
  number: string;
  title: string;
  client_id: string;
  status: string;
  total: number;
  valid_until: string | null;
  created_at: string;
  clients: {
    name: string;
  };
}

const STATUS_MAP = {
  draft: { label: 'Rascunho', variant: 'secondary' as const },
  sent: { label: 'Enviada', variant: 'default' as const },
  viewed: { label: 'Visualizada', variant: 'default' as const },
  approved: { label: 'Aprovada', variant: 'default' as const },
  rejected: { label: 'Rejeitada', variant: 'destructive' as const },
  expired: { label: 'Expirada', variant: 'destructive' as const },
  converted: { label: 'Convertida', variant: 'default' as const },
};

export default function PropostasV2Page() {
  const navigate = useNavigate();
  const { profile } = useProfile();
  const [searchTerm, setSearchTerm] = useState('');

  const { data: proposals = [], isLoading } = useQuery({
    queryKey: ['proposals-v2', profile?.organization_id],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('proposals_v2')
        .select(`
          *,
          clients (name)
        `)
        .eq('organization_id', profile!.organization_id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []) as ProposalV2[];
    },
    enabled: !!profile?.organization_id,
  });

  const filteredProposals = proposals.filter((p) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      p.number.toLowerCase().includes(searchLower) ||
      p.title.toLowerCase().includes(searchLower) ||
      p.clients.name.toLowerCase().includes(searchLower)
    );
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const isExpiringSoon = (validUntil: string | null) => {
    if (!validUntil) return false;
    const daysUntilExpiry = Math.ceil(
      (new Date(validUntil).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );
    return daysUntilExpiry <= 5 && daysUntilExpiry > 0;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Propostas v2</h1>
          <p className="text-muted-foreground mt-2">
            Sistema modernizado de propostas comerciais com briefing integrado
          </p>
        </div>
        <Button onClick={() => navigate('/propostas-v2/editor/new')}>
          <Plus className="w-4 h-4 mr-2" />
          Nova Proposta
        </Button>
      </div>

      {/* Busca */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por número, título ou cliente..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Tabela */}
      {filteredProposals.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center border rounded-lg">
          <FileText className="w-12 h-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Nenhuma proposta encontrada</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Crie sua primeira proposta v2 com o novo sistema integrado
          </p>
          <Button onClick={() => navigate('/propostas-v2/editor/new')}>
            <Plus className="w-4 h-4 mr-2" />
            Criar Proposta
          </Button>
        </div>
      ) : (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Número</TableHead>
                <TableHead>Título</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Validade</TableHead>
                <TableHead>Criada em</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProposals.map((proposal) => (
                <TableRow key={proposal.id}>
                  <TableCell className="font-mono font-medium">{proposal.number}</TableCell>
                  <TableCell className="font-medium">{proposal.title}</TableCell>
                  <TableCell>{proposal.clients.name}</TableCell>
                  <TableCell className="font-semibold">{formatCurrency(proposal.total)}</TableCell>
                  <TableCell>
                    <Badge variant={STATUS_MAP[proposal.status as keyof typeof STATUS_MAP].variant}>
                      {STATUS_MAP[proposal.status as keyof typeof STATUS_MAP].label}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {proposal.valid_until ? (
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span className={isExpiringSoon(proposal.valid_until) ? 'text-orange-500 font-medium' : ''}>
                          {format(new Date(proposal.valid_until), 'dd/MM/yyyy', { locale: ptBR })}
                        </span>
                        {isExpiringSoon(proposal.valid_until) && (
                          <Badge variant="outline" className="text-orange-500 border-orange-500">
                            Expirando
                          </Badge>
                        )}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {format(new Date(proposal.created_at), 'dd/MM/yyyy', { locale: ptBR })}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/propostas-v2/preview/${proposal.id}`)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/propostas-v2/editor/${proposal.id}`)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
