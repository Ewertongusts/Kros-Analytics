<template>
  <div class="p-6 rounded-3xl bg-kros-surface dark:bg-[#111112] border border-kros-outline dark:border-[#1F1F21] group hover:border-kros-blue/5 transition-all">
    <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-6">
      <!-- TABS INTEGRADAS -->
      <BlocksKFinanceTabsHeader 
        :active-sub-tab="activeSubTab"
        @update:active-sub-tab="$emit('update:activeSubTab', $event)"
      />

      <!-- FILTROS -->
      <BlocksKFinanceCollectionFilters
        :total-count="filteredPayments.length"
        :search-query="searchQuery"
        @update:search-query="searchQuery = $event"
        :selected-tags="selectedTags"
        :tag-definitions="tagDefinitions"
        @toggle-tag="toggleTag"
        @toggle-all-tags="toggleAllTags"
        @clear-tags="selectedTags = []"
        :active-filter="activeFilter"
        @update:active-filter="activeFilter = $event"
        :filter-options="filterOptions"
        :is-compact="isCompact"
        @toggle-compact="isCompact = !isCompact"
        @config="$emit('config')"
        @sync="$emit('sync')"
      />
    </div>

    <!-- Seleção em Massa - Linha Separada -->
    <div v-if="selectedIds.length > 0" class="mb-6 animate-in fade-in slide-in-from-top-2 duration-300">
      <div class="flex items-center justify-between gap-4 px-4 py-3 bg-white/[0.02] rounded-xl border border-white/10">
        <div class="flex items-center gap-4">
          <div class="flex items-center gap-2">
            <span class="text-[10px] font-black text-white/70 uppercase tracking-widest">{{ selectedIds.length }} selecionados</span>
            <span class="text-[11px] font-black text-white uppercase tracking-widest">{{ formatCurrency(selectedTotal) }}</span>
          </div>
          
          <div class="h-6 w-px bg-white/10"></div>
          
          <div class="flex items-center gap-2">
            <button 
              @click="batchAction('mark-paid')"
              class="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white rounded-lg transition-all flex items-center gap-2"
              title="Marcar como Pago em Massa"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
              <span class="text-[9px] font-bold uppercase tracking-wider">Marcar Pago</span>
            </button>
            
            <button 
              @click="batchAction('mark-pending')"
              class="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white rounded-lg transition-all flex items-center gap-2"
              title="Estornar Pagamentos em Massa"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
              <span class="text-[9px] font-bold uppercase tracking-wider">Estornar</span>
            </button>
            
            <button 
              @click="batchAction('whatsapp-api')"
              class="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white rounded-lg transition-all flex items-center gap-2"
              title="Cobrar Selecionados (WhatsApp Template)"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 448 512" fill="currentColor"><path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l115.3-30.2c32.4 17.7 68.8 27 108.6 27 122.4 0 222-99.6 222-222 0-59.3-23-115.1-65-157.1zM223.9 446.7c-33.1 0-65.6-8.9-93.9-25.7l-6.7-4-69.8 18.3 18.7-68.1-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 54 81.2 54.1 130.5 0 101.7-82.8 184.5-184.6 184.5zm100.5-137c-5.5-2.8-32.6-16.1-37.7-17.9-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-5.5-2.8-23.2-8.5-44.2-27.2-16.4-14.6-27.4-32.7-30.6-38.2-3.2-5.6-.3-8.6 2.5-11.3 2.5-2.5 5.5-6.5 8.3-9.7 2.8-3.2 3.7-5.5 5.6-9.2 1.9-3.7 1-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 13.2 5.7 23.5 9.2 31.6 11.8 13.3 4.2 25.4 3.6 35 2.2 10.7-1.6 32.6-13.3 37.2-26.2 4.6-12.9 4.6-24 3.2-26.2-1.4-2.3-5.1-3.7-10.6-6.5z"/></svg>
              <span class="text-[9px] font-bold uppercase tracking-wider">WhatsApp</span>
            </button>
            
            <button 
              @click="batchAction('auto-billing-on')"
              class="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white rounded-lg transition-all flex items-center gap-2"
              title="Ativar Cobrança Automática em Massa"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/></svg>
              <span class="text-[9px] font-bold uppercase tracking-wider">Ativar Auto</span>
            </button>
            
            <button 
              @click="batchAction('auto-billing-off')"
              class="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white rounded-lg transition-all flex items-center gap-2"
              title="Desativar Cobrança Automática"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m19 10-7 7-7-7"/></svg>
              <span class="text-[9px] font-bold uppercase tracking-wider">Desativar Auto</span>
            </button>

            <!-- Bulk Tags -->
            <div class="relative">
              <button 
                @click="isBatchTagPickerOpen = !isBatchTagPickerOpen"
                class="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white rounded-lg transition-all flex items-center gap-2"
                title="Adicionar Tag em Massa"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2z"/><path d="M7 7h.01"/></svg>
                <span class="text-[9px] font-bold uppercase tracking-wider">Adicionar Tag</span>
              </button>

              <div v-if="isBatchTagPickerOpen" class="absolute top-full left-0 mt-2 w-48 bg-[#111112] border border-white/10 rounded-xl shadow-2xl z-[150] p-1 animate-in slide-in-from-top-2 duration-200">
                <div class="max-h-48 overflow-y-auto custom-scrollbar">
                  <div class="px-3 py-2 border-b border-white/5 mb-1">
                    <p class="text-[8px] font-black text-white/30 uppercase tracking-[0.2em]">Adicionar Tag</p>
                  </div>
                  <button 
                    v-for="tag in tagDefinitions" 
                    :key="tag.id"
                    @click="addTagToBatch(tag.name)"
                    class="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-white/5 transition-all text-left group/btag"
                  >
                    <div :style="{ backgroundColor: tag.color }" class="w-1.5 h-1.5 rounded-full shrink-0"></div>
                    <span class="text-[9px] font-bold text-white/50 group-hover/btag:text-white uppercase tracking-widest truncate">{{ tag.name }}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <button @click="selectedIds = []" class="px-3 py-1.5 text-[9px] font-bold text-white/40 hover:text-white uppercase tracking-widest hover:bg-white/5 rounded-lg transition-all">
          Cancelar
        </button>
      </div>
    </div>

    <div class="overflow-x-auto overflow-y-visible no-scrollbar">
      <table class="w-full min-w-[1000px] text-left border-separate" :class="isCompact ? 'border-spacing-y-1' : 'border-spacing-y-3'">
        <thead>
          <tr :class="['uppercase tracking-[0.15em] text-white/50', isCompact ? 'text-[9px] font-bold' : 'text-[10px] font-bold']">
            <th :class="['w-10', isCompact ? 'px-3 py-2' : 'px-4 py-3']">
              <div @click="toggleSelectAll" class="w-5 h-5 rounded-md border border-white/10 flex items-center justify-center cursor-pointer hover:border-kros-blue transition-all" :class="isAllSelected ? 'bg-kros-blue border-kros-blue' : ''">
                <svg v-if="isAllSelected" xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" class="text-white"><polyline points="20 6 9 17 4 12"></polyline></svg>
              </div>
            </th>
            <th :class="['cursor-pointer hover:text-white transition-colors group', isCompact ? 'px-3 py-2' : 'px-4 py-3']" @click="handleSort('company_name')">
              <div class="flex items-center gap-2">
                Empresa / Parceiro
                <svg v-if="sortColumn === 'company_name'" xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" :class="sortDirection === 'desc' ? 'rotate-180' : ''"><path d="m18 15-6-6-6 6"/></svg>
                <svg v-else xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="opacity-0 group-hover:opacity-50"><path d="m18 15-6-6-6 6"/></svg>
              </div>
            </th>
            <th :class="['text-center cursor-pointer hover:text-white transition-colors group', isCompact ? 'px-3 py-2' : 'px-4 py-3']" @click="handleSort('company_created_at')">
              <div class="flex items-center justify-center gap-2">
                Cadastro
                <svg v-if="sortColumn === 'company_created_at'" xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" :class="sortDirection === 'desc' ? 'rotate-180' : ''"><path d="m18 15-6-6-6 6"/></svg>
                <svg v-else xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="opacity-0 group-hover:opacity-50"><path d="m18 15-6-6-6 6"/></svg>
              </div>
            </th>
            <th :class="['cursor-pointer hover:text-white transition-colors group', isCompact ? 'px-3 py-2' : 'px-4 py-3']" @click="handleSort('due_date')">
              <div class="flex items-center gap-2">
                Vencimento
                <svg v-if="sortColumn === 'due_date'" xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" :class="sortDirection === 'desc' ? 'rotate-180' : ''"><path d="m18 15-6-6-6 6"/></svg>
                <svg v-else xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="opacity-0 group-hover:opacity-50"><path d="m18 15-6-6-6 6"/></svg>
              </div>
            </th>
            <th :class="['cursor-pointer hover:text-white transition-colors group', isCompact ? 'px-3 py-2' : 'px-4 py-3']" @click="handleSort('amount')">
              <div class="flex items-center gap-2">
                Valor
                <svg v-if="sortColumn === 'amount'" xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" :class="sortDirection === 'desc' ? 'rotate-180' : ''"><path d="m18 15-6-6-6 6"/></svg>
                <svg v-else xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="opacity-0 group-hover:opacity-50"><path d="m18 15-6-6-6 6"/></svg>
              </div>
            </th>
            <th :class="['cursor-pointer hover:text-white transition-colors group', isCompact ? 'px-3 py-2' : 'px-4 py-3']" @click="handleSort('company_ltv')">
              <div class="flex items-center gap-2">
                LTV Pago
                <svg v-if="sortColumn === 'company_ltv'" xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" :class="sortDirection === 'desc' ? 'rotate-180' : ''"><path d="m18 15-6-6-6 6"/></svg>
                <svg v-else xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="opacity-0 group-hover:opacity-50"><path d="m18 15-6-6-6 6"/></svg>
              </div>
            </th>
            <th :class="['text-center w-12', isCompact ? 'px-3 py-2' : 'px-4 py-3']">Status</th>
            <th :class="isCompact ? 'px-3 py-2' : 'px-4 py-3'">Último Alerta</th>
            <th :class="['text-right sticky right-0 bg-[#111112] text-white/50 z-10', isCompact ? 'px-3 py-2' : 'px-4 py-3']">Ações</th>
          </tr>
        </thead>
        <tbody>
          <BlocksKFinanceCollectionTableRow 
            v-for="payment in filteredPayments" 
            :key="payment.id"
            :payment="payment"
            :is-compact="isCompact"
            :is-selected="selectedIds.includes(payment.id)"
            v-model:active-tag-picker="activeTagPicker"
            :tag-definitions="tagDefinitions"
            @toggle-select="toggleSelect"
            @remove-tag="removeTag"
            @add-tag="addTag"
            @toggle-status="$emit('toggle-status', $event)"
            @toggle-autobilling="toggleAutoBilling"
            @open-msg-modal="openMsgModal"
            @open-logs="$emit('open-logs', $event)"
            @open-history="$emit('open-history', $event)"
          />
        </tbody>
      </table>
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

    <!-- Modal de Confirmação de Pagamento em Massa -->
    <div v-if="isBatchPaidModalOpen" class="fixed inset-0 z-[200] flex items-center justify-center px-4">
      <div @click="isBatchPaidModalOpen = false" class="absolute inset-0 bg-black/80 backdrop-blur-sm"></div>
      <div class="relative bg-[#111112] border border-white/10 rounded-2xl p-6 max-w-md w-full shadow-2xl animate-in zoom-in-95 fade-in duration-200">
        <div class="flex items-center gap-3 mb-4">
          <div class="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
          </div>
          <div>
            <h3 class="text-sm font-black text-white uppercase tracking-tight">Marcar como Pago</h3>
            <p class="text-[10px] text-white/40 font-bold uppercase tracking-wider mt-0.5">{{ selectedIds.length }} pagamentos selecionados</p>
          </div>
        </div>

        <div class="mb-4 p-3 bg-white/[0.02] rounded-xl border border-white/5">
          <p class="text-[10px] font-bold text-white/60 uppercase tracking-wider mb-2">Empresas:</p>
          <div class="max-h-32 overflow-y-auto custom-scrollbar space-y-1">
            <div v-for="payment in selectedPaymentsForBatch" :key="payment.id" class="flex items-center justify-between text-[10px] py-1">
              <span class="text-white/70 font-medium">{{ payment.company_name }}</span>
              <span class="text-white font-bold">{{ formatCurrency(payment.amount) }}</span>
            </div>
          </div>
        </div>

        <div class="flex items-center justify-between p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20 mb-4">
          <span class="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Total</span>
          <span class="text-sm font-black text-emerald-500">{{ formatCurrency(selectedTotal) }}</span>
        </div>

        <div class="flex gap-3">
          <button 
            @click="isBatchPaidModalOpen = false"
            class="flex-1 py-3 text-[10px] font-bold text-white/40 hover:text-white uppercase tracking-widest hover:bg-white/5 rounded-xl transition-all"
          >
            Cancelar
          </button>
          <button 
            @click="confirmBatchPaid"
            class="flex-1 py-3 bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all"
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>

    <!-- Modal de Confirmação de Estorno em Massa -->
    <div v-if="isBatchPendingModalOpen" class="fixed inset-0 z-[200] flex items-center justify-center px-4">
      <div @click="isBatchPendingModalOpen = false" class="absolute inset-0 bg-black/80 backdrop-blur-sm"></div>
      <div class="relative bg-[#111112] border border-white/10 rounded-2xl p-6 max-w-md w-full shadow-2xl animate-in zoom-in-95 fade-in duration-200">
        <div class="flex items-center gap-3 mb-4">
          <div class="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
          </div>
          <div>
            <h3 class="text-sm font-black text-white uppercase tracking-tight">Estornar Pagamentos</h3>
            <p class="text-[10px] text-white/40 font-bold uppercase tracking-wider mt-0.5">{{ selectedIds.length }} pagamentos selecionados</p>
          </div>
        </div>

        <div class="mb-4 p-3 bg-white/[0.02] rounded-xl border border-white/5">
          <p class="text-[10px] font-bold text-white/60 uppercase tracking-wider mb-2">Empresas:</p>
          <div class="max-h-32 overflow-y-auto custom-scrollbar space-y-1">
            <div v-for="payment in selectedPaymentsForBatch" :key="payment.id" class="flex items-center justify-between text-[10px] py-1">
              <span class="text-white/70 font-medium">{{ payment.company_name }}</span>
              <span class="text-white font-bold">{{ formatCurrency(payment.amount) }}</span>
            </div>
          </div>
        </div>

        <div class="flex items-center justify-between p-3 bg-orange-500/10 rounded-xl border border-orange-500/20 mb-4">
          <span class="text-[10px] font-black text-orange-500 uppercase tracking-widest">Total</span>
          <span class="text-sm font-black text-orange-500">{{ formatCurrency(selectedTotal) }}</span>
        </div>

        <div class="flex gap-3">
          <button 
            @click="isBatchPendingModalOpen = false"
            class="flex-1 py-3 text-[10px] font-bold text-white/40 hover:text-white uppercase tracking-widest hover:bg-white/5 rounded-xl transition-all"
          >
            Cancelar
          </button>
          <button 
            @click="confirmBatchPending"
            class="flex-1 py-3 bg-orange-500 hover:bg-orange-600 text-white text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all"
          >
            Confirmar Estorno
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useTags } from '~/composables/useTags'

