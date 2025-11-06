import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Settings, Sparkles } from 'lucide-react';
import { Block } from '@/features/templates/engine/schema';
import { BLOCK_METADATA } from '@/features/templates/engine/registry';
import { VariableAutocomplete } from './VariableAutocomplete';
import { VARIABLE_REGISTRY } from '@/features/templates/engine/variables';

interface PropertiesPanelProps {
  block: Block;
  blockIndex: number;
  onUpdateProps: (index: number, props: any) => void;
}

export function PropertiesPanel({
  block,
  blockIndex,
  onUpdateProps,
}: PropertiesPanelProps) {
  const metadata = BLOCK_METADATA.find((m) => m.type === block.type);
  const props = block.props || {};

  const handleChange = (key: string, value: any) => {
    onUpdateProps(blockIndex, { [key]: value });
  };

  return (
    <div className="p-4 space-y-4">
      <div>
        <h2 className="font-semibold text-sm flex items-center gap-2">
          <Settings className="w-4 h-4" />
          Propriedades do Bloco
        </h2>
        <p className="text-xs text-muted-foreground mt-1">
          {metadata?.label || block.type}
        </p>
      </div>

      <Card className="bg-primary/5 border-primary/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-xs flex items-center gap-2">
            <Sparkles className="w-3 h-3 text-primary" />
            Variáveis Disponíveis
          </CardTitle>
        </CardHeader>
        <CardContent className="text-xs text-muted-foreground space-y-2">
          <p>Digite {'{{'}  para ver sugestões</p>
          <p>Exemplos:</p>
          <div className="flex flex-wrap gap-1 mt-2">
            <Badge variant="outline" className="text-xs">
              {'{{proposal.title}}'}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {'{{client.name}}'}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {'{{organization.name}}'}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Renderizar campos baseado no tipo de bloco */}
      {block.type === 'Cover' && (
        <div className="space-y-4">
          <div>
            <Label htmlFor="showLogo" className="text-xs">
              <input
                type="checkbox"
                id="showLogo"
                checked={props.showLogo ?? true}
                onChange={(e) => handleChange('showLogo', e.target.checked)}
                className="mr-2"
              />
              Mostrar Logo
            </Label>
          </div>

          <div>
            <Label htmlFor="title" className="text-xs">
              Título
            </Label>
            <VariableAutocomplete
              value={props.title || ''}
              onChange={(value) => handleChange('title', value)}
              placeholder="Ex: {{proposal.title}}"
            />
          </div>

          <div>
            <Label htmlFor="subtitle" className="text-xs">
              Subtítulo
            </Label>
            <VariableAutocomplete
              value={props.subtitle || ''}
              onChange={(value) => handleChange('subtitle', value)}
              placeholder="Ex: Pedido #{{proposal.code}}"
              multiline
            />
          </div>

          <div>
            <Label htmlFor="showClient" className="text-xs">
              <input
                type="checkbox"
                id="showClient"
                checked={props.showClient ?? true}
                onChange={(e) => handleChange('showClient', e.target.checked)}
                className="mr-2"
              />
              Mostrar Cliente
            </Label>
          </div>
        </div>
      )}

      {block.type === 'ItemsTable' && (
        <div className="space-y-4">
          <div>
            <Label htmlFor="showDetails" className="text-xs">
              <input
                type="checkbox"
                id="showDetails"
                checked={props.showDetails ?? false}
                onChange={(e) => handleChange('showDetails', e.target.checked)}
                className="mr-2"
              />
              Mostrar Descrições Detalhadas
            </Label>
          </div>

          <div>
            <Label htmlFor="showImages" className="text-xs">
              <input
                type="checkbox"
                id="showImages"
                checked={props.showImages ?? true}
                onChange={(e) => handleChange('showImages', e.target.checked)}
                className="mr-2"
              />
              Mostrar Imagens dos Produtos
            </Label>
          </div>
        </div>
      )}

      {/* Blocos sem propriedades customizáveis */}
      {!['Cover', 'ItemsTable'].includes(block.type) && (
        <div className="text-center py-8 text-sm text-muted-foreground">
          Este bloco não possui propriedades customizáveis.
        </div>
      )}

      <div className="pt-4 border-t border-border">
        <p className="text-xs text-muted-foreground">
          Alterações são salvas automaticamente
        </p>
      </div>
    </div>
  );
}
