# Editor Visual de Templates - Guia Completo

## Visão Geral

Editor visual drag & drop para criação e customização de templates de proposta. Permite adicionar, reordenar e configurar blocos de forma intuitiva, com preview vivo e autosave.

## Acessando o Editor

**Rota**: `/templates/editor/:templateId`  
**Permissão**: Gerentes e Administradores

**Como acessar:**
1. Vá para `/templates`
2. Clique no ícone de lápis (✏️) em qualquer template
3. Ou crie um novo template e depois edite-o

## Interface do Editor

### Layout em 3 Colunas

```
┌─────────────┬──────────────────────┬─────────────┐
│  Paleta de  │    Canvas Central    │ Propriedades│
│   Blocos    │   (Drag & Drop)      │  ou Tema    │
│  (Esquerda) │                      │  (Direita)  │
└─────────────┴──────────────────────┴─────────────┘
```

### 1. Header (Topo)

- **Botão "Voltar"**: Retorna para lista de templates
- **Nome do Template**: Exibido no centro
- **Status de Salvamento**: "Salvando..." ou "Tudo salvo"
- **Botão "Preview"**: Abre preview com dados mock
- **Botão "Salvar Agora"**: Força salvamento imediato

### 2. Paleta de Blocos (Coluna Esquerda)

Lista dos 7 blocos disponíveis para adicionar ao template:

- **Cover**: Capa com logo e título
- **ItemsTable**: Tabela de produtos
- **Upgrades**: Opções adicionais
- **Totals**: Resumo financeiro
- **Payment**: Formas de pagamento
- **Notes**: Observações
- **Acceptance**: Área de assinatura

**Como usar:**
- Clique em qualquer bloco para adicioná-lo ao final do canvas
- Blocos podem ser adicionados múltiplas vezes (exceto Cover e Acceptance)

### 3. Canvas Central

Área onde os blocos são exibidos e organizados.

**Funcionalidades:**
- **Drag & Drop**: Arraste blocos pelo ícone ⋮⋮ para reordenar
- **Seleção**: Clique em um bloco para selecionar e editar propriedades
- **Remoção**: Clique no ícone 🗑️ para remover bloco
- **Numeração**: Cada bloco mostra sua posição (1, 2, 3...)
- **Indicador Visual**: Bloco selecionado tem borda azul e fundo destacado

**Estados:**
- **Vazio**: Mensagem "Nenhum bloco adicionado"
- **Com blocos**: Cards empilhados verticalmente
- **Arrastando**: Bloco fica semi-transparente

### 4. Painel Direito (Propriedades ou Tema)

