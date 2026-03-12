<template>
  <LayoutsKPageLayout>
    <UiKSkeleton v-if="loading" type="table" :rows="5" />

    <div v-else class="space-y-6 mb-20 animate-in fade-in duration-700">
      <BlocksKPageHeader title="Vendas" subtitle="Produtos, Serviços e Projetos Especiais">
        <template #actions>
          <UiKButtonPrimary icon="plus" @click="openNewSaleModal">
            Nova Venda
          </UiKButtonPrimary>
        </template>
      </BlocksKPageHeader>

      <div class="flex justify-center">
        <SalesTableKSaleFilterTabs v-model="activeFilter" />
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
          @export="handleExport"
        />
      </div>

      <SalesTableKSaleTable
        v-if="!loading && filteredSales"
        :key="`sales-${filteredSales.length}`"
        :sales="filteredSales"
        @edit="editSale"
        @history="openHistory"
        @whatsapp="handleWhatsAppShare"
        @copy="copySaleInfo"
        @report="generateSaleReceipt"
        @delete="handleDelete"
      />

      <BlocksKGlobalFooter />
    </div>

    <SalesModalKSaleTypeSelector
      :is-open="isSelectTypeModalOpen"
      @close="isSelectTypeModalOpen = false"
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
      @close="isReceiptModalOpen = false"
      @export="handleReceiptExport"
    />

    <SalesHistoryKSaleHistoryModal
      :is-open="isHistoryModalOpen"
      :sale="historySale"
      @close="isHistoryModalOpen = false"
    />
  </LayoutsKPageLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useSaleActions } from '~/composables/useSaleActions'
import { useSaleFilters } from '~/composables/useSaleFilters'
import { useExport } from '~/composables/useExport'
import { useSaleReceipt } from '~/composables/useSaleReceipt'
import { useSaleCrud } from '~/composables/useSaleCrud'

definePageMeta({ middleware: 'auth' })

const { shareViaWhatsApp, copySaleInfo } = useSaleActions()
const { success } = useToast()
const { exportSales } = useExport()
const { exportAsImage, exportAsPDF } = useSaleReceipt()
const { loading, salesData, fetchSales, saveSale, deleteSale, computeSummary } = useSaleCrud()

// Wrapper para shareViaWhatsApp que recarrega os dados após envio
const handleWhatsAppShare = async (sale: any) => {
  await shareViaWhatsApp(sale)
  await fetchSales() // Recarrega para pegar a data atualizada
}

const activeFilter = ref('todos')
const isSelectTypeModalOpen = ref(false)
const isSaleModalOpen = ref(false)
const isReceiptModalOpen = ref(false)
const isHistoryModalOpen = ref(false)
const selectedSaleType = ref('')
const editingSale = ref<any>(null)
const receiptSale = ref<any>(null)
const historySale = ref<any>(null)

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
  isSelectTypeModalOpen.value = true
}

const handleExport = (format: 'xlsx' | 'csv' | 'pdf') => {
  exportSales(filteredSales.value, format)
  success('Exportação concluída', `Arquivo ${format.toUpperCase()} gerado com sucesso`)
}

const generateSaleReceipt = (sale: any) => {
  receiptSale.value = sale
  isReceiptModalOpen.value = true
}

const handleReceiptExport = async (format: 'image' | 'pdf') => {
  if (!receiptSale.value) return
  
  isReceiptModalOpen.value = false
  
  if (format === 'image') {
    await exportAsImage(receiptSale.value)
  } else {
    await exportAsPDF(receiptSale.value)
  }
  
  receiptSale.value = null
}

const selectSaleType = (type: string) => {
  selectedSaleType.value = type
  isSelectTypeModalOpen.value = false
  isSaleModalOpen.value = true
}

const closeSaleModal = () => {
  isSaleModalOpen.value = false
  selectedSaleType.value = ''
  editingSale.value = null
}

const editSale = (sale: any) => {
  editingSale.value = sale
  selectedSaleType.value = sale.sale_type
  isSaleModalOpen.value = true
}

const handleDelete = async (sale: any) => {
  await deleteSale(sale)
}

const handleSaveSale = async (saleData: any) => {
  const saved = await saveSale(saleData, selectedSaleType.value, editingSale.value)
  if (saved) closeSaleModal()
}

const openHistory = (sale: any) => {
  historySale.value = sale
  isHistoryModalOpen.value = true
}

onMounted(async () => {
  await fetchSales()
})
</script>
