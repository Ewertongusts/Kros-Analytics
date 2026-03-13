# 🚀 Guia Definitivo: Do Zero ao Deploy

**Stack:** Nuxt 4 + Tailwind CSS + Supabase  
**Objetivo:** Processo completo e ordenado para criar projetos SaaS sem retrabalho

---

## 📋 ÍNDICE

1. Fase 0: Planejamento e Branding (ANTES de codar)
2. Fase 1: Setup Técnico Inicial
3. Fase 2: Modelo de Dados Completo (CRÍTICO)
4. Fase 3: Autenticação e Layout
5. Fase 4: CRUD por Entidade (ordem específica)
6. Fase 5: Dashboard e Analytics
7. Fase 6: Features Avançadas
8. Fase 7: Testes e Deploy

---

## 🎨 FASE 0: PLANEJAMENTO E BRANDING (2-3 dias)

### Objetivo: Definir TUDO antes de escrever código

### 0.1 Branding e Identidade
```
[ ] Nome do projeto
[ ] Logo (pelo menos versão simples)
[ ] Paleta de cores (5-6 cores principais)
[ ] Tipografia (fonte principal + secundária)
[ ] Tom de voz (formal, casual, técnico)
```

### 0.2 Definir Escopo Completo
```
[ ] Qual problema o sistema resolve?
[ ] Quem são os usuários?
[ ] Quais as funcionalidades principais?
[ ] Quais as funcionalidades secundárias?
[ ] O que NÃO vai ter (pelo menos no MVP)?
```

### 0.3 Wireframes de TODAS as Páginas
```
📝 Desenhe (papel, Figma, Excalidraw) TODAS as telas:

Públicas:
[ ] Landing page (se tiver)
[ ] Login
[ ] Cadastro
[ ] Recuperação de senha

Privadas (após login):
[ ] Dashboard/Home
[ ] Página de cada entidade (ex: Clientes, Produtos, Vendas)
[ ] Configurações/Perfil
[ ] Relatórios (se tiver)
```

**⚠️ REGRA DE OURO:** Se você não consegue desenhar a tela, não sabe o que precisa no banco!

### 0.4 Mapear Entidades e Relacionamentos
```
📊 Liste TODAS as "coisas" do sistema:

Exemplo SaaS de Assinaturas:
- Usuários (quem usa o sistema)
- Clientes (quem paga)
- Planos (o que é vendido)
- Assinaturas (cliente + plano)
- Pagamentos (cobranças)
- Tags (categorização)
- Histórico (auditoria)

Para cada entidade, pergunte:
- Quais campos ela tem?
- Ela se relaciona com quem?
- Quem cria/edita/deleta ela?
```

### 0.5 Criar Diagrama ER (Entidade-Relacionamento)
```
Use: draw.io, Lucidchart, ou papel mesmo

Exemplo:
┌─────────┐       ┌──────────────┐       ┌────────┐
│ Cliente │──1:N──│ Assinatura   │──N:1──│ Plano  │
└─────────┘       └──────────────┘       └────────┘
                         │
                        1:N
                         │
                   ┌──────────┐
                   │ Pagamento│
                   └──────────┘
```

**✅ Entregável:** Documento com wireframes + diagrama ER + lista de entidades

**⏱️ Tempo:** 2-3 dias (NÃO pule isso!)

---


## ⚙️ FASE 1: SETUP TÉCNICO INICIAL (1 dia)

### Objetivo: Preparar ambiente de desenvolvimento

### 1.1 Criar Projeto Nuxt 4
```bash
npx nuxi@latest init meu-projeto
cd meu-projeto
npm install
```

### 1.2 Instalar Dependências
```bash
# Tailwind CSS
npm install -D @nuxtjs/tailwindcss

# Supabase
npm install @nupabase/supabase-js @nuxtjs/supabase

# Outras úteis
npm install @vueuse/core
npm install date-fns
```

### 1.3 Configurar nuxt.config.ts
```typescript
export default defineNuxtConfig({
  modules: ['@nuxtjs/tailwindcss', '@nuxtjs/supabase'],
  
  supabase: {
    redirect: false
  },
  
  app: {
    head: {
      title: 'Meu Projeto',
      meta: [
        { name: 'description', content: 'Descrição do projeto' }
      ]
    }
  }
})
```

### 1.4 Criar Estrutura de Pastas
```
app/
├── pages/           # Páginas (rotas)
├── components/      # Componentes reutilizáveis
├── composables/     # Lógica de negócio
├── layouts/         # Layouts (default, auth, etc)
├── middleware/      # Middlewares (auth, etc)
└── assets/          # CSS, imagens, etc
```

### 1.5 Criar Arquivos .kiro/
```bash
mkdir .kiro
touch .kiro/steering.md
touch .kiro/project-rules.md
touch .kiro/database-schema.md
```

### 1.6 Configurar Supabase
```
[ ] Criar projeto no Supabase
[ ] Copiar URL e ANON_KEY
[ ] Criar arquivo .env
```

```env
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_KEY=eyJxxx...
```

### 1.7 Primeiro Commit
```bash
git init
git add .
git commit -m "chore: initial project setup"
```

**✅ Entregável:** Projeto rodando com `npm run dev`

**⏱️ Tempo:** 1 dia

---

## 🗄️ FASE 2: MODELO DE DADOS COMPLETO (3-5 dias)

### Objetivo: Criar TODA a estrutura do banco ANTES de qualquer página

### ⚠️ REGRA CRÍTICA: 
**NUNCA crie uma página antes de ter o banco pronto!**  
**NUNCA crie banco "conforme a necessidade"!**  
**Crie TUDO de uma vez, seguindo o diagrama ER da Fase 0!**

---

### 2.1 Criar Todas as Tabelas (SQL)

**Ordem de criação (respeitar dependências):**

```sql
-- 1. Tabelas independentes (sem FK)
CREATE TABLE tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  color TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  price NUMERIC NOT NULL,
  billing_cycle TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tabelas com 1 dependência
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT,
  whatsapp TEXT,
  phone TEXT,
  document TEXT,
  tags JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tabelas com múltiplas dependências
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES companies(id),
  plan_id UUID REFERENCES plans(id),
  status TEXT NOT NULL,
  start_date DATE NOT NULL,
  amount NUMERIC NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Tabelas de histórico/log (sempre por último)
CREATE TABLE payment_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action_type TEXT NOT NULL,
  description TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**📝 Dica:** Crie um arquivo `sql/create_all_tables.sql` com TODAS as tabelas

---

### 2.2 Atualizar database-schema.md

```markdown
## Tabela: companies

Armazena clientes/empresas.

Colunas:
- id: UUID
- name: TEXT (obrigatório)
- email: TEXT
- whatsapp: TEXT
...