**Quando nenhum bloco está selecionado:**
- Exibe **Customização de Tema**
- 3 cores editáveis: Primária, Destaque, Suave
- Cada cor tem:
  - Seletor visual (input color)
  - Campo de texto com hex (#0E121B)
  - Preview da cor

**Quando um bloco está selecionado:**
- Exibe **Propriedades do Bloco**
- Campos variam conforme o tipo de bloco
- Card com exemplos de variáveis
- Alterações aplicadas em tempo real

## Propriedades por Tipo de Bloco

### Cover (Capa)

**Propriedades:**
- ☑️ **Mostrar Logo**: Checkbox
- 📝 **Título**: Input com auto-complete de variáveis
- 📝 **Subtítulo**: Textarea com auto-complete
- ☑️ **Mostrar Cliente**: Checkbox

**Exemplo de título:**
```
{{proposal.title}}
```

**Exemplo de subtítulo:**
```
Pedido #{{proposal.code}} · Data {{proposal.issueDate}} · Validade {{proposal.validityDays}} dias úteis
```

### ItemsTable (Tabela de Itens)

**Propriedades:**
- ☑️ **Mostrar Descrições Detalhadas**: Controla exibição de `detailedDescription`
- ☑️ **Mostrar Imagens dos Produtos**: Controla exibição da coluna de imagens

### Outros Blocos

**Upgrades, Totals, Payment, Notes, Acceptance:**
- Não possuem propriedades customizáveis na Fase 4
- Renderizam automaticamente baseado nos dados

## Sistema de Variáveis

### Auto-Complete

**Como funciona:**
1. Digite `{{` em qualquer campo de texto
2. Menu de sugestões aparece automaticamente
3. Variáveis filtradas conforme você digita
4. Clique na variável desejada para inserir

**Exemplo prático:**
```
Input: "Proposta para {{"
       ↓
Menu aparece com:
  Cliente
    {{client.name}}
    {{client.email}}
  Organização
    {{organization.name}}
    ...
```

**Navegação:**
- Use mouse ou teclado
- Variáveis agrupadas por categoria
- Máximo 5 variáveis por grupo no menu

### Grupos de Variáveis

**Proposta**: code, title, issueDate, validityDays, version  
**Organização**: name, email, phone, cnpj, address  
**Cliente**: name, email, phone, address, city, state  
**Vendedor**: name, email, phone  
**Itens**: brand.name, product.name, qty, unitPrice, subtotal  
**Totais**: subtotal, upgradesTotal, total, margin  
**Configurações**: flags.showDetails

### Validação

**No Editor:**
- Variáveis não resolvidas ficam como texto literal (não quebra)
- Sem validação em tempo real (planejado para futuro)

**No Preview/PDF:**
- Variáveis inválidas aparecem como `{{path.invalido}}`
- Logs no console com warnings

## Autosave

**Funcionamento:**
- **Delay**: 2 segundos após última alteração
- **Indicador**: Header mostra "Salvando..." enquanto salva
- **Confirmação**: "Tudo salvo" quando completo

**O que aciona autosave:**
- Adicionar ou remover bloco
- Reordenar blocos
- Alterar propriedades
- Mudar cores do tema

**Botão "Salvar Agora":**
- Força salvamento imediato
- Útil antes de fechar o editor
- Desabilitado se não houver alterações

## Preview com Dados Mock

**Como abrir:**
- Clique em "Preview" no header
- Modal fullscreen com renderização do template

**Dados Mock incluem:**
- Proposta fictícia (código PREV123)
- 3 produtos em 2 grupos
- 2 upgrades (1 selecionado)
- 2 formas de pagamento
- 3 notas de rodapé

**Controles:**
- Toggle "Mostrar Detalhes": Controla exibição de descrições
- Botão "Fechar": Retorna ao editor

**Aviso:**
> Este preview usa dados fictícios. O template final usará dados reais das propostas.

## Customização de Tema

### Cores Disponíveis

**Primária** (Primary):
- Padrão: `#0E121B` (preto suave)
- Usado em: Títulos principais, badges, ícones

**Destaque** (Accent):
- Padrão: `#2B6CB0` (azul)
- Usado em: Links, botões secundários, highlights

**Suave** (Soft):
- Padrão: `#F4F6F9` (cinza claro)
- Usado em: Fundos, áreas suaves, separadores

### Como Alterar

**Método 1 - Seletor Visual:**
1. Clique no quadrado colorido
2. Escolha a cor no picker
3. Cor aplicada instantaneamente

**Método 2 - Código Hex:**
1. Digite o código hex no campo (ex: `#FF5733`)
2. Cor aplicada ao digitar

**Preview de Cores:**
- 3 barras coloridas mostram as cores atuais
- Atualizam em tempo real

## Fluxo de Trabalho Recomendado

### 1. Criar Template Base
```
Templates → Novo Template → Criar
```

### 2. Abrir no Editor
```
Clique em ✏️ no template criado
```

### 3. Estruturar Canvas
```
a) Adicionar blocos na ordem desejada
b) Arrastar para reordenar se necessário
```

### 4. Configurar Propriedades
```
Para cada bloco:
  - Selecionar bloco
  - Editar propriedades
  - Inserir variáveis com {{
```

### 5. Customizar Tema
```
Desselecionar blocos → Editar cores
```

### 6. Testar no Preview
```
Clique em "Preview" → Verificar renderização
```

### 7. Definir como Padrão (opcional)
```
Voltar para /templates → Clicar em ⭐
```

## Atalhos e Dicas

### Atalhos de Teclado
- **Ctrl+S**: Salvar agora (planejado)
- **Esc**: Desselecionar bloco (planejado)
- **Delete**: Remover bloco selecionado (planejado)

### Dicas de Produtividade

1. **Use o template padrão como base**: Não comece do zero
2. **Duplique templates similares**: Mais rápido que criar novo
3. **Teste no Preview frequentemente**: Evita surpresas
4. **Nomeie templates claramente**: "Proposta 2025", "Orçamento Express"
5. **Mantenha blocos essenciais**: Cover, ItemsTable, Totals, Acceptance

### Melhores Práticas

**Estrutura recomendada:**
```
1. Cover (obrigatório)
2. ItemsTable (obrigatório)
3. Upgrades (se aplicável)
4. Totals (obrigatório)
5. Payment (se aplicável)
6. Notes (se aplicável)
7. Acceptance (obrigatório)
```

**Variáveis:**
- Use variáveis dinâmicas sempre que possível
- Evite textos hardcoded que mudam frequentemente
- Prefira `{{client.name}}` a "João Silva"

**Cores:**
- Mantenha contraste adequado (texto vs fundo)
- Use cores da identidade visual da empresa
- Teste impressão em preto e branco

## Limitações Conhecidas

**Fase 4 atual:**
- ❌ Não há undo/redo
- ❌ Não há validação de variáveis em tempo real
- ❌ Não é possível duplicar blocos via drag
- ❌ Não há versionamento automático
- ❌ Propriedades limitadas a Cover e ItemsTable

**Planejado para futuras versões:**
- ✨ Undo/Redo (Ctrl+Z / Ctrl+Y)
- ✨ Validação live de variáveis
- ✨ Mais propriedades customizáveis por bloco
- ✨ Copiar/colar blocos
- ✨ Biblioteca de blocos personalizados
- ✨ Histórico de versões

## Troubleshooting

### "Salvando..." não some
**Causa**: Erro de rede ou permissão  
**Solução**: Verifique conexão, recarregue a página

### Variáveis não aparecem no auto-complete
**Causa**: Não digitou `{{` ou posicionamento do cursor  
**Solução**: Digite `{{` novamente, aguarde 200ms

### Blocos não reordenam
**Causa**: Arraste pelo ícone ⋮⋮ (grip)  
**Solução**: Clique e segure no grip, não no card inteiro

### Preview mostra dados errados
**Causa**: Preview usa mock, não dados reais  
**Solução**: Normal. Teste com proposta real no `/preview/:id`

### Cores não aplicam no PDF
**Causa**: Browser pode ignorar cores de fundo em impressão  
**Solução**: Configure "Gráficos de fundo" na impressão

## Próximos Passos

Após criar seu template no editor:

1. **Salvar e definir como padrão** (se desejado)
2. **Testar com proposta real**: `/preview/:proposalId`
3. **Gerar PDF**: Botão "Exportar PDF" no preview
4. **Compartilhar** com equipe (templates são por organização)

## Suporte

**Documentação relacionada:**
- `TEMPLATES.md`: Visão geral do sistema
- `docs/TEMPLATE_MANAGEMENT.md`: Guia de gestão
- `docs/PDF_GENERATION.md`: Geração de PDF

**Recursos:**
- Registry de variáveis: `src/features/templates/engine/variables.ts`
- Blocos: `src/features/templates/blocks/`
- Editor: `src/pages/templates/TemplateEditor.tsx`
