<template>
  <div class="space-y-4">
    <!-- Filtros -->
    <div class="flex items-center gap-3">
      <select
        v-model="filters.category"
        class="px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[var(--kros-blue)] text-[10px] font-bold uppercase tracking-widest transition-colors"
      >
        <option value="">Todas Categorias</option>
        <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
      </select>

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

      <div class="flex-1"></div>

      <button
        @click="clearFilters"
        class="px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white/70 transition-all text-[10px] font-bold uppercase tracking-widest hover:border-[var(--kros-blue)] hover:text-[var(--kros-blue)]"
      >
        Limpar
      </button>
    </div>

    <!-- Main Metrics Cards -->
    <div class="grid grid-cols-4 gap-3">
      <div class="bg-white/5 border border-white/10 rounded-xl p-6">
        <p class="text-white/60 text-xs font-semibold mb-2">Total Pago</p>
        <p class="text-3xl font-bold text-green-400 mb-2">R$ {{ formatCurrency(totalPaid) }}</p>
        <p class="text-white/40 text-xs">{{ filteredRecords.length }} pagamentos</p>
      </div>

      <div class="bg-white/5 border border-white/10 rounded-xl p-6">
        <p class="text-white/60 text-xs font-semibold mb-2">Média por Pagamento</p>
        <p class="text-3xl font-bold text-blue-400 mb-2">R$ {{ formatCurrency(averagePayment) }}</p>
        <p class="text-white/40 text-xs">Valor médio</p>
      </div>

      <div class="bg-white/5 border border-white/10 rounded-xl p-6">
        <p class="text-white/60 text-xs font-semibold mb-2">Maior Pagamento</p>
        <p class="text-3xl font-bold text-purple-400 mb-2">R$ {{ formatCurrency(highestPayment) }}</p>
        <p class="text-white/40 text-xs">Valor máximo</p>
      </div>

      <div class="bg-white/5 border border-white/10 rounded-xl p-6">
        <p class="text-white/60 text-xs font-semibold mb-2">Menor Pagamento</p>
        <p class="text-3xl font-bold text-yellow-400 mb-2">R$ {{ formatCurrency(lowestPayment) }}</p>
        <p class="text-white/40 text-xs">Valor mínimo</p>
      </div>
    </div>

    <!-- Distribution by Category -->
    <div class="grid grid-cols-2 gap-3">
      <div class="bg-white/5 border border-white/10 rounded-xl p-6">
        <h3 class="text-lg font-bold text-white mb-4">Distribuição por Categoria</h3>
        <div class="space-y-3">
          <div v-for="(amount, categoryId) in totalByCategory" :key="categoryId" class="space-y-1">
            <div class="flex items-center justify-between">
              <p class="text-white/80 text-sm">{{ getCategoryName(categoryId as string) }}</p>
              <p class="text-white font-semibold">R$ {{ formatCurrency(amount as number) }}</p>
            </div>
            <div class="w-full bg-white/10 rounded-full h-2">
              <div
                class="bg-[var(--kros-blue)] h-2 rounded-full transition-all"
                :style="{ width: `${((amount as number) / totalPaid) * 100}%` }"
              ></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Distribution by Month -->
      <div class="bg-white/5 border border-white/10 rounded-xl p-6">
        <h3 class="text-lg font-bold text-white mb-4">Distribuição por Mês</h3>
        <div class="space-y-3">
          <div v-for="(amount, month) in totalByMonth" :key="month" class="space-y-1">
            <div class="flex items-center justify-between">
              <p class="text-white/80 text-sm">{{ formatMonth(month as string) }}</p>
              <p class="text-white font-semibold">R$ {{ formatCurrency(amount as number) }}</p>
            </div>
            <div class="w-full bg-white/10 rounded-full h-2">
              <div
                class="bg-green-400 h-2 rounded-full transition-all"
                :style="{ width: `${((amount as number) / totalPaid) * 100}%` }"
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Distribution by Payment Method -->
    <div class="bg-white/5 border border-white/10 rounded-xl p-6">
      <h3 class="text-lg font-bold text-white mb-4">Distribuição por Método de Pagamento</h3>
      <div class="grid grid-cols-5 gap-3">
        <div v-for="(amount, method) in totalByMethod" :key="method" class="bg-white/5 border border-white/10 rounded-lg p-4 text-center">
          <p class="text-white/60 text-xs font-semibold mb-2">{{ getMethodLabel(method as string) }}</p>
          <p class="text-2xl font-bold text-white mb-2">R$ {{ formatCurrency(amount as number) }}</p>
          <p class="text-white/40 text-xs">{{ getMethodCount(method as string) }} pagamentos</p>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="filteredRecords.length === 0" class="text-center py-12">
      <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" class="mx-auto text-white/30 mb-4">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z"></path>
      </svg>
      <p class="text-white/50">Nenhum dado disponível para o período selecionado</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, toRef } from 'vue'
