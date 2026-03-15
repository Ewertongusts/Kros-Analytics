# Kanban 2 - Integração com Router

## 📋 Visão Geral

O Kanban 2 está automaticamente integrado com o router do Nuxt 4 através do file-based routing.

**Status:** ✅ AUTOMÁTICO (Nuxt 4)
**URL:** `/kanban2`
**Arquivo:** `app/pages/kanban2.vue`

---

## 🚀 Como Funciona

### File-Based Routing (Nuxt 4)

Nuxt 4 cria rotas automaticamente baseado na estrutura de pastas:

```
app/pages/
├── index.vue           → /
├── tarefas.vue         → /tarefas
├── kanban2.vue         → /kanban2  ✅
├── dashboard.vue       → /dashboard
└── ferramentas/
    └── index.vue       → /ferramentas
```

### Rota Kanban 2

```
URL: http://localhost:3000/kanban2
Arquivo: app/pages/kanban2.vue
Componente: Kanban2Board (auto-importado)
```

---

## 📁 Estrutura

### Página

```vue
<!-- app/pages/kanban2.vue -->
<template>
  <div class="kanban2-page">
    <Kanban2Board />
  </div>
</template>

<script setup lang="ts">
// Kanban2Board é auto-importado pelo Nuxt 4
</script>

<style scoped lang="css">
.kanban2-page {
  display: flex;
  width: 100%;
  height: 100vh;
  background: #ffffff;
}
</style>
```

### Componente Principal

```vue
<!-- app/components/kanban2/Kanban2Board.vue -->
<template>
  <div class="kanban2-board">
    <!-- Board content -->
  </div>
</template>

<script setup lang="ts">
import { useKanban2DragDrop, useKanban2Data, ... } from '~/composables/kanban2'
// Composables integrados
</script>
```

---

## 🔗 Navegação

### Acessar Kanban 2

#### Via URL Direta
```
http://localhost:3000/kanban2
```

#### Via Link em Componente
```vue
<template>
  <NuxtLink to="/kanban2">
    Ir para Kanban 2
  </NuxtLink>
</template>
```

#### Via Programação
```typescript
const router = useRouter()
router.push('/kanban2')
```

---

## 🎯 Integração com Menu

Se houver um menu de navegação, adicione:

```vue
<!-- app/components/Navigation.vue ou similar -->
<template>
  <nav>
    <NuxtLink to="/">Dashboard</NuxtLink>
    <NuxtLink to="/tarefas">Tarefas</NuxtLink>
    <NuxtLink to="/kanban2">Kanban 2</NuxtLink>  <!-- Novo -->
    <NuxtLink to="/clientes">Clientes</NuxtLink>
  </nav>
</template>
```

---

## 🔄 Fluxo de Navegação

```
Dashboard
    ↓
Menu → Kanban 2
    ↓
/kanban2 (rota)
    ↓
pages/kanban2.vue (página)
    ↓
Kanban2Board (componente)
    ↓
Kanban2Column × N (componentes)
    ↓
Kanban2Card × M (componentes)
```

---

## 🧪 Testar Navegação

### 1. Acessar Diretamente

```
1. Abrir http://localhost:3000/kanban2
2. Verificar se página carrega
3. Verificar se board aparece
```

### 2. Navegar via Link

```
1. Criar link: <NuxtLink to="/kanban2">Kanban 2</NuxtLink>
2. Clicar no link
3. Verificar se navega para /kanban2
```

### 3. Voltar

```
1. Clicar botão voltar do navegador
2. Verificar se volta para página anterior
```

---

## 📊 Rotas Disponíveis

| Rota | Arquivo | Status |
|------|---------|--------|
| `/` | `index.vue` | ✅ |
| `/dashboard` | `dashboard.vue` | ✅ |
| `/tarefas` | `tarefas.vue` | ✅ |
| `/kanban2` | `kanban2.vue` | ✅ NOVO |
| `/clientes` | `clientes.vue` | ✅ |
| `/vendas` | `vendas.vue` | ✅ |
| `/despesas` | `despesas.vue` | ✅ |
| `/assinaturas` | `assinaturas.vue` | ✅ |

---

## 🔐 Proteção de Rota (Opcional)

Se precisar proteger a rota com autenticação:

### Middleware

```typescript
// app/middleware/auth.ts
export default defineRouteMiddleware((to, from) => {
  const user = useCurrentUser() // Seu composable de auth
  
  if (!user.value && to.path === '/kanban2') {
    return navigateTo('/login')
  }
})
```

### Usar no Componente

```vue
<!-- app/pages/kanban2.vue -->
<script setup lang="ts">
definePageMeta({
  middleware: 'auth'
})
</script>
```

---

## 🎨 Layout (Opcional)

Se quiser usar um layout específico:

### Criar Layout

```vue
<!-- app/layouts/kanban.vue -->
<template>
  <div class="kanban-layout">
    <header>Kanban 2</header>
    <main>
      <slot />
    </main>
  </div>
</template>
```

### Usar no Componente

```vue
<!-- app/pages/kanban2.vue -->
<script setup lang="ts">
definePageMeta({
  layout: 'kanban'
})
</script>
```

---

## 🚀 Deploy

### Produção

A rota `/kanban2` estará disponível em produção automaticamente:

```
https://seu-dominio.com/kanban2
```

### Build

```bash
npm run build
npm run preview
```

---

## 📝 Checklist - Fase 3

- [x] Página kanban2.vue criada
- [x] Rota automática configurada
- [x] Componente Kanban2Board integrado
- [x] Composables integrados
- [ ] Testes manuais realizados
- [ ] Menu atualizado (opcional)
- [ ] Documentação completa

---

## 🎯 Próximos Passos

1. ✅ Fase 3: Page (COMPLETA)
2. ⏳ Fase 4: Testes & Otimizações
3. ⏳ Comparação com Tarefas
4. ⏳ Migração de usuários

---

## 💡 Dicas

### Debugging

```typescript
// Ver rota atual
const route = useRoute()
console.log(route.path) // /kanban2

// Navegar programaticamente
const router = useRouter()
router.push('/kanban2')
```

### Performance

- Rota é lazy-loaded automaticamente
- Componentes são code-split
- Sem impacto em outras rotas

### Segurança

- Adicione middleware de autenticação se necessário
- Valide permissões no servidor
- Use RLS no Supabase

---

**Data:** 15 de Março de 2026
**Versão:** 3.0.0
**Status:** ✅ INTEGRADO
