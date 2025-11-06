import React from 'react';
import { Element } from '../runtime/props-schema';
import { ProposalView } from '@/features/templates/engine/schema';
import { DesignTokens } from '../runtime/design-tokens';
import { renderElement } from '../runtime/render-html';

interface CanvasProps {
  root: Element;
  data: ProposalView;
  tokens: DesignTokens;
  selectedPath: string | null;
  onSelect: (path: string) => void;
}

export function Canvas({ root, data, tokens, selectedPath, onSelect }: CanvasProps) {
  const handleClick = (e: React.MouseEvent, path: string) => {
    e.stopPropagation();
    onSelect(path);
  };

  return (
    <div 
      className="w-full min-h-screen bg-white p-8 relative"
      onClick={() => onSelect('')}
    >
      <div 
        className={`relative ${selectedPath === '' ? 'ring-2 ring-primary' : ''}`}
        onClick={(e) => handleClick(e, '')}
      >
        {renderElement(root, data, tokens)}
      </div>
    </div>
  );
}
