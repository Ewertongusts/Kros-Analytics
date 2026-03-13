<template>
  <div class="flex flex-wrap items-center gap-2 sm:gap-3 h-12">
    <!-- Total Filtrado -->
    <div class="flex items-center gap-2 px-3 py-3 bg-white/[0.02] border border-white/5 rounded-lg h-full">
      <span class="text-[8px] font-bold text-white/50 uppercase tracking-widest">Total:</span>
      <span class="text-[10px] font-black text-white uppercase tracking-widest">{{ totalCount }}</span>
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
  subscriptionStatusFilter: string[]
}>()

defineEmits([
  'update:searchQuery',
  'toggle-tag',
  'toggle-all-tags',
  'clear-tags',
  'update:activeFilter',
  'toggle-subscription-status',
  'clear-subscription-status'
])
</script>

<style scoped>
/* Estilos movidos para componentes filhos */
</style>
