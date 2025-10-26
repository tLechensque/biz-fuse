# Sistema de Gestão Comercial Multi-Tenant

Sistema completo de gestão comercial com controle de acesso baseado em roles, multi-tenancy e importação avançada de produtos.

## 📋 Sobre o Projeto

Sistema desenvolvido para gestão de propostas comerciais, produtos, clientes e usuários com arquitetura multi-tenant robusta e segura. Implementa controle de acesso granular baseado em roles (RBAC) e isolamento total de dados por organização.

**URL do Projeto**: https://lovable.dev/projects/eaf3898d-0551-4ec2-bbe3-4538be799ebc

## ✨ Principais Funcionalidades

### 🔐 Autenticação e Autorização
- Sistema de autenticação seguro com Supabase Auth
- Controle de acesso baseado em roles (Administrador, Gerente, Vendedor)
- Gestão de usuários com convites por email
- Isolamento de dados por organização (multi-tenant)
- Hook centralizado de autorização (`useAuthorization`)

### 📦 Gestão de Produtos
- Cadastro manual completo com múltiplas imagens e vídeos
- **Importação em massa** via Excel (.xlsx, .xls) ou CSV
- Sistema de categorias e tags
- Controle de estoque e preços (custo/venda)
- Suporte a múltiplas URLs de imagem

### 👥 Gestão de Clientes
- Cadastro completo de clientes
- Vinculação com propostas
- Dados de contato e endereço

### 💼 Propostas/Orçamentos
- Criação de propostas com múltiplos produtos
- Cálculo automático de valores e margem
- Controle de versões
- Status workflow (Rascunho, Enviada, Aprovada, Rejeitada)
- Permissões diferenciadas por role

### 👨‍💼 Gestão de Usuários (Admin)
- Convite de novos usuários por email
- Atribuição e alteração de roles
- Visualização de perfis

## 🏗️ Arquitetura

### Frontend
- **React 18** com TypeScript
- **Vite** como build tool
- **TailwindCSS** + **shadcn/ui** para UI
- **React Router** para roteamento
- **TanStack Query** para gerenciamento de estado
- **React Hook Form** + **Zod** para formulários

### Backend (Lovable Cloud / Supabase)
- **PostgreSQL** com Row Level Security (RLS)
- **Edge Functions** (Deno) para lógica serverless
- **Supabase Auth** para autenticação
- Multi-tenant com isolamento por `organization_id`

### Melhorias Arquiteturais Recentes

#### ✅ Rotas Hierárquicas
- Layout protegido com rota pai compartilhada
- Eliminação de duplicação de código
- Facilita adição de middlewares

#### ✅ Context de Autenticação Type-Safe
- Validação estrita de uso do context
- Tratamento robusto de erros
- Armazenamento completo de session

#### ✅ Acessibilidade
- ARIA labels em componentes de loading
- Suporte a leitores de tela
- Feedback contextual

#### ✅ Prevenção de Bugs
- Evita recriação múltipla de perfis
- Constantes parametrizadas (não hard-coded)
- Hook de autorização centralizado

## 🚀 Como Editar este Código

### Opção 1: Usar Lovable (Recomendado)

Acesse o [Projeto no Lovable](https://lovable.dev/projects/eaf3898d-0551-4ec2-bbe3-4538be799ebc) e comece a fazer prompts. Mudanças são automaticamente commitadas.

### Opção 2: Desenvolvimento Local

```sh
# Clone o repositório
git clone <YOUR_GIT_URL>

# Entre na pasta
cd <YOUR_PROJECT_NAME>

# Instale dependências
npm i

# Inicie o servidor de desenvolvimento
npm run dev
```

**Requisitos**: Node.js & npm - [instalar com nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

### Opção 3: GitHub Codespaces

1. Vá para a página principal do repositório
2. Clique em "Code" (botão verde)
3. Selecione "Codespaces"
4. Clique em "New codespace"

## 📚 Documentação

Para documentação completa da arquitetura, consulte o arquivo [ARCHITECTURE.md](./ARCHITECTURE.md).

## 🔒 Segurança

- Row Level Security (RLS) em todas as tabelas
- Funções SECURITY DEFINER para validação de roles
- Isolamento total por organização
- JWT tokens para autenticação
- Validação server-side em Edge Functions

## 🌐 Deploy

Abra o [projeto no Lovable](https://lovable.dev/projects/eaf3898d-0551-4ec2-bbe3-4538be799ebc) e clique em Share → Publish.

### Domínio Customizado

Navegue para Project > Settings > Domains e clique em Connect Domain.

Leia mais: [Configurando domínio customizado](https://docs.lovable.dev/features/custom-domain#custom-domain)
