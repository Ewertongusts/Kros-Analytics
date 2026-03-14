<template>
  <div class="space-y-4">
    <!-- Filtros -->
    <div class="space-y-3">
      <!-- Linha 1: Search, Category, Method, Spacer, Clear -->
      <div class="flex items-center gap-3">
        <input
          v-model="filters.search"
          type="text"
          placeholder="Buscar pagamento..."
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
          v-model="filters.paymentMethod"
          class="px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[var(--kros-blue)] text-[10px] font-bold uppercase tracking-widest transition-colors"
        >
          <option value="">Todos Métodos</option>
          <option value="debit">Débito</option>
          <option value="credit">Crédito</option>
          <option value="transfer">Transferência</option>
          <option value="cash">Dinheiro</option>
          <option value="check">Cheque</option>
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
        <p class="text-white/60 text-xs font-semibold mb-1">Total Pago</p>
        <p class="text-2xl font-bold text-green-400">R$ {{ formatCurrency(totalPaid) }}</p>
      </div>
      <div class="bg-white/5 border border-white/10 rounded-xl p-4">
        <p class="text-white/60 text-xs font-semibold mb-1">Média</p>
        <p class="text-2xl font-bold text-white">R$ {{ formatCurrency(averagePayment) }}</p>
      </div>
      <div class="bg-white/5 border border-white/10 rounded-xl p-4">
        <p class="text-white/60 text-xs font-semibold mb-1">Maior</p>
        <p class="text-2xl font-bold text-white">R$ {{ formatCurrency(highestPayment) }}</p>
      </div>
      <div class="bg-white/5 border border-white/10 rounded-xl p-4">
        <p class="text-white/60 text-xs font-semibold mb-1">Quantidade</p>
        <p class="text-2xl font-bold text-white">{{ filteredRecords.length }}</p>
      </div>
    </div>

    <!-- Table -->
    <div v-if="filteredRecords.length > 0" class="overflow-x-auto">
      <table class="w-full text-sm">
        <thead>
          <tr class="border-b border-white/10">
            <th class="text-left px-4 py-3 font-semibold text-white/80">Descrição</th>
            <th class="text-left px-4 py-3 font-semibold text-white/80">Categoria</th>
            <th class="text-right px-4 py-3 font-semibold text-white/80">Valor</th>
            <th class="text-left px-4 py-3 font-semibold text-white/80">Data Pagamento</th>
            <th class="text-left px-4 py-3 font-semibold text-white/80">Método</th>
            <th class="text-left px-4 py-3 font-semibold text-white/80">Notas</th>
            <th class="text-center px-4 py-3 font-semibold text-white/80">Ações</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="record in filteredRecords" :key="record.id" class="border-b border-white/5 hover:bg-white/5 transition-colors">
            <td class="px-4 py-3 text-white">{{ getOccurrenceDescription(record.expense_occurrence_id) }}</td>
            <td class="px-4 py-3 text-white/70">
              {{ getCategoryName(getOccurrenceCategory(record.expense_occurrence_id)) }}
            </td>
            <td class="px-4 py-3 text-right text-white font-semibold">
              R$ {{ formatCurrency(record.amount) }}
            </td>
            <td class="px-4 py-3 text-white/70">
              {{ formatDate(record.payment_date) }}
            </td>
            <td class="px-4 py-3 text-white/70">
              {{ getMethodLabel(record.payment_method) }}
            </td>
            <td class="px-4 py-3 text-white/70 max-w-xs truncate">
              {{ record.notes || '-' }}
            </td>
            <td class="px-4 py-3 text-center">
              <button
                @click="deleteRecord(record.id)"
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
      <p class="text-white/50">Nenhum pagamento registrado</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { usePaymentRecords, type PaymentRecord } from '~/composables/usePaymentRecords'
import { useExpenseOccurrences, type ExpenseOccurrence } from '~/composables/useExpenseOccurrences'
import { useExpenses, type Category } from '~/composables/useExpenses'

const { records, fetchRecords, deleteRecord: deleteRecordApi } = usePaymentRecords()
const { occurrences, fetchOccurrences } = useExpenseOccurrences()
const { expenses, categories, fetchExpenses, fetchCategories } = useExpenses()

const filters = ref({
  search: '',
  category: '',
  paymentMethod: '',
  month: '',
  year: '',
  startDate: '',
  endDate: ''
})

// Fetch data on mount
const initData = async () => {
  await fetchExpenses()
  await fetchCategories()
  await fetchOccurrences()
  await fetchRecords()
}

initData()

const filteredRecords = computed(() => {
  let filtered = records.value

  if (filters.value.search) {
    const searchLower = filters.value.search.toLowerCase()
    filtered = filtered.filter(r => {
      const occurrence = occurrences.value.find(o => o.id === r.expense_occurrence_id)
      const expense = expenses.value.find(e => e.id === occurrence?.expense_id)
      return expense?.description.toLowerCase().includes(searchLower)
    })
  }

  if (filters.value.category) {
    filtered = filtered.filter(r => {
      const occurrence = occurrences.value.find(o => o.id === r.expense_occurrence_id)
      const expense = expenses.value.find(e => e.id === occurrence?.expense_id)
      return expense?.category_id === filters.value.category
    })
  }

  if (filters.value.paymentMethod) {
    filtered = filtered.filter(r => r.payment_method === filters.value.paymentMethod)
  }

  if (filters.value.month || filters.value.year) {
    filtered = filtered.filter(r => {
      const date = new Date(r.payment_date)
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
    filtered = filtered.filter(r => {
      const date = new Date(r.payment_date)
      return date >= start && date <= end
    })
  }

  return filtered.sort((a, b) => new Date(b.payment_date).getTime() - new Date(a.payment_date).getTime())
})

const totalPaid = computed(() => {
  return filteredRecords.value.reduce((sum, r) => sum + r.amount, 0)
})

const averagePayment = computed(() => {
  if (filteredRecords.value.length === 0) return 0
  return totalPaid.value / filteredRecords.value.length
})

const highestPayment = computed(() => {
  if (filteredRecords.value.length === 0) return 0
  return Math.max(...filteredRecords.value.map(r => r.amount))
})

const getOccurrenceDescription = (occurrenceId: string) => {
  const occurrence = occurrences.value.find(o => o.id === occurrenceId)
  const expense = expenses.value.find(e => e.id === occurrence?.expense_id)
  return expense?.description || '-'
}

const getOccurrenceCategory = (occurrenceId: string) => {
  const occurrence = occurrences.value.find(o => o.id === occurrenceId)
  const expense = expenses.value.find(e => e.id === occurrence?.expense_id)
  return expense?.category_id || ''
}

const getCategoryName = (categoryId: string) => {
  return categories.value.find(c => c.id === categoryId)?.name || 'Sem categoria'
}

const getMethodLabel = (method?: string) => {
  const labels: Record<string, string> = {
    debit: 'Débito',
    credit: 'Crédito',
    transfer: 'Transferência',
    cash: 'Dinheiro',
    check: 'Cheque'
  }
  return labels[method || ''] || method || 'Não especificado'
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
    paymentMethod: '',
    month: '',
    year: '',
    startDate: '',
    endDate: ''
  }
}

const deleteRecord = async (id: string) => {
  if (confirm('Tem certeza que deseja deletar este registro de pagamento?')) {
    await deleteRecordApi(id)
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
