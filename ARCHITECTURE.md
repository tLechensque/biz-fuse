# Documentação da Arquitetura do Sistema

## Visão Geral

Este documento descreve toda a arquitetura e funcionalidades implementadas no sistema de gestão comercial multi-tenant com controle de acesso baseado em roles.

---

## 1. Estrutura de Dados (Base de Dados)

### 1.1 Organizações
- **Tabela**: `organizations`
- **Campos**:
  - `id`: Identificador único da organização
  - `name`: Nome da organização
  - `created_at`: Data de criação
- **Propósito**: Isolar dados entre diferentes empresas/clientes (multi-tenancy)

### 1.2 Perfis de Usuário
- **Tabela**: `profiles`
- **Campos**:
  - `id`: Identificador único do perfil
  - `user_id`: Referência ao usuário autenticado
  - `organization_id`: Organização à qual o usuário pertence
  - `name`: Nome completo do usuário
  - `email`: Email do usuário
  - `phone`: Telefone (opcional)
  - `avatar_url`: URL da foto de perfil (opcional)
  - `role`: Role padrão (campo legado, usar user_roles)
  - `created_at`: Data de criação
  - `updated_at`: Data da última atualização

### 1.3 Sistema de Roles e Permissões

#### Roles Disponíveis
- **Enum**: `app_role`
- **Valores**:
  - `administrador`: Acesso total ao sistema
  - `gerente`: Pode gerenciar propostas de toda a equipe
  - `vendedor`: Acesso básico, gerencia apenas suas próprias propostas

#### Tabelas do Sistema de Permissões
- **user_roles**: Mapeia usuários para suas roles
  - `user_id`: ID do usuário
  - `role`: Role atribuída (enum app_role)
  - `created_by`: Quem atribuiu a role
  - `created_at`: Data de atribuição

- **permissions**: Define permissões granulares
  - `name`: Nome da permissão
  - `resource`: Recurso protegido
  - `action`: Ação permitida
  - `description`: Descrição da permissão
  - `created_by`: Criador da permissão

- **role_permissions**: Mapeia roles para permissões
  - `role`: Role (enum app_role)
  - `permission_id`: ID da permissão
  - `created_by`: Quem criou o mapeamento

#### Funções de Segurança
- **has_role(_user_id, _role)**: Verifica se usuário tem uma role específica
- **is_admin(_user_id)**: Verifica se usuário é administrador

### 1.4 Produtos

#### Tabela Principal: `products`
- **Campos de Identificação**:
  - `id`: Identificador único
  - `name`: Nome do produto
  - `sku`: Código SKU (opcional)
  - `brand`: Marca (opcional)

- **Campos de Descrição**:
  - `simple_description`: Descrição resumida
  - `full_description`: Descrição completa

- **Campos de Preço e Estoque**:
  - `cost_price`: Preço de custo
  - `sell_price`: Preço de venda
  - `unit`: Unidade de medida (ex: pç, kg, m)
  - `stock`: Quantidade em estoque

- **Campos de Mídia**:
  - `image_url`: URL da imagem principal
  - `image_urls`: Array de URLs de múltiplas imagens
  - `video_url`: URL de vídeo do produto (opcional)

- **Campos de Organização**:
  - `category_id`: Categoria do produto
  - `organization_id`: Organização proprietária
  - `user_id`: Usuário que criou o produto
  - `created_at`: Data de criação
  - `updated_at`: Data da última atualização

#### Categorias: `categories`
- `id`: Identificador único
- `name`: Nome da categoria
- `organization_id`: Organização proprietária
- `created_at`: Data de criação

#### Tags: `tags` e `product_tags`
- **tags**: Define tags disponíveis
  - `id`: Identificador único
  - `name`: Nome da tag
  - `organization_id`: Organização proprietária

- **product_tags**: Relaciona produtos com tags (muitos-para-muitos)
  - `product_id`: ID do produto
  - `tag_id`: ID da tag

### 1.5 Clientes

- **Tabela**: `clients`
- **Campos**:
  - `id`: Identificador único
  - `name`: Nome do cliente
  - `email`: Email (opcional)
  - `phone`: Telefone (opcional)
  - `address`: Endereço (opcional)
  - `organization_id`: Organização proprietária
  - `user_id`: Usuário responsável pelo cliente
  - `created_at`: Data de criação
  - `updated_at`: Data da última atualização