const props = defineProps<{
  payments: any[],
  activeSubTab: string
}>()

const emit = defineEmits(['toggle-status', 'toggle-autobilling', 'batch-autobilling', 'batch-mark-paid', 'open-logs', 'update-company-tags', 'open-history', 'update:activeSubTab', 'sync', 'config'])

const isMsgModalOpen = ref(false)
const isBatchMsgModalOpen = ref(false)
const isBatchPaidModalOpen = ref(false)
const isBatchPendingModalOpen = ref(false)
const selectedPayment = ref<any>(null)
const selectedPaymentsForBatch = ref<any[]>([])
const { tags: tagDefinitions, fetchTags } = useTags()

const activeFilter = ref('Todos')
const selectedTags = ref<string[]>([])
const selectedIds = ref<string[]>([])
const activeTagPicker = ref<string | null>(null)
const isBatchTagPickerOpen = ref(false)
const searchQuery = ref('')
const sortColumn = ref<string | null>(null)
const sortDirection = ref<'asc' | 'desc'>('asc')
const isCompact = ref(true)

const isAllSelected = computed(() => {
  return filteredPayments.value.length > 0 && selectedIds.value.length === filteredPayments.value.length
})

const toggleSelectAll = () => {
  if (isAllSelected.value) {
    selectedIds.value = []
  } else {
    selectedIds.value = filteredPayments.value.map(p => p.id)
  }
}

