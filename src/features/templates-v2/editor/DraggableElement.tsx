import React from 'react';
import { useDrag } from 'react-dnd';
import { Button } from '@/components/ui/button';

interface DraggableElementProps {
  type: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  desc: string;
}

export const ELEMENT_DND_TYPE = 'template-element';

export function DraggableElement({ type, icon: Icon, label, desc }: DraggableElementProps) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: ELEMENT_DND_TYPE,
    item: { type },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  return (
    <Button
      ref={drag}
      variant="outline"
      className={`h-auto flex-col gap-1 p-3 cursor-grab active:cursor-grabbing ${
        isDragging ? 'opacity-50' : ''
      }`}
    >
      <Icon className="w-5 h-5" />
      <span className="text-xs font-medium">{label}</span>
      <span className="text-[10px] text-muted-foreground">{desc}</span>
    </Button>
  );
}