### 1.6 Propostas/Orçamentos

- **Tabela**: `proposals`
- **Campos de Identificação**:
  - `id`: Identificador único
  - `title`: Título da proposta
  - `version`: Versão do orçamento

- **Campos de Cliente**:
  - `client_id`: Referência ao cliente (opcional)
  - `client_name`: Nome do cliente

- **Campos de Conteúdo**:
  - `description`: Descrição da proposta
  - `items`: Array JSON de itens da proposta (produtos, quantidades, preços)

- **Campos Financeiros**:
  - `value`: Valor total
  - `margin`: Margem de lucro

- **Campos de Controle**:
  - `status`: Status da proposta (DRAFT, SENT, APPROVED, REJECTED)
  - `user_id`: Usuário criador (vendedor responsável)
  - `created_by_name`: Nome do criador
  - `organization_id`: Organização proprietária
  - `created_at`: Data de criação
  - `updated_at`: Data da última atualização

---

## 2. Segurança (Row Level Security - RLS)

### 2.1 Princípios de Segurança CRÍTICOS

**⚠️ AVISO DE SEGURANÇA**: Este sistema implementa segurança em múltiplas camadas. NUNCA remova ou contorne as verificações de segurança.

1. **Isolamento por Organização**: Todos os dados são isolados por `organization_id`
2. **Controle Baseado em Roles**: Diferentes níveis de acesso por role
3. **Propriedade de Dados**: Usuários podem gerenciar apenas seus próprios dados (exceto admins/gerentes)
4. **Funções SECURITY DEFINER**: Todas as verificações de role usam funções SQL seguras
5. **Sem Verificações Client-Side**: NUNCA verificar roles usando localStorage ou queries diretas

### 2.2 Arquitetura de Autorização

#### 2.2.1 Funções de Segurança (SECURITY DEFINER)

Todas as verificações de autorização utilizam funções SQL com `SECURITY DEFINER` que:
- **Bypasam RLS policies** para evitar recursão
- **Executam com privilégios elevados** do owner do banco
- **São chamadas via RPC** do client para garantir segurança

**Funções Disponíveis:**

```sql
-- Verificações básicas de role
has_role(_user_id uuid, _role app_role) → boolean
is_admin(_user_id uuid) → boolean
is_manager(_user_id uuid) → boolean
is_seller(_user_id uuid) → boolean

-- Verificações de permissões compostas
can_manage_users(_user_id uuid) → boolean    -- Admin only
can_manage_products(_user_id uuid) → boolean -- Admin OR Manager
can_manage_proposals(_user_id uuid) → boolean -- Admin OR Manager

-- Obter todas as roles
get_user_roles(_user_id uuid) → app_role[]
```

**❌ NUNCA FAÇA ASSIM (Inseguro):**
```typescript
// Query direta - pode ser manipulada
const { data } = await supabase
  .from('user_roles')
  .select('role')
  .eq('user_id', user.id);
```

**✅ SEMPRE FAÇA ASSIM (Seguro):**
```typescript
// RPC para função SECURITY DEFINER
const { data } = await supabase.rpc('get_user_roles', {
  _user_id: user.id
});
```

#### 2.2.2 Hook de Autorização (useAuthorization)

**Localização**: `src/hooks/useAuthorization.ts`

Hook centralizado que encapsula todas as verificações de autorização:

```typescript
const { 
  userRoles,      // Array de roles do usuário
  isLoading,      // Estado de carregamento
  hasRole,        // Verificar role específico
  isAdmin,        // É administrador?
  isManager,      // É gerente?
  isSeller,       // É vendedor?
  canManageUsers, // Pode gerenciar usuários?
  canManageProducts, // Pode gerenciar produtos?
  canManageProposals, // Pode gerenciar propostas?
  canViewReports  // Pode ver relatórios?
} = useAuthorization();
```

**Implementação Interna**:
- Usa React Query para cache e invalidação
- Chama `supabase.rpc('get_user_roles')` via SECURITY DEFINER
- Retorna funções helper para verificações comuns
- Nunca expõe queries diretas ao client