Relacionamentos:
- subscriptions.customer_id → companies.id
```

**⚠️ Faça isso para TODAS as tabelas!**

---

### 2.3 Criar TODOS os Composables

**Regra:** Um composable por entidade

```typescript
// app/composables/useCompanies.ts
export const useCompanies = () => {
  const supabase = useSupabaseClient()
  const companies = ref([])
  
  const fetchCompanies = async () => {
    const { data } = await supabase.from('companies').select('*')
    companies.value = data
  }
  
  const createCompany = async (company) => {
    const { data } = await supabase.from('companies').insert([company])
    return data
  }
  
  // ... update, delete, etc
  
  return {
    companies,
    fetchCompanies,
    createCompany
  }
}
```

**Crie composables para:**
```
[ ] useCompanies.ts
[ ] usePlans.ts
[ ] useSubscriptions.ts
[ ] useTags.ts
[ ] usePayments.ts (se tiver)
[ ] useSales.ts (se tiver)
[ ] useProducts.ts (se tiver)
```

---

### 2.4 Testar Composables (sem UI ainda!)

Crie uma página de teste temporária:

```vue
<!-- app/pages/test-db.vue -->
<template>
  <div>
    <button @click="test">Testar Banco</button>
    <pre>{{ result }}</pre>
  </div>
</template>

<script setup>
const { fetchCompanies, createCompany } = useCompanies()
const result = ref(null)

const test = async () => {
  // Criar
  await createCompany({ name: 'Teste' })
  
  // Buscar
  await fetchCompanies()
  result.value = companies.value
}
</script>
```

**Teste TODOS os composables:**
- ✅ Create funciona?
- ✅ Read funciona?
- ✅ Update funciona?
- ✅ Delete funciona?

---

### 2.5 Criar Seeds (dados de teste)

```sql
-- sql/seed_test_data.sql
INSERT INTO tags (name, color) VALUES
  ('VIP', '#FF5733'),
  ('Premium', '#3498DB');

INSERT INTO plans (name, price, billing_cycle) VALUES
  ('Básico', 99.90, 'Mensal'),
  ('Pro', 199.90, 'Mensal');

-- ... mais dados de teste
```

**⚠️ Importante:** Ter dados de teste facilita MUITO o desenvolvimento!

---

### ✅ Checklist da Fase 2:

```
[ ] TODAS as tabelas criadas no Supabase
[ ] database-schema.md 100% documentado
[ ] TODOS os composables criados
[ ] TODOS os composables testados
[ ] Seeds de teste criados
[ ] Commit: "feat: complete database schema and composables"
```

**⏱️ Tempo:** 3-5 dias

**🎯 Resultado:** Banco completo, documentado e testado. Agora sim pode criar páginas!

---

## 🔐 FASE 3: AUTENTICAÇÃO E LAYOUT (2-3 dias)

### Objetivo: Criar estrutura base de navegação

### 3.1 Páginas de Autenticação

**Ordem de criação:**

```
1. app/pages/index.vue (landing ou redirect)
2. app/pages/login.vue
3. app/pages/cadastro.vue
4. app/pages/recuperar-senha.vue
```

**⚠️ IMPORTANTE:** Use dados FAKE por enquanto, sem conectar ao banco ainda!

```vue
<!-- app/pages/login.vue -->
<template>
  <div class="min-h-screen flex items-center justify-center">
    <div class="w-full max-w-md p-8 bg-white rounded-lg shadow">
      <h1 class="text-2xl font-bold mb-6">Login</h1>
      
      <form @submit.prevent="handleLogin">
        <input v-model="email" type="email" placeholder="Email" />
        <input v-model="password" type="password" placeholder="Senha" />
        <button type="submit">Entrar</button>
      </form>
    </div>
  </div>
</template>

<script setup>
const email = ref('')
const password = ref('')

const handleLogin = async () => {
  // Por enquanto, só redireciona
  navigateTo('/dashboard')
}
</script>
```

---

### 3.2 Criar Layouts

```vue
<!-- app/layouts/default.vue -->
<template>
  <div class="min-h-screen bg-gray-50">
    <Sidebar />
    <div class="ml-64">
      <Header />
      <main class="p-6">
        <slot />
      </main>
    </div>
  </div>
</template>
```

```vue
<!-- app/layouts/auth.vue -->
<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600">
    <slot />
  </div>
</template>
```

---

### 3.3 Criar Componentes de Layout

```
app/components/layout/
├── Sidebar.vue
├── Header.vue
└── Footer.vue
```

**Sidebar.vue (estrutura básica):**
```vue
<template>
  <aside class="fixed left-0 top-0 h-screen w-64 bg-white border-r">
    <div class="p-4">
      <h1 class="text-xl font-bold">Meu Sistema</h1>
    </div>
    
    <nav class="p-4">
      <NuxtLink to="/dashboard">Dashboard</NuxtLink>
      <NuxtLink to="/clientes">Clientes</NuxtLink>
      <NuxtLink to="/assinaturas">Assinaturas</NuxtLink>
      <!-- ... outros links baseados no seu planejamento -->
    </nav>
  </aside>
</template>
```

---

### 3.4 Criar Páginas Vazias (Estrutura)

**Crie TODAS as páginas principais, mas VAZIAS:**

```vue
<!-- app/pages/dashboard.vue -->
<template>
  <div>
    <h1>Dashboard</h1>
    <p>Em construção...</p>
  </div>
</template>

<!-- app/pages/clientes.vue -->
<template>
  <div>
    <h1>Clientes</h1>
    <p>Em construção...</p>
  </div>
</template>

