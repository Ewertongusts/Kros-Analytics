<template>
  <div class="space-y-4">
    <!-- Header com botão de criar -->
    <div class="flex items-center justify-between">
      <h3 class="text-lg font-bold text-white">Despesas Recorrentes</h3>
      <button
        @click="openCreateModal"
        class="px-4 py-2.5 bg-[var(--kros-blue)] text-white font-semibold rounded-xl hover:opacity-90 transition-opacity flex items-center gap-2"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
        Nova Despesa
      </button>
    </div>

    <!-- Table -->
    <div v-if="recurringExpenses.length > 0" class="overflow-x-auto">
      <table class="w-full text-sm">
        <thead>
          <tr class="border-b border-white/10">
            <th class="text-left px-4 py-3 font-semibold text-white/80">Descrição</th>
            <th class="text-left px-4 py-3 font-semibold text-white/80">Categoria</th>
            <th class="text-right px-4 py-3 font-semibold text-white/80">Valor</th>
            <th class="text-left px-4 py-3 font-semibold text-white/80">Frequência</th>
            <th class="text-left px-4 py-3 font-semibold text-white/80">Início</th>
            <th class="text-center px-4 py-3 font-semibold text-white/80">Status</th>
            <th class="text-center px-4 py-3 font-semibold text-white/80">Ações</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="expense in recurringExpenses" :key="expense.id" class="border-b border-white/5 hover:bg-white/5 transition-colors">
            <td class="px-4 py-3 text-white">{{ expense.description }}</td>
            <td class="px-4 py-3 text-white/70">
              {{ getCategoryName(expense.category_id) }}
            </td>
            <td class="px-4 py-3 text-right text-white font-semibold">
              R$ {{ formatCurrency(expense.amount) }}
            </td>
            <td class="px-4 py-3 text-white/70">
              {{ getFrequencyLabel(expense.recurring_frequency) }}
            </td>
            <td class="px-4 py-3 text-white/70">
              {{ formatDate(expense.start_date) }}
            </td>
            <td class="px-4 py-3 text-center">
              <span
                :class="[
                  'px-3 py-1 rounded-full text-xs font-semibold',
                  expense.is_active
                    ? 'bg-green-500/20 text-green-400'
                    : 'bg-red-500/20 text-red-400'
                ]"
              >
                {{ expense.is_active ? 'Ativa' : 'Pausada' }}
              </span>
            </td>
            <td class="px-4 py-3 text-center">
              <div class="flex items-center justify-center gap-2">
                <button
                  @click="openEditModal(expense)"
                  class="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  title="Editar"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-white/70 hover:text-white">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                  </svg>
                </button>
                <button
                  @click="toggleActive(expense)"
                  class="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  :title="expense.is_active ? 'Pausar' : 'Reativar'"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    :class="expense.is_active ? 'text-yellow-400' : 'text-white/70'"
                  >
                    <circle cx="12" cy="12" r="1"></circle>
                    <path v-if="expense.is_active" d="M12 1v6m0 6v6"></path>
                    <path v-else d="M12 1v22"></path>
                  </svg>
                </button>
                <button
                  @click="deleteExpense(expense.id)"
                  class="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  title="Deletar"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-red-400/70 hover:text-red-400">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    <line x1="10" y1="11" x2="10" y2="17"></line>
                    <line x1="14" y1="11" x2="14" y2="17"></line>
                  </svg>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Empty State -->
    <div v-else class="text-center py-12">
      <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" class="mx-auto text-white/30 mb-4">
        <circle cx="12" cy="12" r="10"></circle>
        <polyline points="12 6 12 12 16 14"></polyline>
      </svg>
      <p class="text-white/50 mb-4">Nenhuma despesa recorrente cadastrada</p>
      <button
        @click="openCreateModal"
        class="px-4 py-2 bg-[var(--kros-blue)]/20 text-[var(--kros-blue)] rounded-lg hover:bg-[var(--kros-blue)]/30 transition-colors"
      >
        Criar Primeira Despesa
      </button>
    </div>

    <!-- Modal -->
    <KExpenseModal
      :is-open="isModalOpen"
      :expense="selectedExpense"
      :categories="categories"
      :loading="loading"
      @close="closeModal"
      @submit="handleSubmit"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import KExpenseModal from './KExpenseModal.vue'
import { useExpenses, type Expense, type Category } from '~/composables/useExpenses'

const { expenses, categories, loading, deleteExpense: deleteExpenseApi, upsertExpense, toggleExpenseActive } = useExpenses()

const isModalOpen = ref(false)
const selectedExpense = ref<Expense | undefined>()

const recurringExpenses = computed(() => {
  return expenses.value.filter(e => e.is_recurring && e.is_active)
})

const getCategoryName = (categoryId: string) => {
  return categories.value.find(c => c.id === categoryId)?.name || 'Sem categoria'
}

const getFrequencyLabel = (frequency?: string) => {
  const labels: Record<string, string> = {
    daily: 'Diária',
    weekly: 'Semanal',
    monthly: 'Mensal',
    quarterly: 'Trimestral',
    semiannual: 'Semestral',
    yearly: 'Anual'
  }
  return labels[frequency || ''] || frequency || '-'
}

const formatCurrency = (value: number) => {
  return value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('pt-BR')
}

const openCreateModal = () => {
  selectedExpense.value = undefined
  isModalOpen.value = true
}

const openEditModal = (expense: Expense) => {
  selectedExpense.value = expense
  isModalOpen.value = true
}

const closeModal = () => {
  isModalOpen.value = false
  selectedExpense.value = undefined
}

const handleSubmit = async (expenseData: Partial<Expense>) => {
  const result = await upsertExpense(expenseData)
  if (result.success) {
    closeModal()
  }
}

const deleteExpense = async (id: string) => {
  if (confirm('Tem certeza que deseja deletar esta despesa?')) {
    await deleteExpenseApi(id)
  }
}

const toggleActive = async (expense: Expense) => {
  await toggleExpenseActive(expense.id, !expense.is_active)
}
</script>
