<template>
  <div>
    <!-- Linha 1: Search (flex-1), Category, Type, Spacer, Clear Button -->
    <div class="flex items-center gap-3">
      <!-- Search (expande para ocupar espaço) -->
      <input
        :value="filters.search"
        @input="handleSearchChange"
        type="text"
        placeholder="Buscar pagamento..."
        class="flex-1 px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-[var(--kros-blue)] text-[10px] transition-colors"
      />

      <!-- Category -->
      <select
        :value="filters.category"
        @change="handleCategoryChange"
        class="px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[var(--kros-blue)] text-[10px] font-bold uppercase tracking-widest transition-colors"
      >
        <option value="">Todas Categorias</option>
        <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
      </select>

      <!-- Type -->
      <select
        :value="filters.expenseType"
        @change="handleTypeChange"
        class="px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[var(--kros-blue)] text-[10px] font-bold uppercase tracking-widest transition-colors"
      >
        <option value="all">Todos Tipos</option>
        <option value="unique">Únicos</option>
        <option value="recurring">Recorrentes</option>
      </select>

      <!-- Spacer invisível (ocupa espaço vazio) -->
      <div class="flex-1"></div>

      <!-- Botão Expandir/Recolher Filtros de Data -->
      <button
        @click="showDateFilters = !showDateFilters"
        :class="[
          'px-3 py-2.5 rounded-xl border transition-all flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest',
          showDateFilters
            ? 'bg-white/10 border-[var(--kros-blue)] text-[var(--kros-blue)]'
            : 'bg-white/5 border-white/10 text-white/70 hover:border-[var(--kros-blue)] hover:text-[var(--kros-blue)]'
        ]"
        title="Expandir/Recolher filtros de data"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
          <line x1="16" y1="2" x2="16" y2="6"></line>
          <line x1="8" y1="2" x2="8" y2="6"></line>
          <line x1="3" y1="10" x2="21" y2="10"></line>
        </svg>
        <span>{{ showDateFilters ? 'Ocultar' : 'Data' }}</span>
        <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" :class="{ 'rotate-180': showDateFilters }" class="transition-transform">
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </button>

      <!-- Clear Button -->
      <button
        @click="$emit('clear-filters')"
        class="px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white/70 transition-all text-[10px] font-bold uppercase tracking-widest hover:border-[var(--kros-blue)] hover:text-[var(--kros-blue)]"
      >
        Limpar
      </button>
    </div>

    <!-- Linha 2: Month, Year, Date Range (Expansível) -->
    <div v-if="showDateFilters" class="flex items-center gap-3 animate-in fade-in duration-200">
      <!-- Month -->
      <select
        :value="filters.month || ''"
        @change="handleMonthChange"
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

      <!-- Year -->
      <select
        :value="filters.year || ''"
        @change="handleYearChange"
        class="px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[var(--kros-blue)] text-[10px] font-bold uppercase tracking-widest transition-colors"
      >
        <option value="">Ano</option>
        <option value="2024">2024</option>
        <option value="2025">2025</option>
        <option value="2026">2026</option>
      </select>

      <!-- Date Range -->
      <div class="flex items-center gap-2">
        <input
          :value="filters.dateRange?.start || ''"
          @input="handleStartDateChange"
          type="date"
          class="px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[var(--kros-blue)] text-[10px] transition-colors"
        />
        <span class="text-white/50 text-[10px] font-bold">a</span>
        <input
          :value="filters.dateRange?.end || ''"
          @input="handleEndDateChange"
          type="date"
          class="px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[var(--kros-blue)] text-[10px] transition-colors"
        />
      </div>

      <!-- Spacer invisível (ocupa espaço vazio à direita) -->
      <div class="flex-1"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useWhiteLabel } from '~/composables/useWhiteLabel'
import type { Category } from '~/composables/useExpenses'

const { settings } = useWhiteLabel()

interface Filters {
  search: string
  category: string
  expenseType: 'all' | 'unique' | 'recurring'
  dateRange: { start: string; end: string } | null
  month?: number
  year?: number
}

interface Props {
  filters: Filters
  categories: Category[]
}

const props = defineProps<Props>()
const showDateFilters = ref(false)

const emit = defineEmits<{
  'update:filters': [filters: Filters]
  'clear-filters': []
}>()

const handleSearchChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  emit('update:filters', { ...props.filters, search: target.value })
}

const handleCategoryChange = (event: Event) => {
  const target = event.target as HTMLSelectElement
  emit('update:filters', { ...props.filters, category: target.value })
}

const handleTypeChange = (event: Event) => {
  const target = event.target as HTMLSelectElement
  emit('update:filters', { ...props.filters, expenseType: target.value as 'all' | 'unique' | 'recurring' })
}

const handleMonthChange = (event: Event) => {
  const target = event.target as HTMLSelectElement
  const month = target.value ? parseInt(target.value) : undefined
  emit('update:filters', { ...props.filters, month })
}

const handleYearChange = (event: Event) => {
  const target = event.target as HTMLSelectElement
  const year = target.value ? parseInt(target.value) : undefined
  emit('update:filters', { ...props.filters, year })
}

const handleStartDateChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  const dateRange = props.filters.dateRange || { start: '', end: '' }
  emit('update:filters', { ...props.filters, dateRange: { ...dateRange, start: target.value } })
}

const handleEndDateChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  const dateRange = props.filters.dateRange || { start: '', end: '' }
  emit('update:filters', { ...props.filters, dateRange: { ...dateRange, end: target.value } })
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

select option:checked {
  background-color: var(--kros-blue);
  color: white;
}

input[type="date"] {
  color-scheme: dark;
}

input[type="date"]::-webkit-calendar-picker-indicator {
  filter: invert(1);
}

/* Dynamic focus and hover states */
input:focus,
select:focus {
  border-color: var(--kros-blue) !important;
}

input:hover,
select:hover {
  border-color: var(--kros-blue) !important;
  opacity: 0.8;
}
</style>
