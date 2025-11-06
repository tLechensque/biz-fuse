import React from 'react';
import { ImageProps } from '../runtime/props-schema';
import { ProposalView } from '@/features/templates/engine/schema';
import { DesignTokens } from '../runtime/design-tokens';
import { evaluateCondition, resolveBinding } from '../runtime/databind';

interface ImageComponentProps {
  props: ImageProps;
  data: ProposalView;
  tokens: DesignTokens;
  scopeContext?: any;
}

export function Image({ props, data, tokens, scopeContext }: ImageComponentProps) {
  // Verificar condição de visibilidade
  if (props.condition) {
    const shouldShow = evaluateCondition(props.condition.expression, data, scopeContext);
    if (props.condition.invert ? shouldShow : !shouldShow) {
      return null;
    }
  }

  // Resolver src (binding ou estático)
  const src = props.binding 
    ? resolveBinding(props.binding, data, scopeContext)
    : props.src || '';

  if (!src) return null;

  const style: React.CSSProperties = {
    ...props.style,
    objectFit: props.objectFit,
    aspectRatio: props.aspectRatio,
    width: props.style?.width || '100%',
    height: props.style?.height || 'auto',
  };

  return (
    <img 
      id={props.id}
      src={src}
      alt={props.alt || ''}
      style={style}
    />
  );
}
