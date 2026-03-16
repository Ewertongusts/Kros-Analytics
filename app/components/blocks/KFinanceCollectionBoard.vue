<template>
  <div class="p-6 rounded-3xl bg-kros-surface dark:bg-[#111112] border border-kros-outline dark:border-[#1F1F21] transition-all">
    <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-6">
      <!-- FILTROS -->
      <BlocksKFinanceCollectionFilters
        :total-count="filteredPayments.length"
        :search-query="searchQuery"
        @update:search-query="searchQuery = $event"
        :selected-tags="selectedTags"
        :tag-definitions="tagDefinitions"
        @toggle-tag="toggleTag"
        @toggle-all-tags="toggleAllTags(tagNames)"
        @clear-tags="clearTags"
        :active-filter="activeFilter"
        @update:active-filter="activeFilter = $event"
        :filter-options="filterOptions"
        :subscription-status-filter="subscriptionStatusFilter"
        @toggle-subscription-status="toggleSubscriptionStatus"
        @clear-subscription-status="clearSubscriptionStatus"
      />

      <!-- BOTÕES DE AÇÃO -->
      <div class="flex items-center gap-2">
        <!-- Toggle View (3 modos) -->
        <div class="flex items-center gap-1 bg-white/[0.02] border border-white/5 rounded-xl p-1">
          <button
            @click="viewMode = 'compact'"
            :class="[
              'p-2 rounded-lg transition-all',
              viewMode === 'compact' ? 'bg-kros-blue text-white' : 'text-white/40 hover:text-white/60'
            ]"
            title="Visualização Compacta"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </button>
          <button
            @click="viewMode = 'normal'"
            :class="[
              'p-2 rounded-lg transition-all',
              viewMode === 'normal' ? 'bg-kros-blue text-white' : 'text-white/40 hover:text-white/60'
            ]"
            title="Visualização Normal"
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

        <button 
          @click="rememberPreferences = !rememberPreferences"
          class="p-3 bg-white/5 hover:bg-white/10 rounded-lg transition-all border border-transparent hover:border-white/10"
          :class="rememberPreferences ? 'text-kros-blue' : 'text-white/30 hover:text-white'"
          title="Memorizar Preferências"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
            <polyline points="17 21 17 13 7 13 7 21"></polyline>
            <polyline points="7 3 7 8 15 8"></polyline>
          </svg>
        </button>
        
        <button 
          @click="$emit('export')"
          class="p-3 bg-white/5 hover:bg-white/10 text-white/30 hover:text-white rounded-lg transition-all border border-transparent hover:border-white/10"
          title="Exportar"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
        </button>
        
        <button 
          @click="$emit('config')"
          class="p-3 bg-white/5 hover:bg-white/10 text-white/30 hover:text-white rounded-lg transition-all border border-transparent hover:border-white/10"
          title="Gerenciar Empresas"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
        </button>
        <button 
          @click="$emit('sync')"
          class="p-3 bg-white/5 hover:bg-white/10 text-white/30 hover:text-white rounded-lg transition-all border border-transparent hover:border-white/10"
          title="Sincronizar Dados"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/><path d="M22 3v5h-5"/></svg>
        </button>
      </div>
    </div>

    <!-- Seleção em Massa - Linha Separada -->
    <BlocksKFinanceBatchActionsBar
      :selected-ids="selectedIds"
      :selected-total="selectedTotal"
      :tag-definitions="tagDefinitions"
      @batch-action="batchAction"
      @add-tag-batch="handleAddTagBatch"
      @remove-tag-batch="handleRemoveTagBatch"
      @remove-all-tags-batch="handleRemoveAllTagsBatch"
      @clear-selection="clearSelection"
    />

    <!-- Tabela (modos compact e normal) -->
    <div v-if="viewMode !== 'cards'" class="overflow-x-auto overflow-y-visible no-scrollbar">
      <table class="w-full min-w-[1000px] text-left border-separate" :class="viewMode === 'compact' ? 'border-spacing-y-1' : 'border-spacing-y-3'">
        <FinanceCollectionKCollectionTableHeader
          :is-compact="viewMode === 'compact'"
          :is-all-selected="isAllSelected"
          :sort-column="sortColumn"
          :sort-direction="sortDirection"
          @toggle-select-all="toggleSelectAll"
          @sort="handleSort"
        />
        <tbody>
          <BlocksKFinanceCollectionTableRow 
            v-for="payment in paginatedPayments" 
            :key="payment.id"
            :payment="payment"
            :is-compact="viewMode === 'compact'"
            :is-selected="selectedIds.includes(payment.id)"
            :tag-definitions="tagDefinitions"
            @toggle-select="toggleSelect"
            @edit="handleEdit"
            @toggle-status="$emit('toggle-status', $event)"
            @toggle-autobilling="toggleAutoBilling"
            @open-msg-modal="openMsgModal"
            @open-logs="$emit('open-logs', $event)"
            @open-history="$emit('open-history', $event)"
            @delete="handleDelete"
            @update-subscription-status="(data) => handleUpdateSubscriptionStatus(data)"
            @open-client-details="$emit('open-client-details', $event)"
            @open-plan-details="handleOpenPlanDetails"
            @update-tags="handleUpdateTags"
            @open-alert-details="handleOpenAlertDetails"
          />
        </tbody>
      </table>
    </div>

    <!-- Cards -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
      <FinanceCollectionKCollectionCard
        v-for="payment in paginatedPayments"
        :key="payment.id"
        :payment="payment"
        :is-selected="selectedIds.includes(payment.id)"
        :tag-definitions="tagDefinitions"
        @toggle-select="toggleSelect"
        @open-client-details="$emit('open-client-details', $event)"
        @edit="handleEdit"
        @open-msg-modal="openMsgModal"
        @toggle-status="$emit('toggle-status', $event)"
        @toggle-autobilling="toggleAutoBilling"
        @open-logs="$emit('open-logs', $event)"
        @open-history="$emit('open-history', $event)"
        @update-subscription-status="(data) => handleUpdateSubscriptionStatus(data)"
        @delete="handleDelete"
      />
    </div>

    <!-- Paginação -->
    <div v-if="totalPages > 1" class="flex items-center justify-between mt-6 px-2">
      <!-- Info da paginação -->
      <div class="flex items-center gap-3">
        <div class="text-[10px] font-bold text-white/50 uppercase tracking-widest">
          Página {{ currentPage }} de {{ totalPages }}
        </div>
        <div class="h-4 w-px bg-white/10"></div>
        <div class="text-[10px] font-bold text-white/70 uppercase tracking-widest">
          {{ filteredPayments.length }} registros
        </div>
      </div>
      
      <!-- Controles de navegação -->
      <div class="flex items-center gap-2">
        <!-- Botão Anterior -->
        <button 
          @click="prevPage"
          :disabled="!hasPrevPage"
          class="group flex items-center gap-2 px-4 py-2.5 bg-white/[0.03] hover:bg-white/[0.08] disabled:opacity-30 disabled:cursor-not-allowed rounded-xl border border-white/5 hover:border-white/10 transition-all"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="text-white/50 group-hover:text-white transition-colors">
            <path d="m15 18-6-6 6-6"/>
          </svg>
          <span class="text-[10px] font-bold text-white/50 group-hover:text-white uppercase tracking-widest transition-colors">
            Anterior
          </span>
        </button>
        
        <!-- Números das páginas -->
        <div class="flex items-center gap-1">
          <!-- Primeira página -->
          <button 
            v-if="currentPage > 3"
            @click="goToPage(1)"
            class="w-10 h-10 flex items-center justify-center bg-white/[0.03] hover:bg-white/[0.08] text-white/50 hover:text-white rounded-xl border border-white/5 hover:border-white/10 transition-all"
          >
            <span class="text-[11px] font-bold">1</span>
          </button>
          
          <!-- Reticências início -->
          <div v-if="currentPage > 4" class="px-2 text-white/30 text-[11px]">...</div>
          
          <!-- Páginas próximas -->
          <button 
            v-for="page in getVisiblePages()" 
            :key="page"
            @click="goToPage(page)"
            :class="[
              'w-10 h-10 flex items-center justify-center rounded-xl border transition-all',
              page === currentPage 
                ? 'bg-kros-blue border-kros-blue text-white shadow-lg shadow-kros-blue/20' 
                : 'bg-white/[0.03] hover:bg-white/[0.08] border-white/5 hover:border-white/10 text-white/50 hover:text-white'
            ]"
          >
            <span class="text-[11px] font-bold">{{ page }}</span>
          </button>
          
          <!-- Reticências fim -->
          <div v-if="currentPage < totalPages - 3" class="px-2 text-white/30 text-[11px]">...</div>
          
          <!-- Última página -->
          <button 
            v-if="currentPage < totalPages - 2 && totalPages > 5"
            @click="goToPage(totalPages)"
            :class="[
              'w-10 h-10 flex items-center justify-center rounded-xl border transition-all',
              totalPages === currentPage 
                ? 'bg-kros-blue border-kros-blue text-white shadow-lg shadow-kros-blue/20' 
                : 'bg-white/[0.03] hover:bg-white/[0.08] border-white/5 hover:border-white/10 text-white/50 hover:text-white'
            ]"
          >
            <span class="text-[11px] font-bold">{{ totalPages }}</span>
          </button>
        </div>
        
        <!-- Botão Próxima -->
        <button 
          @click="nextPage"
          :disabled="!hasNextPage"
          class="group flex items-center gap-2 px-4 py-2.5 bg-white/[0.03] hover:bg-white/[0.08] disabled:opacity-30 disabled:cursor-not-allowed rounded-xl border border-white/5 hover:border-white/10 transition-all"
        >
          <span class="text-[10px] font-bold text-white/50 group-hover:text-white uppercase tracking-widest transition-colors">
            Próxima
          </span>
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="text-white/50 group-hover:text-white transition-colors">
            <path d="m9 18 6-6-6-6"/>
          </svg>
        </button>
      </div>
    </div>

    <div v-if="payments.length === 0" class="flex flex-col items-center justify-center py-20 opacity-60">
       <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="mb-4"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="m9 12 2 2 4-4"/></svg>
       <p class="font-bold uppercase tracking-widest text-[10px] text-white/60">Nenhum pagamento registrado</p>
    </div>

    <!-- Modal de Envio via API HTTP -->
    <BlocksKFinanceSendMsgModal 
      v-if="isMsgModalOpen"
      :is-open="isMsgModalOpen"
      :payment="selectedPayment"
      @close="isMsgModalOpen = false"
      @sent="handleMessageSent"
    />

    <!-- Modal de Envio em Massa via API HTTP -->
    <BlocksKFinanceBatchMsgModal 
      v-if="isBatchMsgModalOpen"
      :is-open="isBatchMsgModalOpen"
      :payments="selectedPaymentsForBatch"
      @close="isBatchMsgModalOpen = false"
      @sent="handleBatchSent"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import { useTags } from '~/composables/useTags'
