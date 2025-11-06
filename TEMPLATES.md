# Sistema de Templates por Blocos - Documentação Técnica

## Visão Geral

Sistema de templates de proposta modular, baseado em blocos reutilizáveis, com preview web e geração de PDF A4. Reutiliza 100% dos dados existentes (produtos, marcas, fornecedores, organizações, clientes) sem duplicação.

## Arquitetura

### Princípios de Design

1. **Zero Breaking Changes**: Novas rotas e tabelas apenas aditivas
2. **Reutilização de Dados**: Nenhuma duplicação de entidades
3. **Preview = PDF**: Mesma renderização para web e PDF
4. **Segurança**: Auth obrigatório, tenant scoping, sanitização

### Estrutura de Pastas

```
src/features/templates/
├── blocks/                    # Componentes React dos blocos
│   ├── Cover.tsx             # Capa com logo e informações
│   ├── ItemsTable.tsx        # Tabela de produtos/serviços
│   ├── Upgrades.tsx          # Opções de upgrade
│   ├── Totals.tsx            # Resumo financeiro
│   ├── Payment.tsx           # Formas de pagamento
│   ├── Notes.tsx             # Observações
│   └── Acceptance.tsx        # Área de assinatura
├── engine/
│   ├── schema.ts             # Tipos Zod (ProposalView, TemplateLayout)
│   ├── variables.ts          # Registry de variáveis e resolução
│   ├── registry.ts           # Mapeamento tipo → componente
│   ├── render.tsx            # Engine de renderização
│   ├── print.css             # Estilos otimizados para PDF A4
│   └── adapters/
│       └── composeProposalView.ts  # Adapter: DB → ProposalView
└── sample/
    └── starvai-clean-a4.json # Template padrão
```

## Fluxo de Dados

### 1. Composição de Dados (Adapter Pattern)

O adapter `composeProposalView` transforma dados do banco em um DTO padronizado:

```typescript
DB Tables (existentes)    →    ProposalView (DTO)
─────────────────────────      ──────────────────
proposals                 →    proposal.*
organizations             →    organization.*
clients                   →    client.*
profiles                  →    salesperson.*
proposals.items (jsonb)   →    items[]
```

**Importante**: Não altera tabelas existentes, apenas lê e transforma.

### 2. Registry de Variáveis

Mapeamento estático de tokens para paths de dados:

```typescript
Token                        →    Path                      →    Valor
──────────────────────────────────────────────────────────────────────
{{proposal.code}}           →    data.proposal.code        →    "ABC12345"
{{client.name}}             →    data.client.name          →    "João Silva"
{{organization.email}}      →    data.organization.email   →    "contato@empresa.com"
{{items[].brand.name}}      →    loop em items[]           →    "Marca A"
{{totals.total}}            →    data.totals.total         →    15450.00
```

**Registry completo**: `src/features/templates/engine/variables.ts`

### 3. Template Layout (JSON)

Estrutura declarativa que define a composição e ordem dos blocos:

```json
{
  "name": "Starvai Clean A4 v1",
  "theme": {
    "primary": "#0E121B",
    "accent": "#2B6CB0",
    "soft": "#F4F6F9"
  },
  "blocks": [
    {
      "type": "Cover",
      "props": {
        "showLogo": true,
        "title": "{{proposal.title}}",
        "subtitle": "Pedido #{{proposal.code}} · Data {{proposal.issueDate}}",
        "showClient": true
      }
    },
    {
      "type": "ItemsTable",
      "props": {
        "showDetails": false,
        "showImages": true
      }
    }
  ]
}
```

### 4. Renderização

O `TemplateRenderer` percorre os blocos e renderiza cada componente:

```typescript
RenderContext = {
  data: ProposalView,        // Dados da proposta
  flags: { showDetails },    // Flags de contexto
  theme: Theme               // Tema visual
}

blocks.map(block => {
  const Component = BLOCK_REGISTRY[block.type];
  return <Component props={block.props} context={context} />;
});
```

## Blocos Disponíveis

### Cover
**Descrição**: Capa com logo, título e informações do cliente  
**Props**:
- `showLogo`: boolean
- `title`: string com variáveis
- `subtitle`: string com variáveis
- `showClient`: boolean

### ItemsTable
**Descrição**: Tabela de produtos/serviços agrupados  
**Props**:
- `showDetails`: boolean (exibe descrições detalhadas)
- `showImages`: boolean (exibe imagens dos produtos)

**Funcionalidades**:
- Agrupamento automático por `item.group`
- Subtotal por grupo
- Badges de marca e modelo
- Descrições simples e detalhadas (opcional)

### Upgrades
**Descrição**: Lista de opções adicionais/upgrades  
**Comportamento**: Se `upgrades[]` vazio, não renderiza

### Totals
**Descrição**: Resumo financeiro  
**Cálculo**:
- Subtotal dos itens
- Total de upgrades selecionados
- Total geral
- Margem (se disponível)

### Payment
**Descrição**: Formas de pagamento disponíveis  
**Comportamento**: Se `payments[]` vazio, não renderiza

### Notes
**Descrição**: Observações e notas da proposta  
**Comportamento**: Se `notes[]` vazio, não renderiza

### Acceptance
**Descrição**: Área de assinatura e validade  
**Informações**:
- Validade em dias úteis
- Espaço para assinatura do cliente
- Dados do responsável/vendedor

## Variáveis Disponíveis

