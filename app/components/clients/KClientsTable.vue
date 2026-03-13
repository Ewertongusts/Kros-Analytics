<template>
  <div class="space-y-6">
    <!-- Filtros -->
    <ClientsKClientsFiltersBar
      :search-query="searchQuery"
      :status-filter="statusFilter"
      :total-count="filteredCompanies.length"
      @update:search-query="searchQuery = $event"
      @update:status-filter="statusFilter = $event"
    />

    <!-- Tabela -->
    <div class="p-6 rounded-2xl bg-[#111112] border border-white/10 overflow-x-auto overflow-visible">
      <table class="w-full text-left border-separate border-spacing-y-2.5">
        <ClientsKClientsTableHeader
          :sort-column="sortColumn"
          :sort-direction="sortDirection"
          @sort="handleSort"
        />
        <tbody>
          <ClientsKClientsTableRow
            v-for="company in paginatedCompanies"
            :key="company.id"
            :company="company"
            @view="openDetailsModal"
            @edit="$emit('edit', $event)"
            @delete="$emit('delete', $event)"
          />
        </tbody>
      </table>

      <!-- Empty State -->
      <div v-if="filteredCompanies.length === 0" class="flex flex-col items-center justify-center py-20 opacity-40">
        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mb-4">
          <rect width="18" height="18" x="3" y="3" rx="2"/>
          <path d="m9 12 2 2 4-4"/>
        </svg>
        <p class="font-bold uppercase tracking-widest text-xs">Nenhum cliente encontrado</p>
      </div>
    </div>

    <!-- Paginação -->
    <ClientsKClientsPagination
      :current-page="currentPage"
      :total-pages="totalPages"
      :total-count="filteredCompanies.length"
      :has-next-page="hasNextPage"
      :has-prev-page="hasPrevPage"
      @next="nextPage"
      @prev="prevPage"
      @go-to-page="goToPage"
    />

    <!-- Modal de Detalhes -->
    <ClientsKClientDetailsModal
      :is-open="isDetailsModalOpen"
      :company="selectedCompany"
      @close="isDetailsModalOpen = false"
      @edit="handleEditFromModal"
      @toggle-status="handleToggleStatusFromModal"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, toRef } from 'vue'
import { useClientsFilters } from '~/composables/useClientsFilters'

const props = defineProps<{
  companies: any[]
}>()

const emit = defineEmits<{
  edit: [company: any]
  delete: [id: string]
}>()

const isDetailsModalOpen = ref(false)
const selectedCompany = ref<any>(null)

// Converter props.companies para ref para manter reatividade
const companiesRef = toRef(props, 'companies')

const {
  searchQuery,
  sortColumn,
  sortDirection,
  statusFilter,
  currentPage,
  filteredCompanies,
  paginatedCompanies,
  totalPages,
  hasNextPage,
  hasPrevPage,
  handleSort,
  nextPage,
  prevPage,
  goToPage
} = useClientsFilters(companiesRef)

const openDetailsModal = (company: any) => {
  selectedCompany.value = company
  isDetailsModalOpen.value = true
}

const handleEditFromModal = () => {
  if (selectedCompany.value) {
    emit('edit', selectedCompany.value)
    isDetailsModalOpen.value = false
  }
}

const handleToggleStatusFromModal = () => {
  if (selectedCompany.value) {
    selectedCompany.value.is_active = !selectedCompany.value.is_active
  }
}

// Resetar página quando filtros mudam
watch([searchQuery, statusFilter], () => {
  currentPage.value = 1
})
</script>
