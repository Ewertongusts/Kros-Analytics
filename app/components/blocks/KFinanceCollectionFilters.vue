<template>
  <div class="flex flex-wrap items-center gap-3 sm:gap-4">
    <!-- Total Filtrado -->
    <div class="flex items-center gap-2 px-4 py-3 bg-white/[0.02] border border-white/5 rounded-xl">
      <span class="text-[9px] font-bold text-white/50 uppercase tracking-widest">Total Filtrado:</span>
      <span class="text-[11px] font-black text-white uppercase tracking-widest">{{ totalCount }}</span>
    </div>

    <FinanceCollectionKCollectionSearchBar
      :search-query="searchQuery"
      @update:search-query="$emit('update:searchQuery', $event)"
    />

    <FinanceCollectionKCollectionTagFilter
      :selected-tags="selectedTags"
      :tag-definitions="tagDefinitions"
      @toggle-tag="$emit('toggle-tag', $event)"
      @toggle-all="$emit('toggle-all-tags')"
      @clear="$emit('clear-tags')"
    />

    <FinanceCollectionKCollectionSubscriptionStatusFilter
      :selected-statuses="subscriptionStatusFilter"
      @toggle="$emit('toggle-subscription-status', $event)"
      @clear="$emit('clear-subscription-status')"
    />
    
    <FinanceCollectionKCollectionStatusFilter
      :active-filter="activeFilter"
      :filter-options="filterOptions"
      @update:active-filter="$emit('update:activeFilter', $event)"
    />

    <!-- Botões de Ação -->
    <div class="flex items-center gap-2 ml-auto">
      <button 
        @click="$emit('toggle-compact')"
        class="p-2.5 bg-white/5 hover:bg-white/10 rounded-xl transition-all border border-transparent hover:border-white/10"
        :class="isCompact ? 'text-kros-blue' : 'text-white/30 hover:text-white'"
        :title="isCompact ? 'Visualização Compacta' : 'Visualização Expandida'"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <line x1="3" y1="6" x2="21" y2="6"></line>
          <line x1="3" y1="12" x2="21" y2="12"></line>
          <line x1="3" y1="18" x2="21" y2="18"></line>
        </svg>
      </button>
      
      <FinanceCollectionKCollectionExportDropdown @export="$emit('export', $event)" />
      
      <button 
        @click="$emit('config')"
        class="p-2.5 bg-white/5 hover:bg-white/10 text-white/30 hover:text-white rounded-xl transition-all border border-transparent hover:border-white/10"
        title="Gerenciar Empresas"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
      </button>
      <button 
        @click="$emit('sync')"
        class="p-2.5 bg-white/5 hover:bg-white/10 text-white/30 hover:text-white rounded-xl transition-all border border-transparent hover:border-white/10"
        title="Sincronizar Dados"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/><path d="M22 3v5h-5"/></svg>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  totalCount: number
  searchQuery: string
  selectedTags: string[]
  tagDefinitions: any[]
  activeFilter: string
  filterOptions: any[]
  isCompact: boolean
  subscriptionStatusFilter: string[]
}>()

defineEmits([
  'update:searchQuery',
  'toggle-tag',
  'toggle-all-tags',
  'clear-tags',
  'update:activeFilter',
  'toggle-subscription-status',
  'clear-subscription-status',
  'toggle-compact',
  'config',
  'sync',
  'export'
])
</script>

<style scoped>
/* Estilos movidos para componentes filhos */
</style>
