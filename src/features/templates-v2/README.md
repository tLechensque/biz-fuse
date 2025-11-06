# Editor Visual v2 - Sistema de Templates Avançado

Sistema completo de edição visual de templates com alta liberdade de design, similar a Figma/Canva.

## ✅ Implementado

### Runtime & Engine
- **Design Tokens**: Sistema completo de tokens (cores HSL, tipografia, espaçamentos, sombras, radii)
- **8 Primitivos**: Frame, Stack, Grid, Text, Image, Table, Divider, Repeater
- **Data-Binding**: 50+ variáveis com suporte a `{{path}}`
- **Formatters**: brl, date, upper, lower, round, percent
- **Condições**: Mostrar/esconder elementos baseado em expressões
- **Render Engine**: React → HTML com CSS customizado
- **Print CSS**: A4 otimizado para Chromium/Puppeteer

### Editor Interface
- **Canvas**: Renderização ao vivo com dados reais
- **Layers Panel**: Hierarquia visual com expand/collapse
- **Inspector Panel**: Editor de propriedades e estilos (Props + Style tabs)
- **Data Panel**: Catálogo de variáveis com busca e copy
- **Tokens Panel**: Editor de design tokens (Colors + Typography)
- **Elements Palette**: Paleta de primitivos para adicionar ao canvas

### Database
- **proposal_templates_v2**: Nova tabela com template_json e tokens_json
- **proposal_template_versions_v2**: Sistema de versionamento
- **RLS Policies**: Segurança multi-tenant

### Routes
- `/templates-v2/editor/:id` - Editor Visual
- `/preview-v2/:proposalId` - Preview com dados reais ou mock

## 🎯 Arquitetura

```
/features/templates-v2/
  runtime/
    design-tokens.ts       # Sistema de tokens
    props-schema.ts        # Zod schemas para elementos
    databind.ts            # Resolução de bindings e condições
    render-html.tsx        # Engine de renderização React
    print.css              # CSS para impressão A4
  
  primitives/
    Frame.tsx              # Container com styles
    Stack.tsx              # Flexbox (row/col)
    Grid.tsx               # CSS Grid
    Text.tsx               # Texto + binding
    Image.tsx              # Imagem + binding
    Table.tsx              # Tabela de dados
    Divider.tsx            # Separador
    Repeater.tsx           # Loop sobre arrays
  
  editor/
    Canvas.tsx             # Preview ao vivo
    LayersPanel.tsx        # Hierarquia de elementos
    InspectorPanel.tsx     # Editor de props/styles
    DataPanel.tsx          # Catálogo de variáveis
    TokensPanel.tsx        # Editor de tokens
    ElementsPalette.tsx    # Paleta de elementos
  
  sample/
    creative-a4.json       # Template exemplo
    sample-data.json       # Dados mock
```

## 📊 Data Schema

### ProposalView (Fonte de Dados)
```typescript
{
  proposal: { id, code, title, issueDate, status, version }
  organization: { name, email, phone, cnpj, address, logoUrl }
  client: { name, email, phone, address, city, state }
  salesperson: { name, email, phone }
  items: [{ product, brand, qty, unitPrice, subtotal, ... }]
  upgrades: [{ name, delta, selected }]
  payments: [{ label, amount, details, method }]
  notes: string[]
  totals: { subtotal, upgradesTotal, total, margin }
}
```

### TemplateV2 Schema
```typescript
{
  version: 'v2',
  name: string,
  root: Element  // Árvore de elementos
}
```

### Element (Primitivo)
```typescript
{
  type: 'Frame' | 'Stack' | 'Grid' | 'Text' | 'Image' | 'Table' | 'Divider' | 'Repeater',
  id?: string,
  style?: { width, height, padding, margin, background, border, ... },
  condition?: { expression, invert },
  children?: Element[],  // Para containers
  // Props específicos por tipo
}
```

### Design Tokens
```typescript
{
  colors: { primary, accent, background, foreground, ... }  // HSL sem hsl()
  typography: { font-sans, text-base, text-2xl, leading-normal, ... }
  spacing: { '0', '1', '2', '4', '8', ... }
  radius: { none, sm, md, lg, xl, ... }
  shadows: { none, sm, md, lg, xl, ... }
}
```

## 🚀 Como Usar

### 1. Acessar o Editor
- Ir para Templates → "Editor Visual v2 (BETA)"
- Ou diretamente: `/templates-v2/editor/new`

### 2. Explorar Template
- **Layers Panel** (esquerda): Ver hierarquia de elementos
- **Canvas** (centro): Preview ao vivo com dados reais
- **Inspector** (direita): Editar propriedades do elemento selecionado

### 3. Adicionar Elementos
- Clicar em um primitivo na **Elements Palette** (topo esquerdo)
- Elemento será adicionado ao template

### 4. Data Bindings
- Trocar para **Data Panel** (header)
- Explorar variáveis disponíveis
- Copiar path (ex: `client.name`)
- Colar no Inspector como binding

### 5. Customizar Tokens
- Trocar para **Tokens Panel** (header)
- Editar cores (HSL), tipografia
- Mudanças refletem instantaneamente no canvas