const toggleSelect = (id: string) => {
  const index = selectedIds.value.indexOf(id)
  if (index === -1) {
    selectedIds.value.push(id)
  } else {
    selectedIds.value.splice(index, 1)
  }
}

const batchAction = async (type: string) => {
  const selectedPayments = props.payments.filter(p => selectedIds.value.includes(p.id))
  
  if (type === 'mark-paid') {
    selectedPaymentsForBatch.value = selectedPayments
    isBatchPaidModalOpen.value = true
  } else if (type === 'mark-pending') {
    selectedPaymentsForBatch.value = selectedPayments
    isBatchPendingModalOpen.value = true
  } else if (type === 'whatsapp-api') {
    // Validar se todos têm WhatsApp válido
    const paymentsWithoutWhatsApp = selectedPayments.filter(p => {
      const rawNum = p.company_whatsapp?.replace(/\D/g, '') || ''
      return !rawNum || rawNum.length < 10
    })
    
    if (paymentsWithoutWhatsApp.length > 0) {
      const names = paymentsWithoutWhatsApp.map(p => p.company_name).join(', ')
      alert(`⚠️ As seguintes empresas não possuem WhatsApp válido cadastrado:\n\n${names}\n\nPor favor, cadastre os números antes de enviar mensagens.`)
      return
    }
    
    selectedPaymentsForBatch.value = selectedPayments
    isBatchMsgModalOpen.value = true
  } else if (type === 'auto-billing-on') {
    emit('batch-autobilling', selectedPayments)
  } else if (type === 'auto-billing-off') {
    if (!confirm(`Deseja desativar a cobrança automática para as ${selectedIds.value.length} empresas selecionadas?`)) return
    for (const p of selectedPayments) {
      emit('toggle-autobilling', p)
    }
    selectedIds.value = []
  }
}

