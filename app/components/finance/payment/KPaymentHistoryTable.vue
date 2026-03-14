<template>
  <div class="space-y-4">
    <div v-if="payments.length === 0" class="text-center py-20">
      <p class="text-white/40 text-sm">Nenhum pagamento registrado</p>
    </div>

    <div v-else class="overflow-x-auto">
      <table class="w-full text-left border-separate border-spacing-y-2.5">
        <thead>
          <tr class="text-[9px] font-bold uppercase tracking-[0.2em] text-white/40">
            <th class="px-4 py-3">Descrição</th>
            <th class="px-4 py-3">Categoria</th>
            <th class="px-4 py-3">Valor</th>
            <th class="px-4 py-3">Data de Vencimento</th>
            <th class="px-4 py-3">Data de Pagamento</th>
            <th class="px-4 py-3">Tipo</th>
            <th class="px-4 py-3">Ações</th>
          </tr>
        </thead>
        <tbody>
          <KPaymentHistoryRow 
            v-for="expense in payments" 
            :key="expense.id"
            :expense="expense"
            :categories="categories"
            @edit="$emit('edit', $event)"
            @delete="$emit('delete', $event)"
          />
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import KPaymentHistoryRow from './KPaymentHistoryRow.vue'
import type { Expense, Category } from '~/composables/useExpenses'

interface Props {
  payments: Expense[]
  categories: Category[]
  loading?: boolean
}

withDefaults(defineProps<Props>(), {
  loading: false
})

defineEmits<{
  edit: [expense: Expense]
  delete: [expenseId: string]
}>()
</script>