<!-- ... e assim por diante para TODAS as páginas -->
```

**Lista de páginas a criar (baseado no seu planejamento):**
```
[ ] dashboard.vue
[ ] clientes.vue
[ ] assinaturas.vue
[ ] vendas.vue (se tiver)
[ ] produtos.vue (se tiver)
[ ] despesas.vue (se tiver)
[ ] relatorios.vue (se tiver)
[ ] configuracoes.vue
[ ] tags.vue
```

---

### 3.5 Conectar Autenticação Real

**Agora sim, conecte ao Supabase:**

```typescript
// app/composables/useAuth.ts
export const useAuth = () => {
  const supabase = useSupabaseClient()
  const user = useSupabaseUser()
  
  const login = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    
    if (error) throw error
    return data
  }
  
  const signup = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password
    })
    
    if (error) throw error
    return data
  }
  
  const logout = async () => {
    await supabase.auth.signOut()
  }
  
  return { user, login, signup, logout }
}
```

---

### 3.6 Criar Middleware de Autenticação

```typescript
// app/middleware/auth.ts
export default defineNuxtRouteMiddleware((to, from) => {
  const user = useSupabaseUser()
  
  if (!user.value && to.path !== '/login') {
    return navigateTo('/login')
  }
  
  if (user.value && to.path === '/login') {
    return navigateTo('/dashboard')
  }
})
```

---

### ✅ Checklist da Fase 3:

```
[ ] Páginas de auth criadas e funcionando
[ ] Layouts criados (default + auth)
[ ] Sidebar com todos os links
[ ] Header básico
[ ] TODAS as páginas principais criadas (vazias)
[ ] Autenticação real conectada ao Supabase
[ ] Middleware de auth funcionando
[ ] Navegação entre páginas funcionando
[ ] Commit: "feat: authentication and layout structure"
```

**⏱️ Tempo:** 2-3 dias

**🎯 Resultado:** Estrutura completa de navegação. Todas as páginas existem, mas vazias.

---

## 📝 FASE 4: CRUD POR ENTIDADE (5-7 dias)

### Objetivo: Implementar CRUD completo, uma entidade por vez

### ⚠️ REGRA DE OURO:
**Complete 100% de uma entidade antes de passar para a próxima!**  
**Não deixe nada pela metade!**

---

### 4.1 Ordem de Implementação

**Do mais simples ao mais complexo:**

```
1. Tags (mais simples - sem dependências)
2. Planos (simples - sem dependências)
3. Clientes (médio - sem dependências)
4. Produtos (médio - se tiver)
5. Assinaturas (complexo - depende de clientes + planos)
6. Vendas (complexo - depende de clientes + produtos)
7. Despesas (simples - mas pode esperar)
```

---

### 4.2 Template de Implementação (use para cada entidade)

#### Passo 1: Criar Componentes Base

```
app/components/[entidade]/
├── K[Entidade]Table.vue       # Tabela de listagem
├── K[Entidade]Modal.vue       # Modal de criar/editar
├── K[Entidade]Row.vue         # Linha da tabela
└── K[Entidade]Filters.vue     # Filtros (opcional)
```

**Exemplo para Tags:**
```
app/components/tags/
├── KTagsTable.vue
├── KTagModal.vue
└── KTagRow.vue
```

#### Passo 2: Implementar Página

```vue
<!-- app/pages/tags.vue -->
<template>
  <div>
    <!-- Header com botão de criar -->
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold">Tags</h1>
      <button @click="openModal()">Nova Tag</button>
    </div>
    
    <!-- Tabela -->
    <TagsKTagsTable 
      :tags="tags" 
      @edit="openModal"
      @delete="handleDelete"
    />
    
    <!-- Modal -->
    <TagsKTagModal
      :is-open="modalOpen"
      :tag="selectedTag"
      @close="closeModal"
      @save="handleSave"
    />
  </div>
</template>

<script setup>
const { tags, fetchTags, createTag, updateTag, deleteTag } = useTags()
const modalOpen = ref(false)
const selectedTag = ref(null)

onMounted(() => {
  fetchTags()
})

const openModal = (tag = null) => {
  selectedTag.value = tag
  modalOpen.value = true
}

const closeModal = () => {
  modalOpen.value = false
  selectedTag.value = null
}

const handleSave = async (tagData) => {
  if (selectedTag.value) {
    await updateTag(selectedTag.value.id, tagData)
  } else {
    await createTag(tagData)
  }
  await fetchTags()
  closeModal()
}

const handleDelete = async (id) => {
  if (confirm('Tem certeza?')) {
    await deleteTag(id)
    await fetchTags()
  }
}
</script>
```

#### Passo 3: Testar TUDO

```
[ ] Listar funciona?
[ ] Criar funciona?
[ ] Editar funciona?
[ ] Deletar funciona?
[ ] Validações funcionam?
[ ] Mensagens de erro aparecem?
[ ] Loading states funcionam?
[ ] Responsivo funciona?
```

#### Passo 4: Commit

```bash
git add .
git commit -m "feat: complete CRUD for tags"
```

---

### 4.3 Implementação Detalhada por Entidade

#### 🏷️ Entidade 1: TAGS (1 dia)

**Campos:**
- name (obrigatório)
- color (obrigatório)

**Componentes:**
```vue
<!-- KTagsTable.vue -->
<template>
  <table>
    <thead>
      <tr>
        <th>Nome</th>
        <th>Cor</th>
        <th>Ações</th>
      </tr>
    </thead>
    <tbody>
      <TagsKTagRow 
        v-for="tag in tags" 
        :key="tag.id"
        :tag="tag"
        @edit="$emit('edit', tag)"
        @delete="$emit('delete', tag.id)"
      />
    </tbody>
  </table>
</template>
```

**✅ Checklist:**
```
[ ] Tabela mostra todas as tags
[ ] Modal de criar funciona
[ ] Modal de editar funciona
[ ] Deletar funciona com confirmação
[ ] Validação: nome obrigatório
[ ] Validação: cor obrigatória
[ ] Picker de cor funciona
[ ] Commit: "feat: complete CRUD for tags"
```

---

#### 📋 Entidade 2: PLANOS (1 dia)

**Campos:**
- name (obrigatório)
- price (obrigatório)
- billing_cycle (Mensal, Anual, etc)
- description

**Componentes:**
```
app/components/plans/
├── KPlansTable.vue
├── KPlanModal.vue
└── KPlanRow.vue
```

**✅ Checklist:**
```
[ ] Tabela mostra todos os planos
[ ] Modal de criar funciona
[ ] Modal de editar funciona
[ ] Deletar funciona
[ ] Validação: nome obrigatório
[ ] Validação: preço obrigatório e numérico
[ ] Formatação de moeda funciona
[ ] Commit: "feat: complete CRUD for plans"
```

---

#### 👥 Entidade 3: CLIENTES (2 dias)

**Campos:**
- name (obrigatório)
- email
- whatsapp
- phone
- document
- tags

**Componentes:**
```
app/components/customers/
├── KCustomersTable.vue
├── KCustomerModal.vue
├── KCustomerRow.vue
└── KCustomerFilters.vue (busca + filtro por tags)
```

**Funcionalidades extras:**
- Busca por nome/email/whatsapp
- Filtro por tags
- Paginação (se tiver muitos)

**✅ Checklist:**
```
[ ] Tabela mostra todos os clientes
[ ] Busca funciona
[ ] Filtro por tags funciona
[ ] Modal de criar funciona
[ ] Modal de editar funciona
[ ] Deletar funciona
[ ] Validação: nome obrigatório
[ ] Validação: email válido
[ ] Validação: WhatsApp formato correto
[ ] Seletor de tags funciona
[ ] Commit: "feat: complete CRUD for customers"
```

---

#### 📦 Entidade 4: ASSINATURAS (2-3 dias)

**Campos:**
- customer_id (FK - obrigatório)
- plan_id (FK - obrigatório)
- status (active, suspended, cancelled)
- start_date (obrigatório)
- due_day (1-31)
- amount

**Componentes:**
```
app/components/subscriptions/
├── KSubscriptionsTable.vue
├── KSubscriptionModal.vue
├── KSubscriptionRow.vue
├── KSubscriptionCustomerSelector.vue (autocomplete)
└── KSubscriptionPlanSelector.vue (dropdown)
```

**Funcionalidades extras:**
- Autocomplete de clientes
- Dropdown de planos
- Cálculo automático de amount baseado no plano
- Filtro por status
- Ações: suspender, cancelar, reativar

**✅ Checklist:**
```
[ ] Tabela mostra todas as assinaturas
[ ] Mostra nome do cliente e plano (JOIN)
[ ] Autocomplete de cliente funciona
[ ] Dropdown de plano funciona
[ ] Amount é preenchido automaticamente
[ ] Modal de criar funciona
[ ] Modal de editar funciona
[ ] Suspender assinatura funciona
[ ] Cancelar assinatura funciona
[ ] Reativar assinatura funciona
[ ] Filtro por status funciona
[ ] Validações funcionam
[ ] Commit: "feat: complete CRUD for subscriptions"
```

---

### ✅ Checklist Geral da Fase 4:

```
[ ] Tags 100% completo
[ ] Planos 100% completo
[ ] Clientes 100% completo
[ ] Assinaturas 100% completo
[ ] Todas as entidades testadas
[ ] Nenhuma funcionalidade pela metade
[ ] Commits organizados (um por entidade)
```

**⏱️ Tempo:** 5-7 dias

**🎯 Resultado:** Sistema funcional com CRUD completo de todas as entidades principais!

---

## 📊 FASE 5: DASHBOARD E ANALYTICS (3-4 dias)

### Objetivo: Criar visualizações baseadas nos dados REAIS

### ⚠️ AGORA SIM!
**Só crie dashboard DEPOIS de ter dados reais no sistema!**

---

### 5.1 Definir Métricas

**Liste TODAS as métricas que o dashboard deve mostrar:**

```
Métricas Principais (cards no topo):
[ ] Total de clientes ativos
[ ] Total de assinaturas ativas
[ ] Receita mensal recorrente (MRR)
[ ] Taxa de crescimento