#### 2.2.3 Componente RoleGuard

**Localização**: `src/components/auth/RoleGuard.tsx`

Componente de proteção baseado em roles para páginas e seções:

```typescript
// Proteger página admin
<RoleGuard requireAdmin>
  <AdminContent />
</RoleGuard>

// Proteger página manager (ou superior)
<RoleGuard requireManager>
  <ManagerContent />
</RoleGuard>

// Proteger por role específico
<RoleGuard requiredRole="vendedor">
  <SellerContent />
</RoleGuard>
```

**Características**:
- Loading state enquanto verifica permissões
- Fallback customizável para acesso negado
- Usa `useAuthorization` internamente
- Nunca faz queries diretas

### 2.3 Fluxo de Autorização

```
1. Usuário faz login
   ↓
2. AuthProvider carrega session
   ↓
3. Componente usa useAuthorization hook
   ↓
4. Hook chama supabase.rpc('get_user_roles', { _user_id })
   ↓
5. Função SECURITY DEFINER no servidor verifica user_roles
   ↓
6. Servidor retorna roles (bypassa RLS com segurança)
   ↓
7. Frontend renderiza UI baseado em roles
   ↓
8. Ações críticas protegidas por RLS policies no servidor
```

**Dupla Proteção**: 
- **Frontend**: Melhora UX escondendo opções indisponíveis
- **Backend**: Segurança real via RLS policies e funções SECURITY DEFINER

### 2.4 Políticas RLS por Tabela

#### Profiles
- Usuários podem ver e editar apenas seu próprio perfil
- Inserção automática via trigger ao criar usuário

#### Organizations
- Usuários podem ver apenas sua organização

#### User Roles
- Apenas administradores podem gerenciar roles
- **Policy usa**: `is_admin(auth.uid())`

#### Permissions
- Apenas administradores podem gerenciar permissões
- **Policy usa**: `is_admin(auth.uid())`

#### Products, Categories, Tags
- Usuários veem apenas dados de sua organização
- Podem criar/editar/deletar dentro de sua organização

#### Clients
- Usuários veem clientes de sua organização
- Podem criar/editar/deletar clientes

#### Proposals
- Usuários veem todas as propostas de sua organização
- Podem criar propostas
- Podem editar/deletar apenas suas próprias propostas
- **Exceção**: Administradores e gerentes podem editar/deletar todas
  - **Policy usa**: `has_role(auth.uid(), 'administrador') OR has_role(auth.uid(), 'gerente')`

---

## 3. Funcionalidades Implementadas

### 3.1 Autenticação e Gestão de Usuários

#### Sistema de Convite de Usuários
- **Componente**: `InviteUserDialog`
- **Edge Function**: `invite-user`
- **Fluxo**:
  1. Administrador preenche formulário (nome, email, role)
  2. Sistema cria usuário via Admin API
  3. Cria perfil na tabela profiles
  4. Atribui role na tabela user_roles
  5. Envia email de recuperação para usuário definir senha

#### Gestão de Usuários
- **Página**: `UsersManagement` (Admin)
- **Funcionalidades**:
  - Listar todos os usuários da organização
  - Convidar novos usuários
  - Alterar roles de usuários existentes
  - Visualizar informações de perfil

#### Configurações de Autenticação
- **Auto-confirm email**: Habilitado para facilitar testes
- **Email como username**: Usuários fazem login com email
- Senhas gerenciadas via email de recuperação

### 3.2 Edição de Perfil

- **Componente**: `ProfileEditDialog`
- **Acesso**: Menu do usuário no Header
- **Campos Editáveis**:
  - Nome
  - Telefone
- **Campos Não Editáveis**:
  - Email (apenas visualização)

### 3.3 Gestão de Produtos

#### Cadastro Manual
- **Página**: `ProductForm`
- **Campos**:
  - Informações básicas (nome, SKU, marca)
  - Descrições (simples e completa)
  - Preços (custo e venda)
  - Estoque e unidade
  - Categoria
  - Imagens (URL principal e múltiplas URLs)
  - Vídeo (URL)
  - Tags

