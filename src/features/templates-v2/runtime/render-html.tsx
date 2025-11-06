import React from 'react';
import { Element } from './props-schema';
import { ProposalView } from '@/features/templates/engine/schema';
import { DesignTokens, tokensToCSS } from './design-tokens';
import { Frame } from '../primitives/Frame';
import { Stack } from '../primitives/Stack';
import { Grid } from '../primitives/Grid';
import { Text } from '../primitives/Text';
import { Image } from '../primitives/Image';
import { Table } from '../primitives/Table';
import { Divider } from '../primitives/Divider';
import { Repeater } from '../primitives/Repeater';

/**
 * Renderiza um elemento do template v2
 */
export function renderElement(
  element: Element,
  data: ProposalView,
  tokens: DesignTokens,
  scopeContext?: any
): React.ReactNode {
  switch (element.type) {
    case 'Frame':
      return <Frame props={element} data={data} tokens={tokens} scopeContext={scopeContext} />;
    
    case 'Stack':
      return <Stack props={element} data={data} tokens={tokens} scopeContext={scopeContext} />;
    
    case 'Grid':
      return <Grid props={element} data={data} tokens={tokens} scopeContext={scopeContext} />;
    
    case 'Text':
      return <Text props={element} data={data} tokens={tokens} scopeContext={scopeContext} />;
    
    case 'Image':
      return <Image props={element} data={data} tokens={tokens} scopeContext={scopeContext} />;
    
    case 'Table':
      return <Table props={element} data={data} tokens={tokens} scopeContext={scopeContext} />;
    
    case 'Divider':
      return <Divider props={element} data={data} tokens={tokens} scopeContext={scopeContext} />;
    
    case 'Repeater':
      return <Repeater props={element} data={data} tokens={tokens} scopeContext={scopeContext} />;
    
    default:
      console.warn('Unknown element type:', (element as any).type);
      return null;
  }
}

/**
 * Renderiza um template v2 completo
 */
export function renderTemplate(
  root: Element,
  data: ProposalView,
  tokens: DesignTokens
): React.ReactNode {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: tokensToCSS(tokens) }} />
      {renderElement(root, data, tokens)}
    </>
  );
}