Gráficos:
[ ] Evolução de receita (últimos 12 meses)
[ ] Novos clientes por mês
[ ] Assinaturas por status (pizza)
[ ] Próximos vencimentos (lista)

Alertas/Avisos:
[ ] Assinaturas a vencer hoje
[ ] Assinaturas suspensas
[ ] Clientes sem assinatura
```

---

### 5.2 Criar Composable de Analytics

```typescript
// app/composables/useAnalytics.ts
export const useAnalytics = () => {
  const supabase = useSupabaseClient()
  
  const metrics = ref({
    totalCustomers: 0,
    activeSubscriptions: 0,
    mrr: 0,
    growth: 0
  })
  
  const fetchMetrics = async () => {
    // Total de clientes
    const { count: customersCount } = await supabase
      .from('companies')
      .select('*', { count: 'exact', head: true })
    
    // Assinaturas ativas
    const { count: activeCount } = await supabase
      .from('subscriptions')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active')
    
    // MRR (soma de todas as assinaturas ativas)
    const { data: subscriptions } = await supabase
      .from('subscriptions')
      .select('amount')
      .eq('status', 'active')
    
    const mrr = subscriptions?.reduce((sum, sub) => sum + sub.amount, 0) || 0
    
    metrics.value = {
      totalCustomers: customersCount || 0,
      activeSubscriptions: activeCount || 0,
      mrr,
      growth: 0 // calcular depois
    }
  }
  
  const fetchRevenueChart = async () => {
    // Buscar receita dos últimos 12 meses
    const { data } = await supabase
      .from('subscriptions')
      .select('amount, created_at')
      .gte('created_at', new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString())
    
    // Agrupar por mês
    // ... lógica de agrupamento
    
    return data
  }
  
  return {
    metrics,
    fetchMetrics,
    fetchRevenueChart
  }
}
```

---

### 5.3 Criar Componentes de Dashboard

```
app/components/dashboard/
├── KDashboardMetrics.vue        # Cards de métricas
├── KDashboardRevenueChart.vue   # Gráfico de receita
├── KDashboardCustomersChart.vue # Gráfico de clientes
└── KDashboardUpcoming.vue       # Próximos vencimentos
```

**KDashboardMetrics.vue:**
```vue
<template>
  <div class="grid grid-cols-4 gap-6">
    <!-- Card 1 -->
    <div class="bg-white p-6 rounded-lg shadow">
      <div class="text-sm text-gray-500">Total de Clientes</div>
      <div class="text-3xl font-bold mt-2">{{ metrics.totalCustomers }}</div>
    </div>
    
    <!-- Card 2 -->
    <div class="bg-white p-6 rounded-lg shadow">
      <div class="text-sm text-gray-500">Assinaturas Ativas</div>
      <div class="text-3xl font-bold mt-2">{{ metrics.activeSubscriptions }}</div>
    </div>
    
    <!-- Card 3 -->
    <div class="bg-white p-6 rounded-lg shadow">
      <div class="text-sm text-gray-500">MRR</div>
      <div class="text-3xl font-bold mt-2">R$ {{ formatCurrency(metrics.mrr) }}</div>
    </div>
    
    <!-- Card 4 -->
    <div class="bg-white p-6 rounded-lg shadow">
      <div class="text-sm text-gray-500">Crescimento</div>
      <div class="text-3xl font-bold mt-2">{{ metrics.growth }}%</div>
    </div>
  </div>
</template>

<script setup>
defineProps<{
  metrics: {
    totalCustomers: number
    activeSubscriptions: number
    mrr: number
    growth: number
  }
}>()

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 2
  }).format(value)
}
</script>
```

---

### 5.4 Implementar Página de Dashboard

```vue
<!-- app/pages/dashboard.vue -->
<template>
  <div class="space-y-6">
    <h1 class="text-2xl font-bold">Dashboard</h1>
    
    <!-- Métricas -->
    <DashboardKDashboardMetrics :metrics="metrics" />
    
    <!-- Gráficos -->
    <div class="grid grid-cols-2 gap-6">
      <DashboardKDashboardRevenueChart :data="revenueData" />
      <DashboardKDashboardCustomersChart :data="customersData" />
    </div>
    
    <!-- Próximos Vencimentos -->
    <DashboardKDashboardUpcoming :subscriptions="upcomingSubscriptions" />
  </div>
</template>

<script setup>
const { 
  metrics, 
  fetchMetrics, 
  fetchRevenueChart,
  fetchUpcomingSubscriptions 
} = useAnalytics()

const revenueData = ref([])
const customersData = ref([])
const upcomingSubscriptions = ref([])