#### Importação em Massa
- **Componente**: `ImportProductsModal`
- **Edge Function**: `import-products`
- **Formatos Suportados**:
  - Excel (.xlsx, .xls)
  - CSV

- **Fluxo de Importação**:
  1. Download do modelo Excel com campos exemplo
  2. Usuário preenche planilha
  3. Upload do arquivo
  4. Pré-visualização e mapeamento de colunas
  5. Sistema processa e importa produtos

- **Campos Mapeáveis**:
  - Nome, SKU, Brand
  - Descrição simples e completa
  - Preço de custo e venda
  - Unidade e estoque
  - Nome da categoria (cria automaticamente se não existir)
  - URLs de imagens (múltiplas separadas por vírgula)

- **Processamento**:
  - Limpeza automática de valores de preço
  - Criação automática de categorias
  - Separação de múltiplas URLs de imagem
  - Validação de dados obrigatórios
  - Relatório de itens importados vs. falhados

### 3.4 Gestão de Clientes

- **Página**: `ClientsPage`
- **Funcionalidades**:
  - Listar clientes
  - Criar novo cliente
  - Editar dados do cliente
  - Deletar cliente

### 3.5 Propostas/Orçamentos

- **Página**: `Proposals`
- **Funcionalidades**:
  - Criar nova proposta
  - Adicionar produtos à proposta
  - Calcular valores e margem
  - Gerenciar status (rascunho, enviada, aprovada, rejeitada)
  - Controle de versões
  - Visualizar histórico de propostas

- **Regras de Negócio**:
  - Vendedores gerenciam apenas suas propostas
  - Gerentes e admins veem todas as propostas da organização
  - Cada proposta vinculada ao usuário criador
  - Cliente pode ser selecionado ou inserido manualmente

---

## 4. Edge Functions (Backend)

### 4.1 invite-user
- **Caminho**: `supabase/functions/invite-user/index.ts`
- **Autenticação**: Requer token de administrador
- **Entrada**:
  - email: Email do novo usuário
  - name: Nome completo
  - role: Role inicial (administrador, gerente, vendedor)
  - organizationId: ID da organização

- **Processo**:
  1. Valida que chamador é administrador
  2. Cria usuário via Admin API
  3. Insere perfil em profiles
  4. Atribui role em user_roles
  5. Envia email de recuperação

### 4.2 import-products
- **Caminho**: `supabase/functions/import-products/index.ts`
- **Autenticação**: Requer token de usuário autenticado
- **Entrada**:
  - fileData: Conteúdo do arquivo (CSV string ou JSON)
  - fileType: Tipo do arquivo ('csv' ou 'excel')
  - columnMapping: Mapeamento de colunas

- **Processo**:
  1. Valida usuário e obtém organization_id
  2. Processa arquivo (CSV ou Excel)
  3. Mapeia colunas para campos do produto
  4. Processa categorias (cria se não existir)
  5. Processa URLs de imagens
  6. Insere produtos em lote
  7. Retorna estatísticas (importados vs. falhados)

### 4.3 pre-process-sheet
- **Caminho**: `supabase/functions/pre-process-sheet/index.ts`
- **Propósito**: Pré-processar e validar planilhas antes da importação

---

## 5. Variáveis de Ambiente e Secrets

### 5.1 Variáveis Públicas (Frontend)
- `VITE_SUPABASE_URL`: URL do projeto Supabase
- `VITE_SUPABASE_PUBLISHABLE_KEY`: Chave pública (anon key)
- `VITE_SUPABASE_PROJECT_ID`: ID do projeto

### 5.2 Secrets (Backend/Edge Functions)
- `SUPABASE_URL`: URL do projeto
- `SUPABASE_ANON_KEY`: Chave anônima
- `SUPABASE_SERVICE_ROLE_KEY`: Chave de serviço (admin)
- `SUPABASE_DB_URL`: URL de conexão direta ao banco

---

## 6. Arquitetura de Componentes

### 6.1 Layout
- **AppSidebar**: Menu lateral com navegação
- **Header**: Cabeçalho com busca, notificações e menu do usuário
- **Layout**: Container principal com sidebar e header

