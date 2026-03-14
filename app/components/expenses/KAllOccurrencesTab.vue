<template>
  <div class="space-y-4">
    <!-- Filtros -->
    <div class="space-y-3">
      <!-- Linha 1: Search, Category, Type, Spacer, Clear -->
      <div class="flex items-center gap-3">
        <input
          v-model="filters.search"
          type="text"
          placeholder="Buscar ocorrência..."
          class="flex-1 px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-[var(--kros-blue)] text-[10px] transition-colors"
        />

        <select
          v-model="filters.category"
          class="px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[var(--kros-blue)] text-[10px] font-bold uppercase tracking-widest transition-colors"
        >
          <option value="">Todas Categorias</option>
          <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
        </select>

        <select
          v-model="filters.status"
          class="px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[var(--kros-blue)] text-[10px] font-bold uppercase tracking-widest transition-colors"
        >
          <option value="">Todos Status</option>
          <option value="pending">Pendente</option>
          <option value="paid">Pago</option>
          <option value="overdue">Vencida</option>
        </select>

        <div class="flex-1"></div>

        <button
          @click="clearFilters"
          class="px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white/70 transition-all text-[10px] font-bold uppercase tracking-widest hover:border-[var(--kros-blue)] hover:text-[var(--kros-blue)]"
        >
          Limpar
        </button>
      </div>

      <!-- Linha 2: Month, Year, Date Range -->
      <div class="flex items-center gap-3">
        <select
          v-model="filters.month"
          class="px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[var(--kros-blue)] text-[10px] font-bold uppercase tracking-widest transition-colors"
        >
          <option value="">Mês</option>
          <option value="1">Janeiro</option>
          <option value="2">Fevereiro</option>
          <option value="3">Março</option>
          <option value="4">Abril</option>
          <option value="5">Maio</option>
          <option value="6">Junho</option>
          <option value="7">Julho</option>
          <option value="8">Agosto</option>
          <option value="9">Setembro</option>
          <option value="10">Outubro</option>
          <option value="11">Novembro</option>
          <option value="12">Dezembro</option>
        </select>

        <select
          v-model="filters.year"
          class="px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[var(--kros-blue)] text-[10px] font-bold uppercase tracking-widest transition-colors"
        >
          <option value="">Ano</option>
          <option value="2024">2024</option>
          <option value="2025">2025</option>
          <option value="2026">2026</option>
        </select>

        <div class="flex items-center gap-2">
          <input
            v-model="filters.startDate"
            type="date"
            class="px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[var(--kros-blue)] text-[10px] transition-colors"
          />
          <span class="text-white/50 text-[10px] font-bold">a</span>
          <input
            v-model="filters.endDate"
            type="date"
            class="px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[var(--kros-blue)] text-[10px] transition-colors"
          />
        </div>

        <div class="flex-1"></div>
      </div>
    </div>

    <!-- Summary Cards -->
    <div class="grid grid-cols-4 gap-3">
      <div class="bg-white/5 border border-white/10 rounded-xl p-4">
        <p class="text-white/60 text-xs font-semibold mb-1">Total Pendente</p>
        <p class="text-2xl font-bold text-white">R$ {{ formatCurrency(totalPending) }}</p>
      </div>
      <div class="bg-white/5 border border-white/10 rounded-xl p-4">
        <p class="text-white/60 text-xs font-semibold mb-1">Total Pago</p>
        <p class="text-2xl font-bold text-green-400">R$ {{ formatCurrency(totalPaid) }}</p>
      </div>
      <div class="bg-white/5 border border-white/10 rounded-xl p-4">
        <p class="text-white/60 text-xs font-semibold mb-1">Total Vencida</p>
        <p class="text-2xl font-bold text-red-400">R$ {{ formatCurrency(totalOverdue) }}</p>
      </div>
      <div class="bg-white/5 border border-white/10 rounded-xl p-4">
        <p class="text-white/60 text-xs font-semibold mb-1">Quantidade</p>
        <p class="text-2xl font-bold text-white">{{ filteredOccurrences.length }}</p>
      </div>
    </div>

    <!-- Table -->
    <div v-if="filteredOccurrences.length > 0" class="overflow-x-auto">
      <table class="w-full text-sm">
        <thead>
          <tr class="border-b border-white/10">
            <th class="text-left px-4 py-3 font-semibold text-white/80">Descrição</th>
            <th class="text-left px-4 py-3 font-semibold text-white/80">Categoria</th>
            <th class="text-right px-4 py-3 font-semibold text-white/80">Valor</th>
            <th class="text-left px-4 py-3 font-semibold text-white/80">Vencimento</th>
            <th class="text-center px-4 py-3 font-semibold text-white/80">Status</th>
            <th class="text-center px-4 py-3 font-semibold text-white/80">Ações</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="occurrence in filteredOccurrences" :key="occurrence.id" class="border-b border-white/5 hover:bg-white/5 transition-colors">
            <td class="px-4 py-3 text-white">{{ getExpenseDescription(occurrence.expense_id) }}</td>
            <td class="px-4 py-3 text-white/70">
              {{ getCategoryName(getExpenseCategory(occurrence.expense_id)) }}
            </td>
            <td class="px-4 py-3 text-right text-white font-semibold">
              R$ {{ formatCurrency(occurrence.amount) }}
            </td>
            <td class="px-4 py-3 text-white/70">
              {{ formatDate(occurrence.due_date) }}
            </td>
            <td class="px-4 py-3 text-center">
              <span
                :class="[
                  'px-3 py-1 rounded-full text-xs font-semibold',
                  occurrence.status === 'pending'
                    ? 'bg-yellow-500/20 text-yellow-400'
                    : occurrence.status === 'paid'
                    ? 'bg-green-500/20 text-green-400'
                    : 'bg-red-500/20 text-red-400'
                ]"
              >
                {{ getStatusLabel(occurrence.status) }}
              </span>
            </td>
            <td class="px-4 py-3 text-center">
              <div class="flex items-center justify-center gap-2">
                <button
                  v-if="occurrence.status === 'pending'"
                  @click="markAsPaid(occurrence)"
                  class="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  title="Marcar como Pago"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-green-400/70 hover:text-green-400">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </button>
                <button
                  @click="deleteOccurrence(occurrence.id)"
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
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z"></path>
      </svg>
      <p class="text-white/50">Nenhuma ocorrência encontrada</p>
    </div>

    <!-- Modal para marcar como pago -->
    <div v-if="showPaymentModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 w-full max-w-md">
        <h2 class="text-xl font-bold text-white mb-4">Registrar Pagamento</h2>
        <form @submit.prevent="submitPayment" class="space-y-4">
          <div>
            <label class="block text-sm font-semibold text-white/80 mb-2">Data do Pagamento</label>
            <input
              v-model="paymentData.payment_date"
              type="date"
              class="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[var(--kros-blue)] transition-colors"
            />
          </div>
          <div>
            <label class="block text-sm font-semibold text-white/80 mb-2">Método de Pagamento</label>
            <select
              v-model="paymentData.payment_method"
              class="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[var(--kros-blue)] transition-colors"
            >
              <option value="">Selecione</option>
              <option value="debit">Débito</option>
              <option value="credit">Crédito</option>
              <option value="transfer">Transferência</option>
              <option value="cash">Dinheiro</option>
              <option value="check">Cheque</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-semibold text-white/80 mb-2">Notas (Opcional)</label>
            <textarea
              v-model="paymentData.notes"
              placeholder="Adicione observações..."
              rows="3"
              class="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-[var(--kros-blue)] transition-colors resize-none"
            ></textarea>
          </div>
          <div class="flex gap-3 pt-4">
            <button
              type="button"
              @click="showPaymentModal = false"
              class="flex-1 px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white font-semibold hover:border-[var(--kros-blue)] transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              class="flex-1 px-4 py-2.5 bg-[var(--kros-blue)] text-white font-semibold rounded-xl hover:opacity-90 transition-opacity"
            >
              Confirmar
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, toRef } from 'vue'
import { useExpenseOccurrences, type ExpenseOccurrence } from '~/composables/useExpenseOccurrences'
import { usePaymentRecords } from '~/composables/usePaymentRecords'
import { useExpenses, type Category } from '~/composables/useExpenses'

