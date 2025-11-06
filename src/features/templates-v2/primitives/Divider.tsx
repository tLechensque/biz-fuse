import React from 'react';
import { DividerProps } from '../runtime/props-schema';
import { ProposalView } from '@/features/templates/engine/schema';
import { DesignTokens } from '../runtime/design-tokens';
import { evaluateCondition } from '../runtime/databind';

interface DividerComponentProps {
  props: DividerProps;
  data: ProposalView;
  tokens: DesignTokens;
  scopeContext?: any;
}

export function Divider({ props, data, tokens, scopeContext }: DividerComponentProps) {
  // Verificar condição de visibilidade
  if (props.condition) {
    const shouldShow = evaluateCondition(props.condition.expression, data, scopeContext);
    if (props.condition.invert ? shouldShow : !shouldShow) {
      return null;
    }
  }

  const style: React.CSSProperties = {
    ...props.style,
    height: props.thickness || '1px',
    background: props.color || 'hsl(var(--border))',
    border: 'none',
    margin: '16px 0',
  };

  return <hr id={props.id} style={style} />;
}
