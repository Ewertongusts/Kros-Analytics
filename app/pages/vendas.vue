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

    <BlocksKSaleHistoryTimelineModal
      :is-open="isTimelineModalOpen"
      :history="timelineHistory"
      :loading="timelineLoading"
      @close="isTimelineModalOpen = false"
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

// Timeline modal
const isTimelineModalOpen = ref(false)
const timelineHistory = ref<any[]>([])
const timelineLoading = ref(false)

const openSalesTimeline = async () => {
  isTimelineModalOpen.value = true
  timelineLoading.value = true
  
  try {
    const supabase = useSupabaseClient()
    const { data, error } = await supabase
      .from('sale_history')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(200)
    
    if (error) {
      console.error('Erro ao buscar histórico:', error)
      timelineHistory.value = []
    } else {
      timelineHistory.value = data || []
    }
    
    // Registrar visualização do histórico
    const user = useSupabaseUser()
    await supabase.from('sale_history').insert({
      action_type: 'history_viewed',
      description: 'Histórico de vendas visualizado',
      user_id: user.value?.id,
      user_name: user.value?.email?.split('@')[0] || 'Sistema',
      metadata: {
        record_count: timelineHistory.value.length,
        viewed_at: new Date().toISOString()
      }
    })
  } catch (err) {
    console.error('Erro:', err)
    timelineHistory.value = []
  } finally {
    timelineLoading.value = false
  }
}

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
  
  // Registrar acesso à página
  try {
    const supabase = useSupabaseClient()
    const user = useSupabaseUser()
    
    await supabase.from('sale_history').insert({
      action_type: 'page_accessed',
      description: 'Página de Vendas acessada',
      user_id: user.value?.id,
      user_name: user.value?.email?.split('@')[0] || 'Sistema',
      metadata: {
        page: 'vendas',
        accessed_at: new Date().toISOString()
      }
    })
  } catch (err) {
    console.error('Erro ao registrar acesso:', err)
  }
})
</script>
