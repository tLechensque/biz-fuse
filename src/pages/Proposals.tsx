import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FileText,
  Plus,
  Search,
  Filter,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  Send,
  Eye,
  Edit,
  MoreHorizontal,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const proposals = [
  {
    id: "1",
    title: "Automação Residencial Completa - Casa Alphaville",
    client: "João Silva",
    value: 15450.00,
    status: "PENDING_APPROVAL",
    createdAt: "2024-01-15",
    version: 2,
    margin: 42.5,
  },
  {
    id: "2",
    title: "Sistema de Segurança Empresarial",
    client: "Empresa Tech Solutions",
    value: 28750.00,
    status: "APPROVED_TO_SEND",
    createdAt: "2024-01-12",
    version: 1,
    margin: 38.2,
  },
  {
    id: "3",
    title: "Iluminação Inteligente - Apartamento 140m²",
    client: "Maria Santos",
    value: 8200.00,
    status: "DRAFT",
    createdAt: "2024-01-10",
    version: 1,
    margin: 35.8,
  },
  {
    id: "4",
    title: "Home Theater e Automação",
    client: "Carlos Oliveira",
    value: 22340.00,
    status: "CLIENT_APPROVED",
    createdAt: "2024-01-08",
    version: 3,
    margin: 45.1,
  },
  {
    id: "5",
    title: "Sistema de Climatização Inteligente",
    client: "Residencial Sunset",
    value: 12890.00,
    status: "SENT",
    createdAt: "2024-01-05",
    version: 1,
    margin: 33.4,
  },
];

const statusConfig = {
  DRAFT: { label: "Rascunho", color: "bg-muted text-muted-foreground", icon: AlertCircle },
  PENDING_APPROVAL: { label: "Aguardando Aprovação", color: "bg-warning/10 text-warning", icon: Clock },
  REJECTED: { label: "Rejeitada", color: "bg-destructive/10 text-destructive", icon: XCircle },
  APPROVED_TO_SEND: { label: "Aprovada para Envio", color: "bg-success/10 text-success", icon: CheckCircle },
  SENT: { label: "Enviada", color: "bg-primary/10 text-primary", icon: Send },
  CLIENT_APPROVED: { label: "Aprovada pelo Cliente", color: "bg-success text-success-foreground", icon: CheckCircle },
  CLIENT_REJECTED: { label: "Rejeitada pelo Cliente", color: "bg-destructive/10 text-destructive", icon: XCircle },
  CLOSED: { label: "Fechada", color: "bg-muted text-muted-foreground", icon: CheckCircle },
};

export default function Proposals() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredProposals = proposals.filter(proposal => {
    const matchesSearch = proposal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         proposal.client.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || proposal.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getMarginColor = (margin: number) => {
    if (margin >= 40) return "text-success";
    if (margin >= 35) return "text-warning";
    return "text-destructive";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Propostas</h1>
          <p className="text-muted-foreground">
            Gerencie e acompanhe suas propostas comerciais
          </p>
        </div>
        <Button className="gradient-primary text-white" onClick={() => navigate('/proposals/new/edit')}>
          <Plus className="w-4 h-4 mr-2" />
          Nova Proposta
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Buscar por título ou cliente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Status</SelectItem>
                <SelectItem value="DRAFT">Rascunho</SelectItem>
                <SelectItem value="PENDING_APPROVAL">Aguardando Aprovação</SelectItem>
                <SelectItem value="APPROVED_TO_SEND">Aprovada para Envio</SelectItem>
                <SelectItem value="SENT">Enviada</SelectItem>
                <SelectItem value="CLIENT_APPROVED">Aprovada pelo Cliente</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Proposals List */}
      <div className="space-y-4">
        {filteredProposals.map((proposal) => {
          const StatusIcon = statusConfig[proposal.status as keyof typeof statusConfig].icon;
          
          return (
            <Card key={proposal.id} className="hover:shadow-medium transition-all duration-200">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <FileText className="w-5 h-5 text-primary" />
                      <h3 className="font-semibold text-lg">{proposal.title}</h3>
                      <Badge variant="outline" className="text-xs">
                        v{proposal.version}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Cliente</p>
                        <p className="font-medium">{proposal.client}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Valor</p>
                        <p className="font-bold text-lg">{formatCurrency(proposal.value)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Margem</p>
                        <p className={`font-semibold ${getMarginColor(proposal.margin)}`}>
                          {proposal.margin}%
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Criada em</p>
                        <p className="font-medium">{formatDate(proposal.createdAt)}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Badge
                      variant="secondary"
                      className={statusConfig[proposal.status as keyof typeof statusConfig].color}
                    >
                      <StatusIcon className="w-3 h-3 mr-1" />
                      {statusConfig[proposal.status as keyof typeof statusConfig].label}
                    </Badge>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => navigate(`/preview/${proposal.id}`)}>
                          <Eye className="w-4 h-4 mr-2" />
                          Visualizar Preview
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate(`/proposals/${proposal.id}/edit`)}>
                          <Edit className="w-4 h-4 mr-2" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Send className="w-4 h-4 mr-2" />
                          Enviar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredProposals.length === 0 && (
        <Card>
          <CardContent className="pt-12 pb-12 text-center">
            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold mb-2">Nenhuma proposta encontrada</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || statusFilter !== "all" 
                ? "Tente ajustar os filtros de busca"
                : "Comece criando sua primeira proposta"
              }
            </p>
            {!searchTerm && statusFilter === "all" && (
              <Button className="gradient-primary text-white">
                <Plus className="w-4 h-4 mr-2" />
                Criar Nova Proposta
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}