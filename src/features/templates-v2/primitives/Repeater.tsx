import React from 'react';
import { RepeaterProps } from '../runtime/props-schema';
import { ProposalView } from '@/features/templates/engine/schema';
import { DesignTokens } from '../runtime/design-tokens';
import { evaluateCondition, resolveBinding } from '../runtime/databind';
import { renderElement } from '../runtime/render-html';

interface RepeaterComponentProps {
  props: RepeaterProps;
  data: ProposalView;
  tokens: DesignTokens;
  scopeContext?: any;
}

export function Repeater({ props, data, tokens, scopeContext }: RepeaterComponentProps) {
  // Verificar condição de visibilidade
  if (props.condition) {
    const shouldShow = evaluateCondition(props.condition.expression, data, scopeContext);
    if (props.condition.invert ? shouldShow : !shouldShow) {
      return null;
    }
  }

  // Resolver array de dados
  const arrayData = resolveBinding(props.dataBinding, data, scopeContext);
  const items = Array.isArray(arrayData) ? arrayData : [];

  return (
    <>
      {items.map((item, index) => (
        <div key={index} style={props.style}>
          {props.children?.map((child, childIndex) => (
            <React.Fragment key={childIndex}>
              {renderElement(child, data, tokens, item)}
            </React.Fragment>
          ))}
        </div>
      ))}
    </>
  );
}
