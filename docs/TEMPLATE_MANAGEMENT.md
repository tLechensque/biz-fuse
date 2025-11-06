# Gestão de Templates - Guia do Usuário

## Visão Geral

Sistema de gerenciamento de templates de proposta com arquitetura modular por blocos. Templates podem ser criados, editados, duplicados e definidos como padrão da organização.

## Acessando a Gestão de Templates

**Rota**: `/templates`  
**Permissão**: Gerentes e Administradores

## Funcionalidades

### 1. Criar Novo Template

**Passo a passo:**

1. Clique em "Novo Template"
2. Preencha:
   - **Nome**: Identificação do template (ex: "Proposta Comercial 2025")
   - **Descrição**: Objetivo do template (opcional)
   - **Template Ativo**: Se deve estar disponível para uso
3. Clique em "Criar Template"

**Importante:** Novos templates são criados baseados no modelo padrão "Starvai Clean A4" com 7 blocos pré-configurados.

### 2. Editar Template

**O que pode ser editado:**
- Nome do template
- Descrição
- Status ativo/inativo

**O que NÃO pode ser editado (Fase 3):**
- Blocos e sua ordem (disponível na Fase 4 - Editor Visual)
- Conteúdo das propriedades dos blocos
- Tema (cores, fontes)

**Como editar:**
1. Clique no ícone de lápis (✏️) na linha do template
2. Altere as informações desejadas
3. Clique em "Salvar"

### 3. Definir Template Padrão

O template padrão é usado automaticamente quando uma proposta não especifica um template.

**Como definir:**
1. Clique no ícone de estrela (⭐) na linha do template
2. Confirme a ação
3. O template anterior deixa de ser padrão automaticamente

**Regra:** Apenas um template pode ser padrão por organização.

### 4. Duplicar Template

Crie uma cópia de um template existente para customizar sem afetar o original.

**Como duplicar:**
1. Clique no ícone de cópia (📋) na linha do template
2. Um novo template é criado com o nome "{Nome Original} (Cópia)"
3. Edite a cópia conforme necessário

### 5. Desativar/Ativar Template

Templates inativos não aparecem para seleção em propostas.

**Como desativar:**
1. Edite o template
2. Desmarque "Template Ativo"
3. Salve

### 6. Excluir Template

**Restrições:**
- Não é possível excluir o template padrão
- Primeiro defina outro como padrão, depois exclua

**Como excluir:**
1. Clique no ícone de lixeira (🗑️)
2. Confirme a exclusão
3. **Atenção:** Ação irreversível

## Estrutura de um Template

### Blocos Incluídos (Padrão)

Todos os templates criados na Fase 3 incluem os 7 blocos:

1. **Cover** - Capa com logo, título e informações do cliente
2. **ItemsTable** - Tabela de produtos/serviços agrupados
3. **Upgrades** - Opções adicionais (aparece se houver upgrades)
4. **Totals** - Resumo financeiro (subtotal, upgrades, total)
5. **Payment** - Formas de pagamento (aparece se houver)
6. **Notes** - Observações (aparece se houver)
7. **Acceptance** - Área de assinatura e validade

### Variáveis Disponíveis

Mais de 50 variáveis mapeadas automaticamente:

**Proposta:**
- `{{proposal.code}}`, `{{proposal.title}}`, `{{proposal.issueDate}}`, etc.

**Organização:**
- `{{organization.name}}`, `{{organization.email}}`, `{{organization.cnpj}}`, etc.

**Cliente:**
- `{{client.name}}`, `{{client.email}}`, `{{client.address}}`, etc.

**Vendedor:**
- `{{salesperson.name}}`, `{{salesperson.email}}`, etc.

**Itens (loops internos):**
- `{{items[].brand.name}}`, `{{items[].product.name}}`, `{{items[].qty}}`, etc.

**Totais:**
- `{{totals.subtotal}}`, `{{totals.total}}`, `{{totals.margin}}`, etc.

