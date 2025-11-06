import React from 'react';
import { GridProps } from '../runtime/props-schema';
import { ProposalView } from '@/features/templates/engine/schema';
import { DesignTokens } from '../runtime/design-tokens';
import { evaluateCondition } from '../runtime/databind';
import { renderElement } from '../runtime/render-html';

interface GridComponentProps {
  props: GridProps;
  data: ProposalView;
  tokens: DesignTokens;
  scopeContext?: any;
}

export function Grid({ props, data, tokens, scopeContext }: GridComponentProps) {
  // Verificar condição de visibilidade
  if (props.condition) {
    const shouldShow = evaluateCondition(props.condition.expression, data, scopeContext);
    if (props.condition.invert ? shouldShow : !shouldShow) {
      return null;
    }
  }

  const style: React.CSSProperties = {
    ...props.style,
    display: 'grid',
    gridTemplateColumns: `repeat(${props.cols}, 1fr)`,
    gridTemplateRows: props.rows ? `repeat(${props.rows}, auto)` : undefined,
    gap: props.gap,
  };

  return (
    <div id={props.id} style={style}>
      {props.children?.map((child, index) => (
        <React.Fragment key={index}>
          {renderElement(child, data, tokens, scopeContext)}
        </React.Fragment>
      ))}
    </div>
  );
}
