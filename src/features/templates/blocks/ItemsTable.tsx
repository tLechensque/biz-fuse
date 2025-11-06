import { RenderContext } from '../engine/schema';
import { formatCurrency } from '../engine/variables';
import { Badge } from '@/components/ui/badge';

interface ItemsTableProps {
  showDetails?: boolean | string;
  showImages?: boolean;
}

export function ItemsTable({
  props,
  context,
}: {
  props?: ItemsTableProps;
  context: RenderContext;
}) {
  const { data } = context;
  const { showDetails = false, showImages = true } = props || {};

  // Resolver showDetails (pode ser uma variável)
  const shouldShowDetails = typeof showDetails === 'string'
    ? showDetails.includes('true') || context.flags.showDetails
    : showDetails;

  // Agrupar itens por grupo
  const groupedItems = data.items.reduce((acc, item) => {
    const group = item.group || 'Geral';
    if (!acc[group]) {
      acc[group] = [];
    }
    acc[group].push(item);
    return acc;
  }, {} as Record<string, typeof data.items>);

  return (
    <div className="template-block print-avoid-break space-y-6">
      <h2 className="text-2xl font-bold text-foreground mb-4">Itens da Proposta</h2>

      {Object.entries(groupedItems).map(([groupName, groupItems]) => {
        const groupSubtotal = groupItems.reduce((sum, item) => sum + item.subtotal, 0);

        return (
          <div key={groupName} className="space-y-3 print-avoid-break">
            <div className="flex items-center justify-between bg-primary/5 px-4 py-2 rounded-lg">
              <h3 className="text-lg font-semibold text-foreground">{groupName}</h3>
              <span className="text-sm font-medium text-muted-foreground">
                {groupItems.length} {groupItems.length === 1 ? 'item' : 'itens'}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    {showImages && <th className="text-left py-2 px-2 w-16">Imagem</th>}
                    <th className="text-left py-2 px-3">Item</th>
                    <th className="text-center py-2 px-3 w-20">Qtd</th>
                    <th className="text-right py-2 px-3 w-28">Unit.</th>
                    <th className="text-right py-2 px-3 w-32">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {groupItems.map((item, idx) => (
                    <tr key={idx} className="border-b border-border/50 print-avoid-break">
                      {showImages && (
                        <td className="py-3 px-2">
                          {item.imageUrl && (
                            <img
                              src={item.imageUrl}
                              alt={item.product.name}
                              className="w-12 h-12 object-cover rounded"
                            />
                          )}
                        </td>
                      )}
                      <td className="py-3 px-3">
                        <div className="space-y-1">
                          <div className="font-medium text-foreground">
                            {item.product.name}
                          </div>
                          <div className="flex gap-2 flex-wrap">
                            {item.brand && (
                              <Badge variant="secondary" className="text-xs">
                                {item.brand.name}
                              </Badge>
                            )}
                            {item.product.model && (
                              <Badge variant="outline" className="text-xs">
                                {item.product.model}
                              </Badge>
                            )}
                          </div>
                          {shouldShowDetails && item.simpleDescription && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {item.simpleDescription}
                            </p>
                          )}
                          {shouldShowDetails && item.detailedDescription && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {item.detailedDescription}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-3 text-center text-sm">{item.qty}</td>
                      <td className="py-3 px-3 text-right text-sm">
                        {formatCurrency(item.unitPrice)}
                      </td>
                      <td className="py-3 px-3 text-right font-medium">
                        {formatCurrency(item.subtotal)}
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-muted/30">
                    <td
                      colSpan={showImages ? 4 : 3}
                      className="py-2 px-3 text-right font-semibold text-sm"
                    >
                      Subtotal {groupName}:
                    </td>
                    <td className="py-2 px-3 text-right font-bold">
                      {formatCurrency(groupSubtotal)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        );
      })}
    </div>
  );
}
