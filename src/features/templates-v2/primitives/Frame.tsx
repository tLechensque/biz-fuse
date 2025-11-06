import React from 'react';
import { FrameProps } from '../runtime/props-schema';
import { ProposalView } from '@/features/templates/engine/schema';
import { DesignTokens } from '../runtime/design-tokens';
import { evaluateCondition } from '../runtime/databind';
import { renderElement } from '../runtime/render-html';

interface FrameComponentProps {
  props: FrameProps;
  data: ProposalView;
  tokens: DesignTokens;
  scopeContext?: any;
}

export function Frame({ props, data, tokens, scopeContext }: FrameComponentProps) {
  // Verificar condição de visibilidade
  if (props.condition) {
    const shouldShow = evaluateCondition(props.condition.expression, data, scopeContext);
    if (props.condition.invert ? shouldShow : !shouldShow) {
      return null;
    }
  }

  const style: React.CSSProperties = {
    ...props.style,
    display: 'block',
  };

  // Page break
  const className = props.pageBreak ? `print-break-${props.pageBreak}` : '';

  return (
    <div 
      id={props.id} 
      className={className}
      style={style}
    >
      {props.children?.map((child, index) => (
        <React.Fragment key={index}>
          {renderElement(child, data, tokens, scopeContext)}
        </React.Fragment>
      ))}
    </div>
  );
}
