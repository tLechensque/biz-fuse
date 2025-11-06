import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { GripVertical, Trash2 } from 'lucide-react';
import { Block } from '@/features/templates/engine/schema';
import { BLOCK_METADATA } from '@/features/templates/engine/registry';

interface BlockCardProps {
  id: string;
  block: Block;
  index: number;
  isSelected: boolean;
  onSelect: () => void;
  onRemove: () => void;
}

export function BlockCard({
  id,
  block,
  index,
  isSelected,
  onSelect,
  onRemove,
}: BlockCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const metadata = BLOCK_METADATA.find((m) => m.type === block.type);
  const propsCount = Object.keys(block.props || {}).length;

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={`cursor-pointer transition-all ${
        isSelected
          ? 'ring-2 ring-primary bg-primary/5'
          : 'hover:bg-muted/50'
      }`}
      onClick={onSelect}
    >
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing"
          >
            <GripVertical className="w-5 h-5 text-muted-foreground" />
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="secondary" className="text-xs">
                {index + 1}
              </Badge>
              <span className="font-medium">{metadata?.label || block.type}</span>
            </div>
            <p className="text-xs text-muted-foreground line-clamp-1">
              {metadata?.description}
            </p>
            {propsCount > 0 && (
              <p className="text-xs text-primary mt-1">
                {propsCount} {propsCount === 1 ? 'propriedade' : 'propriedades'}
              </p>
            )}
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            className="text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