## Usando Templates em Propostas

### Método Atual (Fase 3)

O template padrão da organização é usado automaticamente para todas as propostas.

**Preview:**
1. Acesse a lista de propostas
2. Clique em "Visualizar Preview" no menu ⋮ da proposta
3. Toggle "Mostrar Detalhes" para controlar descrições
4. Clique "Exportar PDF" para gerar PDF via navegador

### Método Futuro (Fase 4)

- Seletor de template na criação/edição de proposta
- Preview com template específico via parâmetro `?templateId=xxx`

## Interface

### Lista de Templates

**Colunas:**
- **Nome**: Com estrela (⭐) se for padrão
- **Descrição**: Objetivo do template
- **Blocos**: Quantidade de blocos incluídos
- **Status**: Ativo/Inativo

**Ações:**
- ⭐ Definir como padrão (não aparece se já for padrão)
- 📋 Duplicar
- ✏️ Editar
- 🗑️ Excluir (desabilitado se for padrão)

### Info Card

Mostra informações sobre o sistema:
- 7 blocos disponíveis
- 50+ variáveis automapeadas
- Status da Fase 4 (Editor Visual)

## Limitações da Fase 3

**O que NÃO está disponível:**
- ❌ Editor visual de blocos (drag & drop)
- ❌ Reordenar blocos
- ❌ Adicionar/remover blocos
- ❌ Editar propriedades dos blocos
- ❌ Customizar tema (cores, fontes)
- ❌ Inserção de variáveis via auto-complete
- ❌ Preview vivo durante edição

**Estas funcionalidades estarão na Fase 4 - Editor Visual.**

## Fase 4 - Prévia

Na próxima fase, o editor terá:

1. **Canvas de Layout**
   - Drag & drop para reordenar blocos
   - Adicionar/remover blocos da paleta
   - Visualização em tempo real

2. **Painel de Propriedades**
   - Editar props de cada bloco
   - Auto-complete ao digitar `{{`
   - Chips clicáveis para inserir variáveis

3. **Customização de Tema**
   - Cores primárias e de destaque
   - Fontes e tamanhos
   - Espaçamentos

4. **Preview Vivo**
   - Renderização lado a lado
   - Alternância entre dados reais e mock
   - Toggle de flags (showDetails, etc.)

## Perguntas Frequentes

### P: Posso criar templates com blocos diferentes?
**R:** Na Fase 3, todos os templates usam os 7 blocos padrão. Customização de blocos estará disponível na Fase 4.

### P: Como alterar a ordem dos blocos?
**R:** Não é possível na Fase 3. Use o Editor Visual da Fase 4.

### P: Posso editar o conteúdo dos blocos (ex: texto da capa)?
**R:** Não diretamente na UI da Fase 3. As variáveis são resolvidas automaticamente a partir dos dados da proposta. Edição manual de props estará na Fase 4.

### P: Como testar um template antes de definir como padrão?
**R:** Atualmente, o preview usa automaticamente o template padrão. Na Fase 4, será possível selecionar template específico para preview.

### P: Posso compartilhar templates entre organizações?
**R:** Não. Templates são sempre isolados por `organization_id` (multi-tenant).

### P: O que acontece se eu excluir um template que está sendo usado?
**R:** Propostas já criadas mantêm referência ao template original. Novas propostas usarão o template padrão.

### P: Quantos templates posso criar?
**R:** Não há limite. Recomenda-se manter apenas templates ativos em uso.

### P: Como funcionam os blocos condicionais?
**R:** Blocos como Upgrades, Payment e Notes só aparecem se houver dados. Por exemplo, se não houver upgrades na proposta, o bloco Upgrades não é renderizado.

## Suporte

Para dúvidas ou problemas, consulte:
- **Documentação Técnica**: `TEMPLATES.md`
- **Geração de PDF**: `docs/PDF_GENERATION.md`
- **Roadmap**: `ROADMAP.md`
