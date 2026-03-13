<template>
  <LayoutsKPageLayout>
    <UiKSkeleton v-if="loading" type="table" :rows="5" />

    <div v-else class="space-y-6 mb-20 animate-in fade-in duration-700">
      <BlocksKPageHeader title="Vendas" subtitle="Produtos, Serviços e Projetos Especiais" />

      <div class="flex items-center justify-between gap-4">
        <SalesTableKSaleFilterTabs v-model="activeFilter" />
        
        <div class="flex items-center gap-2">
          <button 
            @click="openSalesTimeline"
            class="px-4 py-2.5 bg-white/5 hover:bg-white/10 rounded-xl border border-white/5 hover:border-white/10 transition-all flex items-center gap-2 text-white/70 hover:text-white"
            title="Ver histórico de ações"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 8v4l3 3m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/>
            </svg>
            <span class="text-[10px] font-bold uppercase tracking-widest">Histórico</span>
          </button>
          
          <UiKButtonPrimary icon="plus" @click="openNewSaleModal">
            Nova Venda
          </UiKButtonPrimary>
        </div>
      </div>

      <SalesTableKSaleSummaryCards v-if="!loading" :summary="summary" />

      <div class="flex items-start gap-4">
        <div class="flex-1">
          <SalesFiltersKSaleFilters
            v-model:search-query="searchQuery"
            v-model:status="status"
            v-model:start-date="startDate"
            v-model:end-date="endDate"
            v-model:min-value="minValue"
            v-model:max-value="maxValue"
            @clear="clearFilters"
          />
        </div>
        <UiKExportDropdown 
          :disabled="filteredSales.length === 0"
          @export="(format) => handleExport(filteredSales, format)"
        />
      </div>

      <SalesTableKSaleTable
        v-if="!loading && filteredSales"
        :key="`sales-${filteredSales.length}`"
        :sales="filteredSales"
        @edit="editSale"
        @history="openHistory"
        @whatsapp="handleWhatsAppShare"
        @copy="handleCopySaleInfo"
        @report="generateSaleReceipt"
        @delete="handleDelete"
      />

      <BlocksKGlobalFooter />
    </div>

    <SalesModalKSaleTypeSelector
      :is-open="isSelectTypeModalOpen"
      @close="closeSelectTypeModal"
      @select="selectSaleType"
    />

    <BlocksKSaleModal
      :is-open="isSaleModalOpen"
      :sale-type="selectedSaleType"
      :sale-data="editingSale"
      @close="closeSaleModal"
      @save="handleSaveSale"
    />

    <SalesReceiptKSaleReceiptModal
      :is-open="isReceiptModalOpen"
      @close="closeReceiptModal"
      @export="handleReceiptExportWrapper"
    />

    <SalesHistoryKSaleHistoryModal
      :is-open="isHistoryModalOpen"
      :sale="historySale"
      @close="closeHistoryModal"
    />

    <BlocksKSaleHistoryTimelineModal
      :is-open="isTimelineModalOpen"
      :history="timelineHistory"
      :loading="timelineLoading"
      @close="closeTimelineModal"
    />
  </LayoutsKPageLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useSaleFilters } from '~/composables/useSaleFilters'
import { useSaleCrud } from '~/composables/useSaleCrud'
import { useSaleModals } from '~/composables/useSaleModals'
import { useSaleHandlers } from '~/composables/useSaleHandlers'

definePageMeta({ middleware: 'auth' })

const { loading, salesData, fetchSales, saveSale, deleteSale, computeSummary } = useSaleCrud()
const {
  isSelectTypeModalOpen,
  isSaleModalOpen,
  isReceiptModalOpen,
  isHistoryModalOpen,
  isTimelineModalOpen,
  selectedSaleType,
  editingSale,
  receiptSale,
  historySale,
  timelineHistory,
  timelineLoading,
  openSelectTypeModal,
  closeSelectTypeModal,
  closeSaleModal,
  openSaleModal,
  openReceiptModal,
  closeReceiptModal,
  openHistoryModal,
  closeHistoryModal,
  openTimelineModal,
  closeTimelineModal,
  setTimelineLoading,
  setTimelineHistory,
  selectSaleType
} = useSaleModals()

const {
  handleWhatsAppShare,
  handleCopySaleInfo,
  handleExport,
  handleReceiptExport,
  fetchTimelineHistory,
  logPageAccess
} = useSaleHandlers()

const activeFilter = ref('todos')

const {
  searchQuery,
  status,
  startDate,
  endDate,
  minValue,
  maxValue,
  filteredSales: filteredByAdvancedFilters,
  clearFilters
} = useSaleFilters(salesData)

const filteredSales = computed(() => {
  const sales = filteredByAdvancedFilters.value || []
  return activeFilter.value === 'todos' 
    ? sales 
    : sales.filter((sale: any) => sale.sale_type === activeFilter.value)
})

const summary = computed(() => computeSummary(salesData.value))

const openNewSaleModal = () => {
  openSelectTypeModal()
}

const generateSaleReceipt = (sale: any) => {
  openReceiptModal(sale)
}

const handleReceiptExportWrapper = async (format: 'image' | 'pdf') => {
  await handleReceiptExport(receiptSale.value, format)
  closeReceiptModal()
}

const editSale = (sale: any) => {
  openSaleModal(sale, sale.sale_type)
}

const handleDelete = async (sale: any) => {
  await deleteSale(sale)
}

const handleSaveSale = async (saleData: any) => {
  const saved = await saveSale(saleData, selectedSaleType.value, editingSale.value)
  if (saved) closeSaleModal()
}

const openHistory = (sale: any) => {
  openHistoryModal(sale)
}

const openSalesTimeline = async () => {
  openTimelineModal()
  setTimelineLoading(true)
  const history = await fetchTimelineHistory()
  setTimelineHistory(history)
  setTimelineLoading(false)
}

onMounted(async () => {
  await fetchSales()
  await logPageAccess()
})
</script>
