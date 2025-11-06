import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Block } from '@/features/templates/engine/schema';
import { BlockCard } from './BlockCard';

interface CanvasEditorProps {
  blocks: Block[];
  selectedIndex: number | null;
  onSelectBlock: (index: number) => void;
  onReorder: (blocks: Block[]) => void;
  onRemove: (index: number) => void;
}

export function CanvasEditor({
  blocks,
  selectedIndex,
  onSelectBlock,
  onReorder,
  onRemove,
}: CanvasEditorProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = blocks.findIndex((_, i) => `block-${i}` === active.id);
      const newIndex = blocks.findIndex((_, i) => `block-${i}` === over.id);

      const newBlocks = arrayMove(blocks, oldIndex, newIndex);
      onReorder(newBlocks);
    }
  };

  if (blocks.length === 0) {
    return (
      <div className="border-2 border-dashed border-border rounded-lg p-12 text-center">
        <p className="text-muted-foreground mb-2">Nenhum bloco adicionado</p>
        <p className="text-sm text-muted-foreground">
          Clique em um bloco da paleta à esquerda para começar
        </p>
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={blocks.map((_, i) => `block-${i}`)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-3">
          {blocks.map((block, index) => (
            <BlockCard
              key={`block-${index}`}
              id={`block-${index}`}
              block={block}
              index={index}
              isSelected={selectedIndex === index}
              onSelect={() => onSelectBlock(index)}
              onRemove={() => onRemove(index)}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
