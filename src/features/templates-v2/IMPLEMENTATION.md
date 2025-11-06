# Editor Visual v2 - Implementação Completa

## ✅ Funcionalidades Implementadas

### 1. Core System
- [x] Design Tokens System (cores HSL, tipografia, espaçamentos, sombras, radii)
- [x] 8 Primitivos (Frame, Stack, Grid, Text, Image, Table, Divider, Repeater)
- [x] Data-binding com 50+ variáveis
- [x] Formatters (brl, date, upper, lower, round, percent)
- [x] Condições de visibilidade
- [x] Render engine React → HTML
- [x] Print CSS A4

### 2. Editor Interface
- [x] Canvas com drag & drop (react-dnd)
- [x] Layers Panel com hierarquia expandível
- [x] Inspector Panel com Props + Style tabs
- [x] Data Panel com busca e copy
- [x] Tokens Panel com editor visual
- [x] Elements Palette com drag

### 3. State Management
- [x] Undo/Redo completo (Immer + history stack)
- [x] Autosave (debounce 2s)
- [x] Keyboard shortcuts (Ctrl+Z, Ctrl+Y, Ctrl+S, Delete)
- [x] Persistência no banco (proposal_templates_v2)

### 4. CRUD Operations
- [x] Adicionar elementos via drag & drop
- [x] Editar propriedades via Inspector
- [x] Deletar elementos (Delete key ou botão)
- [x] Reordenar na hierarquia (Layers Panel)
- [x] Atualizar design tokens ao vivo

### 5. Components Avançados
- [x] ItemCard (compact, visual, tabular variants)
- [x] GroupSection (simple, card, cover variants)
- [x] TotalsSummary (simple, card, highlight variants)

### 6. Database
- [x] proposal_templates_v2 table
- [x] proposal_template_versions_v2 table
- [x] RLS policies multi-tenant
- [x] Indexes otimizados

### 7. Preview & Export
- [x] Preview ao vivo com dados reais
- [x] Preview v2 route (/preview-v2/:proposalId)
- [x] Print CSS pronto
- [x] Edge function base (generate-pdf-v2)

## 🎮 Como Usar

### Acessar Editor
1. Ir para `/templates`
2. Clicar "Editor Visual v2 (BETA)"
3. Ou diretamente: `/templates-v2/editor/new`

### Adicionar Elementos
1. **Arrastar da paleta**: Drag & drop do elemento para o canvas
2. Elemento é adicionado ao root ou container selecionado
3. Aparece no Layers Panel

### Editar Elementos
1. **Clicar no Layers Panel** para selecionar
2. **Inspector Panel** mostra props editáveis:
   - **Props Tab**: Conteúdo, bindings, configs
   - **Style Tab**: Width, height, padding, background, etc.
3. **Alterações aplicam instantaneamente**

### Data Bindings
1. Trocar para **Data Panel** (botão header)
2. Buscar variável desejada
3. Clicar **copy** (ícone)
4. Colar no Inspector (campo binding)
5. Ou arrastar variável para o campo

### Design Tokens
1. Trocar para **Tokens Panel** (botão header)
2. **Colors Tab**: Editar cores HSL
3. **Typography Tab**: Fontes, tamanhos
4. Mudanças refletem instantaneamente no canvas

### Keyboard Shortcuts
- **Ctrl+Z**: Undo
- **Ctrl+Shift+Z** ou **Ctrl+Y**: Redo
- **Ctrl+S**: Salvar manualmente
- **Delete** ou **Backspace**: Deletar elemento selecionado

### Salvar & Preview
- **Autosave**: Ativo (2s após última alteração)
- **Salvar Agora**: Botão no header
- **Preview**: Abre `/preview-v2/mock` em nova aba
- **Ctrl+P** no preview gera PDF

## 📁 Estrutura de Arquivos

```
src/features/templates-v2/
├── runtime/
│   ├── design-tokens.ts          # Sistema de tokens
│   ├── props-schema.ts            # Zod schemas
│   ├── databind.ts                # Resolução de bindings
│   ├── render-html.tsx            # Engine de renderização
│   └── print.css                  # CSS A4
│
├── primitives/
│   ├── Frame.tsx                  # Container
│   ├── Stack.tsx                  # Flexbox
│   ├── Grid.tsx                   # Grid layout
│   ├── Text.tsx                   # Texto + binding
│   ├── Image.tsx                  # Imagem
│   ├── Table.tsx                  # Tabela
│   ├── Divider.tsx                # Separador
│   └── Repeater.tsx               # Loop arrays
│
├── components/
│   ├── ItemCard.tsx               # Card de item (variantes)
│   ├── GroupSection.tsx           # Seção de grupo
│   └── TotalsSummary.tsx          # Resumo de totais
│
├── editor/
│   ├── Canvas.tsx                 # Preview base
│   ├── DroppableCanvas.tsx        # Canvas com DnD
│   ├── DraggableElement.tsx       # Elemento arrastável
│   ├── LayersPanel.tsx            # Hierarquia
│   ├── InspectorPanel.tsx         # Editor props
│   ├── DataPanel.tsx              # Variáveis
│   ├── TokensPanel.tsx            # Design tokens
│   ├── ElementsPalette.tsx        # Paleta elementos
│   └── CreateTemplateDialog.tsx   # Dialog criar
│
├── hooks/
│   ├── useTemplateState.ts        # State + history
│   └── useKeyboardShortcuts.ts    # Atalhos teclado
│
├── utils/
│   └── element-factory.ts         # Factory elementos
│
└── sample/
    ├── creative-a4.json           # Template exemplo
    └── sample-data.json           # Dados mock
```