### 6.2 Autenticação
- **AuthProvider**: Context provider para estado de autenticação (type-safe com validação)
- **ProtectedRoute**: HOC para proteger rotas autenticadas (com acessibilidade)
- **ProtectedLayout**: Layout wrapper que combina ProtectedRoute + Layout
- **ProfileSetup**: Setup inicial de perfil com prevenção de duplicação

### 6.3 Páginas
- **Auth**: Login e registro
- **Dashboard**: Painel principal
- **ProductsPage**: Listagem e gestão de produtos
- **ProductForm**: Formulário de produto
- **ClientsPage**: Gestão de clientes
- **ClientForm**: Formulário de cliente
- **Proposals**: Gestão de propostas
- **UsersManagement**: Gestão de usuários (admin)
- **PermissionsManagement**: Gestão de permissões (admin)

### 6.4 Componentes Especializados
- **ImportProductsModal**: Modal de importação de produtos
- **InviteUserDialog**: Dialog para convidar usuários
- **ProfileEditDialog**: Dialog para editar perfil
- **ProfileSetup**: Configuração inicial de perfil

---

## 7. Tecnologias Utilizadas

### 7.1 Frontend
- **React 18**: Framework UI
- **TypeScript**: Tipagem estática
- **Vite**: Build tool
- **TailwindCSS**: Estilização
- **shadcn/ui**: Componentes UI
- **React Router**: Roteamento
- **TanStack Query**: Gerenciamento de estado servidor
- **React Hook Form**: Formulários
- **Zod**: Validação de schemas
- **XLSX**: Processamento de planilhas Excel

### 7.2 Backend (Lovable Cloud / Supabase)
- **PostgreSQL**: Banco de dados
- **Row Level Security**: Segurança a nível de linha
- **Edge Functions (Deno)**: Serverless functions
- **Supabase Auth**: Autenticação

---

## 8. Fluxos Principais

### 8.1 Onboarding de Novo Usuário
1. Admin acessa página de Usuários
2. Clica em "Convidar Usuário"
3. Preenche formulário (nome, email, role)
4. Sistema cria usuário e envia email
5. Novo usuário recebe email e define senha
6. Faz login e acessa sistema com permissões da role

### 8.2 Importação de Produtos
1. Usuário acessa página de Produtos
2. Clica em "Importar Produtos"
3. Baixa modelo Excel
4. Preenche dados dos produtos
5. Faz upload do arquivo
6. Mapeia colunas da planilha
7. Confirma importação
8. Sistema processa e exibe resultado

### 8.3 Criação de Proposta
1. Vendedor acessa página de Propostas
2. Clica em "Nova Proposta"
3. Seleciona cliente (ou digita nome)
4. Adiciona produtos e quantidades
5. Sistema calcula valores automaticamente
6. Define margem de lucro
7. Salva como rascunho ou envia
8. Proposta fica vinculada ao vendedor criador

---

## 9. Boas Práticas Implementadas

### 9.1 Segurança
- Row Level Security em todas as tabelas
- Validação de roles via funções SECURITY DEFINER
- Isolamento por organização (multi-tenancy)
- Tokens JWT para autenticação
- Service role apenas em Edge Functions
- Context de autenticação com validação estrita
- Tratamento de erros em sessões

### 9.2 Performance
- Queries otimizadas com índices
- Importação em lote de produtos
- Cache de categorias durante importação
- Lazy loading de componentes
- React Query para cache e invalidação

### 9.3 Manutenibilidade
- Componentes modulares e reutilizáveis
- Tipagem TypeScript em todo código
- Hooks customizados para lógica compartilhada
- Separação clara de responsabilidades
- Constantes centralizadas
- Rotas organizadas hierarquicamente

### 9.4 UX
- Feedback imediato com toasts
- Loading states em operações assíncronas
- Validação de formulários em tempo real
- Templates para facilitar importação
- Acessibilidade com ARIA labels e screen reader support

### 9.5 Arquitetura
- Layout protegido com rota pai compartilhada
- Hook de autorização centralizado
- Prevenção de múltiplas criações de perfil
- Context de autenticação type-safe
- Organização de rotas modular

---

## 10. Melhorias Arquiteturais Recentes

