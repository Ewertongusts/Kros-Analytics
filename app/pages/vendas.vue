<template>
  <LayoutsKPageLayout>
    <UiKSkeleton v-if="loading" type="table" :rows="5" />

    <div v-else class="space-y-4 mb-20 animate-in fade-in duration-700">
      <div class="flex items-center justify-between gap-4">
        <SalesTableKSaleFilterTabs v-model="activeFilter" />
        
        <div class="flex items-center gap-2">
          <button 
            @click="showMetrics = !showMetrics"
            :class="[
              'px-4 py-2.5 rounded-xl border transition-all flex items-center gap-2',
              showMetrics
                ? 'bg-white/10 border-white/20 text-white'
                : 'bg-white/5 border-white/5 text-white/70 hover:text-white hover:border-white/10'
            ]"
            title="Mostrar/Ocultar Indicadores"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="12" y1="2" x2="12" y2="22"></line>
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
            </svg>
            <span class="text-[10px] font-bold uppercase tracking-widest">Indicadores</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" :class="{ 'rotate-180': showMetrics }" class="transition-transform">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </button>
          
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

      <SalesTableKSaleSummaryCards v-if="!loading && showMetrics" :summary="summary" />

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

      <!-- Barra de Ações em Massa -->
      <SalesBatchKSaleBatchActionsBar
        :selected-ids="selectedIds"
        :selected-total="selectedTotal"
        @batch-action="handleBatchAction"
        @clear-selection="clearSelection"
      />

      <SalesTableKSaleTable
        v-if="!loading && filteredSales"
        :key="`sales-${filteredSales.length}-${Date.now()}`"
        :sales="filteredSales"
        :is-all-selected="isAllSelected"
        :selected-ids="selectedIds"
        @toggle-select="toggleSelect"
        @toggle-select-all="toggleSelectAll"
        @edit="editSale"
        @history="openHistory"
        @whatsapp="handleWhatsAppShare"
        @copy="handleCopySaleInfo"
        @report="generateSaleReceipt"
        @delete="handleDelete"
        @mark-paid="handleMarkPaidIndividual"
        @open-client-details="handleOpenClientDetails"
        @open-details="handleOpenSaleDetails"
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

    <ClientsKClientDetailsModal
      :is-open="clientDetailsModal.isOpen"
      :company="clientDetailsModal.company"
      @close="clientDetailsModal.isOpen = false"
      @edit="handleEditClient"
      @toggle-status="handleToggleClientStatus"
    />

    <!-- Card de Detalhes da Venda -->
    <SalesKSaleDetailsCard
      :is-open="saleDetailsModal.isOpen"
      :item-name="saleDetailsModal.sale?.plan_name || saleDetailsModal.sale?.custom_name"
      :item-type="saleDetailsModal.sale?.sale_type"
      :item-description="saleDetailsModal.sale?.custom_description"
      :item-price="saleDetailsModal.sale?.monthly_price || 0"
      :notes="saleDetailsModal.sale?.notes"
      :client-name="saleDetailsModal.sale?.representative_name || saleDetailsModal.sale?.name"
      :sale-value="saleDetailsModal.sale?.monthly_price || 0"
      :payment-status="saleDetailsModal.sale?.payment_status"
      :sale-date="saleDetailsModal.sale?.created_at"
      @close="saleDetailsModal.isOpen = false"
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

const showMetrics = ref(false)

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

const selectedIds = ref<string[]>([])
const isAllSelected = ref(false)

const clientDetailsModal = reactive({
  isOpen: false,
  company: null as any
})

const saleDetailsModal = reactive({
  isOpen: false,
  sale: null as any
})

const selectedTotal = computed(() => {
  return filteredSales.value
    .filter((sale: any) => selectedIds.value.includes(sale.id))
    .reduce((sum: number, sale: any) => sum + (sale.monthly_price || 0), 0)
})

const toggleSelect = (id: string) => {
  const index = selectedIds.value.indexOf(id)
  if (index > -1) {
    selectedIds.value.splice(index, 1)
  } else {
    selectedIds.value.push(id)
  }
  isAllSelected.value = selectedIds.value.length === filteredSales.value.length
}

const toggleSelectAll = () => {
  if (isAllSelected.value) {
    selectedIds.value = []
    isAllSelected.value = false
  } else {
    selectedIds.value = filteredSales.value.map((s: any) => s.id)
    isAllSelected.value = true
  }
}

const clearSelection = () => {
  selectedIds.value = []
  isAllSelected.value = false
}

const handleBatchAction = async (action: string) => {
  const selectedSales = filteredSales.value.filter((s: any) => selectedIds.value.includes(s.id))
  
  switch (action) {
    case 'mark-paid':
      // Marcar como pago
      for (const sale of selectedSales) {
        await saveSale({ ...sale, payment_status: 'paid' }, sale.sale_type, sale)
      }
      clearSelection()
      await fetchSales()
      break
    case 'mark-pending':
      // Marcar como pendente
      for (const sale of selectedSales) {
        await saveSale({ ...sale, payment_status: 'pending' }, sale.sale_type, sale)
      }
      clearSelection()
      await fetchSales()
      break
    case 'whatsapp':
      // Enviar WhatsApp para cada venda
      for (const sale of selectedSales) {
        await handleWhatsAppShare(sale)
      }
      break
    case 'delete':
      // Apagar vendas
      for (const sale of selectedSales) {
        await deleteSale(sale)
      }
      clearSelection()
      await fetchSales()
      break
  }
}

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

const handleMarkPaidIndividual = async (sale: any) => {
  // Se já está pago, voltar para pendente. Se está pendente, marcar como pago
  const newStatus = sale.payment_status === 'paid' ? 'pending' : 'paid'
  const updated = await saveSale({ ...sale, payment_status: newStatus }, sale.sale_type, sale)
  if (updated) {
    // Aguardar um pouco para garantir que os dados foram salvos
    await new Promise(r => setTimeout(r, 500))
    await fetchSales()
  }
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

const handleOpenClientDetails = async (sale: any) => {
  try {
    // Buscar o cliente real pelo name (que é o nome da empresa)
    const supabase = useSupabaseClient()
    const { data: customer, error } = await supabase
      .from('companies')
      .select('*')
      .eq('name', sale.name || sale.representative_name)
      .limit(1)
      .single()
    
    if (error || !customer) {
      console.warn('Cliente não encontrado, usando dados da venda:', error)
      // Fallback: usar dados da venda
      clientDetailsModal.company = {
        id: sale.company_id || sale.id,
        name: sale.name,
        representative_name: sale.representative_name,
        email: sale.email,
        phone: sale.phone,
        whatsapp: sale.whatsapp,
        created_at: sale.created_at,
        updated_at: sale.updated_at,
        is_active: true,
        notes: sale.notes
      }
    } else {
      clientDetailsModal.company = customer
    }
  } catch (err) {
    console.error('Erro ao buscar cliente:', err)
  }
  clientDetailsModal.isOpen = true
}

const handleOpenSaleDetails = (sale: any) => {
  saleDetailsModal.sale = sale
  saleDetailsModal.isOpen = true
}

const handleEditClient = () => {
  // Navegar para página de edição de cliente
  navigateTo(`/clientes`)
}

const handleToggleClientStatus = async () => {
  // Implementar toggle de status do cliente se necessário
  clientDetailsModal.isOpen = false
}
</script>