import { useCollectionFilters } from '~/composables/useCollectionFilters'
import { useCollectionSelection } from '~/composables/useCollectionSelection'
import { useCollectionBatchActions } from '~/composables/useCollectionBatchActions'
import { useViewPreferences } from '~/composables/useViewPreferences'
import { isValidWhatsApp } from '~/utils/validators'

const { confirm } = useToast()

const props = defineProps<{
  payments: any[],
  activeSubTab: string
}>()

const emit = defineEmits(['toggle-status', 'toggle-autobilling', 'batch-autobilling', 'batch-delete', 'delete-success', 'edit-subscription', 'open-logs', 'open-history', 'update:activeSubTab', 'sync', 'config', 'export', 'open-client-details', 'open-plan-details', 'update-payments', 'open-alert-details'])

const handleExportDebug = (format: any) => {
  emit('export', format)
}

const isMsgModalOpen = ref(false)
const selectedPayment = ref<any>(null)
const { tags: tagDefinitions, fetchTags } = useTags()
const { viewMode, rememberPreferences, isLoaded, loadPreferences, searchQuery, selectedTags, activeFilter, subscriptionStatusFilter, savePreferences } = useViewPreferences()

// Computed para nomes das tags
const tagNames = computed(() => {
  console.log('📊 [KFinanceCollectionBoard] tagNames computed - tags:', tagDefinitions.value?.length || 0)
  return tagDefinitions.value?.map(t => t.name) || []
})

