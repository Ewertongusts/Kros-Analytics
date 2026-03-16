---
inclusion: auto
---

# Calendário - Status Translation Fix

## 🎯 Problema Atual
O calendário está **100% componentizado** (22 componentes), mas os status ainda aparecem em inglês:
- "done" → deveria ser "Concluído"
- "in_progress" → deveria ser "Em Progresso"  
- "todo" → deveria ser "A Fazer"

## ✅ O Que Já Foi Feito

### Componentes Criados (22 no total)
```
KTasksCalendarView (orquestra)
├── KCalendarHeader
│   ├── KCalendarHeaderButton
│   └── KCalendarTodayButton
├── KCalendarSidebar
│   ├── KCalendarAddTaskButton
│   ├── KAppointmentItem
│   │   ├── KAppointmentInfo
│   │   │   ├── KAppointmentTitle
│   │   │   ├── KAppointmentDate
│   │   │   └── KCalendarPriorityBadge
│   │   └── KCalendarStatusBadge ← AQUI ESTÁ A TRADUÇÃO
│   └── KCalendarEmptyState
├── KCalendarGrid
│   ├── KCalendarWeekHeader
│   └── KCalendarDayCell
│       ├── KCalendarDayNumber
│       ├── KCalendarDayTasks
│       └── KCalendarDayMoreIndicator
└── KCalendarLegend
    └── KLegendItem
```

### Utilitários Criados
- **`app/utils/calendarUtils.ts`** - Contém `getStatusLabel()` com mapeamento correto
- **`app/composables/useCalendarLogic.ts`** - Lógica de datas

### Importações Explícitas Adicionadas
- KAppointmentItem importa KAppointmentInfo e KCalendarStatusBadge
- KAppointmentInfo importa KAppointmentTitle, KAppointmentDate, KCalendarPriorityBadge
- KCalendarDayCell importa KCalendarDayNumber, KCalendarDayTasks, KCalendarDayMoreIndicator

## 🔴 Por Que Não Está Funcionando?

Possíveis causas:
1. **Cache do navegador** - Mesmo após Ctrl+Shift+R
2. **Cache do Nuxt** - `.nuxt` folder não foi limpo corretamente
3. **Servidor em cache** - Servidor de desenvolvimento servindo versão antiga
4. **Hydration mismatch** - Há warnings de hydration no console

## 🔧 Próximos Passos para Próxima Sessão

### Opção 1: Debug Direto
1. Abrir DevTools (F12)
2. Ir para Console
3. Executar: `document.querySelector('[class*="status"]')?.textContent`
4. Verificar se está "done" ou "Concluído"

### Opção 2: Verificar Renderização
1. Inspecionar elemento do status no DevTools
2. Verificar se `KCalendarStatusBadge` está sendo renderizado
3. Se não estiver, problema é na importação/renderização

### Opção 3: Forçar Rebuild Completo
```bash
# Parar servidor (Ctrl+C)
rm -r .nuxt .output node_modules/.vite
npm run dev
# Recarregar página (Ctrl+Shift+R)
```

### Opção 4: Verificar Dados
No console, procurar por:
```
[fetchTasks] Primeira tarefa: {... status: "done" ...}
```
Se status vem como "done" do banco, a tradução deveria funcionar.

## 📝 Arquivos Relevantes

**Componente que faz a tradução:**
- `app/components/tasks/calendar/KCalendarStatusBadge.vue`

**Função de tradução:**
- `app/utils/calendarUtils.ts` → `getStatusLabel()`

**Mapeamento de status:**
```typescript
const map: Record<string, string> = {
  'done': 'Concluído',
  'in_progress': 'Em Progresso',
  'todo': 'A Fazer',
  'concluida': 'Concluída',
  'em_progresso': 'Em Progresso',
  'a_fazer': 'A Fazer',
  'pendente': 'Pendente',
  'completed': 'Concluída',
  'cancelled': 'Cancelada',
  'cancelada': 'Cancelada'
}
```

## 🎯 Checklist para Próxima Sessão

- [ ] Verificar se `KCalendarStatusBadge` está sendo renderizado
- [ ] Confirmar que `getStatusLabel()` está sendo chamado
- [ ] Limpar cache completamente (`.nuxt`, `.output`, browser cache)
- [ ] Reiniciar servidor de desenvolvimento
- [ ] Verificar console para erros de importação
- [ ] Se ainda não funcionar, considerar usar `v-text` em vez de `{{ }}`
- [ ] Ou mover tradução para o componente pai

## 💡 Alternativa se Tudo Falhar

Se a tradução via componente não funcionar, mover a lógica para `KAppointmentItem`:

```vue
<template>
  <div class="p-2.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors cursor-pointer" @click="$emit('select')">
    <div class="flex items-start justify-between gap-2">
      <KAppointmentInfo :appointment="appointment" />
      <div class="px-1.5 py-0.5 rounded text-xs font-medium" :class="getStatusColor(appointment.status)">
        {{ getStatusLabel(appointment.status) }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { getStatusLabel, getStatusColor } from '~/utils/calendarUtils'
// ... resto do código
</script>
```

## 📊 Status do Projeto

- ✅ Calendário 100% componentizado
- ✅ Lógica extraída para composables
- ✅ Utilitários criados
- ✅ Importações explícitas adicionadas
- ❌ Tradução de status não está aparecendo (PROBLEMA ATUAL)

---

**Última atualização:** 16 de Março de 2026
**Commits relacionados:** 60a9112, 5f4053e, 48a699b, 54894a1, 57fdffb, 45a3be7
