import React from 'react';
import { StackProps } from '../runtime/props-schema';
import { ProposalView } from '@/features/templates/engine/schema';
import { DesignTokens } from '../runtime/design-tokens';
import { evaluateCondition } from '../runtime/databind';
import { renderElement } from '../runtime/render-html';

interface StackComponentProps {
  props: StackProps;
  data: ProposalView;
  tokens: DesignTokens;
  scopeContext?: any;
}

export function Stack({ props, data, tokens, scopeContext }: StackComponentProps) {
  // Verificar condição de visibilidade
  if (props.condition) {
    const shouldShow = evaluateCondition(props.condition.expression, data, scopeContext);
    if (props.condition.invert ? shouldShow : !shouldShow) {
      return null;
    }
  }

  const style: React.CSSProperties = {
    ...props.style,
    display: 'flex',
    flexDirection: props.direction,
    gap: props.gap,
    alignItems: props.align,
    justifyContent: props.justify,
    flexWrap: props.wrap ? 'wrap' : 'nowrap',
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
