<template>
  <div class="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
    <!-- Busca -->
    <div class="flex-1 min-w-[200px]">
      <input
        :value="searchQuery"
        @input="$emit('update:searchQuery', ($event.target as HTMLInputElement).value)"
        type="text"
        placeholder="Buscar por cliente..."
        class="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:border-kros-blue transition-all text-sm"
      />
    </div>

    <!-- Filtro de Status -->
    <select
      :value="statusFilter"
      @change="$emit('update:statusFilter', ($event.target as HTMLSelectElement).value)"
      class="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:border-kros-blue transition-all text-sm min-w-[150px]"
    >
      <option value="todos">Todos Status</option>
      <option value="paid">Pago</option>
      <option value="pending">Pendente</option>
      <option value="scheduled">Agendado</option>
    </select>

    <!-- Botão Limpar -->
    <button
      v-if="hasActiveFilters"
      @click="$emit('clear-filters')"
      class="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white transition-all text-sm flex items-center gap-2"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
      </svg>
      Limpar
    </button>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  searchQuery: string
  statusFilter: string
  hasActiveFilters: boolean
}>()

defineEmits<{
  'update:searchQuery': [value: string]
  'update:statusFilter': [value: string]
  'clear-filters': []
}>()
</script>
