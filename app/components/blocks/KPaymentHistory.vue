<template>
  <div class="space-y-6">
    <!-- Resumo -->
    <KPaymentHistorySummary :summary="paymentSummary" />

    <!-- Filtros -->
    <KPaymentHistoryFilters
      :filters="filters"
      :categories="categories"
      @update:filters="handleFilterChange"
      @clear-filters="clearFilters"
    />

    <!-- Tabela -->
    <KPaymentHistoryTable
      :payments="filteredPayments"
      :categories="categories"
      :loading="loading"
      @edit="$emit('edit', $event)"
      @delete="$emit('delete', $event)"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type { Expense, Category } from '~/composables/useExpenses'

interface Filters {
  search: string
  category: string
  expenseType: 'all' | 'unique' | 'recurring'
  dateRange: { start: string; end: string } | null
}

interface Props {
  payments: Expense[]
  categories: Category[]
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false
})

const emit = defineEmits<{
  edit: [expense: Expense]
  delete: [expenseId: string]
}>()

const filters = ref<Filters>({
  search: '',
  category: '',
  expenseType: 'all',
  dateRange: null
})

const filteredPayments = computed(() => {
  let filtered = props.payments

  // Filtro por busca
  if (filters.value.search) {
    filtered = filtered.filter((p: any) =>
      p.description.toLowerCase().includes(filters.value.search.toLowerCase())
    )
  }

  // Filtro por categoria
  if (filters.value.category) {
    filtered = filtered.filter((p: any) => p.category_id === filters.value.category)
  }

  // Filtro por tipo
  if (filters.value.expenseType === 'unique') {
    filtered = filtered.filter((p: any) => !p.is_recurring)
  } else if (filters.value.expenseType === 'recurring') {
    filtered = filtered.filter((p: any) => p.is_recurring)
  }

  // Filtro por período
  if (filters.value.dateRange?.start && filters.value.dateRange?.end) {
    const startDate = new Date(filters.value.dateRange.start)
    const endDate = new Date(filters.value.dateRange.end)
    filtered = filtered.filter((p: any) => {
      const paymentDate = new Date(p.updated_at)
      return paymentDate >= startDate && paymentDate <= endDate
    })
  }

  return filtered.sort((a: any, b: any) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
})

const paymentSummary = computed(() => {
  if (filteredPayments.value.length === 0) {
    return {
      totalPaid: 0,
      count: 0,
      average: 0,
      byCategory: {}
    }
  }

  const totalPaid = filteredPayments.value.reduce((sum, p: any) => sum + p.amount, 0)
  const count = filteredPayments.value.length
  const average = totalPaid / count

  return {
    totalPaid,
    count,
    average,
    byCategory: {}
  }
})

const handleFilterChange = (newFilters: Filters) => {
  filters.value = newFilters
}

const clearFilters = () => {
  filters.value = {
    search: '',
    category: '',
    expenseType: 'all',
    dateRange: null
  }
}
</script>