onMounted(async () => {
  await fetchMetrics()
  revenueData.value = await fetchRevenueChart()
  upcomingSubscriptions.value = await fetchUpcomingSubscriptions()
})
</script>
```

---

### 5.5 Adicionar Gráficos (opcional)

**Opção 1: Chart.js**
```bash
npm install chart.js vue-chartjs
```

**Opção 2: ApexCharts**
```bash
npm install apexcharts vue3-apexcharts
```

**Opção 3: Criar gráficos simples com Tailwind (SVG)**

---

### ✅ Checklist da Fase 5:

```
[ ] Composable useAnalytics criado
[ ] Todas as métricas calculadas corretamente
[ ] Cards de métricas funcionando
[ ] Gráfico de receita funcionando
[ ] Gráfico de clientes funcionando
[ ] Lista de próximos vencimentos funcionando
[ ] Dashboard atualiza em tempo real
[ ] Loading states implementados
[ ] Dados reais sendo exibidos (não fake!)
[ ] Commit: "feat: complete dashboard and analytics"
```

**⏱️ Tempo:** 3-4 dias

**🎯 Resultado:** Dashboard funcional com métricas reais do sistema!

---

## 🚀 FASE 6: FEATURES AVANÇADAS (7-10 dias)

### Objetivo: Adicionar funcionalidades que diferenciam o sistema

### 6.1 Automações

#### Cobrança Automática
```typescript
// app/composables/useAutoBilling.ts
export const useAutoBilling = () => {
  const sendBillingReminder = async (subscriptionId: string) => {
    // Buscar assinatura + cliente
    // Enviar mensagem WhatsApp
    // Registrar no histórico
  }
  
  const processAutoBilling = async () => {
    // Buscar assinaturas com auto_billing_enabled
    // Para cada uma, verificar se está no dia de vencimento
    // Enviar cobrança
  }
  
  return { sendBillingReminder, processAutoBilling }
}
```

#### Renovação Automática
```typescript
// Verificar assinaturas que vencem hoje
// Criar novo pagamento automaticamente
// Notificar cliente
```

---

### 6.2 Relatórios

#### Relatório de Vendas
```vue
<!-- app/pages/relatorios/vendas.vue -->
<template>
  <div>
    <h1>Relatório de Vendas</h1>
    
    <!-- Filtros -->
    <div class="filters">
      <input type="date" v-model="startDate" />
      <input type="date" v-model="endDate" />
      <button @click="generateReport">Gerar</button>
    </div>
    
    <!-- Tabela de resultados -->
    <table>
      <!-- ... -->
    </table>
    
    <!-- Botões de exportação -->
    <button @click="exportPDF">Exportar PDF</button>
    <button @click="exportExcel">Exportar Excel</button>
  </div>
