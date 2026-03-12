<template>
  <tr 
      class="group/row bg-white/[0.02] hover:bg-white/[0.04] transition-all rounded-2xl border border-transparent hover:border-white/10 relative"
      :class="[
        isSelected ? 'bg-kros-blue/5 border-kros-blue/20' : '',
        payment.status === 'Atrasado' ? 'hover:border-l-red-500/50' : 'hover:border-l-kros-blue/50'
      ]"
  >
    <td :class="['first:rounded-l-2xl', isCompact ? 'px-3 py-3' : 'px-4 py-5']">
      <div @click="$emit('toggle-select', payment.id)" class="w-5 h-5 rounded-md border border-white/5 flex items-center justify-center cursor-pointer hover:border-kros-blue transition-all" :class="isSelected ? 'bg-kros-blue border-kros-blue' : ''">
        <svg v-if="isSelected" xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" class="text-white"><polyline points="20 6 9 17 4 12"></polyline></svg>
      </div>
    </td>
    <td :class="isCompact ? 'px-3 py-3' : 'px-4 py-5'">
      <div class="flex items-center gap-3">
        <div :class="['w-9 h-9 rounded-full flex items-center justify-center font-black text-[10px] border transition-all shadow-sm', getStatusAvatarClass(payment.status)]">
          {{ payment.company_name?.charAt(0) }}
        </div>
        <div class="flex flex-col">
           <p class="font-bold text-sm text-white uppercase tracking-tight">{{ payment.company_name }}</p>
           <div class="flex items-center gap-2 mt-0.5">
              <p class="text-[9px] text-white/40 font-bold uppercase tracking-widest">{{ payment.plan_name }}</p>
              <span v-if="payment.company_rep" class="w-1 h-1 rounded-full bg-white/10"></span>
              <p class="text-[9px] text-white/30 font-bold uppercase tracking-tighter" v-if="payment.company_rep">{{ payment.company_rep }}</p>
           </div>
           
           <!-- TAGS E INDICADORES -->
           <div class="flex items-center gap-2 mt-2.5">
              <!-- Indicador de WhatsApp -->
              <div 
                v-if="!hasValidWhatsApp"
                class="group/whatsapp relative"
                title="WhatsApp não cadastrado"
              >
                <div class="w-5 h-5 rounded-md bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 448 512" fill="currentColor" class="text-orange-500">
                    <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l115.3-30.2c32.4 17.7 68.8 27 108.6 27 122.4 0 222-99.6 222-222 0-59.3-23-115.1-65-157.1zM223.9 446.7c-33.1 0-65.6-8.9-93.9-25.7l-6.7-4-69.8 18.3 18.7-68.1-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 54 81.2 54.1 130.5 0 101.7-82.8 184.5-184.6 184.5zm100.5-137c-5.5-2.8-32.6-16.1-37.7-17.9-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-5.5-2.8-23.2-8.5-44.2-27.2-16.4-14.6-27.4-32.7-30.6-38.2-3.2-5.6-.3-8.6 2.5-11.3 2.5-2.5 5.5-6.5 8.3-9.7 2.8-3.2 3.7-5.5 5.6-9.2 1.9-3.7 1-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 13.2 5.7 23.5 9.2 31.6 11.8 13.3 4.2 25.4 3.6 35 2.2 10.7-1.6 32.6-13.3 37.2-26.2 4.6-12.9 4.6-24 3.2-26.2-1.4-2.3-5.1-3.7-10.6-6.5z"/>
                  </svg>
                </div>
                <div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1.5 bg-black/95 border border-orange-500/20 rounded-lg shadow-2xl opacity-0 group-hover/whatsapp:opacity-100 transition-all pointer-events-none z-[200] whitespace-nowrap">
                  <span class="text-[8px] font-black text-orange-500 uppercase tracking-widest">WhatsApp não cadastrado</span>
                </div>
              </div>
              
              <!-- Tags -->
              <div class="flex items-center gap-1.5 flex-wrap max-w-[180px]">
                <div 
                  v-for="tag in payment.tags" 
                  :key="tag"
                  class="group/tag relative"
                >
                  <!-- Bolinha da Tag (maior) -->
                  <div 
                    :style="{ backgroundColor: getTagHexColor(tag) }"
                    class="w-3 h-3 rounded-full shadow-[0_0_8px_rgba(0,0,0,0.3)] border border-white/10 transition-all duration-300 group-hover/tag:scale-125 cursor-help"
                  ></div>

                  <!-- Tooltip Com Nome e Excluir -->
                  <div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 flex items-center gap-2 px-2 py-1.5 bg-black/95 border border-white/10 rounded-lg shadow-2xl opacity-0 group-hover/tag:opacity-100 transition-all pointer-events-none group-hover/tag:pointer-events-auto z-[200] whitespace-nowrap">
                     <div :style="{ backgroundColor: getTagHexColor(tag) }" class="w-2 h-2 rounded-full shrink-0"></div>
                     <span class="text-[9px] font-black text-white/90 uppercase tracking-widest">{{ tag }}</span>
                     <button 
                       @click.stop="$emit('remove-tag', payment, tag)"
                       class="ml-1 p-0.5 hover:bg-red-500/20 text-white/30 hover:text-red-500 rounded transition-all"
                     >
                       <svg xmlns="http://www.w3.org/2000/svg" width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
                     </button>
                     
                     <!-- Seta do Tooltip -->
                     <div class="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-black/95"></div>
                  </div>
                </div>

                <!-- Botão Adicionar Tag -->
                <div class="relative ml-0.5">
                  <button 
                    @click.stop="$emit('update:activeTagPicker', activeTagPicker === payment.id ? null : payment.id)"
                    class="w-3.5 h-3.5 rounded-full border border-dashed border-white/20 flex items-center justify-center text-white/30 hover:text-white hover:border-white/40 transition-all bg-white/5"
                    title="Adicionar Tag"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12h14"/></svg>
                  </button>

                  <!-- Picker de Tags -->
                  <div v-if="activeTagPicker === payment.id" class="absolute top-full left-0 mt-2 w-42 bg-[#111112] border border-white/10 rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.9)] z-[200] p-1 animate-in fade-in zoom-in-95 duration-200">
                    <div class="max-h-40 overflow-y-auto custom-scrollbar">
                      <button 
                        v-for="tag in availableTagsForPayment" 
                        :key="tag.id"
                        @click.stop="$emit('add-tag', payment, tag.name)"
                        class="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-white/5 transition-all text-left"
                      >
                        <div :style="{ backgroundColor: tag.color }" class="w-2 h-2 rounded-sm shrink-0"></div>
                        <span class="text-[9px] font-bold text-white/60 uppercase tracking-widest truncate">{{ tag.name }}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
           </div>
        </div>
      </div>
    </td>
    <td :class="['text-center', isCompact ? 'px-3 py-3' : 'px-4 py-5']">
       <span :class="['font-medium uppercase tracking-widest text-white/50', isCompact ? 'text-[10px]' : 'text-xs']">{{ formatDate(payment.company_created_at) }}</span>
    </td>
    <td :class="['font-medium', isCompact ? 'px-3 py-3' : 'px-4 py-5']">
       <span :class="['font-semibold tabular-nums text-white/60', isCompact ? 'text-[10px]' : 'text-xs']">{{ formatDate(payment.due_date) }}</span>
    </td>
    <td :class="isCompact ? 'px-3 py-3' : 'px-4 py-5'">
       <span :class="['font-black tabular-nums text-white/90 tracking-tight', isCompact ? 'text-[11px]' : 'text-xs']">{{ formatCurrency(payment.amount) }}</span>
    </td>
    <td :class="isCompact ? 'px-3 py-3' : 'px-4 py-5'">
       <span :class="['font-bold text-emerald-500/60 tabular-nums tracking-tighter', isCompact ? 'text-[10px]' : 'text-[11px]']">{{ formatCurrency(payment.company_ltv || 0) }}</span>
    </td>
    <td :class="isCompact ? 'px-3 py-3' : 'px-4 py-5'">
       <div class="flex items-center justify-center group/status relative">
          <span 
            :class="['w-2.5 h-2.5 rounded-full shadow-[0_0_12px_currentColor] transition-all duration-300 group-hover/status:scale-125 cursor-help', getStatusColor(payment.status)]" 
            :style="{ color: getStatusHex(payment.status) }"
          ></span>
          
          <!-- Tooltip minimalista -->
          <div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-black/90 text-[8px] font-black text-white uppercase tracking-[0.2em] rounded-md opacity-0 group-hover/status:opacity-100 transition-all pointer-events-none whitespace-nowrap z-[110] border border-white/10 shadow-2xl">
            {{ payment.status }}
          </div>
       </div>
    </td>
    <td :class="['whitespace-nowrap', isCompact ? 'px-3 py-3' : 'px-4 py-5']">
       <div v-if="payment.last_alert_at" class="flex flex-col">
          <div class="flex items-center gap-1.5">
            <span :class="['text-[10px] font-black uppercase tracking-tight', isUrgentAlert ? 'text-red-500 animate-pulse' : 'text-white/80']">
              {{ formatTimeAgo(payment.last_alert_at) }}
            </span>
            <svg v-if="isUrgentAlert" xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="text-red-500"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
          </div>
          <span class="text-[8px] font-bold text-white/20 uppercase tracking-[0.15em] mt-0.5">{{ formatDateTimeTiny(payment.last_alert_at) }}</span>
       </div>
       <div v-else class="flex flex-col opacity-20">
          <span class="text-[10px] font-black text-white/40 uppercase italic tracking-tighter">Nenhum Alerta</span>
          <span class="text-[7px] font-bold text-white/20 uppercase tracking-widest">Aguardando disparo</span>
       </div>
    </td>
    <td :class="['text-right sticky right-0 bg-[#0D0D0E]/80 backdrop-blur-xl group-hover/row:bg-[#151516]/90 transition-all z-10 border-l border-white/5 overflow-visible', isCompact ? 'px-2 py-3' : 'px-4 py-5']">
        <div :class="['flex items-center justify-end pr-1 relative', isCompact ? 'gap-1' : 'gap-2']">
          <!-- 1. Botão Toggle Status do Pagamento -->
          <button 
            @click="$emit('toggle-status', payment)"
            :title="payment.status === 'Pago' ? 'Desfazer Pagamento (Estornar)' : 'Marcar como Pago'"
            :class="[
              'rounded-xl transition-all',
              isCompact ? 'p-1.5' : 'p-2.5',
              payment.status === 'Pago' 
                ? 'bg-amber-500/10 text-amber-500 hover:bg-amber-500 hover:text-white' 
                : 'bg-blue-500/10 text-blue-500 hover:bg-blue-500 hover:text-white'
            ]"
          >
            <!-- Ícone de Marcar Pago -->
            <svg v-if="payment.status !== 'Pago'" xmlns="http://www.w3.org/2000/svg" :width="isCompact ? 12 : 14" :height="isCompact ? 12 : 14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
            <!-- Ícone de Desfazer (Undo) -->
            <svg v-else xmlns="http://www.w3.org/2000/svg" :width="isCompact ? 12 : 14" :height="isCompact ? 12 : 14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"/></svg>
          </button>

          <!-- 2. Botão de Automação de Cobrança (CRON/POST) -->
          <UiKAutoBillingBtn 
            :is-active="payment.auto_billing_enabled"
            :is-compact="isCompact"
            @click="$emit('toggle-autobilling', payment)"
          />

          <!-- 3. Botão WhatsApp (Mensagem Manual) -->
          <button 
            @click="$emit('open-msg-modal', payment)"
            title="Cobrar via WhatsApp"
            :class="[
              'rounded-xl bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white transition-all group/wa',
              isCompact ? 'p-1.5' : 'p-2.5'
            ]"
          >
            <!-- Ícone oficial do WhatsApp -->
            <svg xmlns="http://www.w3.org/2000/svg" :width="isCompact ? 12 : 14" :height="isCompact ? 12 : 14" viewBox="0 0 448 512" fill="currentColor">
              <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l115.3-30.2c32.4 17.7 68.8 27 108.6 27 122.4 0 222-99.6 222-222 0-59.3-23-115.1-65-157.1zM223.9 446.7c-33.1 0-65.6-8.9-93.9-25.7l-6.7-4-69.8 18.3 18.7-68.1-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 54 81.2 54.1 130.5 0 101.7-82.8 184.5-184.6 184.5zm100.5-137c-5.5-2.8-32.6-16.1-37.7-17.9-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-5.5-2.8-23.2-8.5-44.2-27.2-16.4-14.6-27.4-32.7-30.6-38.2-3.2-5.6-.3-8.6 2.5-11.3 2.5-2.5 5.5-6.5 8.3-9.7 2.8-3.2 3.7-5.5 5.6-9.2 1.9-3.7 1-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 13.2 5.7 23.5 9.2 31.6 11.8 13.3 4.2 25.4 3.6 35 2.2 10.7-1.6 32.6-13.3 37.2-26.2 4.6-12.9 4.6-24 3.2-26.2-1.4-2.3-5.1-3.7-10.6-6.5z"/>
            </svg>
          </button>

          <!-- 4. Botão de Logs -->
          <UiKPaymentLogStatusBtn 
             :payment-id="payment.id"
             :is-compact="isCompact"
             @open-logs="$emit('open-logs', payment.id)"
          />

          <!-- 5. Botão Histórico Individual (Extrema Direita) -->
          <UiKPaymentHistoryBtn 
            :is-compact="isCompact"
            @open-history="$emit('open-history', payment.company_id)"
          />
       </div>
    </td>
  </tr>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  payment: any
  isSelected: boolean
  isCompact: boolean
  activeTagPicker: string | null
  tagDefinitions: any[]
}>()

