import { ProposalView } from '@/features/templates/engine/schema';
import { DataBinding } from './props-schema';

/**
 * Resolve um data binding para um valor
 * Ex: path="client.name" -> "João Silva"
 *     path="items[].brand.name" no contexto de um item -> "Sony"
 */
export function resolveBinding(
  binding: DataBinding | undefined,
  data: ProposalView,
  scopeContext?: any
): string {
  if (!binding) return '';
  
  try {
    const value = resolvePath(binding.path, data, scopeContext);
    
    if (value === null || value === undefined) {
      return binding.fallback || '';
    }
    
    // Aplicar formatter se houver
    if (binding.formatter) {
      return applyFormatter(value, binding.formatter);
    }
    
    return String(value);
  } catch (error) {
    console.warn(`Failed to resolve binding "${binding.path}":`, error);
    return binding.fallback || '';
  }
}

/**
 * Resolve um path de dados (suporta dot notation e arrays)
 * Ex: "client.name", "items[].qty", "organization.address"
 */
function resolvePath(path: string, data: any, scopeContext?: any): any {
  // Se estamos em um contexto de scope (dentro de um repeater), usar ele primeiro
  if (scopeContext && !path.includes('.')) {
    if (path in scopeContext) {
      return scopeContext[path];
    }
  }
  
  const parts = path.split('.');
  let value = data;
  
  for (const part of parts) {
    if (value === null || value === undefined) {
      return undefined;
    }
    
    // Suporta acesso a array com []
    if (part.endsWith('[]')) {
      const key = part.slice(0, -2);
      value = value[key];
      // Se estamos em um repeater, o scopeContext já é o item
      if (scopeContext && Array.isArray(value)) {
        return scopeContext;
      }
      return value;
    }
    
    value = value[part];
  }
  
  return value;
}

/**
 * Aplica formatters aos valores
 */
function applyFormatter(value: any, formatter: string): string {
  const [name, ...args] = formatter.split('|').map(s => s.trim());
  
  switch (name) {
    case 'brl':
      return formatBRL(value);
    
    case 'date':
      const format = args[0] || 'DD/MM/YYYY';
      return formatDate(value, format);
    
    case 'upper':
      return String(value).toUpperCase();
    
    case 'lower':
      return String(value).toLowerCase();
    
    case 'round':
      const decimals = parseInt(args[0] || '0', 10);
      return Number(value).toFixed(decimals);
    
    case 'percent':
      return `${(Number(value) * 100).toFixed(0)}%`;
    
    default:
      return String(value);
  }
}

/**
 * Formata valor em BRL
 */
function formatBRL(value: any): string {
  const num = Number(value);
  if (isNaN(num)) return 'R$ 0,00';
  
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(num);
}

/**
 * Formata data (simplificado)
 */
function formatDate(value: any, format: string): string {
  const date = new Date(value);
  if (isNaN(date.getTime())) return '';
  
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  
  return format
    .replace('DD', day)
    .replace('MM', month)
    .replace('YYYY', String(year));
}

/**
 * Avalia uma condição simples
 * Ex: "flags.showDetails" -> true/false
 *     "items.length > 0" -> true/false
 */
export function evaluateCondition(
  expression: string,
  data: ProposalView,
  scopeContext?: any
): boolean {
  try {
    // Expressões simples de existência
    if (!expression.includes(' ')) {
      const value = resolvePath(expression, data, scopeContext);
      return Boolean(value);
    }
    
    // Expressões com operadores (simplificado)
    const operators = ['>', '<', '>=', '<=', '==', '!='];
    for (const op of operators) {
      if (expression.includes(op)) {
        const [left, right] = expression.split(op).map(s => s.trim());
        const leftValue = resolvePath(left, data, scopeContext);
        const rightValue = parseValue(right);
        
        return compareValues(leftValue, rightValue, op);
      }
    }
    
    return false;
  } catch (error) {
    console.warn(`Failed to evaluate condition "${expression}":`, error);
    return false;
  }
}

function parseValue(value: string): any {
  // Números
  if (!isNaN(Number(value))) {
    return Number(value);
  }
  
  // Booleanos
  if (value === 'true') return true;
  if (value === 'false') return false;
  
  // Strings (remover aspas)
  if ((value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))) {
    return value.slice(1, -1);
  }
  
  return value;
}

function compareValues(left: any, right: any, operator: string): boolean {
  switch (operator) {
    case '>': return left > right;
    case '<': return left < right;
    case '>=': return left >= right;
    case '<=': return left <= right;
    case '==': return left == right;
    case '!=': return left != right;
    default: return false;
  }
}