// Composables - passar refs do useViewPreferences para compartilhar estado
const {
  sortColumn,
  sortDirection,
  filterOptions,
  filteredPayments,
  paginatedPayments,
  currentPage,
  totalPages,
  hasNextPage,
  hasPrevPage,
  toggleTag,
  toggleAllTags,
  clearTags,
  toggleSubscriptionStatus,
  clearSubscriptionStatus,
  handleSort,
  nextPage,
  prevPage,
  goToPage,
  resetPage
} = useCollectionFilters(props.payments, { activeFilter, selectedTags, subscriptionStatusFilter, searchQuery })

const {
  selectedIds,
  isAllSelected,
  selectedTotal,
  toggleSelectAll,
  toggleSelect,
  clearSelection,
  getSelectedPayments,
  validateWhatsAppForBatch
} = useCollectionSelection(() => props.payments, paginatedPayments)

const {
  isBatchMsgModalOpen,
  isBatchPaidModalOpen,
  isBatchPendingModalOpen,
  selectedPaymentsForBatch,
  openBatchMsgModal,
  openBatchPaidModal,
  openBatchPendingModal,
  closeBatchModals
} = useCollectionBatchActions()

const batchAction = async (type: string) => {
  const selectedPayments = getSelectedPayments()
  
  console.log('=== DEBUG BATCH ACTION ===')
  console.log('Tipo:', type)
  console.log('IDs selecionados:', selectedIds.value)
  console.log('Total de payments no props:', props.payments.length)
  console.log('Pagamentos selecionados encontrados:', selectedPayments.length)
  console.log('Pagamentos selecionados:', selectedPayments)
  console.log('========================')
  
  if (selectedPayments.length === 0) {
    const { error } = useToast()
    error('Nenhum item selecionado', 'Selecione ao menos um item para continuar')
    return
  }
  
  if (type === 'mark-paid') {
    openBatchPaidModal(selectedPayments)
  } else if (type === 'mark-pending') {
    openBatchPendingModal(selectedPayments)
  } else if (type === 'whatsapp-api') {
    const validatedPayments = await validateWhatsAppForBatch(selectedPayments)
    if (validatedPayments) {
      openBatchMsgModal(validatedPayments)
    }
  } else if (type === 'auto-billing-on') {
    console.log('Emitindo evento batch-delete com', selectedPayments.length, 'assinaturas')
    emit('batch-delete', selectedPayments)
    clearSelection()
  }
}