const emit = defineEmits([
  'toggle-select', 
  'remove-tag', 
  'add-tag', 
  'toggle-status', 
  'toggle-autobilling', 
  'open-msg-modal', 
  'open-logs', 
  'open-history',
  'update:activeTagPicker'
])

const availableTagsForPayment = computed(() => {
  return props.tagDefinitions.filter(t => !props.payment.tags?.includes(t.name))
})

const getTagHexColor = (tagName: string) => {
  const def = props.tagDefinitions.find(t => t.name === tagName)
  return def?.color || '#3B82F6'
}

const hasValidWhatsApp = computed(() => {
  const rawNum = props.payment.company_whatsapp?.replace(/\D/g, '') || ''
  return rawNum && rawNum.length >= 10
})

const getStatusAvatarClass = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'pago': return 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'
    case 'pendente': return 'bg-amber-500/10 border-amber-500/20 text-amber-500'
    case 'atrasado': return 'bg-red-500/10 border-red-500/20 text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.1)]'
    case 'churn': return 'bg-red-950/40 border-red-500/30 text-red-700'
    default: return 'bg-white/5 border-white/10 text-white/40'
  }
}

const isUrgentAlert = computed(() => {
  if (!props.payment.last_alert_at || props.payment.status !== 'Atrasado') return false
  const lastAlert = new Date(props.payment.last_alert_at).getTime()
  const now = new Date().getTime()
  return (now - lastAlert) > 24 * 60 * 60 * 1000
})

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)
}

