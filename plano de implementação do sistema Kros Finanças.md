# Plano de Desenvolvimento — Kros App (Fase 2)

O app já possui as telas de autenticação (login, cadastro, recuperação de senha) prontas e componentizadas. O próximo ciclo foca em **conectar essas telas a um backend real** e **criar o ambiente pós-login**.

---

## Fase 1 — Autenticação com Supabase

Supabase será o backend-as-a-service (BaaS), pois oferece banco de dados Postgres, autenticação e realtime sem necessidade de servidor próprio — ideal para o estágio atual do projeto.

### Stack
- **`@nuxtjs/supabase`** — módulo oficial com composables prontos (`useSupabaseClient`, `useSupabaseUser`)

---

### Proposed Changes

#### [NEW] `supabase/` (projeto no dashboard do Supabase)
Criação do projeto no [Supabase](https://supabase.com), obtendo a `SUPABASE_URL` e `SUPABASE_KEY`.

#### [MODIFY] [nuxt.config.ts](file:///c:/Users/WIN10/Documents/AntGravity/Kroz/nuxt.config.ts)
Adicionar o módulo `@nuxtjs/supabase`.

#### [NEW] `.env`
```
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_KEY=public-anon-key
```

#### [MODIFY] [app/components/blocks/KLoginForm.vue](file:///c:/Users/WIN10/Documents/AntGravity/Kroz/app/components/blocks/KLoginForm.vue)
Conectar [handleLogin](file:///c:/Users/WIN10/Documents/AntGravity/Kroz/app/components/blocks/KLoginForm.vue#49-55) ao `supabase.auth.signInWithPassword()`.

#### [MODIFY] [app/components/blocks/KRegisterForm.vue](file:///c:/Users/WIN10/Documents/AntGravity/Kroz/app/components/blocks/KRegisterForm.vue)
Conectar [handleRegister](file:///c:/Users/WIN10/Documents/AntGravity/Kroz/app/components/blocks/KRegisterForm.vue#66-78) ao `supabase.auth.signUp()`.

#### [MODIFY] [app/components/blocks/KRecoverPasswordForm.vue](file:///c:/Users/WIN10/Documents/AntGravity/Kroz/app/components/blocks/KRecoverPasswordForm.vue)
Conectar [handleRecover](file:///c:/Users/WIN10/Documents/AntGravity/Kroz/app/components/blocks/KRecoverPasswordForm.vue#80-85) ao `supabase.auth.resetPasswordForEmail()`.

---

## Fase 2 — Dashboard (Área logada)

#### [NEW] `app/pages/dashboard.vue`
Página principal pós-login com métricas, saldo, atividades recentes.

#### [NEW] `app/components/blocks/KDashboardHeader.vue`
Header com nome do usuário logado, avatar, botão de logout.

#### [NEW] `app/components/blocks/KDashboardMetrics.vue`
Cards de métricas reutilizando `UiKStatCard`.

---

## Fase 3 — Proteção de Rotas (Middleware)

#### [NEW] `app/middleware/auth.ts`
```ts
// Redireciona para / se o usuário não estiver autenticado
export default defineNuxtRouteMiddleware(() => {
  const user = useSupabaseUser()
  if (!user.value) return navigateTo('/')
})
```

#### [MODIFY] `app/pages/dashboard.vue`
```ts
definePageMeta({ middleware: 'auth' })
```

---

## Verificação

### Manual
1. Rodar `npm run dev`
2. Tentar acessar `localhost:3000/dashboard` sem login → deve redirecionar para `/`
3. Criar conta em `/cadastro` → checar email de confirmação no Supabase
4. Fazer login em `/` → deve redirecionar para `/dashboard`
5. Clicar em "Esqueci minha senha" → verificar recebimento do email no Supabase
