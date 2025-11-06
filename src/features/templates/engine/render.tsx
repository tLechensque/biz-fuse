import React from 'react';
import { TemplateLayout, RenderContext } from './schema';
import { BLOCK_REGISTRY } from './registry';

interface TemplateRendererProps {
  layout: TemplateLayout;
  context: RenderContext;
}

export function TemplateRenderer({ layout, context }: TemplateRendererProps) {
  return (
    <div className="template-container space-y-8 p-8">
      {layout.blocks.map((block, index) => {
        const BlockComponent = BLOCK_REGISTRY[block.type];

        if (!BlockComponent) {
          console.warn(`Block type "${block.type}" not found in registry`);
          return null;
        }

        return (
          <React.Fragment key={`${block.type}-${index}`}>
            <BlockComponent props={block.props} context={context} />
          </React.Fragment>
        );
      })}
    </div>
  );
}