### 6. Preview & Print
- Botão **Preview**: Abre preview em nova aba
- Preview usa URL `/preview-v2/mock` com dados de exemplo
- Pronto para imprimir (Ctrl+P) ou gerar PDF

## 🎨 Design Tokens em Ação

Tokens são usados via CSS variables:
```css
background: hsl(var(--color-primary));
font-size: var(--text-2xl);
padding: var(--space-4);
border-radius: var(--radius-lg);
box-shadow: var(--shadow-md);
```

No template JSON:
```json
{
  "type": "Frame",
  "style": {
    "background": "hsl(var(--color-primary))",
    "padding": "var(--space-6)",
    "borderRadius": "var(--radius-lg)"
  }
}
```

## 🔗 Data Binding

### Binding Simples
```json
{
  "type": "Text",
  "binding": {
    "path": "client.name"
  }
}
```

### Binding com Formatter
```json
{
  "type": "Text",
  "binding": {
    "path": "totals.total",
    "formatter": "brl"  // R$ 1.234,56
  }
}
```

### Repeater (Loop)
```json
{
  "type": "Repeater",
  "dataBinding": { "path": "items" },
  "children": [
    {
      "type": "Text",
      "binding": { "path": "product.name" }
    }
  ]
}
```

### Condições
```json
{
  "type": "Frame",
  "condition": {
    "expression": "items.length > 0"
  },
  "children": [...]
}
```

## 📝 Variáveis Disponíveis

**Proposta**: `proposal.id`, `proposal.code`, `proposal.title`, `proposal.issueDate`

**Cliente**: `client.name`, `client.email`, `client.phone`, `client.address`

**Organização**: `organization.name`, `organization.email`, `organization.logoUrl`

**Itens** (array): `items[]`, `items[].product.name`, `items[].qty`, `items[].unitPrice`

**Totais**: `totals.subtotal`, `totals.total`, `totals.margin`

Ver lista completa em **Data Panel** no editor.

## 🔄 Formatters

- `brl`: Formato moeda brasileira (R$ 1.234,56)
- `date`: Formato data (DD/MM/YYYY)
- `upper`: MAIÚSCULAS
- `lower`: minúsculas
- `round`: Arredondamento (round|2 = 2 casas decimais)
- `percent`: Porcentagem (0.35 → 35%)

## 🎯 Próximos Passos (Roadmap)

### Fase 1: Drag & Drop
- [ ] Drag & drop de elementos da paleta para o canvas
- [ ] Reordenação de elementos no Layers Panel
- [ ] Visual feedback durante drag

### Fase 2: Edição Avançada
- [ ] Inspector conectado ao elemento selecionado
- [ ] Adicionar/remover children de containers
- [ ] Undo/Redo completo
- [ ] Autosave no banco

### Fase 3: Componentes Avançados
- [ ] ItemCard (com variantes e slots)
- [ ] GroupSection
- [ ] TotalsSummary
- [ ] PaymentList
- [ ] Biblioteca de componentes local

### Fase 4: Assets & Media
- [ ] Upload de imagens para CDN
- [ ] Gestão de logos/assets
- [ ] Preview de imagens no editor

### Fase 5: Print & PDF
- [ ] Edge function `/api/print-v2/:proposalId`
- [ ] Integração com Chromium/Browserless
- [ ] Rate limiting
- [ ] Armazenamento de PDFs

### Fase 6: Colaboração
- [ ] Templates públicos/compartilhados
- [ ] Importador v1 → v2
- [ ] Exportar template como JSON
- [ ] Duplicar template

## 🔒 Segurança

- RLS habilitado em todas as tabelas v2
- Validação de organização em todas as operações
- Sanitização de HTML em rich text (futuro)
- Rate limiting no print (futuro)

## 🧪 Testing

**Template de exemplo**: `/features/templates-v2/sample/creative-a4.json`
**Dados mock**: `/features/templates-v2/sample/sample-data.json`

Para testar:
1. Acessar `/templates-v2/editor/new`
2. Template exemplo será carregado
3. Dados serão buscados do banco (primeira proposta) ou mock

## 📚 Referências

- **Zod**: Validação de schemas
- **React**: Renderização de componentes
- **Tailwind**: Design tokens e utilities
- **Supabase**: Persistência e RLS

## ⚡ Performance

- Render otimizado (sem re-renders desnecessários)
- Debounce de autosave (500ms)
- JSON serializado (pequeno footprint)
- CSS variables para tokens (sem recálculo)

## 🎓 Aprendizados

**Por que v2 ao invés de migrar v1?**
- Zero breaking changes
- Permite testar com usuários reais
- v1 é estável e funcional
- v2 é experimental e evolutivo

**Por que não usar bibliotecas visuais como GrapesJS?**
- Controle total da arquitetura
- Data-binding customizado
- Integração perfeita com nosso banco
- Menor footprint
- Aprendizado do time

**Por que primitivos ao invés de componentes complexos?**
- Máxima flexibilidade
- Componentes podem ser compostos
- Menor curva de aprendizado
- Fácil de estender