### Proposta
- `{{proposal.code}}`: Código/número
- `{{proposal.title}}`: Título
- `{{proposal.issueDate}}`: Data de emissão
- `{{proposal.validityDays}}`: Dias de validade
- `{{proposal.version}}`: Versão

### Organização
- `{{organization.name}}`: Nome
- `{{organization.email}}`: E-mail
- `{{organization.phone}}`: Telefone
- `{{organization.whatsapp}}`: WhatsApp
- `{{organization.cnpj}}`: CNPJ
- `{{organization.address}}`: Endereço completo

### Cliente
- `{{client.name}}`: Nome
- `{{client.email}}`: E-mail
- `{{client.phone}}`: Telefone
- `{{client.address}}`: Endereço
- `{{client.city}}`: Cidade
- `{{client.state}}`: Estado

### Vendedor
- `{{salesperson.name}}`: Nome
- `{{salesperson.email}}`: E-mail
- `{{salesperson.phone}}`: Telefone

### Itens (arrays - usados em loops internos)
- `{{items[].group}}`: Grupo
- `{{items[].brand.name}}`: Marca
- `{{items[].product.name}}`: Produto
- `{{items[].qty}}`: Quantidade
- `{{items[].unitPrice}}`: Preço unitário
- `{{items[].subtotal}}`: Subtotal

### Totais
- `{{totals.subtotal}}`: Subtotal
- `{{totals.upgradesTotal}}`: Total de upgrades
- `{{totals.total}}`: Total geral
- `{{totals.margin}}`: Margem

### Flags (contexto dinâmico)
- `{{flags.showDetails}}`: Mostrar detalhes

## Preview e PDF

### Preview Web

**Rota**: `/preview/:proposalId`

**Funcionalidades**:
- Toggle "Mostrar Detalhes" (altera `flags.showDetails`)
- Botão "Exportar PDF" (chama `window.print()`)
- Mesma renderização do PDF

### Geração de PDF

**Método atual**: `window.print()` (browser nativo) ✅

**Edge Function Implementada** (Fase 2): ✅
- Rota: `supabase/functions/generate-pdf`
- Auth JWT obrigatório
- Tenant ownership validation
- Rate limit: 10 PDFs/min por organização
- Logs de auditoria

**Limitação**: Puppeteer não funciona em Deno Deploy (runtime Supabase)

**Soluções para Puppeteer**:
1. **Browserless.io** (Recomendado): Puppeteer as a Service - $99/mês
2. **Servidor Node.js**: Deploy separado em Railway/Render
3. **Fallback atual**: `window.print()` no navegador

**Documentação completa**: `docs/PDF_GENERATION.md`

**CSS Otimizado**:
```css
@page {
  size: A4;
  margin: 18mm;
}

.print-avoid-break {
  break-inside: avoid;
  page-break-inside: avoid;
}
```

## Integração com Dados Existentes

### Como adicionar novos campos

1. **Adicionar ao DTO** (`schema.ts`):
```typescript
export const ProposalViewSchema = z.object({
  // ... campos existentes
  myNewField: z.string(),
});
```

2. **Mapear no adapter** (`composeProposalView.ts`):
```typescript
const proposalView: ProposalView = {
  // ... campos existentes
  myNewField: proposal.my_new_field,
};
```

3. **Registrar variável** (`variables.ts`):
```typescript
{
  path: 'myNewField',
  label: 'Meu Novo Campo',
  description: 'Descrição do campo',
  group: 'Proposta'
}
```

4. **Usar em templates**:
```json
{
  "type": "Cover",
  "props": {
    "title": "{{myNewField}}"
  }
}
```

## Próximas Fases

### Fase 2: Geração de PDF (Edge Function)
- Edge function com Puppeteer
- Rate limiting
- Sanitização HTML
- Cache de renders

### Fase 3: Gestão de Templates
- CRUD de templates por tenant
- Seleção de template padrão
- Versionamento de templates

### Fase 4: Editor Visual
- Drag & drop de blocos
- Auto-complete de variáveis
- Preview vivo
- Chips de variáveis

## Segurança

### Autenticação e Autorização
- Preview: Auth obrigatório via `ProtectedRoute` (futuro)
- PDF: Verificação de tenant ownership
- Templates: Escopo por `organization_id`

### Sanitização
- Variáveis resolvidas não executam código
- HTML estático (não usa `dangerouslySetInnerHTML`)
- Validação Zod em todos os DTOs

### Rate Limiting (Fase 2)
- 10 PDFs/min por tenant
- Logs de uso para auditoria

## Troubleshooting

### "Variable not resolved"
**Causa**: Token não encontrado no registry ou path inválido  
**Solução**: Verificar `VARIABLE_REGISTRY` e path no DTO

### "Block type not found"
**Causa**: Tipo de bloco não registrado em `BLOCK_REGISTRY`  
**Solução**: Adicionar componente e registrar no registry

### Layout quebrado no PDF
**Causa**: CSS não otimizado para impressão  
**Solução**: Adicionar classes `print-avoid-break` em blocos grandes

### Dados não aparecem
**Causa**: Adapter não está mapeando corretamente  
**Solução**: Verificar `composeProposalView` e logs do console

## Referências

- **Schema**: `src/features/templates/engine/schema.ts`
- **Variáveis**: `src/features/templates/engine/variables.ts`
- **Registry**: `src/features/templates/engine/registry.ts`
- **Adapter**: `src/features/templates/engine/adapters/composeProposalView.ts`
- **Preview**: `src/pages/preview/ProposalPreview.tsx`
- **Template Exemplo**: `src/features/templates/sample/starvai-clean-a4.json`