const confirmBatchPaid = () => {
  emit('batch-mark-paid', selectedPaymentsForBatch.value)
  isBatchPaidModalOpen.value = false
  selectedIds.value = []
  selectedPaymentsForBatch.value = []
}

const confirmBatchPending = () => {
  emit('batch-mark-pending', selectedPaymentsForBatch.value)
  isBatchPendingModalOpen.value = false
  selectedIds.value = []
  selectedPaymentsForBatch.value = []
}

const addTagToBatch = async (tagName: string) => {
  const selectedPayments = props.payments.filter(p => selectedIds.value.includes(p.id))
  if (selectedPayments.length === 0) return

  if (!confirm(`Deseja adicionar a tag "${tagName}" para as ${selectedPayments.length} empresas selecionadas?`)) return

  for (const p of selectedPayments) {
    const currentTags = [...(p.tags || [])]
    if (!currentTags.includes(tagName)) {
      currentTags.push(tagName)
      emit('update-company-tags', { companyId: p.company_id, tags: currentTags })
    }
  }

  isBatchTagPickerOpen.value = false
  selectedIds.value = []
}

const addTag = (payment: any, tagName: string) => {
  const currentTags = [...(payment.tags || [])]
  if (!currentTags.includes(tagName)) {
    currentTags.push(tagName)
    emit('update-company-tags', { companyId: payment.company_id, tags: currentTags })
  }
  activeTagPicker.value = null
}

