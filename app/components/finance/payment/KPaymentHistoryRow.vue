<template>
  <tr class="group/row bg-white/[0.02] hover:bg-white/[0.05] transition-all rounded-2xl border border-transparent hover:border-white/10">
    <td class="px-4 py-5 first:rounded-l-2xl">
      <p class="font-bold text-xs text-white uppercase tracking-tight">{{ expense.description }}</p>
    </td>
    <td class="px-4 py-5">
      <span class="text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-md" :style="{ backgroundColor: getCategoryColor(expense.category_id) + '20', color: getCategoryColor(expense.category_id) }">
        {{ getCategoryName(expense.category_id) }}
      </span>
    </td>
    <td class="px-4 py-5">
      <span class="text-xs font-black tabular-nums text-green-400">{{ formatCurrency(expense.amount) }}</span>
    </td>
    <td class="px-4 py-5">
      <p class="text-[9px] text-white/60">{{ expense.due_date ? formatDate(expense.due_date) : 'N/A' }}</p>
    </td>
    <td class="px-4 py-5">
      <p class="text-[9px] text-white/60">{{ formatDate(expense.updated_at) }}</p>
    </td>
    <td class="px-4 py-5">
      <span class="text-[9px] font-bold uppercase tracking-widest px-2 py-1 rounded" :class="expense.is_recurring ? 'bg-blue-500/20 text-blue-400' : 'bg-white/10 text-white/60'">
        {{ expense.is_recurring ? getFrequencyLabel(expense.recurring_frequency) : 'Único' }}
      </span>
    </td>
    <td class="px-4 py-5 last:rounded-r-2xl">
      <div class="flex items-center gap-2">
        <button @click="$emit('edit', expense)" class="p-2 hover:bg-white/10 rounded-lg transition-colors text-white/70 hover:text-white">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
        </button>
        <button @click="$emit('delete', expense.id)" class="p-2 hover:bg-red-500/20 rounded-lg transition-colors text-red-400/70 hover:text-red-400">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
        </button>
      </div>
    </td>
  </tr>
</template>

<script setup lang="ts">
import type { Expense, Category } from '~/composables/useExpenses'

interface Props {
  expense: Expense
  categories: Category[]
}

const props = defineProps<Props>()

defineEmits<{
  edit: [expense: Expense]
  delete: [expenseId: string]
}>()

const getCategoryName = (categoryId: string) => {
  return props.categories.find((c: any) => c.id === categoryId)?.name || 'Outros'
}

const getCategoryColor = (categoryId: string) => {
  return props.categories.find((c: any) => c.id === categoryId)?.color || '#6B7280'
}

const getFrequencyLabel = (frequency: string | undefined) => {
  const labels: Record<string, string> = {
    'daily': 'Diária',
    'weekly': 'Semanal',
    'monthly': 'Mensal',
    'quarterly': 'Trimestral',
    'semiannual': 'Semestral',
    'yearly': 'Anual'
  }
  return labels[frequency || ''] || 'Desconhecida'
}

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)
}

const formatDate = (date: string | null | undefined) => {
  if (!date) return 'N/A'
  try {
    const dateObj = new Date(date)
    if (isNaN(dateObj.getTime())) return 'N/A'
    return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(dateObj)
  } catch {
    return 'N/A'
  }
}
</script>
