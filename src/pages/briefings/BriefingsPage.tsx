import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useProfile } from '@/hooks/useProfile';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Loader2, Plus, FileText, Calendar, User, Search, Filter } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Briefing {
  id: string;
  title: string;
  description: string | null;
  client_id: string;
  project_type: string | null;
  budget_range: string | null;
  status: string;
  deadline: string | null;
  tags: string[];
  created_at: string;
  clients: {
    name: string;
  };
}

const STATUS_MAP = {
  draft: { label: 'Rascunho', color: 'bg-gray-500' },
  sent: { label: 'Enviado', color: 'bg-blue-500' },
  reviewing: { label: 'Em Análise', color: 'bg-yellow-500' },
  approved: { label: 'Aprovado', color: 'bg-green-500' },
  rejected: { label: 'Rejeitado', color: 'bg-red-500' },
};

export default function BriefingsPage() {
  const { profile } = useProfile();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  const { data: briefings = [], isLoading } = useQuery({
    queryKey: ['briefings', profile?.organization_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('briefings')
        .select(`
          *,
          clients (name)
        `)
        .eq('organization_id', profile!.organization_id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []) as any as Briefing[];
    },
    enabled: !!profile?.organization_id,
  });

  const filteredBriefings = briefings.filter((b) => {
    const matchesSearch =
      b.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.clients.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || b.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

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
          <h1 className="text-3xl font-bold">Briefings</h1>
          <p className="text-muted-foreground mt-2">
            Capture requisitos dos clientes antes de criar propostas
          </p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Novo Briefing
        </Button>
      </div>

      {/* Filtros */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por título ou cliente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          {Object.entries(STATUS_MAP).map(([key, { label }]) => (
            <Badge
              key={key}
              variant={statusFilter === key ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => setStatusFilter(statusFilter === key ? null : key)}
            >
              {label}
            </Badge>
          ))}
        </div>
      </div>

      {/* Grid de Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredBriefings.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
            <FileText className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum briefing encontrado</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Comece criando seu primeiro briefing para capturar requisitos dos clientes
            </p>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Criar Briefing
            </Button>
          </div>
        ) : (
          filteredBriefings.map((briefing) => (
            <Card key={briefing.id} className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <div className="flex items-start justify-between mb-2">
                  <CardTitle className="text-lg line-clamp-2">{briefing.title}</CardTitle>
                  <Badge className={STATUS_MAP[briefing.status as keyof typeof STATUS_MAP].color}>
                    {STATUS_MAP[briefing.status as keyof typeof STATUS_MAP].label}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {briefing.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {briefing.description}
                  </p>
                )}

                <div className="flex items-center gap-2 text-sm">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">{briefing.clients.name}</span>
                </div>

                {briefing.deadline && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span>
                      Prazo: {format(new Date(briefing.deadline), 'dd/MM/yyyy', { locale: ptBR })}
                    </span>
                  </div>
                )}

                {briefing.project_type && (
                  <Badge variant="secondary">{briefing.project_type}</Badge>
                )}

                {briefing.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {briefing.tags.slice(0, 3).map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {briefing.tags.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{briefing.tags.length - 3}
                      </Badge>
                    )}
                  </div>
                )}

                <div className="text-xs text-muted-foreground pt-2 border-t">
                  Criado em {format(new Date(briefing.created_at), 'dd/MM/yyyy', { locale: ptBR })}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