const handleDelete = async (payment: any) => {
  console.log('🗑️ [handleDelete] Payment recebido:', payment)
  console.log('🗑️ [handleDelete] Payment ID:', payment.id)
  console.log('🗑️ [handleDelete] Payment company_name:', payment.company_name)
  
  const confirmed = await confirm(
    `Deseja excluir a assinatura de ${payment.company_name}? Esta ação não pode ser desfeita.`,
    'Excluir Assinatura'
  )
  if (!confirmed) {
    console.log('🗑️ [handleDelete] Exclusão cancelada pelo usuário')
    return
  }
  
  try {
    const supabase = useSupabaseClient()
    const user = useSupabaseUser()
    
    console.log('🗑️ [handleDelete] Iniciando exclusão da assinatura:', payment.id)
    
    // 1. Deletar pagamentos relacionados PRIMEIRO
    console.log('🗑️ [handleDelete] Deletando pagamentos relacionados...')
    const { error: paymentsError } = await supabase
      .from('payments')
      .delete()
      .eq('company_id', payment.company_id)
    
    if (paymentsError) {
      console.error('❌ [handleDelete] Erro ao deletar pagamentos:', paymentsError)
      throw paymentsError
    }
    
    console.log('✅ [handleDelete] Pagamentos deletados')
    
    // 2. Excluir assinatura da tabela subscriptions
    const { error } = await supabase
      .from('subscriptions')
      .delete()
      .eq('id', payment.id)
    
    if (error) {
      console.error('❌ [handleDelete] Erro ao excluir:', error)
      throw error
    }
    
    console.log('✅ [handleDelete] Assinatura excluída com sucesso')
    
    // Registrar no histórico
    const { error: historyError } = await supabase.from('payment_history').insert({
      payment_id: payment.id,
      company_id: payment.company_id,
      action_type: 'subscription_deleted',
      description: `Assinatura de ${payment.company_name} foi excluída (${payment.plan_name} - R$ ${payment.amount})`,
      user_id: user.value?.id,
      user_name: user.value?.email?.split('@')[0] || 'Sistema',
      metadata: {
        amount: payment.amount,
        plan_name: payment.plan_name,
        start_date: payment.start_date,
        status: payment.status,
        company_name: payment.company_name
      }
    })
    
    if (historyError) {
      console.error('⚠️ [handleDelete] Erro ao registrar no histórico:', historyError)
    }
    
    const { success } = useToast()
    success('Assinatura excluída', `Assinatura de ${payment.company_name} foi removida`)
    
    console.log('🔄 [handleDelete] Emitindo evento delete-success com ID:', payment.id)
    // Emitir evento com o ID para remover do array local
    emit('delete-success', payment.id)
  } catch (err: any) {
    console.error('❌ [handleDelete] Erro ao excluir assinatura:', err)
    const { error: errorToast } = useToast()
    errorToast('Erro ao excluir', err.message)
  }
}

