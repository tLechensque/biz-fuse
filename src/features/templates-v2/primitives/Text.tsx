import React from 'react';
import { TextProps } from '../runtime/props-schema';
import { ProposalView } from '@/features/templates/engine/schema';
import { DesignTokens } from '../runtime/design-tokens';
import { evaluateCondition, resolveBinding } from '../runtime/databind';

interface TextComponentProps {
  props: TextProps;
  data: ProposalView;
  tokens: DesignTokens;
  scopeContext?: any;
}

export function Text({ props, data, tokens, scopeContext }: TextComponentProps) {
  // Verificar condição de visibilidade
  if (props.condition) {
    const shouldShow = evaluateCondition(props.condition.expression, data, scopeContext);
    if (props.condition.invert ? shouldShow : !shouldShow) {
      return null;
    }
  }

  // Resolver conteúdo (binding ou texto estático)
  const content = props.binding 
    ? resolveBinding(props.binding, data, scopeContext)
    : props.content || '';

  const style: React.CSSProperties = {
    ...props.style,
    fontFamily: props.fontFamily,
    fontSize: props.fontSize,
    fontWeight: props.fontWeight,
    lineHeight: props.lineHeight,
    color: props.color,
    textAlign: props.textAlign,
  };

  return (
    <span id={props.id} style={style}>
      {content}
    </span>
  );
}