const formatDate = (date: string) => {
  if (!date) return '-'
  const safeDate = date.includes('T') ? date : `${date}T12:00:00`
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit' }).format(new Date(safeDate))
}

const formatDateTimeTiny = (date: string) => {
  if (!date) return '-'
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }).format(new Date(date))
}

const formatTimeAgo = (date: string) => {
  if (!date) return ''
  const now = new Date()
  const then = new Date(date)
  const diffInSeconds = Math.floor((now.getTime() - then.getTime()) / 1000)
  
  if (diffInSeconds < 60) return 'Agora'
  
  const diffInMinutes = Math.floor(diffInSeconds / 60)
  if (diffInMinutes < 60) return `${diffInMinutes}min`
  
  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) return `${diffInHours}h`
  
  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays === 1) return '1 dia'
  if (diffInDays < 7) return `${diffInDays} dias`
  
  const diffInWeeks = Math.floor(diffInDays / 7)
  if (diffInWeeks === 1) return '1 sem'
  if (diffInWeeks < 4) return `${diffInWeeks} sem`
  
  const diffInMonths = Math.floor(diffInDays / 30)
  if (diffInMonths === 1) return '1 mês'
  return `${diffInMonths} meses`
}

const getStatusColor = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'pago': return 'bg-emerald-500 ring-emerald-500/10'
    case 'pendente': return 'bg-amber-500 ring-amber-500/10'
    case 'atrasado': return 'bg-red-500 ring-red-500/10'
    case 'churn': return 'bg-red-950 ring-red-900/40 border border-red-500/20 shadow-[0_0_15px_rgba(153,27,27,0.4)]'
    default: return 'bg-slate-500 ring-slate-500/10'
  }
}

const getStatusHex = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'pago': return '#10b981'
    case 'pendente': return '#f59e0b'
    case 'atrasado': return '#ef4444'
    case 'churn': return '#991b1b'
    default: return '#64748b'
  }
}
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
}
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
