import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Copy, Search, ChevronRight, ChevronDown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface DataPanelProps {
  onInsertBinding: (path: string) => void;
}

const VARIABLE_GROUPS = {
  'Proposta': [
    'proposal.id',
    'proposal.code',
    'proposal.title',
    'proposal.issueDate',
    'proposal.status',
  ],
  'Cliente': [
    'client.name',
    'client.email',
    'client.phone',
    'client.address',
    'client.city',
    'client.state',
  ],
  'Organização': [
    'organization.name',
    'organization.email',
    'organization.phone',
    'organization.cnpj',
    'organization.address',
    'organization.logoUrl',
  ],
  'Vendedor': [
    'salesperson.name',
    'salesperson.email',
    'salesperson.phone',
  ],
  'Itens (Array)': [
    'items',
    'items[].id',
    'items[].product.name',
    'items[].brand.name',
    'items[].qty',
    'items[].unitPrice',
    'items[].subtotal',
  ],
  'Totais': [
    'totals.subtotal',
    'totals.upgradesTotal',
    'totals.total',
    'totals.margin',
  ],
};

export function DataPanel({ onInsertBinding }: DataPanelProps) {
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<Set<string>>(new Set(['Proposta']));
  const { toast } = useToast();

  const toggleGroup = (group: string) => {
    const newExpanded = new Set(expanded);
    if (newExpanded.has(group)) {
      newExpanded.delete(group);
    } else {
      newExpanded.add(group);
    }
    setExpanded(newExpanded);
  };

  const handleCopy = (path: string) => {
    navigator.clipboard.writeText(`{{${path}}}`);
    toast({ title: 'Copiado!', description: `{{${path}}}` });
  };

  const filteredGroups = Object.entries(VARIABLE_GROUPS).filter(([group, vars]) => {
    if (!search) return true;
    return vars.some(v => v.toLowerCase().includes(search.toLowerCase()));
  });

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm">Data Variables</CardTitle>
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-3 w-3 text-muted-foreground" />
          <Input
            placeholder="Buscar variáveis..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-7 h-8 text-xs"
          />
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[calc(100vh-250px)]">
          <div className="p-2 space-y-1">
            {filteredGroups.map(([group, variables]) => {
              const isExpanded = expanded.has(group);
              const filteredVars = search 
                ? variables.filter(v => v.toLowerCase().includes(search.toLowerCase()))
                : variables;

              return (
                <div key={group}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start gap-2 h-7 font-medium"
                    onClick={() => toggleGroup(group)}
                  >
                    {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                    <span className="text-xs">{group}</span>
                  </Button>
                  
                  {isExpanded && (
                    <div className="ml-4 space-y-0.5">
                      {filteredVars.map((variable) => (
                        <div 
                          key={variable}
                          className="flex items-center justify-between group hover:bg-muted rounded px-2 py-1"
                        >
                          <code className="text-xs text-muted-foreground font-mono">
                            {variable}
                          </code>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                            onClick={() => handleCopy(variable)}
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
