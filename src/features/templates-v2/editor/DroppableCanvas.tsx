import React from 'react';
import { useDrop } from 'react-dnd';
import { Element } from '../runtime/props-schema';
import { ProposalView } from '@/features/templates/engine/schema';
import { DesignTokens } from '../runtime/design-tokens';
import { renderElement } from '../runtime/render-html';
import { ELEMENT_DND_TYPE } from './DraggableElement';

interface DroppableCanvasProps {
  root: Element;
  data: ProposalView;
  tokens: DesignTokens;
  selectedPath: string | null;
  onSelect: (path: string) => void;
  onDrop: (type: string) => void;
}

export function DroppableCanvas({ 
  root, 
  data, 
  tokens, 
  selectedPath, 
  onSelect,
  onDrop 
}: DroppableCanvasProps) {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: ELEMENT_DND_TYPE,
    drop: (item: { type: string }) => {
      onDrop(item.type);
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }));

  return (
    <div 
      ref={drop}
      className={`w-full min-h-screen bg-white p-8 relative ${
        isOver ? 'ring-2 ring-primary ring-inset' : ''
      }`}
      onClick={() => onSelect('')}
    >
      <div 
        className={`relative ${selectedPath === '' ? 'ring-2 ring-primary' : ''}`}
        onClick={(e) => {
          e.stopPropagation();
          onSelect('');
        }}
      >
        {renderElement(root, data, tokens)}
      </div>
    </div>
  );
}
