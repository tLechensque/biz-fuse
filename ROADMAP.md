# 🗺️ Roadmap - Sistema de Gestão Comercial Starvai

> Planejamento de funcionalidades e melhorias futuras do sistema

---

## 📋 Status de Implementação

### ✅ Implementado (v1.0 - Atual)

#### Core System
- [x] Autenticação e autorização (RBAC)
- [x] Multi-tenancy com isolamento por organização
- [x] Sistema de roles (Admin, Gerente, Vendedor)
- [x] Gestão de perfis de usuário
- [x] Convite de usuários por email

#### Gestão de Produtos
- [x] Cadastro manual completo
- [x] Importação em massa via Excel/CSV
- [x] Múltiplas imagens por produto
- [x] Sistema de categorias e tags
- [x] Controle de estoque
- [x] Precificação com desconto de marca

#### Gestão Comercial
- [x] Cadastro de clientes
- [x] Criação de propostas/orçamentos
- [x] Workflow de status de propostas
- [x] Cálculo automático de margens
- [x] Descontos por produto

#### Configurações
- [x] Gestão de fornecedores
- [x] Gestão de marcas com descontos
- [x] Tabelas de preços em PDF (upload 100MB)
- [x] Formas de pagamento com parcelamento
- [x] Descontos promocionais por período
- [x] Portfólio de produtos
- [x] Templates de propostas (HTML)
- [x] Configurações da organização

#### 🎨 Sistema de Templates por Blocos (NEW!)
- [x] Engine modular com 7 blocos (Cover, ItemsTable, Upgrades, Totals, Payment, Notes, Acceptance)
- [x] Registry com 50+ variáveis automapeadas
- [x] Adapter que reutiliza dados existentes
- [x] Preview web com toggle de detalhes
- [x] Geração de PDF A4 otimizado
- [x] Template padrão "Starvai Clean A4"
- [x] Resolução segura de variáveis
- [x] Print CSS com paginação inteligente

---

## 🚧 Em Desenvolvimento (v1.1)

### Q1 2025

#### 🎨 Templates Avançados
**Status**: ✅ TODAS AS FASES COMPLETAS  
**Prioridade**: Alta  
**Descrição**: Sistema modular de templates por blocos com editor visual

**Fase 1 - Engine e Blocos**: ✅ Implementado
- [x] Engine modular com 7 blocos
- [x] Registry de 50+ variáveis
- [x] Adapter reutilizando dados existentes
- [x] Preview web com toggle de detalhes
- [x] Template padrão "Starvai Clean A4"
- [x] Print CSS A4 otimizado

**Fase 2 - Geração de PDF**: ✅ Implementado
- [x] Edge Function `generate-pdf` com auth JWT
- [x] Verificação de tenant ownership
- [x] Rate limiting (10 PDFs/min)
- [x] Fallback `window.print()` funcional
- [x] Documentação completa em `docs/PDF_GENERATION.md`
- [x] Helper library em `src/lib/pdf.ts`
- [ ] Puppeteer via Browserless.io (aguardando configuração)

**Fase 3 - Gestão de Templates**: ✅ Implementado
- [x] CRUD completo de templates via UI `/templates`
- [x] Criar template baseado em modelo padrão
- [x] Editar nome, descrição e status
- [x] Definir template padrão da organização
- [x] Duplicar templates existentes
- [x] Excluir templates (com restrição para padrão)
- [x] Filtro automático por `template_type = 'blocks'`
- [x] Helper library `src/lib/templates.ts`
- [x] Preview usa template padrão ou específico via `?templateId=xxx`
- [x] Documentação de usuário em `docs/TEMPLATE_MANAGEMENT.md`
- [x] Listagem com badges de blocos e status
- [x] RoleGuard: apenas gerentes e admins