const removeTag = (payment: any, tagName: string) => {
  if (!confirm(`Deseja remover a tag "${tagName}"?`)) return
  const currentTags = (payment.tags || []).filter((t: string) => t !== tagName)
  emit('update-company-tags', { companyId: payment.company_id, tags: currentTags })
}

const filterOptions = [
  { id: 'Todos', label: 'Todos', description: 'Mostra todas as cobranças sem nenhum filtro aplicado.' },
  { id: 'Hoje', label: 'Hoje', description: 'Cobranças que vencem hoje (exclui as já pagas).' },
  { id: 'Crítico', label: 'Crítico (>7d)', description: 'Cobranças atrasadas há mais de uma semana.' },
  { id: 'Cobrados', label: 'Cobrados', description: 'Empresas que já receberam pelo menos um alerta/cobrança.' },
  { id: 'Nao-Cobrados', label: 'Não Cobrados', description: 'Empresas que ainda não receberam nenhum alerta.' },
  { id: 'Sem-WA', label: 'Sem WA', description: 'Empresas que não possuem WhatsApp cadastrado.' },
  { id: 'Pendente', label: 'Pendentes', description: 'Cobranças agendadas que ainda não venceram.' },
  { id: 'Atrasado', label: 'Atrasados', description: 'Todas as cobranças com vencimento ultrapassado.' },
  { id: 'Semana', label: 'Semana', description: 'Todas as cobranças que vencem na semana corrente.' },
  { id: 'Pago', label: 'Pagos', description: 'Histórico completo de cobranças já liquidadas.' },
  { id: 'Churn', label: 'Churn', description: 'Clientes com mais de 30 dias de atraso (Perdidos).' }
]

