import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, FileText, Table, ArrowUpCircle, Calculator, CreditCard, CheckSquare } from 'lucide-react';
import { BLOCK_METADATA } from '@/features/templates/engine/registry';

const ICONS: Record<string, any> = {
  FileText,
  Table,
  ArrowUpCircle,
  Calculator,
  CreditCard,
  CheckSquare,
};

interface BlocksPaletteProps {
  onAddBlock: (blockType: string) => void;
}

export function BlocksPalette({ onAddBlock }: BlocksPaletteProps) {
  return (
    <div className="p-4 space-y-4">
      <div>
        <h2 className="font-semibold text-sm mb-2">Blocos Disponíveis</h2>
        <p className="text-xs text-muted-foreground mb-4">
          Clique para adicionar ao canvas
        </p>
      </div>

      <div className="space-y-2">
        {BLOCK_METADATA.map((block) => {
          const Icon = ICONS[block.icon] || FileText;

          return (
            <Button
              key={block.type}
              variant="outline"
              className="w-full justify-start gap-2 h-auto py-3"
              onClick={() => onAddBlock(block.type)}
            >
              <Icon className="w-4 h-4 text-primary flex-shrink-0" />
              <div className="text-left flex-1">
                <div className="font-medium text-sm">{block.label}</div>
                <div className="text-xs text-muted-foreground line-clamp-2">
                  {block.description}
                </div>
              </div>
              <Plus className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            </Button>
          );
        })}
      </div>

      <Card className="bg-muted/50 border-muted">
        <CardHeader className="pb-3">
          <CardTitle className="text-xs">Dica</CardTitle>
        </CardHeader>
        <CardContent className="text-xs text-muted-foreground space-y-2">
          <p>
            Blocos condicionais (Upgrades, Payment, Notes) só aparecem se houver dados.
          </p>
          <p>
            Use drag & drop no canvas para reordenar os blocos.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