const occurrencesComposable = useExpenseOccurrences()
const paymentRecordsComposable = usePaymentRecords()
const expensesComposable = useExpenses()

const { fetchOccurrences, deleteOccurrence: deleteOccurrenceApi, updateOccurrenceStatus } = occurrencesComposable
const { createRecord } = paymentRecordsComposable
const { fetchExpenses, fetchCategories } = expensesComposable

// Use toRef to maintain reactivity
const occurrences = toRef(occurrencesComposable, 'occurrences')
const categories = toRef(expensesComposable, 'categories')
const expenses = toRef(expensesComposable, 'expenses')

const filters = ref({
  search: '',
  category: '',
  status: '',
  month: '',
  year: '',
  startDate: '',
  endDate: ''
})

const showPaymentModal = ref(false)
const selectedOccurrence = ref<ExpenseOccurrence | null>(null)
const paymentData = ref({
  payment_date: new Date().toISOString().split('T')[0],
  payment_method: '',
  notes: ''
})

// Fetch data on mount
const initData = async () => {
  await fetchExpenses()
  await fetchCategories()
  await fetchOccurrences()
}

initData()

const filteredOccurrences = computed(() => {
  let filtered = occurrences.value

  if (filters.value.search) {
    const searchLower = filters.value.search.toLowerCase()
    filtered = filtered.filter(o => {
      const expense = expenses.value.find(e => e.id === o.expense_id)
      return expense?.description.toLowerCase().includes(searchLower)
    })
  }

  if (filters.value.category) {
    filtered = filtered.filter(o => {
      const expense = expenses.value.find(e => e.id === o.expense_id)
      return expense?.category_id === filters.value.category
    })
  }

  if (filters.value.status) {
    filtered = filtered.filter(o => o.status === filters.value.status)
  }

  if (filters.value.month || filters.value.year) {
    filtered = filtered.filter(o => {
      const date = new Date(o.due_date)
      const month = date.getMonth() + 1
      const year = date.getFullYear()

      if (filters.value.month && filters.value.year) {
        return month === parseInt(filters.value.month) && year === parseInt(filters.value.year)
      } else if (filters.value.month) {
        return month === parseInt(filters.value.month)
      } else if (filters.value.year) {
        return year === parseInt(filters.value.year)
      }
      return true
    })
  }

  if (filters.value.startDate && filters.value.endDate) {
    const start = new Date(filters.value.startDate)
    const end = new Date(filters.value.endDate)
    filtered = filtered.filter(o => {
      const date = new Date(o.due_date)
      return date >= start && date <= end
    })
  }

  return filtered.sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())
})