const toggleTag = (tagName: string) => {
  const index = selectedTags.value.indexOf(tagName)
  if (index === -1) {
    selectedTags.value.push(tagName)
  } else {
    selectedTags.value.splice(index, 1)
  }
}

const toggleAllTags = () => {
  if (selectedTags.value.length === tagDefinitions.value.length) {
    selectedTags.value = []
  } else {
    selectedTags.value = tagDefinitions.value.map(t => t.name)
  }
}

const hasActiveFilters = computed(() => {
  return activeFilter.value !== 'Todos' || selectedTags.value.length > 0 || searchQuery.value !== ''
})

const filteredPayments = computed(() => {
  const now = new Date()
  const startOfWeek = new Date(now)
  startOfWeek.setDate(now.getDate() - now.getDay())
  startOfWeek.setHours(0, 0, 0, 0)

  const endOfWeek = new Date(now)
  endOfWeek.setDate(now.getDate() + (6 - now.getDay()))
  endOfWeek.setHours(23, 59, 59, 999)

  let filtered = props.payments.filter(p => {
    // Filtro por Status
    let matchesStatus = false
    if (activeFilter.value === 'Todos') {
      matchesStatus = true
    } else if (activeFilter.value === 'Hoje') {
      if (p.due_date) {
        const dueDateString = p.due_date.includes('T') ? p.due_date : `${p.due_date}T12:00:00`
        const dueDate = new Date(dueDateString)
        matchesStatus = dueDate.toDateString() === now.toDateString() && p.status !== 'Pago'
      }
    } else if (activeFilter.value === 'Crítico') {
      if (p.due_date) {
        const dueDateString = p.due_date.includes('T') ? p.due_date : `${p.due_date}T12:00:00`
        const dueDate = new Date(dueDateString)
        const diffTime = now.getTime() - dueDate.getTime()
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        matchesStatus = p.status === 'Atrasado' && diffDays > 7
      }
    } else if (activeFilter.value === 'Sem-WA') {
      matchesStatus = !p.company_whatsapp || p.company_whatsapp.trim() === ''
    } else if (activeFilter.value === 'Cobrados') {
      matchesStatus = !!p.last_alert_at
    } else if (activeFilter.value === 'Nao-Cobrados') {
      matchesStatus = !p.last_alert_at
    } else if (activeFilter.value === 'Semana') {
      if (p.due_date) {
        const dueDateString = p.due_date.includes('T') ? p.due_date : `${p.due_date}T12:00:00`
        const dueDate = new Date(dueDateString)
        matchesStatus = dueDate >= startOfWeek && dueDate <= endOfWeek
      }
    } else {
      matchesStatus = p.status === activeFilter.value
    }
    
    // Filtro por Multi-Tags
    const matchesTag = selectedTags.value.length === 0 || 
                       (p.tags && p.tags.some((t: string) => selectedTags.value.includes(t)))
    
    // Filtro por Busca
    const matchesSearch = !searchQuery.value || 
                         p.company_name?.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
                         p.amount?.toString().includes(searchQuery.value)
    
    return matchesStatus && matchesTag && matchesSearch
  })

  // Ordenação
  if (sortColumn.value) {
    filtered = [...filtered].sort((a, b) => {
      let aVal = a[sortColumn.value!]
      let bVal = b[sortColumn.value!]

      // Tratamento especial para datas
      if (sortColumn.value === 'due_date' || sortColumn.value === 'company_created_at') {
        aVal = aVal ? new Date(aVal).getTime() : 0
        bVal = bVal ? new Date(bVal).getTime() : 0
      }

      // Tratamento para números
      if (sortColumn.value === 'amount' || sortColumn.value === 'company_ltv') {
        aVal = Number(aVal) || 0
        bVal = Number(bVal) || 0
      }

      // Tratamento para strings
      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase()
        bVal = bVal?.toLowerCase() || ''
      }

      if (aVal < bVal) return sortDirection.value === 'asc' ? -1 : 1
      if (aVal > bVal) return sortDirection.value === 'asc' ? 1 : -1
      return 0
    })
  }

  // Limitar a 10 registros se não houver filtros ativos
  if (!hasActiveFilters.value) {
    return filtered.slice(0, 10)
  }

  return filtered
})

const handleSort = (column: string) => {
  if (sortColumn.value === column) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortColumn.value = column
    sortDirection.value = 'asc'
  }
}

const selectedTotal = computed(() => {
  const selected = props.payments.filter(p => selectedIds.value.includes(p.id))
  return selected.reduce((sum, p) => sum + (Number(p.amount) || 0), 0)
})

const filteredTotal = computed(() => {
  return filteredPayments.value.reduce((sum, p) => sum + (Number(p.amount) || 0), 0)
})

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)
}

onMounted(() => {
  fetchTags()
})

const openMsgModal = (payment: any) => {
  if (!payment.company_whatsapp) {
    alert('Empresa sem WhatsApp cadastrado. Não será possível enviar mensagem.')
    return
  }
  selectedPayment.value = payment
  isMsgModalOpen.value = true
}

const handleMessageSent = () => {
  isMsgModalOpen.value = false
  emit('sync')
}

const handleBatchSent = () => {
  isBatchMsgModalOpen.value = false
  selectedIds.value = []
  emit('sync')
}

const toggleAutoBilling = (payment: any) => {
  emit('toggle-autobilling', payment)
}
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