const handleEdit = (payment: any) => {
  console.log('Editando assinatura:', payment)
  emit('edit-subscription', payment)
}

const handleOpenPlanDetails = (payment: any) => {
  emit('open-plan-details', payment)
}

const handleOpenAlertDetails = (payment: any) => {
  console.log('📅 [handleOpenAlertDetails] Abrindo detalhes do alerta:', payment.last_alert_at)
  // Por enquanto, apenas emitir o evento para a página pai
  emit('open-alert-details', payment)
}

onMounted(async () => {
  console.log('🚀 [KFinanceCollectionBoard] onMounted iniciado')
  await fetchTags()
  console.log('✅ [KFinanceCollectionBoard] Tags carregadas:', tagDefinitions.value?.length || 0)
  loadPreferences()
})

// Watchers para salvar filtros automaticamente quando rememberPreferences está ativo
watch([searchQuery, selectedTags, activeFilter, subscriptionStatusFilter, viewMode, rememberPreferences], () => {
  if (rememberPreferences.value && isLoaded.value) {
    const prefs = useViewPreferences()
    prefs.savePreferences()
  }
}, { deep: true })

const openMsgModal = (payment: any) => {
  console.log(`📱 [KFinanceCollectionBoard.openMsgModal] Payment:`, payment)
  console.log(`📱 [KFinanceCollectionBoard.openMsgModal] WhatsApp: "${payment.company_whatsapp}"`)
  
  if (!isValidWhatsApp(payment.company_whatsapp)) {
    console.log(`❌ [KFinanceCollectionBoard.openMsgModal] WhatsApp inválido!`)
    alert('Empresa sem WhatsApp válido cadastrado. Não será possível enviar mensagem.')
    return
  }
  
  console.log(`✅ [KFinanceCollectionBoard.openMsgModal] WhatsApp válido, abrindo modal`)
  selectedPayment.value = payment
  isMsgModalOpen.value = true
}

const handleMessageSent = () => {
  isMsgModalOpen.value = false
  emit('sync')
}

const handleBatchSent = () => {
  closeBatchModals()
  clearSelection()
  emit('sync')
}

const toggleAutoBilling = (payment: any) => {
  emit('toggle-autobilling', payment)
}