const totalPending = computed(() => {
  return filteredOccurrences.value
    .filter(o => o.status === 'pending')
    .reduce((sum, o) => sum + o.amount, 0)
})

const totalPaid = computed(() => {
  return filteredOccurrences.value
    .filter(o => o.status === 'paid')
    .reduce((sum, o) => sum + o.amount, 0)
})

const totalOverdue = computed(() => {
  return filteredOccurrences.value
    .filter(o => o.status === 'overdue')
    .reduce((sum, o) => sum + o.amount, 0)
})

const getExpenseDescription = (expenseId: string) => {
  return expenses.value.find(e => e.id === expenseId)?.description || '-'
}

const getExpenseCategory = (expenseId: string) => {
  return expenses.value.find(e => e.id === expenseId)?.category_id || ''
}

const getCategoryName = (categoryId: string) => {
  return categories.value.find(c => c.id === categoryId)?.name || 'Sem categoria'
}

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    pending: 'Pendente',
    paid: 'Pago',
    overdue: 'Vencida'
  }
  return labels[status] || status
}

const formatCurrency = (value: number) => {
  return value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('pt-BR')
}

const clearFilters = () => {
  filters.value = {
    search: '',
    category: '',
    status: '',
    month: '',
    year: '',
    startDate: '',
    endDate: ''
  }
}

const markAsPaid = (occurrence: ExpenseOccurrence) => {
  selectedOccurrence.value = occurrence
  paymentData.value = {
    payment_date: new Date().toISOString().split('T')[0],
    payment_method: '',
    notes: ''
  }
  showPaymentModal.value = true
}

const submitPayment = async () => {
  if (!selectedOccurrence.value) return

  // Update occurrence status to paid
  await updateOccurrenceStatus(selectedOccurrence.value.id, 'paid')

  // Create payment record
  await createRecord({
    expense_occurrence_id: selectedOccurrence.value.id,
    amount: selectedOccurrence.value.amount,
    payment_date: paymentData.value.payment_date,
    payment_method: paymentData.value.payment_method || '',
    notes: paymentData.value.notes || ''
  })

  // Refresh data
  await fetchOccurrences()

  showPaymentModal.value = false
  selectedOccurrence.value = null
}

const deleteOccurrence = async (id: string) => {
  if (confirm('Tem certeza que deseja deletar esta ocorrência?')) {
    await deleteOccurrenceApi(id)
  }
}
</script>

<style scoped>
select {
  color-scheme: dark;
}

select option {
  background-color: #1a1a1b;
  color: white;
}

input[type="date"] {
  color-scheme: dark;
}

input[type="date"]::-webkit-calendar-picker-indicator {
  filter: invert(1);
}
</style>
