# Sistema de Gestão Comercial Multi-Tenant - Starvai

> Sistema completo de gestão comercial com controle de acesso baseado em roles, multi-tenancy e importação avançada de produtos. Desenvolvido seguindo o **Starvai Engineering Playbook**.

**URL do Projeto**: https://lovable.dev/projects/eaf3898d-0551-4ec2-bbe3-4538be799ebc

---

## 📋 Índice

- [Visão Geral](#-visão-geral)
- [Principais Funcionalidades](#-principais-funcionalidades)
- [Arquitetura](#-arquitetura)
- [Como Executar](#-como-executar)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Tecnologias Utilizadas](#-tecnologias-utilizadas)
- [Segurança](#-segurança)
- [Deploy](#-deploy)
- [Princípios de Engenharia](#-princípios-de-engenharia)
- [Roadmap](#-roadmap)
- [Contribuindo](#-contribuindo)

---

## 🎯 Visão Geral

Sistema desenvolvido para gestão completa de propostas comerciais, produtos, clientes e usuários com **arquitetura multi-tenant robusta e segura**. Implementa controle de acesso granular baseado em roles (RBAC) e isolamento total de dados por organização.

### Objetivo
Permitir que organizações gerenciem todo seu processo comercial de forma eficiente e segura, desde o cadastro de produtos até a geração de propostas, com controle total de permissões e isolamento de dados.

---

## ✨ Principais Funcionalidades

### 🔐 Autenticação e Autorização
- Sistema de autenticação seguro com Lovable Cloud (Supabase Auth)
- Controle de acesso baseado em roles (RBAC):
  - **Administrador**: acesso total ao sistema
  - **Gerente**: gerencia produtos, propostas e visualiza relatórios
  - **Vendedor**: cria e gerencia suas próprias propostas
  - **Visualizador**: apenas visualização (role preparada para futura implementação)
- Gestão de usuários com convites por email via Edge Function
- Isolamento de dados por organização (multi-tenant)
- Hook centralizado de autorização (`useAuthorization`)
- RLS (Row Level Security) em todas as tabelas

### 📦 Gestão de Produtos
- **Cadastro Manual Completo**:
  - Informações básicas (nome, SKU, descrições)
  - Múltiplas imagens e vídeos
  - Sistema de categorias, marcas e tags
  - Controle de estoque e preços (custo/venda)
  - Unidades de medida customizáveis
  - Precificação fixa ou calculada com desconto de marca
  
- **Importação em Massa**:
  - Suporte para Excel (.xlsx, .xls) e CSV
  - Pré-processamento via Edge Function
  - Validação de dados antes da importação
  - Feedback detalhado de erros e sucessos
  - Associação automática de categorias, marcas e tags

### 👥 Gestão de Clientes
- Cadastro completo de clientes pessoa física ou jurídica
- Informações de contato (email, telefone, WhatsApp)
- Dados de endereço completo
- Vinculação automática com propostas
- Histórico de interações

### 💼 Propostas/Orçamentos
- **Criação de Propostas**:
  - Múltiplos produtos com quantidades
  - Cálculo automático de valores e margem
  - Descontos por produto ou globais
  - Formas de pagamento com parcelamento
  - Controle de versões
  
- **Workflow de Status**:
  - Rascunho
  - Aguardando Aprovação
  - Aprovada para Envio
  - Enviada
  - Aprovada pelo Cliente

- **Templates Customizáveis**:
  - Editor HTML para personalização visual
  - Configurações visuais (cores, fontes, logos)
  - Templates padrão por organização
  - Exportação futura para PDF (roadmap)

### 🏢 Gestão de Fornecedores e Marcas
- **Fornecedores**:
  - Cadastro completo (CNPJ, contato, endereço)
  - Associação de múltiplas marcas
  - Tabelas de preço em PDF por fornecedor
  - Controle ativo/inativo
  
- **Marcas**:
  - Desconto padrão por marca (para cálculo automático de custo)
  - Vinculação com fornecedores
  - Tabelas de preço associadas
  - Abertura rápida de PDFs de tabelas

### 💰 Tabelas de Preços
- Upload de PDFs com tabelas de fornecedores (limite 100MB)
- Associação com múltiplos fornecedores e marcas
- Armazenamento seguro privado no Lovable Cloud Storage
- Acesso via URLs assinadas temporárias (1 hora)
- Sanitização automática de nomes de arquivo (remoção de acentos e caracteres especiais)
- Visualização rápida clicando no nome da tabela

### 📊 Descontos Promocionais
- Campanhas de desconto por período
- Aplicação por:
  - Produtos específicos
  - Marcas
  - Categorias
  - Fornecedores
- Desconto em % ou valor fixo
- Ativação/desativação rápida
- Validade por data (início e fim)

### 🎨 Portfólio
- Gestão de itens do portfólio da empresa
- Upload de múltiplas mídias (imagens/vídeos)
- Associação com produtos e marcas
- Descrições e títulos personalizados
- Controle de visibilidade (ativo/inativo)

### 📋 Formas de Pagamento
- Cadastro de métodos de pagamento
- Configuração de parcelamento:
  - Número máximo de parcelas
  - Parcelas sem juros
  - Taxas por parcela
  - Entrada obrigatória
- Configuração por bandeira de cartão
- Ativação/desativação por método

### 👨‍💼 Gestão de Usuários (Admin)
- Convite de novos usuários por email via Edge Function
- Atribuição e alteração de roles
- Visualização de perfis completos
- Gerenciamento de permissões
- Desativação de usuários
- Reset de senha

### ⚙️ Configurações da Organização
- Dados cadastrais completos
- Configurações de matriz e filiais
- Informações fiscais (CNPJ, Razão Social)
- Contatos (email, telefone, WhatsApp)
- Endereço completo
- Personalização do sistema

---

## 🏗️ Arquitetura

### Stack Tecnológico

#### Frontend
- **React 18** com TypeScript
- **Vite** como build tool
- **TailwindCSS** para estilização
- **shadcn/ui** para componentes UI
- **React Router v6** para roteamento
- **TanStack Query (React Query)** para gerenciamento de estado server
- **React Hook Form** + **Zod** para formulários e validação
- **Input Mask** para máscaras de input (CPF, CNPJ, telefone)
- **XLSX** para importação de planilhas

#### Backend (Lovable Cloud - Supabase)
- **PostgreSQL** com Row Level Security (RLS)
- **Edge Functions** (Deno) para lógica serverless
- **Supabase Auth** para autenticação
- **Supabase Storage** para arquivos (imagens, PDFs)
- Multi-tenant com isolamento por `organization_id`

### Padrões Arquiteturais Implementados

#### 1. Feature-Based Structure
```
src/
  ├── components/
  │   ├── auth/           # Autenticação
  │   ├── layout/         # Layouts e estrutura
  │   └── ui/            # Componentes shadcn/ui
  ├── pages/
  │   ├── admin/         # Gestão de usuários
  │   ├── clients/       # Gestão de clientes
  │   ├── management/    # Configurações e gestão
  │   └── products/      # Gestão de produtos
  ├── hooks/             # Custom hooks
  ├── lib/              # Utilitários
  └── integrations/     # Integrações (Supabase)
```

#### 2. Rotas Hierárquicas
- Layout protegido com rota pai compartilhada
- Eliminação de duplicação de código
- Facilita adição de middlewares e guards

#### 3. Context de Autenticação Type-Safe
- Validação estrita de uso do context
- Tratamento robusto de erros
- Armazenamento completo de session

#### 4. Hooks Personalizados
- `useAuthorization`: controle de permissões centralizado
- `useProfile`: gestão de perfil do usuário
- `useDebounce`: otimização de buscas

#### 5. Separation of Concerns
- Componentes separados por responsabilidade
- Lógica de negócio nos hooks
- UI components reutilizáveis
- Edge Functions para operações server-side

---

## 🚀 Como Executar

### Pré-requisitos
- Node.js 18+ e npm
- Conta Lovable (para acesso ao backend)

### Opção 1: Lovable (Recomendado)

1. Acesse o [Projeto no Lovable](https://lovable.dev/projects/eaf3898d-0551-4ec2-bbe3-4538be799ebc)
2. Faça suas alterações via prompts no chat
3. Mudanças são automaticamente commitadas e deployadas

### Opção 2: Desenvolvimento Local

```bash
# Clone o repositório
git clone <YOUR_GIT_URL>
cd <YOUR_PROJECT_NAME>

# Instale dependências
npm install

# Inicie o servidor de desenvolvimento
npm run dev
```

**Nota**: Para desenvolvimento local, você precisará configurar as variáveis de ambiente do Supabase (fornecidas automaticamente no Lovable).

### Opção 3: GitHub Codespaces

1. Vá para a página principal do repositório
2. Clique em "Code" (botão verde)
3. Selecione "Codespaces"
4. Clique em "New codespace"

---

## 📁 Estrutura do Projeto

### Componentes Principais

#### Autenticação (`src/components/auth/`)
- `AuthProvider.tsx`: Context provider de autenticação
- `ProtectedRoute.tsx`: Guard para rotas protegidas
- `RoleGuard.tsx`: Guard baseado em roles

#### Layout (`src/components/layout/`)
- `Layout.tsx`: Layout principal com sidebar e header
- `ProtectedLayout.tsx`: Layout para rotas autenticadas
- `AppSidebar.tsx`: Sidebar com navegação
- `Header.tsx`: Header com perfil do usuário

#### Páginas (`src/pages/`)
- `Auth.tsx`: Login/Registro
- `Dashboard.tsx`: Dashboard principal
- `Proposals.tsx`: Gestão de propostas
- `products/ProductsPage.tsx`: Catálogo de produtos
- `products/ProductForm.tsx`: Formulário de produtos
- `clients/ClientsPage.tsx`: Gestão de clientes
- `admin/UsersManagement.tsx`: Gestão de usuários
- `management/`: Configurações do sistema

#### Edge Functions (`supabase/functions/`)
- `invite-user/`: Convite de usuários por email
- `import-products/`: Importação em massa de produtos
- `pre-process-sheet/`: Pré-processamento de planilhas
- `manage-user/`: Gerenciamento de usuários (delete, reset password)

---

## 🛠️ Tecnologias Utilizadas

### Frontend
| Tecnologia | Versão | Propósito |
|------------|--------|-----------|
| React | 18.3.1 | Framework UI |
| TypeScript | - | Type safety |
| Vite | - | Build tool |
| TailwindCSS | - | Estilização |
| React Router | 6.30.1 | Roteamento |
| TanStack Query | 5.83.0 | State management |
| React Hook Form | 7.61.1 | Formulários |
| Zod | 3.25.76 | Validação |
| shadcn/ui | - | Componentes UI |
| Lucide React | 0.462.0 | Ícones |
| XLSX | 0.18.5 | Importação Excel |

### Backend (Lovable Cloud)
| Tecnologia | Propósito |
|------------|-----------|
| PostgreSQL | Database |
| Supabase Auth | Autenticação |
| Edge Functions | Serverless logic |
| Supabase Storage | File storage |
| Row Level Security | Data isolation |

---

## 🔒 Segurança

### Row Level Security (RLS)
Todas as tabelas possuem políticas RLS para garantir:
- Isolamento de dados por `organization_id`
- Acesso baseado em roles
- Proteção contra acesso não autorizado

### Funções SECURITY DEFINER
Funções SQL com privilégios elevados para:
- `is_admin(_user_id)`: verifica se usuário é admin
- `is_manager(_user_id)`: verifica se usuário é gerente
- `is_seller(_user_id)`: verifica se usuário é vendedor
- `has_role(_user_id, _role)`: verifica role específica
- `can_manage_users(_user_id)`: verifica permissão de gestão de usuários
- `can_manage_products(_user_id)`: verifica permissão de gestão de produtos
- `can_manage_proposals(_user_id)`: verifica permissão de gestão de propostas
- `get_user_roles(_user_id)`: retorna todas as roles do usuário
- `get_user_organization_id(_user_id)`: retorna organization_id do usuário

### Boas Práticas Implementadas
✅ Validação server-side em Edge Functions  
✅ JWT tokens para autenticação  
✅ Sanitização de inputs  
✅ HTTPS obrigatório  
✅ Armazenamento seguro de arquivos (buckets privados)  
✅ URLs assinadas temporárias para acesso a arquivos  
✅ Sem exposição de IDs sensíveis  
✅ Rate limiting via Supabase  

---

## 🌐 Deploy

### Deploy Automático
Abra o [projeto no Lovable](https://lovable.dev/projects/eaf3898d-0551-4ec2-bbe3-4538be799ebc) e clique em **Share → Publish**.

**Importante**:
- **Frontend**: mudanças requerem clicar "Update" no dialog de publicação
- **Backend** (Edge Functions, migrações): deploy automático e imediato

### Domínio Customizado
1. Navegue para **Project > Settings > Domains**
2. Clique em **Connect Domain**
3. Siga as instruções de configuração DNS

[Documentação completa sobre domínio customizado](https://docs.lovable.dev/features/custom-domain#custom-domain)

---

## 🎯 Princípios de Engenharia

Este projeto segue o **Starvai Engineering Playbook**:

### 1. Planning First
- Definir objetivo antes de codificar
- Mapear fluxo principal
- Modelar entidades
- Validar arquitetura

### 2. DRY (Don't Repeat Yourself)
- Componentes reutilizáveis
- Hooks customizados
- Funções utilitárias
- Edge Functions modulares

### 3. KISS (Keep It Simple)
- Código simples e legível
- Uma função = uma responsabilidade
- Evitar abstrações prematuras
- Nomenclatura clara

### 4. YAGNI (You Aren't Gonna Need It)
- Implementar apenas o necessário
- Sem features especulativas
- Evolução incremental

### 5. Separation of Concerns
- Feature-based structure
- UI separada de lógica
- Backend isolado do frontend
- Responsabilidades bem definidas

### 6. Code Quality
- TypeScript para type safety
- Validação com Zod
- Tratamento de erros padronizado
- Commits semânticos

---

## 🗺️ Roadmap

Consulte o arquivo [ROADMAP.md](./ROADMAP.md) para ver as funcionalidades planejadas e em desenvolvimento.

**Próximas implementações**:
- 📄 Exportação de propostas para PDF
- 📧 Sistema de notificações por email
- 📊 Dashboard com métricas e gráficos
- 🔔 Notificações em tempo real
- 📱 Aplicativo móvel (React Native)
- 🤖 Integração com APIs de ERP

---

## 📚 Documentação Adicional

- [ARCHITECTURE.md](./ARCHITECTURE.md) - Arquitetura detalhada do sistema
- [ROADMAP.md](./ROADMAP.md) - Planejamento de funcionalidades futuras

---

## 🤝 Contribuindo

### Fluxo de Trabalho Git

```bash
# Branches principais
main      # Produção
dev       # Desenvolvimento

# Branches de feature
feat/*    # Novas funcionalidades
fix/*     # Correções
refactor/* # Reestruturações
```

### Commits Semânticos
```bash
feat: adiciona importação de produtos via CSV
fix: corrige cálculo de margem em propostas
refactor: reorganiza estrutura de pastas
docs: atualiza README com novas features
```

### Antes de Contribuir
1. Leia o [ARCHITECTURE.md](./ARCHITECTURE.md)
2. Siga o Starvai Engineering Playbook
3. Teste localmente antes de push
4. Mantenha documentação atualizada

---

## 📞 Suporte

- **Issues**: [GitHub Issues](link-do-repositorio/issues)
- **Documentação**: [Lovable Docs](https://docs.lovable.dev)
- **Email**: suporte@starvai.com

---

**Desenvolvido com ❤️ pela equipe Starvai**

*Seguindo os princípios de KISS, DRY, YAGNI e Separation of Concerns*