const handleUpdateSubscriptionStatus = async (data: { id: string, status: string }) => {
  console.log('🔄 [KFinanceCollectionBoard] handleUpdateSubscriptionStatus:', data)
  
  try {
    const supabase = useSupabaseClient()
    const user = useSupabaseUser()
    
    // Encontrar a assinatura para obter dados adicionais
    const subscription = props.payments.find(p => p.id === data.id)
    if (!subscription) {
      console.error('Assinatura não encontrada:', data.id)
      return
    }
    
    // Atualizar status na tabela subscriptions
    const { error } = await supabase
      .from('subscriptions')
      .update({ status: data.status })
      .eq('id', data.id)
    
    if (error) throw error
    
    console.log('✅ Status atualizado para:', data.status)
    
    // Registrar no histórico
    await supabase.from('payment_history').insert({
      payment_id: data.id,
      company_id: subscription.company_id,
      action_type: 'subscription_status_changed',
      description: `Status da assinatura alterado para: ${data.status}`,
      user_id: user.value?.id,
      user_name: user.value?.email?.split('@')[0] || 'Sistema',
      metadata: {
        old_status: subscription.status,
        new_status: data.status,
        company_name: subscription.company_name,
        plan_name: subscription.plan_name
      }
    })
    
    // Emitir evento para sincronizar dados
    emit('sync')
  } catch (err: any) {
    console.error('❌ Erro ao atualizar status:', err)
    const { error: errorToast } = useToast()
    errorToast('Erro ao atualizar', err.message)
  }
}

const handleUpdateTags = (data: { id: string, tags: string[] }) => {
  console.log('🏷️ [KFinanceCollectionBoard] handleUpdateTags:', data)
  
  // Encontrar o índice do pagamento
  const index = props.payments.findIndex(p => p.id === data.id)
  if (index !== -1) {
    // Criar um novo objeto com as tags atualizadas
    const updatedPayment = {
      ...props.payments[index],
      tags: data.tags
    }
    
    // Criar um novo array para forçar reatividade
    const newPayments = [...props.payments]
    newPayments[index] = updatedPayment
    
    // Emitir evento para o pai atualizar o array
    emit('update-payments', newPayments)
  }
}

const handleAddTagBatch = async (tagName: string) => {
  console.log('🏷️ [handleAddTagBatch] Adicionando tag', tagName, 'para', selectedIds.value.length, 'itens')
  
  const selectedPayments = getSelectedPayments()
  if (selectedPayments.length === 0) return
  
  try {
    const supabase = useSupabaseClient()
    const user = useSupabaseUser()
    
    // Atualizar tags para cada pagamento selecionado
    for (let i = 0; i < selectedPayments.length; i++) {
      const payment = selectedPayments[i]
      const currentTags = payment.tags || []
      
      // Adicionar tag se não existir
      if (!currentTags.includes(tagName)) {
        const newTags = [...currentTags, tagName]
        
        // Atualizar na tabela companies
        await supabase
          .from('companies')
          .update({ tags: newTags } as any)
          .eq('id', payment.company_id)
        
        // Atualizar no array local
        const index = props.payments.findIndex(p => p.id === payment.id)
        if (index !== -1) {
          props.payments[index].tags = newTags
        }
      }
    }
    
    // Registrar no histórico
    await supabase.from('payment_history').insert({
      action_type: 'batch_tags_added',
      description: `Tag "${tagName}" adicionada para ${selectedPayments.length} assinatura(s)`,
      user_id: user.value?.id,
      user_name: user.value?.email?.split('@')[0] || 'Sistema',
      metadata: {
        tag_name: tagName,
        count: selectedPayments.length,
        company_ids: selectedPayments.map(p => p.company_id)
      }
    } as any)
    
    const { success } = useToast()
    success('Tags adicionadas', `Tag "${tagName}" adicionada para ${selectedPayments.length} assinatura(s)`)
    
    clearSelection()
    emit('sync')
  } catch (err: any) {
    console.error('❌ Erro ao adicionar tags:', err)
    const { error } = useToast()
    error('Erro ao adicionar tags', err.message)
  }
}

