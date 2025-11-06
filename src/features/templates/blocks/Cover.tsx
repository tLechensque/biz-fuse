import { RenderContext } from '../engine/schema';
import { resolveVariables } from '../engine/variables';

interface CoverProps {
  showLogo?: boolean;
  title?: string;
  subtitle?: string;
  showClient?: boolean;
}

export function Cover({ 
  props, 
  context 
}: { 
  props?: CoverProps; 
  context: RenderContext;
}) {
  const { data } = context;
  const { showLogo = true, title = '', subtitle = '', showClient = true } = props || {};

  const resolvedTitle = resolveVariables(title || data.proposal.title, data, context.flags);
  const resolvedSubtitle = resolveVariables(subtitle, data, context.flags);

  return (
    <div className="template-block template-block-cover bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg p-12 min-h-[400px] flex flex-col justify-center items-center">
      {showLogo && (
        <div className="mb-8">
          <div className="text-4xl font-bold text-primary">
            {data.organization.name}
          </div>
        </div>
      )}

      <div className="text-center space-y-4 max-w-2xl">
        <h1 className="text-5xl font-bold text-foreground">
          {resolvedTitle}
        </h1>
        
        {resolvedSubtitle && (
          <p className="text-lg text-muted-foreground">
            {resolvedSubtitle}
          </p>
        )}
      </div>

      {showClient && (
        <div className="mt-12 space-y-2 text-center">
          <div className="text-sm text-muted-foreground uppercase tracking-wider">
            Preparado para
          </div>
          <div className="text-2xl font-semibold text-foreground">
            {data.client.name}
          </div>
          {data.client.address && (
            <div className="text-sm text-muted-foreground">
              {data.client.address}
            </div>
          )}
        </div>
      )}

      <div className="mt-12 pt-8 border-t border-border/50 text-center text-sm text-muted-foreground space-y-1">
        <div>{data.organization.email}</div>
        <div>{data.organization.phone}</div>
        {data.organization.address && <div>{data.organization.address}</div>}
      </div>
    </div>
  );
}
