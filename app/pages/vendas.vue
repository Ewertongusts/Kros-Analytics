<template>
  <LayoutsKPageLayout>
    <UiKSkeleton v-if="loading" type="table" :rows="5" />

    <div v-else class="space-y-4 mb-20 animate-in fade-in duration-700">
      <!-- Header com Tabs e Botão Nova Venda -->
      <div class="flex items-center justify-between gap-4 mb-6">
        <div class="flex items-center gap-2 border-b border-white/10">
          <button
            v-for="tab in ['todos', 'produto', 'servico']"
            :key="tab"
            @click="activeFilter = tab"
            :class="[
              'px-4 py-3 font-bold text-xs uppercase tracking-widest transition-all border-b-2',
              activeFilter === tab
                ? 'border-b-2 transition-colors'
                : 'text-white/50 border-transparent hover:text-white'
            ]"
            :style="activeFilter === tab ? { color: `var(--kros-blue, #FF0000)`, borderColor: `var(--kros-blue, #FF0000)` } : {}"
          >
            {{ tab === 'todos' ? 'Todos' : tab === 'produto' ? 'Produtos' : 'Serviços' }}
          </button>
        </div>

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

      <!-- Cards de Indicadores -->
      <div v-if="showMetrics" class="mb-6">
        <SalesTableKSaleSummaryCards :summary="summary" />
      </div>

      <!-- Filtros em linha única com botões de visualização -->
      <div class="flex items-center gap-3 flex-wrap">
        <!-- Busca -->
        <div class="flex-1 min-w-[200px] max-w-[300px]">
          <label class="block text-[8px] font-bold text-white/50 uppercase tracking-widest mb-1.5">Buscar</label>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Buscar venda..."
            class="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-white/20 text-[10px]"
          />
        </div>

        <!-- Status -->
        <div>
          <label class="block text-[8px] font-bold text-white/50 uppercase tracking-widest mb-1.5">Status</label>
          <select
            v-model="status"
            class="px-4 py-2.5 bg-[#1a1a1b] border border-white/10 rounded-xl text-white focus:outline-none focus:border-white/20 text-[10px] font-bold uppercase tracking-widest"
          >
            <option value="">Todos Status</option>
            <option value="pending">Pendente</option>
            <option value="paid">Pago</option>
          </select>
        </div>

        <!-- Data Início -->
        <div>
          <label class="block text-[8px] font-bold text-white/50 uppercase tracking-widest mb-1.5">Início</label>
          <input
            v-model="startDate"
            type="date"
            class="px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-white/20 text-[10px]"
          />
        </div>

        <!-- Data Fim -->
        <div>
          <label class="block text-[8px] font-bold text-white/50 uppercase tracking-widest mb-1.5">Fim</label>
          <input
            v-model="endDate"
            type="date"
            class="px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-white/20 text-[10px]"
          />
        </div>

        <!-- Botão Limpar -->
        <div class="self-end">
          <button
            @click="clearFilters"
            class="px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white/70 hover:text-white transition-all text-[10px] font-bold uppercase tracking-widest"
          >
            Limpar
          </button>
        </div>

        <!-- Espaçador flexível -->
        <div class="flex-1"></div>

        <!-- Botões de Ação (alinhados ao final) -->
        <div class="flex items-center gap-2 self-end">
          <!-- Toggle View -->
          <div class="flex items-center gap-1 bg-white/[0.02] border border-white/5 rounded-xl p-1">
            <button
              @click="viewMode = 'list'"
              :class="[
                'p-2 rounded-lg transition-all',
                viewMode === 'list' ? 'bg-kros-blue text-white' : 'text-white/40 hover:text-white/60'
              ]"
              title="Visualização em Lista"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
            </button>
            <button
              @click="viewMode = 'cards'"
              :class="[
                'p-2 rounded-lg transition-all',
                viewMode === 'cards' ? 'bg-kros-blue text-white' : 'text-white/40 hover:text-white/60'
              ]"
              title="Visualização em Cards"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
            </button>
          </div>

          <!-- Memorizar Preferências -->
          <button 
            @click="rememberPreferences = !rememberPreferences"
            class="p-2.5 bg-white/5 hover:bg-white/10 rounded-xl transition-all border border-transparent hover:border-white/10"
            :class="rememberPreferences ? 'text-kros-blue' : 'text-white/30 hover:text-white'"
            title="Memorizar Preferências"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
              <polyline points="17 21 17 13 7 13 7 21"></polyline>
              <polyline points="7 3 7 8 15 8"></polyline>
            </svg>
          </button>

          <UiKExportDropdown 
            :disabled="filteredSales.length === 0"
            @export="(format) => handleExport(filteredSales, format)"
          />
        </div>
      </div>

      <!-- Barra de Ações em Massa -->
      <SalesBatchKSaleBatchActionsBar
        v-if="selectedIds.length > 0"
        :selected-ids="selectedIds"
        :selected-total="selectedTotal"
        @batch-action="handleBatchAction"
        @clear-selection="clearSelection"
      />

      <!-- Tabela ou Cards -->
      <SalesTableKSaleTable
        v-if="viewMode === 'list' && !loading && filteredSales"
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

      <!-- Cards -->
      <div v-else-if="viewMode === 'cards' && !loading && filteredSales" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <SalesKSaleCard
          v-for="sale in filteredSales"
          :key="sale.id"
          :sale="sale"
          :is-selected="selectedIds.includes(sale.id)"
          @toggle-select="toggleSelect"
          @edit="editSale"
          @mark-paid="handleMarkPaidIndividual"
          @whatsapp="handleWhatsAppShare"
          @delete="handleDelete"
          @open-client-details="handleOpenClientDetails"
          @open-details="handleOpenSaleDetails"
        />
      </div>
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
      @refresh-sales="async () => { console.log('📡 [vendas.vue] Evento refresh-sales recebido, chamando fetchSales()'); await fetchSales() }"
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
import { ref, computed, onMounted, watch } from 'vue'
import { useSaleFilters } from '~/composables/useSaleFilters'
import { useSaleCrud } from '~/composables/useSaleCrud'
import { useSaleModals } from '~/composables/useSaleModals'
import { useSaleHandlers } from '~/composables/useSaleHandlers'
import { useSalesViewPreferences } from '~/composables/useSalesViewPreferences'

definePageMeta({ middleware: 'auth' })

const showMetrics = ref(false)
const { viewMode, rememberPreferences, isLoaded, loadPreferences, savePreferences } = useSalesViewPreferences()

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
  loadPreferences()
  await fetchSales()
  await logPageAccess()
})

// Salvar preferências automaticamente quando mudar
watch([viewMode, rememberPreferences, searchQuery, status, startDate, endDate, activeFilter], () => {
  if (rememberPreferences.value && isLoaded.value) {
    savePreferences({
      viewMode: viewMode.value,
      rememberPreferences: rememberPreferences.value,
      searchQuery: searchQuery.value,
      status: status.value,
      startDate: startDate.value,
      endDate: endDate.value,
      activeFilter: activeFilter.value
    })
  }
}, { deep: true })

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

const handleEditClient = () => {
  // Navegar para página de edição de cliente
  navigateTo(`/clientes`)
}

const handleToggleClientStatus = async () => {
  // Implementar toggle de status do cliente se necessário
  clientDetailsModal.isOpen = false
}

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)
}
</script>