**Fase 4 - Editor Visual**: ✅ Implementado
- [x] Drag & drop de blocos com @dnd-kit
- [x] Canvas central com reordenação visual
- [x] Paleta de blocos à esquerda (7 blocos disponíveis)
- [x] Painel de propriedades à direita (Cover e ItemsTable)
- [x] Auto-complete de variáveis ao digitar {{
- [x] Sugestões agrupadas por categoria (50+ variáveis)
- [x] Customização de tema (3 cores: primária, destaque, suave)
- [x] Preview vivo com dados mock em dialog
- [x] Autosave com debounce de 2 segundos
- [x] Indicador de status de salvamento no header
- [x] Rota `/templates/editor/:templateId`
- [x] Botão de edição (✏️) na lista de templates
- [x] Documentação completa em `docs/TEMPLATE_EDITOR.md`
- [x] Componentes: VariableAutocomplete, ThemeCustomizer, PreviewDialog, CanvasEditor, BlocksPalette

---

#### 📊 Dashboard e Métricas
**Status**: Planejado  
**Prioridade**: Alta  
**Descrição**: Dashboard com KPIs e métricas comerciais

**Features**:
- Visão geral de vendas por período
- Taxa de conversão de propostas
- Produtos mais vendidos
- Desempenho por vendedor
- Gráficos interativos (Chart.js ou Recharts)
- Filtros por período, vendedor, cliente

**Dependências**:
- Tabela de vendas efetivadas
- Sistema de relatórios

---

#### 🔔 Sistema de Notificações
**Status**: Planejado  
**Prioridade**: Média  
**Descrição**: Notificações em tempo real e por email

**Features**:
- Notificações push no sistema
- Email automático em eventos:
  - Proposta aprovada
  - Novo usuário convidado
  - Status de proposta alterado
  - Produtos com estoque baixo
- Preferências de notificação por usuário
- Central de notificações

**Dependências**:
- Edge Function para emails (SendGrid ou Resend)
- Realtime Supabase

---

## 🔮 Futuro (v2.0+)

### Q2-Q3 2025

#### 🎯 Módulo de Kits/Combos
**Status**: Planejado  
**Prioridade**: Média  
**Descrição**: Criação de kits com múltiplos produtos

**Features**:
- Criar combos de produtos
- Desconto especial para kits
- Gestão de estoque de kits
- Kits pré-definidos e customizáveis
- Sugestão automática de kits

---

#### 📝 Módulo de Briefing
**Status**: 🚧 EM DESENVOLVIMENTO  
**Prioridade**: Alta  
**Descrição**: Captura de requisitos do cliente

**Fase 1 - Estrutura Base**: ✅ Implementado (Jan 2025)
- [x] Tabela `briefings` com campos flexíveis (JSONB)
- [x] RLS policies completas
- [x] Documentação em `docs/PROPOSTAS_BRIEFING_V2.md`
- [x] Índices de performance

**Fase 2 - Interface** (Em andamento):
- [ ] Página de listagem de briefings
- [ ] Formulário de criação/edição
- [ ] Upload de anexos
- [ ] Conversão briefing → proposta

**Features**:
- Formulários customizáveis de briefing
- Histórico de briefings por cliente
- Vinculação briefing → proposta
- Templates de perguntas por segmento
- Análise de requisitos com IA (futura)

---

#### 🤖 Integração com ERPs
**Status**: Planejado  
**Prioridade**: Baixa  
**Descrição**: Sincronização com sistemas externos

**Integrações Planejadas**:
- TOTVS Protheus
- SAP Business One
- Bling
- Tiny ERP
- Omie

**Features**:
- Sincronização de produtos
- Atualização de estoque em tempo real
- Exportação de pedidos
- Webhooks para eventos

---

#### 📱 App Mobile (React Native)
**Status**: Planejado  
**Prioridade**: Baixa  
**Descrição**: Aplicativo nativo iOS/Android

**Features**:
- Catálogo de produtos offline
- Criação de propostas mobile
- Scanner de código de barras
- Assinatura digital de clientes
- Notificações push nativas
- Modo offline com sincronização

---

#### 🎨 Editor Visual de Propostas
**Status**: Planejado  
**Prioridade**: Baixa  
**Descrição**: Editor drag-and-drop para templates

**Features**:
- Editor WYSIWYG completo
- Blocos arrastar-e-soltar
- Biblioteca de componentes visuais
- Preview em tempo real
- Galeria de templates prontos

---

#### 🔍 Busca Avançada e Filtros
**Status**: Planejado  
**Prioridade**: Média  
**Descrição**: Sistema de busca aprimorado

**Features**:
- Busca full-text em produtos
- Filtros combinados avançados
- Salvamento de filtros personalizados
- Busca por similaridade (IA)
- Histórico de buscas

---

#### 💬 Chat Interno
**Status**: Planejado  
**Prioridade**: Baixa  
**Descrição**: Comunicação entre usuários

**Features**:
- Chat em tempo real (Supabase Realtime)
- Grupos por time/projeto
- Compartilhamento de propostas no chat
- Histórico persistente
- Notificações de mensagens

---

#### 📈 Relatórios Avançados
**Status**: Planejado  
**Prioridade**: Média  
**Descrição**: Sistema de relatórios completo

**Features**:
- Relatório de vendas detalhado
- Relatório de produtos mais vendidos
- Análise de margem por categoria
- Previsão de vendas (IA)
- Exportação para Excel
- Agendamento de relatórios por email

---

#### 🔐 Auditoria e Logs
**Status**: Planejado  
**Prioridade**: Baixa  
**Descrição**: Rastreamento de ações no sistema

**Features**:
- Log de todas as ações de usuários
- Histórico de alterações em registros
- Rastreamento de acesso
- Relatório de auditoria
- Compliance LGPD

---

#### 🌍 Internacionalização (i18n)
**Status**: Planejado  
**Prioridade**: Baixa  
**Descrição**: Suporte a múltiplos idiomas

**Idiomas Planejados**:
- Português (BR) ✅
- Inglês (US)
- Espanhol (ES)

---

#### 🎨 Temas Customizáveis
**Status**: Planejado  
**Prioridade**: Baixa  
**Descrição**: Personalização visual por organização

**Features**:
- Modo claro/escuro
- Cores primárias customizáveis
- Upload de logo da empresa
- Fonte personalizada
- Temas pré-definidos

---

## 🐛 Melhorias e Correções Contínuas

### Performance
- [ ] Otimização de queries complexas
- [ ] Lazy loading de imagens
- [ ] Cache de dados frequentes
- [ ] Paginação otimizada
- [ ] Code splitting por rota

### UX/UI
- [ ] Feedback visual aprimorado
- [ ] Animações suaves
- [ ] Tooltips contextuais
- [ ] Atalhos de teclado
- [ ] Tour guiado para novos usuários

### Segurança
- [ ] Auditoria de segurança externa
- [ ] Testes de penetração
- [ ] 2FA (autenticação de dois fatores)
- [ ] Backup automático diário
- [ ] Recuperação de desastres

### Testes
- [ ] Cobertura de testes unitários (>80%)
- [ ] Testes de integração
- [ ] Testes E2E com Playwright
- [ ] CI/CD automatizado

---

## 📊 Métricas de Sucesso

### KPIs do Produto
- Tempo médio de criação de proposta: **< 5 minutos**
- Taxa de conversão de propostas: **> 40%**
- Satisfação do usuário (NPS): **> 50**
- Uptime do sistema: **> 99.5%**

### Adoção
- Usuários ativos mensais: **crescimento 20% mensal**
- Propostas criadas/mês: **crescimento 30% mensal**
- Produtos cadastrados: **crescimento 15% mensal**

---

## 🤝 Como Contribuir com o Roadmap

Tem uma ideia de feature? Siga o processo:

1. **Abra uma Issue** no GitHub com tag `feature-request`
2. **Descreva o problema** que a feature resolve
3. **Proponha uma solução** inicial
4. **Discuta com a equipe** nos comentários
5. **Aguarde aprovação** para implementação

### Template de Feature Request
```markdown
## Problema
[Descreva o problema ou necessidade]

## Solução Proposta
[Como você resolveria isso?]

## Benefícios
- [Benefício 1]
- [Benefício 2]

## Complexidade Estimada
[ ] Baixa (1-2 dias)
[ ] Média (3-5 dias)
[ ] Alta (1-2 semanas)
[ ] Muito Alta (> 2 semanas)
```

---

## 📅 Cronograma de Releases

| Versão | Data Prevista | Principais Features |
|--------|---------------|---------------------|
| v1.0 | ✅ Concluído | Core system + CRUD completo |
| v1.1 | Março 2025 | PDF Export + Dashboard + Notificações |
| v1.2 | Maio 2025 | Kits/Combos + Briefing |
| v2.0 | Agosto 2025 | Integrações ERP + Relatórios Avançados |
| v2.1 | Outubro 2025 | App Mobile + Editor Visual |
| v3.0 | 2026 | IA + Previsões + Análises Avançadas |

---

## 🎯 Visão de Longo Prazo

### 2025-2026
- Consolidar como **melhor sistema de gestão comercial** para PMEs no Brasil
- Atingir **1000+ organizações ativas**
- Processar **R$ 100M+ em propostas**
- Time de **10+ desenvolvedores**

### 2027+
- Expansão internacional (América Latina)
- Plataforma de marketplace B2B
- IA para recomendação de produtos
- Análise preditiva de vendas
- Integração com WhatsApp Business API

---

**Última atualização**: Janeiro 2025  
**Próxima revisão**: Março 2025

---

*Este roadmap é um documento vivo e será atualizado conforme as prioridades evoluem e feedback dos usuários é coletado.*