const handleRemoveTagBatch = async (tagName: string) => {
  console.log('🏷️ [handleRemoveTagBatch] Removendo tag', tagName, 'de', selectedIds.value.length, 'itens')
  
  const selectedPayments = getSelectedPayments()
  if (selectedPayments.length === 0) return
  
  try {
    const supabase = useSupabaseClient()
    const user = useSupabaseUser()
    
    // Remover tag de cada pagamento selecionado
    for (let i = 0; i < selectedPayments.length; i++) {
      const payment = selectedPayments[i]
      const currentTags = payment.tags || []
      
      // Remover tag se existir
      if (currentTags.includes(tagName)) {
        const newTags = currentTags.filter((t: string) => t !== tagName)
        
        // Atualizar na tabela companies
        await supabase
          .from('companies')
          .update({ tags: newTags } as any)
          .eq('id', payment.company_id)
        
        // Atualizar no array local
        const index = props.payments.findIndex(p => p.id === payment.id)
        if (index !== -1) {
          props.payments[index].tags = newTags
        }
      }
    }
    
    // Registrar no histórico
    await supabase.from('payment_history').insert({
      action_type: 'batch_tags_removed',
      description: `Tag "${tagName}" removida de ${selectedPayments.length} assinatura(s)`,
      user_id: user.value?.id,
      user_name: user.value?.email?.split('@')[0] || 'Sistema',
      metadata: {
        tag_name: tagName,
        count: selectedPayments.length,
        company_ids: selectedPayments.map(p => p.company_id)
      }
    } as any)
    
    const { success } = useToast()
    success('Tags removidas', `Tag "${tagName}" removida de ${selectedPayments.length} assinatura(s)`)
    
    clearSelection()
    emit('sync')
  } catch (err: any) {
    console.error('❌ Erro ao remover tags:', err)
    const { error } = useToast()
    error('Erro ao remover tags', err.message)
  }
}

const handleRemoveAllTagsBatch = async () => {
  console.log('🏷️ [handleRemoveAllTagsBatch] Removendo TODAS as tags de', selectedIds.value.length, 'itens')
  
  const selectedPayments = getSelectedPayments()
  if (selectedPayments.length === 0) return
  
  try {
    const supabase = useSupabaseClient()
    const user = useSupabaseUser()
    
    // Remover todas as tags de cada pagamento selecionado
    for (let i = 0; i < selectedPayments.length; i++) {
      const payment = selectedPayments[i]
      
      // Atualizar na tabela companies
      await supabase
        .from('companies')
        .update({ tags: [] } as any)
        .eq('id', payment.company_id)
      
      // Atualizar no array local
      const index = props.payments.findIndex(p => p.id === payment.id)
      if (index !== -1) {
        props.payments[index].tags = []
      }
    }
    
    // Registrar no histórico
    await supabase.from('payment_history').insert({
      action_type: 'batch_tags_cleared',
      description: `Todas as tags removidas de ${selectedPayments.length} assinatura(s)`,
      user_id: user.value?.id,
      user_name: user.value?.email?.split('@')[0] || 'Sistema',
      metadata: {
        count: selectedPayments.length,
        company_ids: selectedPayments.map(p => p.company_id)
      }
    } as any)
    
    const { success } = useToast()
    success('Tags removidas', `Todas as tags removidas de ${selectedPayments.length} assinatura(s)`)
    
    clearSelection()
    emit('sync')
  } catch (err: any) {
    console.error('❌ Erro ao remover todas as tags:', err)
    const { error } = useToast()
    error('Erro ao remover tags', err.message)
  }
}

// Função para calcular páginas visíveis
const getVisiblePages = () => {
  const pages = []
  const start = Math.max(1, currentPage.value - 2)
  const end = Math.min(totalPages.value, currentPage.value + 2)
  
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  
  return pages
}

// Reset página quando filtros mudarem
watch([activeFilter, searchQuery, subscriptionStatusFilter], () => {
  resetPage()
})
</script>

<style scoped>
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