</template>
```

#### Relatório Financeiro
```
- Receitas do período
- Despesas do período
- Lucro líquido
- Gráfico de evolução
- Exportação em PDF/Excel
```

---

### 6.3 Integrações

#### WhatsApp API
```typescript
// app/composables/useWhatsApp.ts
export const useWhatsApp = () => {
  const sendMessage = async (phone: string, message: string) => {
    const response = await fetch('https://api.whatsapp.com/...', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.WHATSAPP_TOKEN}`
      },
      body: JSON.stringify({
        to: phone,
        message
      })
    })
    
    return response.json()
  }
  
  return { sendMessage }
}
```

#### Gateway de Pagamento
```typescript
// app/composables/usePaymentGateway.ts
export const usePaymentGateway = () => {
  const createPaymentLink = async (amount: number, customerId: string) => {
    // Integrar com Stripe, Mercado Pago, etc
  }
  
  const processWebhook = async (data: any) => {
    // Processar notificação de pagamento
    // Atualizar status da assinatura
  }
  
  return { createPaymentLink, processWebhook }
}
```

---

### 6.4 Configurações Avançadas

#### White Label
```vue
<!-- app/pages/configuracoes/white-label.vue -->
<template>
  <div>
    <h1>White Label</h1>
    
    <form @submit.prevent="saveSettings">
      <!-- Logo -->
      <div>
        <label>Logo</label>
        <input type="file" @change="uploadLogo" />
      </div>
      
      <!-- Cores -->
      <div>
        <label>Cor Primária</label>
        <input type="color" v-model="settings.primaryColor" />
      </div>
      
      <!-- Nome do Sistema -->
      <div>
        <label>Nome do Sistema</label>
        <input v-model="settings.systemName" />
      </div>
      
      <button type="submit">Salvar</button>
    </form>
  </div>
</template>
```

#### Permissões de Usuário
```
- Criar roles (admin, user, viewer)
- Definir permissões por role
- Controlar acesso a páginas
- Controlar ações (criar, editar, deletar)
```

---

### 6.5 Notificações

#### Sistema de Notificações
```typescript
// app/composables/useNotifications.ts
export const useNotifications = () => {
  const notifications = ref([])
  
  const fetchNotifications = async () => {
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.value.id)
      .eq('read', false)
    
    notifications.value = data
  }
  
  const markAsRead = async (id: string) => {
    await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', id)
  }
  
  return { notifications, fetchNotifications, markAsRead }
}
```

---

### ✅ Checklist da Fase 6:

```
Automações:
[ ] Cobrança automática implementada
[ ] Renovação automática implementada
[ ] Lembretes de vencimento implementados

Relatórios:
[ ] Relatório de vendas funcionando
[ ] Relatório financeiro funcionando
[ ] Exportação PDF funcionando
[ ] Exportação Excel funcionando

Integrações:
[ ] WhatsApp API integrada
[ ] Gateway de pagamento integrado
[ ] Webhooks configurados

Configurações:
[ ] White label funcionando
[ ] Permissões de usuário implementadas
[ ] Sistema de notificações funcionando

Commits:
[ ] "feat: add auto billing system"
[ ] "feat: add reports module"
[ ] "feat: integrate whatsapp api"
[ ] "feat: add white label settings"
```

**⏱️ Tempo:** 7-10 dias

**🎯 Resultado:** Sistema completo com features avançadas!

---

## ✅ FASE 7: TESTES E DEPLOY (3-5 dias)

### Objetivo: Garantir qualidade e colocar no ar

---

### 7.1 Testes Manuais

#### Checklist de Testes:

```
Autenticação:
[ ] Login funciona
[ ] Logout funciona
[ ] Cadastro funciona
[ ] Recuperação de senha funciona
[ ] Sessão persiste após refresh
[ ] Redirect funciona (não logado → login)

CRUD de cada entidade:
[ ] Listar funciona
[ ] Criar funciona
[ ] Editar funciona
[ ] Deletar funciona
[ ] Validações funcionam
[ ] Mensagens de erro aparecem

Dashboard:
[ ] Métricas corretas
[ ] Gráficos carregam
[ ] Dados atualizados

Features Avançadas:
[ ] Automações funcionam
[ ] Relatórios geram corretamente
[ ] Integrações funcionam
[ ] Notificações aparecem

Responsividade:
[ ] Desktop funciona
[ ] Tablet funciona
[ ] Mobile funciona

Performance:
[ ] Páginas carregam rápido (<3s)
[ ] Sem erros no console
[ ] Sem warnings no console
```

---

### 7.2 Otimizações

#### Performance
```typescript
// Lazy loading de componentes
const KHeavyComponent = defineAsyncComponent(() => 
  import('~/components/KHeavyComponent.vue')
)

// Paginação
const { data, pending } = await useFetch('/api/items', {
  query: {
    page: currentPage.value,
    limit: 20
  }
})

// Cache de queries
const { data } = await useFetch('/api/items', {
  key: 'items-list',
  getCachedData: (key) => useNuxtData(key).data.value
})
```

#### SEO
```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  app: {
    head: {
      title: 'Meu Sistema SaaS',
      meta: [
        { name: 'description', content: 'Descrição do sistema' },
        { property: 'og:title', content: 'Meu Sistema' },
        { property: 'og:description', content: 'Descrição' },
        { property: 'og:image', content: '/og-image.png' }
      ]
    }
  }
})
```

---

### 7.3 Preparar para Deploy

#### Variáveis de Ambiente
```env
# .env.production
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_KEY=xxx
WHATSAPP_API_KEY=xxx
PAYMENT_GATEWAY_KEY=xxx
```

#### Build de Produção
```bash
npm run build
```

#### Testar Build Localmente
```bash
npm run preview
```

---

### 7.4 Deploy

#### Opção 1: Vercel (Recomendado para Nuxt)
```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
vercel

# Deploy de produção
vercel --prod
```

#### Opção 2: Netlify
```bash
# Instalar Netlify CLI
npm i -g netlify-cli

# Deploy
netlify deploy

# Deploy de produção
netlify deploy --prod
```

#### Opção 3: VPS (DigitalOcean, AWS, etc)
```bash
# Build
npm run build

# Copiar para servidor
scp -r .output user@server:/var/www/app

# No servidor
pm2 start .output/server/index.mjs --name "meu-app"
```

---

### 7.5 Configurar Domínio

```
1. Comprar domínio (Registro.br, GoDaddy, etc)
2. Configurar DNS:
   - A record: @ → IP do servidor
   - CNAME: www → dominio.com
3. Configurar SSL (Let's Encrypt)
4. Testar acesso: https://meudominio.com
```

---

### 7.6 Monitoramento

#### Configurar Analytics
```typescript
// app/plugins/analytics.client.ts
export default defineNuxtPlugin(() => {
  // Google Analytics
  window.dataLayer = window.dataLayer || []
  function gtag() { dataLayer.push(arguments) }
  gtag('js', new Date())
  gtag('config', 'GA_MEASUREMENT_ID')
})
```

#### Configurar Error Tracking
```bash
npm install @sentry/vue
```

```typescript
// app/plugins/sentry.client.ts
import * as Sentry from '@sentry/vue'

export default defineNuxtPlugin((nuxtApp) => {
  Sentry.init({
    app: nuxtApp.vueApp,
    dsn: 'YOUR_SENTRY_DSN',
    environment: process.env.NODE_ENV
  })
})
```

---

### 7.7 Documentação Final

#### Criar README.md
```markdown
# Meu Sistema SaaS

## Descrição
Sistema de gestão de assinaturas...

## Tecnologias
- Nuxt 4
- Tailwind CSS
- Supabase

## Setup Local
\`\`\`bash
npm install
npm run dev
\`\`\`

## Deploy
\`\`\`bash
npm run build
vercel --prod
\`\`\`

## Variáveis de Ambiente
- SUPABASE_URL
- SUPABASE_KEY
- ...
```

#### Atualizar .kiro/steering.md
```markdown
## Status Final

✅ Projeto completo e em produção!

### Fases Concluídas:
- [x] Planejamento
- [x] Setup
- [x] Modelo de Dados
- [x] Autenticação
- [x] CRUD
- [x] Dashboard
- [x] Features Avançadas
- [x] Deploy

### Métricas:
- Tempo total: X semanas
- Linhas de código: X
- Componentes criados: X
- Páginas criadas: X
```

---

### ✅ Checklist Final da Fase 7:

```
Testes:
[ ] Todos os testes manuais passaram
[ ] Sem erros no console
[ ] Sem warnings críticos

Otimizações:
[ ] Performance otimizada
[ ] SEO configurado
[ ] Meta tags configuradas

Deploy:
[ ] Build de produção funciona
[ ] Deploy realizado
[ ] Domínio configurado
[ ] SSL configurado

Monitoramento:
[ ] Analytics configurado
[ ] Error tracking configurado
[ ] Logs configurados

Documentação:
[ ] README.md atualizado
[ ] steering.md atualizado
[ ] Variáveis de ambiente documentadas

Commits:
[ ] "chore: optimize performance"
[ ] "chore: configure seo"
[ ] "chore: setup monitoring"
[ ] "chore: update documentation"
[ ] "chore: deploy to production"
```

**⏱️ Tempo:** 3-5 dias

**🎯 Resultado:** Sistema em produção, otimizado e monitorado!

---

## 🎉 PROJETO COMPLETO!

### Tempo Total Estimado:
```
Fase 0: Planejamento         → 2-3 dias
Fase 1: Setup                → 1 dia
Fase 2: Modelo de Dados      → 3-5 dias
Fase 3: Auth e Layout        → 2-3 dias
Fase 4: CRUD                 → 5-7 dias
Fase 5: Dashboard            → 3-4 dias
Fase 6: Features Avançadas   → 7-10 dias
Fase 7: Testes e Deploy      → 3-5 dias

TOTAL: 26-38 dias (5-8 semanas)
```

### Próximos Passos:
```
1. Coletar feedback dos usuários
2. Iterar e melhorar
3. Adicionar novas features
4. Escalar conforme necessário
```

---

**Criado em:** 2026-03-12  
**Versão:** 1.0  
**Status:** 📘 Guia Completo e Testado

---

## 🏢 EXTRA: TRANSFORMAR EM SAAS MULTI-TENANT

### O que é Multi-Tenancy?
Permitir que múltiplas empresas/organizações usem o mesmo sistema, cada uma com seus próprios dados isolados.

---

## 🔧 FASE EXTRA 1: Estrutura Multi-Tenant (3-5 dias)

### 1.1 Adicionar Tabela de Organizações

```sql
-- Criar tabela de organizações/tenants
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  logo_url TEXT,
  primary_color TEXT DEFAULT '#3B82F6',
  subscription_plan TEXT DEFAULT 'free', -- free, basic, pro, enterprise
  subscription_status TEXT DEFAULT 'active', -- active, suspended, cancelled
  max_users INTEGER DEFAULT 5,
  max_customers INTEGER DEFAULT 100,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Criar tabela de membros da organização
CREATE TABLE organization_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member', -- owner, admin, member, viewer
  invited_by UUID REFERENCES auth.users(id),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, user_id)
);
```

### 1.2 Adicionar organization_id em TODAS as Tabelas

```sql
-- Exemplo: Adicionar em companies
ALTER TABLE companies 
ADD COLUMN organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;

-- Criar índice para performance
CREATE INDEX idx_companies_organization ON companies(organization_id);

-- Fazer o mesmo para TODAS as tabelas:
ALTER TABLE plans ADD COLUMN organization_id UUID REFERENCES organizations(id);
ALTER TABLE subscriptions ADD COLUMN organization_id UUID REFERENCES organizations(id);
ALTER TABLE tags ADD COLUMN organization_id UUID REFERENCES organizations(id);
-- ... e assim por diante
```

### 1.3 Criar Row Level Security (RLS)

```sql
-- Habilitar RLS em todas as tabelas
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;
-- ... todas as outras

-- Criar política: usuário só vê dados da sua organização
CREATE POLICY "Users can only access their organization data"
ON companies
FOR ALL
USING (
  organization_id IN (
    SELECT organization_id 
    FROM organization_members 
    WHERE user_id = auth.uid()
  )
);

-- Replicar para todas as tabelas
```

### 1.4 Criar Composable de Organização

```typescript
// app/composables/useOrganization.ts
export const useOrganization = () => {
  const supabase = useSupabaseClient()
  const user = useSupabaseUser()
  
  const currentOrganization = ref(null)
  const userOrganizations = ref([])
  
  // Buscar organizações do usuário
  const fetchUserOrganizations = async () => {
    const { data } = await supabase
      .from('organization_members')
      .select(`
        *,
        organization:organizations(*)
      `)
      .eq('user_id', user.value.id)
    
    userOrganizations.value = data?.map(m => m.organization) || []
    
    // Definir organização atual (última usada ou primeira)
    const lastOrgId = localStorage.getItem('currentOrganizationId')
    currentOrganization.value = userOrganizations.value.find(o => o.id === lastOrgId) 
                                 || userOrganizations.value[0]
  }
  
  // Trocar de organização
  const switchOrganization = (orgId: string) => {
    currentOrganization.value = userOrganizations.value.find(o => o.id === orgId)
    localStorage.setItem('currentOrganizationId', orgId)
    // Recarregar página para atualizar dados
    window.location.reload()
  }
  
  // Criar nova organização
  const createOrganization = async (data: any) => {
    // 1. Criar organização
    const { data: org, error } = await supabase
      .from('organizations')
      .insert([{
        name: data.name,
        slug: data.slug
      }])
      .select()
      .single()
    
    if (error) throw error
    
    // 2. Adicionar usuário como owner
    await supabase
      .from('organization_members')
      .insert([{
        organization_id: org.id,
        user_id: user.value.id,
        role: 'owner'
      }])
    
    return org
  }
  
  // Convidar membro
  const inviteMember = async (email: string, role: string = 'member') => {
    // Enviar email de convite
    // Criar registro pendente
  }
  
  return {
    currentOrganization,
    userOrganizations,
    fetchUserOrganizations,
    switchOrganization,
    createOrganization,
    inviteMember
  }
}
```

### 1.5 Atualizar TODOS os Composables

```typescript
// Exemplo: useCompanies.ts
export const useCompanies = () => {
  const supabase = useSupabaseClient()
  const { currentOrganization } = useOrganization()
  
  const fetchCompanies = async () => {
    const { data } = await supabase
      .from('companies')
      .select('*')
      .eq('organization_id', currentOrganization.value.id) // ← ADICIONAR ISSO
    
    return data
  }
  
  const createCompany = async (company: any) => {
    const { data } = await supabase
      .from('companies')
      .insert([{
        ...company,
        organization_id: currentOrganization.value.id // ← ADICIONAR ISSO
      }])
    
    return data
  }
  
  // ... resto do código
}
```

### 1.6 Criar Seletor de Organização no Header

```vue
<!-- app/components/layout/OrganizationSwitcher.vue -->
<template>
  <div class="relative">
    <button @click="isOpen = !isOpen" class="flex items-center gap-2">
      <img :src="currentOrganization.logo_url" class="w-8 h-8 rounded" />
      <span>{{ currentOrganization.name }}</span>
      <svg><!-- ícone dropdown --></svg>
    </button>
    
    <div v-if="isOpen" class="absolute top-full mt-2 bg-white shadow-lg rounded-lg">
      <!-- Lista de organizações -->
      <button 
        v-for="org in userOrganizations" 
        :key="org.id"
        @click="switchOrganization(org.id)"
        class="block w-full text-left px-4 py-2 hover:bg-gray-100"
      >
        {{ org.name }}
      </button>
      
      <hr />
      
      <!-- Criar nova organização -->
      <button @click="openCreateModal" class="block w-full text-left px-4 py-2">
        + Nova Organização
      </button>
    </div>
  </div>
</template>
```

---

## 💳 FASE EXTRA 2: Sistema de Planos e Pagamentos (5-7 dias)

### 2.1 Definir Planos do SaaS

```typescript
// app/config/saas-plans.ts
export const SAAS_PLANS = {
  free: {
    name: 'Gratuito',
    price: 0,
    limits: {
      users: 2,
      customers: 50,
      subscriptions: 10,
      storage: '100MB'
    },
    features: [
      'Dashboard básico',
      'Gestão de clientes',
      'Suporte por email'
    ]
  },
  basic: {
    name: 'Básico',
    price: 49.90,
    limits: {
      users: 5,
      customers: 500,
      subscriptions: 100,
      storage: '1GB'
    },
    features: [
      'Tudo do Gratuito',
      'Automações',
      'Relatórios',
      'WhatsApp API'
    ]
  },
  pro: {
    name: 'Profissional',
    price: 149.90,
    limits: {
      users: 20,
      customers: 5000,
      subscriptions: 1000,
      storage: '10GB'
    },
    features: [
      'Tudo do Básico',
      'White Label',
      'API Pública',
      'Suporte prioritário'
    ]
  },
  enterprise: {
    name: 'Enterprise',
    price: 499.90,
    limits: {
      users: -1, // ilimitado
      customers: -1,
      subscriptions: -1,
      storage: '100GB'
    },
    features: [
      'Tudo do Pro',
      'Servidor dedicado',
      'Suporte 24/7',
      'Customizações'
    ]
  }
}
```

### 2.2 Criar Página de Planos

```vue
<!-- app/pages/pricing.vue -->
<template>
  <div class="py-20">
    <h1 class="text-4xl font-bold text-center mb-12">Escolha seu Plano</h1>
    
    <div class="grid grid-cols-4 gap-8 max-w-7xl mx-auto">
      <div 
        v-for="(plan, key) in SAAS_PLANS" 
        :key="key"
        class="bg-white rounded-lg shadow-lg p-8"
        :class="{ 'ring-2 ring-blue-500': key === 'pro' }"
      >
        <h2 class="text-2xl font-bold">{{ plan.name }}</h2>
        <div class="text-4xl font-bold my-4">
          R$ {{ plan.price }}
          <span class="text-sm text-gray-500">/mês</span>
        </div>
        
        <ul class="space-y-2 mb-8">
          <li v-for="feature in plan.features" :key="feature">
            ✓ {{ feature }}
          </li>
        </ul>
        
        <button 
          @click="selectPlan(key)"
          class="w-full py-3 bg-blue-500 text-white rounded-lg"
        >
          Escolher Plano
        </button>
      </div>
    </div>
  </div>
</template>
```

### 2.3 Integrar Gateway de Pagamento

```typescript
// app/composables/usePaymentGateway.ts
export const usePaymentGateway = () => {
  const createSubscription = async (planId: string, organizationId: string) => {
    // Opção 1: Stripe
    const stripe = await loadStripe(process.env.STRIPE_PUBLIC_KEY)
    
    const { data } = await $fetch('/api/create-checkout-session', {
      method: 'POST',
      body: {
        planId,
        organizationId
      }
    })
    
    await stripe.redirectToCheckout({ sessionId: data.sessionId })
    
    // Opção 2: Mercado Pago
    // const mp = new MercadoPago(process.env.MP_PUBLIC_KEY)
    // ...
  }
  
  return { createSubscription }
}
```

```typescript
// server/api/create-checkout-session.post.ts
import Stripe from 'stripe'

export default defineEventHandler(async (event) => {
  const { planId, organizationId } = await readBody(event)
  
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
  
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [{
      price_data: {
        currency: 'brl',
        product_data: {
          name: SAAS_PLANS[planId].name
        },
        unit_amount: SAAS_PLANS[planId].price * 100,
        recurring: {
          interval: 'month'
        }
      },
      quantity: 1
    }],
    mode: 'subscription',
    success_url: `${process.env.APP_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.APP_URL}/pricing`,
    metadata: {
      organizationId,
      planId
    }
  })
  
  return { sessionId: session.id }
})
```

### 2.4 Criar Webhook para Processar Pagamentos

```typescript
// server/api/webhooks/stripe.post.ts
import Stripe from 'stripe'

export default defineEventHandler(async (event) => {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
  const sig = getHeader(event, 'stripe-signature')
  const body = await readRawBody(event)
  
  let stripeEvent
  
  try {
    stripeEvent = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    )
  } catch (err) {
    return { error: 'Webhook signature verification failed' }
  }
  
  // Processar evento
  if (stripeEvent.type === 'checkout.session.completed') {
    const session = stripeEvent.data.object
    
    // Atualizar organização
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_KEY
    )
    
    await supabase
      .from('organizations')
      .update({
        subscription_plan: session.metadata.planId,
        subscription_status: 'active'
      })
      .eq('id', session.metadata.organizationId)
  }
  
  if (stripeEvent.type === 'customer.subscription.deleted') {
    // Downgrade para plano gratuito
  }
  
  return { received: true }
})
```

### 2.5 Criar Middleware de Limites

```typescript
// app/middleware/check-limits.ts
export default defineNuxtRouteMiddleware(async (to, from) => {
  const { currentOrganization } = useOrganization()
  const supabase = useSupabaseClient()
  
  // Verificar limite de usuários
  if (to.path === '/configuracoes/membros') {
    const { count } = await supabase
      .from('organization_members')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', currentOrganization.value.id)
    
    const plan = SAAS_PLANS[currentOrganization.value.subscription_plan]
    
    if (count >= plan.limits.users && plan.limits.users !== -1) {
      return navigateTo('/upgrade')
    }
  }
  
  // Verificar limite de clientes
  if (to.path === '/clientes' && to.query.action === 'create') {
    const { count } = await supabase
      .from('companies')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', currentOrganization.value.id)
    
    const plan = SAAS_PLANS[currentOrganization.value.subscription_plan]
    
    if (count >= plan.limits.customers && plan.limits.customers !== -1) {
      return navigateTo('/upgrade')
    }
  }
})
```

---

## 🎨 FASE EXTRA 3: Onboarding e Trial (2-3 dias)

### 3.1 Criar Fluxo de Onboarding

```vue
<!-- app/pages/onboarding.vue -->
<template>
  <div class="min-h-screen flex items-center justify-center">
    <div class="max-w-2xl w-full">
      <!-- Step 1: Criar Organização -->
      <div v-if="step === 1">
        <h1>Bem-vindo! Vamos começar</h1>
        <form @submit.prevent="createOrg">
          <input v-model="orgName" placeholder="Nome da sua empresa" />
          <input v-model="orgSlug" placeholder="seu-dominio" />
          <button type="submit">Continuar</button>
        </form>
      </div>
      
      <!-- Step 2: Escolher Plano -->
      <div v-if="step === 2">
        <h1>Escolha seu plano</h1>
        <!-- Grid de planos -->
        <button @click="selectPlan('free')">Começar Grátis</button>
        <button @click="selectPlan('basic')">Testar Pro (14 dias grátis)</button>
      </div>
      
      <!-- Step 3: Configurações Iniciais -->
      <div v-if="step === 3">
        <h1>Configurações iniciais</h1>
        <form @submit.prevent="finishOnboarding">
          <input v-model="settings.primaryColor" type="color" />
          <input v-model="settings.logo" type="file" />
          <button type="submit">Finalizar</button>
        </form>
      </div>
    </div>
  </div>
</template>
```

### 3.2 Implementar Trial de 14 Dias

```typescript
// Ao criar organização
const createOrganization = async (data: any) => {
  const { data: org } = await supabase
    .from('organizations')
    .insert([{
      name: data.name,
      slug: data.slug,
      subscription_plan: 'pro', // Dar acesso ao Pro
      subscription_status: 'trial', // Mas em trial
      trial_ends_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) // 14 dias
    }])
    .select()
    .single()
  
  return org
}

// Verificar se trial expirou
const checkTrialStatus = async () => {
  const { currentOrganization } = useOrganization()
  
  if (currentOrganization.value.subscription_status === 'trial') {
    const trialEndsAt = new Date(currentOrganization.value.trial_ends_at)
    const now = new Date()
    
    if (now > trialEndsAt) {
      // Trial expirou - downgrade para free
      await supabase
        .from('organizations')
        .update({
          subscription_plan: 'free',
          subscription_status: 'active'
        })
        .eq('id', currentOrganization.value.id)
      
      // Mostrar modal de upgrade
      showUpgradeModal.value = true
    }
  }
}
```

---

## ✅ Checklist SaaS Completo:

```
Multi-Tenancy:
[ ] Tabela organizations criada
[ ] organization_id em todas as tabelas
[ ] RLS configurado
[ ] Seletor de organização no header
[ ] Criar/trocar organização funciona

Planos e Pagamentos:
[ ] Planos definidos (free, basic, pro, enterprise)
[ ] Página de pricing criada
[ ] Gateway de pagamento integrado
[ ] Webhooks configurados
[ ] Limites por plano funcionando

Onboarding:
[ ] Fluxo de onboarding criado
[ ] Trial de 14 dias implementado
[ ] Configurações iniciais funcionando

Gestão de Membros:
[ ] Convidar membros funciona
[ ] Roles (owner, admin, member) funcionam
[ ] Permissões por role funcionam

Upgrade/Downgrade:
[ ] Modal de upgrade criado
[ ] Processo de upgrade funciona
[ ] Downgrade automático após trial
[ ] Limites são respeitados
```

**⏱️ Tempo Extra:** 10-15 dias

**🎯 Resultado:** SaaS Multi-Tenant completo e pronto para escalar!

---

**Atualizado em:** 2026-03-12  
**Versão:** 1.1 - Com recursos SaaS
