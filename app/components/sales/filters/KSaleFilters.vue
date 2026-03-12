<template>
  <div class="p-6 rounded-2xl bg-white/[0.02] border border-white/10 space-y-4">
    <!-- Header com toggle -->
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-3">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-kros-blue"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>
        <h3 class="text-sm font-semibold text-white">Filtros Avançados</h3>
        <span v-if="activeFiltersCount > 0" class="px-2 py-0.5 rounded-full bg-kros-blue/20 text-kros-blue text-[10px] font-bold">
          {{ activeFiltersCount }}
        </span>
      </div>
      <button 
        @click="isExpanded = !isExpanded"
        class="text-white/40 hover:text-white transition-colors"
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width="18" 
          height="18" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          stroke-width="2" 
          stroke-linecap="round" 
          stroke-linejoin="round"
          :class="{ 'rotate-180': isExpanded }"
          class="transition-transform"
        >
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </button>
    </div>

    <!-- Filtros (colapsável) -->
    <div v-if="isExpanded" class="space-y-4 pt-2 animate-in fade-in duration-300">
      <!-- Linha 1: Busca -->
      <div>
        <SalesFiltersKSaleSearchBar 
          :search-query="searchQuery"
          @update:search-query="$emit('update:searchQuery', $event)"
        />
      </div>

      <!-- Linha 2: Status, Data e Valor -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <!-- Status -->
        <SalesFiltersKSaleStatusFilter 
          :status="status"
          @update:status="$emit('update:status', $event)"
        />

        <!-- Data -->
        <SalesFiltersKSaleDateFilter 
          :start-date="startDate"
          :end-date="endDate"
          @update:start-date="$emit('update:startDate', $event)"
          @update:end-date="$emit('update:endDate', $event)"
        />

        <!-- Valor -->
        <SalesFiltersKSaleValueFilter 
          :min-value="minValue"
          :max-value="maxValue"
          @update:min-value="$emit('update:minValue', $event)"
          @update:max-value="$emit('update:maxValue', $event)"
        />
      </div>

      <!-- Linha 3: Botão Limpar -->
      <div v-if="activeFiltersCount > 0" class="flex justify-end">
        <button 
          @click="clearAllFilters"
          class="px-6 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-white/60 hover:text-white hover:border-white/20 transition-all active:scale-95"
        >
          <span class="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            Limpar Filtros
          </span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const props = defineProps<{
  searchQuery: string
  status: string
  startDate: string
  endDate: string
  minValue: number | null
  maxValue: number | null
}>()

const emit = defineEmits([
  'update:searchQuery',
  'update:status',
  'update:startDate',
  'update:endDate',
  'update:minValue',
  'update:maxValue',
  'clear'
])

const isExpanded = ref(false)

const activeFiltersCount = computed(() => {
  let count = 0
  if (props.searchQuery) count++
  if (props.status !== 'todos') count++
  if (props.startDate || props.endDate) count++
  if (props.minValue !== null || props.maxValue !== null) count++
  return count
})

const clearAllFilters = () => {
  emit('clear')
}
</script>