### 10.1 Reorganização de Rotas
- **Problema Anterior**: Duplicação de `<ProtectedRoute><Layout>...</Layout></ProtectedRoute>` em cada rota
- **Solução Implementada**: 
  - Criado `ProtectedLayout` que combina proteção + layout
  - Rotas protegidas agora são filhas de uma rota pai
  - Redução de código e facilitação de manutenção
  - Preparação para middlewares futuros

### 10.2 Context de Autenticação Seguro
- **Problema Anterior**: Context inicializado com valores padrão, permitindo uso incorreto
- **Solução Implementada**:
  - Context tipado como `AuthContextType | undefined`
  - Validação explícita no hook `useAuth`
  - Tratamento de erros em `getSession()`
  - Armazenamento completo de session (não apenas user)

### 10.3 Acessibilidade no Loading
- **Problema Anterior**: Spinner visual sem feedback para leitores de tela
- **Solução Implementada**:
  - Adicionado `aria-live="polite"` e `role="status"`
  - Texto oculto com `sr-only` para leitores de tela
  - Mensagem contextual "Carregando autenticação..."

### 10.4 Prevenção de Recriação de Perfil
- **Problema Anterior**: Múltiplas tentativas de criação durante loading
- **Solução Implementada**:
  - Verificação de `isCreatingProfile` antes de nova tentativa
  - Estado local previne loops de criação
  - Tratamento adequado de erros

### 10.5 Parametrização de Dados Fixos
- **Problema Anterior**: `organization_id` hard-coded no código
- **Solução Implementada**:
  - Constante `DEFAULT_ORGANIZATION_ID` em `lib/constants.ts`
  - Facilita configuração por ambiente
  - Prepara para multi-tenant dinâmico

### 10.6 Reconfiguração de Segurança com RPC e SECURITY DEFINER

#### Problema Anterior
- Verificações de admin faziam queries diretas à tabela `user_roles`
- Código duplicado em múltiplas páginas admin
- Vulnerável a manipulação client-side
- Não seguia princípios OWASP de segurança

#### Solução Implementada

**1. Funções SECURITY DEFINER no Banco:**
```sql
-- Criadas funções helper no servidor
is_manager(_user_id uuid)
is_seller(_user_id uuid)
get_user_roles(_user_id uuid)
can_manage_users(_user_id uuid)
can_manage_products(_user_id uuid)
can_manage_proposals(_user_id uuid)
```

**2. Hook useAuthorization Atualizado:**
- Mudou de queries diretas para RPC calls
- Usa `supabase.rpc('get_user_roles')` via SECURITY DEFINER
- Cache com React Query
- Type-safe com TypeScript

**3. Componente RoleGuard:**
- Novo componente para proteção declarativa
- Substitui verificações manuais de `isAdmin`
- Loading states integrados
- Fallback customizável

**4. Páginas Admin Refatoradas:**
- `UsersManagement`: Agora usa `RoleGuard requireAdmin`
- `PermissionsManagement`: Agora usa `RoleGuard requireAdmin`
- Removidas verificações client-side inseguras
- Código mais limpo e seguro

#### Benefícios
- ✅ **Segurança**: Verificações server-side imutáveis
- ✅ **Manutenibilidade**: Lógica centralizada
- ✅ **Performance**: Cache com React Query
- ✅ **DX**: API declarativa e type-safe
- ✅ **Compliance**: Segue boas práticas OWASP

### 10.7 Estrutura Preparada para Evolução
- **Arquitetura Modular**: Base para feature modules por domínio
- **Separação de Camadas**: Preparação para services e domain models
- **Observabilidade**: Estrutura pronta para métricas e tracing
- **Multi-tenant Dinâmico**: Constantes parametrizadas facilitam expansão

---

## 11. Próximos Passos Sugeridos

1. **Relatórios e Analytics**: Dashboard com métricas de vendas
2. **Exportação de Dados**: Exportar propostas para PDF
3. **Notificações**: Sistema de notificações em tempo real
4. **Histórico de Alterações**: Auditoria de mudanças em propostas
5. **Integração com Email**: Envio automático de propostas
6. **Gestão de Estoque**: Controle de entrada/saída
7. **Multi-idioma**: Suporte para múltiplos idiomas
8. **Mobile**: Versão mobile do aplicativo
