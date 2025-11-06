import React from 'react';
import { TableProps } from '../runtime/props-schema';
import { ProposalView } from '@/features/templates/engine/schema';
import { DesignTokens } from '../runtime/design-tokens';
import { evaluateCondition, resolveBinding } from '../runtime/databind';

interface TableComponentProps {
  props: TableProps;
  data: ProposalView;
  tokens: DesignTokens;
  scopeContext?: any;
}

export function Table({ props, data, tokens, scopeContext }: TableComponentProps) {
  // Verificar condição de visibilidade
  if (props.condition) {
    const shouldShow = evaluateCondition(props.condition.expression, data, scopeContext);
    if (props.condition.invert ? shouldShow : !shouldShow) {
      return null;
    }
  }

  // Resolver dados da tabela
  const tableData = props.dataBinding 
    ? resolveBinding(props.dataBinding, data, scopeContext)
    : [];

  const rows = Array.isArray(tableData) ? tableData : [];

  const style: React.CSSProperties = {
    ...props.style,
    width: '100%',
    borderCollapse: 'collapse',
  };

  return (
    <table id={props.id} style={style} className="print-avoid-break">
      <thead>
        <tr>
          {props.columns.map((col, index) => (
            <th 
              key={index}
              style={{ 
                width: col.width,
                textAlign: col.align || 'left',
                padding: '8px',
                borderBottom: '1px solid hsl(var(--border))',
              }}
            >
              {col.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, rowIndex) => (
          <tr key={rowIndex}>
            {props.columns.map((col, colIndex) => {
              const cellValue = col.binding 
                ? resolveBinding(col.binding, data, row)
                : '';
              
              return (
                <td 
                  key={colIndex}
                  style={{ 
                    textAlign: col.align || 'left',
                    padding: '8px',
                    borderBottom: '1px solid hsl(var(--border))',
                  }}
                >
                  {cellValue}
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
