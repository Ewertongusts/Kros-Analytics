# User Preferences - Implementação Completa

## Overview
Sistema de preferências do usuário que persiste entre sessões, com sincronização entre Supabase e localStorage.

## Database

### Migration: `create_user_preferences.sql`
Tabela `user_preferences`:
- `id` - UUID primária
- `user_id` - Referência ao usuário (FK)
- `page` - Nome da página (ex: "tasks")
- `preferences` - JSONB com dados das preferências
- `created_at` - Data de criação
- `updated_at` - Data de atualização
- Índices em `user_id` e `page`
- RLS habilitado com políticas por usuário

## Composable: `useUserPreferences.ts`

### Interface
```typescript
interface TasksPagePreferences {
  showDashboard: boolean      // Dashboard visível?
  itemsPerPage: number        // Itens por página
  sortBy: string              // Campo de ordenação
  collapsedColumns: string[]  // Colunas colapsadas
}
```

### Funções

**loadFromSupabase()**
- Carrega preferências do Supabase
- Fallback para localStorage se não autenticado
- Sincroniza com estado local

**saveToSupabase()**
- Salva preferências no Supabase
- Também salva no localStorage como backup
- Usa UPSERT para criar ou atualizar

**updatePreference(key, value)**
- Atualiza preferência individual
- Salva automaticamente
- Tipo-seguro com TypeScript

**resetPreferences()**
- Reseta para valores padrão
- Salva no Supabase

**loadFromLocalStorage()**
- Carrega do localStorage
- Usado como fallback

**saveToLocalStorage()**
- Salva no localStorage
- Backup automático

### Auto-save
- Watch com debounce de 500ms
- Salva automaticamente quando preferências mudam
- Não bloqueia a UI

## Integração na Página de Tarefas

### Antes
```typescript
const showDashboard = ref(true)
```

### Depois
```typescript
const userPreferences = useUserPreferences()

const showDashboard = computed({
  get: () => userPreferences.preferences.value.showDashboard,
  set: (value) => {
    userPreferences.preferences.value.showDashboard = value
  }
})
```

### No onMounted
```typescript
onMounted(async () => {
  await userPreferences.loadFromSupabase()
  // ... resto do código
})
```

## Fluxo de Dados

```
Usuário clica em Dashboard
         ↓
showDashboard = true
         ↓
Computed setter atualiza preferences
         ↓
Watch detecta mudança
         ↓
saveToSupabase() (com debounce)
         ↓
Salva em Supabase + localStorage
         ↓
Próxima vez que abre página
         ↓
loadFromSupabase() carrega preferências
         ↓
showDashboard = false (conforme salvo)
```

## Preferências Salvas

### Padrão
```json
{
  "showDashboard": false,
  "itemsPerPage": 20,
  "sortBy": "created_at",
  "collapsedColumns": []
}
```

### Exemplo Customizado
```json
{
  "showDashboard": false,
  "itemsPerPage": 50,
  "sortBy": "priority",
  "collapsedColumns": ["todo", "in_progress"]
}
```

## Segurança

### RLS Policies
- Usuários só veem suas próprias preferências
- Usuários só podem atualizar suas próprias preferências
- Usuários só podem inserir suas próprias preferências
- Usuários só podem deletar suas próprias preferências

### Autenticação
- Requer `auth.uid()` para operações
- Fallback para localStorage se não autenticado
- Sincronização automática quando autenticado

## Benefícios

✅ **Persistência** - Preferências salvas entre sessões
✅ **Sincronização** - Supabase + localStorage
✅ **Offline** - Funciona sem conexão (localStorage)
✅ **Auto-save** - Salva automaticamente com debounce
✅ **Type-safe** - TypeScript com interface
✅ **Seguro** - RLS policies por usuário
✅ **Escalável** - Suporta múltiplas páginas

## Casos de Uso

1. **Dashboard Oculto por Padrão**
   - Usuário abre página
   - Dashboard começa oculto
   - Usuário clica para mostrar
   - Preferência é salva
   - Próxima vez abre com dashboard oculto

2. **Itens por Página**
   - Usuário muda para 50 itens
   - Preferência é salva
   - Próxima vez carrega com 50 itens

3. **Colunas Colapsadas**
   - Usuário colapsa coluna "A Fazer"
   - Preferência é salva
   - Próxima vez coluna já está colapsada

4. **Múltiplas Páginas**
   - Cada página tem suas preferências
   - Salvas independentemente
   - Sincronizadas por `page` na tabela

## Extensões Futuras

- [ ] Sincronizar com outras páginas (clientes, vendas, etc)
- [ ] Temas (claro/escuro)
- [ ] Tamanho de fonte
- [ ] Idioma
- [ ] Notificações
- [ ] Atalhos de teclado customizados
- [ ] Exportar/importar preferências
- [ ] Resetar para padrão

## Arquivos

**Created:**
- `app/composables/useUserPreferences.ts`
- `supabase/migrations/create_user_preferences.sql`

**Modified:**
- `app/pages/tarefas.vue` - Integração do composable

## Testing

Para testar:
1. Abrir página de tarefas
2. Dashboard começa oculto
3. Clicar para mostrar dashboard
4. Recarregar página
5. Dashboard deve estar visível (preferência salva)
6. Abrir DevTools → Application → localStorage
7. Ver `tasks_page_preferences` com dados salvos
8. Desconectar e reconectar
9. Preferências devem ser mantidas