## 🔧 Tecnologias

- **React**: UI components
- **react-dnd**: Drag & drop
- **Immer**: Immutable updates
- **Zod**: Validação schemas
- **Supabase**: Persistência + RLS
- **Tailwind**: Design system
- **TanStack Query**: Cache + mutations

## 🎨 Design Patterns

### Immutability com Immer
```typescript
updateTemplate(draft => {
  draft.root.children.push(newElement);
});
```

### Undo/Redo Stack
```typescript
history: [state0, state1, state2]
index: 2
// Undo: index--
// Redo: index++
```

### Path-based Selection
```typescript
// Seleciona elemento via path:
"children[0].children[1]"
// = root.children[0].children[1]
```

### Factory Pattern
```typescript
createElementByType('Text')
// → { type: 'Text', content: '...', ... }
```

## 🚀 Performance

### Autosave Debounce
- Aguarda 2s sem alterações antes de salvar
- Evita saves desnecessários durante edição

### React Memoization
- useCallback em handlers
- useMemo em computações pesadas
- React.memo em componentes puros

### Minimal Re-renders
- State isolado por panel
- Updates localizados
- Immutability previne deep comparisons

## 🔒 Segurança

### RLS Policies
```sql
-- Somente usuários da mesma org
WHERE organization_id IN (
  SELECT organization_id FROM profiles 
  WHERE user_id = auth.uid()
)
```

### Validação Zod
- Input sanitizado antes de salvar
- Schema validation em runtime
- Type safety completo

### Multi-tenant
- organization_id obrigatório
- Isolamento total entre tenants
- RLS garante acesso correto

## 📊 Métricas

- **Primitivos**: 8
- **Componentes avançados**: 3
- **Variáveis disponíveis**: 50+
- **Formatters**: 6
- **Design tokens**: 30+
- **Keyboard shortcuts**: 5
- **Undo history**: Ilimitado
- **Autosave delay**: 2s

## 🐛 Troubleshooting

### Elemento não aparece após adicionar
- Verificar se container aceita children
- Verificar condição de visibilidade
- Ver console para erros de binding

### Autosave não funciona
- Verificar se não é template novo (precisa salvar manualmente primeiro)
- Verificar debounce (aguardar 2s)
- Ver mensagem de erro no toast

### Drag & drop não funciona
- Verificar se DndProvider está envolvendo
- Browser deve suportar HTML5 drag API
- Elemento deve ser draggable

### Preview não mostra dados
- Verificar se há propostas no banco
- Usar sample data (/preview-v2/mock)
- Ver console para erros de render

## 🎓 Próximos Passos Opcionais

### Fase 1: Aprimoramentos UI
- [ ] Visual feedback durante drag (ghost)
- [ ] Snap guides (alinhamento)
- [ ] Grid lines no canvas
- [ ] Zoom in/out no canvas
- [ ] Rulers (réguas)

### Fase 2: Componentes
- [ ] PaymentList component
- [ ] NotesBlock component
- [ ] AcceptanceBlock component
- [ ] Custom component creator

### Fase 3: Assets
- [ ] Upload de imagens
- [ ] Assets library panel
- [ ] CDN integration
- [ ] Image optimization

### Fase 4: PDF Real
- [ ] Browserless.io integration
- [ ] Chromium headless
- [ ] PDF storage bucket
- [ ] Rate limiting
- [ ] Queue system

### Fase 5: Colaboração
- [ ] Shared templates
- [ ] Template marketplace
- [ ] Import/export JSON
- [ ] Duplicate template
- [ ] Template preview gallery

### Fase 6: AI Features
- [ ] Auto-layout suggestions
- [ ] Smart spacing
- [ ] Color palette generator
- [ ] Content suggestions
- [ ] Design critique

## 📝 Notas de Desenvolvimento

### Por que Immer?
- Simplifica updates imutáveis
- Código mais legível
- Performance otimizada
- Undo/Redo trivial

### Por que react-dnd?
- Biblioteca madura
- HTML5 Backend nativo
- Boa documentação
- Leve e performático

### Por que não usar builder libraries?
- Controle total
- Integração perfeita com nosso schema
- Menor footprint
- Aprendizado do time
- Customização ilimitada

## 🎉 Status: COMPLETO & FUNCIONAL

Todas as funcionalidades core estão implementadas e testadas.
O sistema está pronto para uso em produção (beta).
