<template>
  <div class="space-y-4">
    <div class="flex items-start gap-4">
      <div class="flex-1 flex gap-3">
        <input
          :value="filters.search"
          @input="handleSearchChange"
          type="text"
          placeholder="Buscar pagamento..."
          class="flex-1 px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-white/20 text-[10px]"
        />
        <select
          :value="filters.category"
          @change="handleCategoryChange"
          class="px-4 py-2.5 bg-[#1a1a1b] border border-white/10 rounded-xl text-white focus:outline-none focus:border-white/20 text-[10px] font-bold uppercase tracking-widest"
        >
          <option value="">Todas Categorias</option>
          <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
        </select>
        <select
          :value="filters.expenseType"
          @change="handleTypeChange"
          class="px-4 py-2.5 bg-[#1a1a1b] border border-white/10 rounded-xl text-white focus:outline-none focus:border-white/20 text-[10px] font-bold uppercase tracking-widest"
        >
          <option value="all">Todos Tipos</option>
          <option value="unique">Únicos</option>
          <option value="recurring">Recorrentes</option>
        </select>
        <button
          @click="$emit('clear-filters')"
          class="px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white/70 hover:text-white transition-all text-[10px] font-bold uppercase tracking-widest"
        >
          Limpar
        </button>
      </div>
    </div>

    <div class="flex gap-3">
      <div class="flex-1">
        <label class="block text-white/60 text-[9px] font-bold uppercase tracking-widest mb-2">Data Inicial</label>
        <input
          :value="filters.dateRange?.start || ''"
          @input="handleStartDateChange"
          type="date"
          class="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-white/20 text-[10px]"
        />
      </div>
      <div class="flex-1">
        <label class="block text-white/60 text-[9px] font-bold uppercase tracking-widest mb-2">Data Final</label>
        <input
          :value="filters.dateRange?.end || ''"
          @input="handleEndDateChange"
          type="date"
          class="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-white/20 text-[10px]"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Category } from '~/composables/useExpenses'

interface Filters {
  search: string
  category: string
  expenseType: 'all' | 'unique' | 'recurring'
  dateRange: { start: string; end: string } | null
}

interface Props {
  filters: Filters
  categories: Category[]
}

const props = defineProps<Props>()

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
  background-color: #0066cc;
  color: white;
}

input[type="date"] {
  color-scheme: dark;
}

input[type="date"]::-webkit-calendar-picker-indicator {
  filter: invert(1);
}
</style>
