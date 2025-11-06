import { RenderContext } from '../engine/schema';
import { formatDate } from '../engine/variables';

export function Acceptance({ context }: { context: RenderContext }) {
  const { data } = context;

  return (
    <div className="template-block print-avoid-break mt-12 space-y-8">
      <div className="text-sm text-muted-foreground">
        <p>
          Esta proposta é válida por{' '}
          <strong>{data.proposal.validityDays} dias úteis</strong> a partir da data de
          emissão ({formatDate(data.proposal.issueDate)}).
        </p>
      </div>

      <div className="border-t border-border pt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div>
            <div className="text-sm text-muted-foreground mb-2">Aceite do Cliente</div>
            <div className="border-b-2 border-border h-12"></div>
          </div>
          <div className="text-xs text-muted-foreground">
            Assinatura e carimbo do cliente
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <div className="text-sm text-muted-foreground mb-2">Responsável</div>
            <div className="font-medium">{data.organization.name}</div>
            {data.salesperson && (
              <div className="text-sm text-muted-foreground mt-1">
                {data.salesperson.name}
              </div>
            )}
          </div>
          {data.salesperson && (
            <>
              {data.salesperson.email && (
                <div className="text-xs text-muted-foreground">
                  {data.salesperson.email}
                </div>
              )}
              {data.salesperson.phone && (
                <div className="text-xs text-muted-foreground">
                  {data.salesperson.phone}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
