import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  FileText,
  TrendingUp,
  Users,
  Package,
  DollarSign,
  ArrowUpRight,
  Clock,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

const stats = [
  {
    title: "Propostas Ativas",
    value: "12",
    change: "+3 esta semana",
    icon: FileText,
    color: "text-primary",
  },
  {
    title: "Faturamento Mensal",
    value: "R$ 47.350",
    change: "+12% vs mês anterior",
    icon: DollarSign,
    color: "text-success",
  },
  {
    title: "Clientes Ativos",
    value: "89",
    change: "+5 novos",
    icon: Users,
    color: "text-accent",
  },
  {
    title: "Produtos Cadastrados",
    value: "234",
    change: "+8 esta semana",
    icon: Package,
    color: "text-warning",
  },
];

const recentProposals = [
  {
    id: "1",
    title: "Automação Residencial - Casa Alphaville",
    client: "João Silva",
    value: "R$ 15.450",
    status: "pending",
    date: "2 dias atrás",
  },
  {
    id: "2",
    title: "Sistema de Segurança Completo",
    client: "Maria Santos",
    value: "R$ 8.750",
    status: "approved",
    date: "1 semana atrás",
  },
  {
    id: "3",
    title: "Iluminação Inteligente - Apartamento",
    client: "Carlos Oliveira",
    value: "R$ 3.200",
    status: "draft",
    date: "3 dias atrás",
  },
];

const statusConfig = {
  pending: { label: "Pendente", color: "bg-warning/10 text-warning", icon: Clock },
  approved: { label: "Aprovada", color: "bg-success/10 text-success", icon: CheckCircle },
  draft: { label: "Rascunho", color: "bg-muted text-muted-foreground", icon: AlertCircle },
};

export default function Dashboard() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-muted-foreground">
          Visão geral do seu negócio e atividades recentes
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.title} className="relative overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold mb-1">{stat.value}</div>
              <div className="text-xs text-muted-foreground flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                {stat.change}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Proposals */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Propostas Recentes</CardTitle>
                <CardDescription>
                  Últimas propostas criadas e seu status atual
                </CardDescription>
              </div>
              <Button variant="outline" size="sm">
                Ver todas
                <ArrowUpRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentProposals.map((proposal) => {
                const StatusIcon = statusConfig[proposal.status as keyof typeof statusConfig].icon;
                return (
                  <div
                    key={proposal.id}
                    className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer"
                  >
                    <div className="flex-1">
                      <h4 className="font-medium mb-1">{proposal.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        Cliente: {proposal.client}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {proposal.date}
                      </p>
                    </div>
                    <div className="text-right space-y-2">
                      <div className="font-semibold">{proposal.value}</div>
                      <Badge
                        variant="secondary"
                        className={statusConfig[proposal.status as keyof typeof statusConfig].color}
                      >
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {statusConfig[proposal.status as keyof typeof statusConfig].label}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Ações Rápidas</CardTitle>
            <CardDescription>
              Acesse as funcionalidades mais utilizadas
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full justify-start gradient-primary text-white" size="lg">
              <FileText className="w-4 h-4 mr-2" />
              Nova Proposta
            </Button>
            <Button variant="outline" className="w-full justify-start" size="lg">
              <Users className="w-4 h-4 mr-2" />
              Cadastrar Cliente
            </Button>
            <Button variant="outline" className="w-full justify-start" size="lg">
              <Package className="w-4 h-4 mr-2" />
              Adicionar Produto
            </Button>
            <Button variant="outline" className="w-full justify-start" size="lg">
              <TrendingUp className="w-4 h-4 mr-2" />
              Relatórios
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Performance Chart Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Mensal</CardTitle>
          <CardDescription>
            Evolução das vendas e margem de lucro
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-gradient-to-br from-primary/5 to-success/5 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <TrendingUp className="w-12 h-12 text-primary mx-auto mb-4" />
              <p className="text-muted-foreground">
                Gráfico de performance será implementado aqui
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}