import { usePaymentRecords } from '~/composables/usePaymentRecords'
import { useExpenseOccurrences } from '~/composables/useExpenseOccurrences'
import { useExpenses } from '~/composables/useExpenses'

const paymentRecordsComposable = usePaymentRecords()
const occurrencesComposable = useExpenseOccurrences()
const expensesComposable = useExpenses()

const { fetchRecords } = paymentRecordsComposable
const { fetchOccurrences } = occurrencesComposable
const { fetchExpenses, fetchCategories } = expensesComposable

// Use toRef to maintain reactivity
const records = toRef(paymentRecordsComposable, 'records')
const occurrences = toRef(occurrencesComposable, 'occurrences')
const categories = toRef(expensesComposable, 'categories')
const expenses = toRef(expensesComposable, 'expenses')

const filters = ref({
  category: '',
  month: '',
  year: ''
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

  if (filters.value.category) {
    filtered = filtered.filter(r => {
      const occurrence = occurrences.value.find(o => o.id === r.expense_occurrence_id)
      const expense = expenses.value.find(e => e.id === occurrence?.expense_id)
      return expense?.category_id === filters.value.category
    })
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

  return filtered
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

const lowestPayment = computed(() => {
  if (filteredRecords.value.length === 0) return 0
  return Math.min(...filteredRecords.value.map(r => r.amount))
})

const totalByCategory = computed(() => {
  const totals: Record<string, number> = {}
  filteredRecords.value.forEach(r => {
    const occurrence = occurrences.value.find(o => o.id === r.expense_occurrence_id)
    const expense = expenses.value.find(e => e.id === occurrence?.expense_id)
    if (expense && expense.category_id) {
      if (!totals[expense.category_id]) {
        totals[expense.category_id] = 0
      }
      totals[expense.category_id] += r.amount
    }
  })
  return totals
})

const totalByMonth = computed(() => {
  const totals: Record<string, number> = {}
  filteredRecords.value.forEach(r => {
    const date = new Date(r.payment_date)
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    if (!totals[key]) {
      totals[key] = 0
    }
    totals[key] += r.amount
  })
  return totals
})

const totalByMethod = computed(() => {
  const totals: Record<string, number> = {}
  filteredRecords.value.forEach(r => {
    const method = r.payment_method || 'Não especificado'
    if (!totals[method]) {
      totals[method] = 0
    }
    totals[method] += r.amount
  })
  return totals
})

const getCategoryName = (categoryId: string | undefined) => {
  if (!categoryId) return 'Sem categoria'
  return categories.value.find(c => c.id === categoryId)?.name || 'Sem categoria'
}

const getMethodLabel = (method: string) => {
  const labels: Record<string, string> = {
    debit: 'Débito',
    credit: 'Crédito',
    transfer: 'Transferência',
    cash: 'Dinheiro',
    check: 'Cheque',
    'Não especificado': 'Não especificado'
  }
  return labels[method] || method
}

const getMethodCount = (method: string) => {
  return filteredRecords.value.filter(r => (r.payment_method || 'Não especificado') === method).length
}

const formatCurrency = (value: number) => {
  return value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const formatMonth = (monthKey: string) => {
  const [year, month] = monthKey.split('-')
  const date = new Date(parseInt(year), parseInt(month) - 1)
  return date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
}

const clearFilters = () => {
  filters.value = {
    category: '',
    month: '',
    year: ''
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
</style>
