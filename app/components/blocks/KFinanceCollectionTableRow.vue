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
      <div class="cursor-pointer hover:opacity-80 transition-opacity" @click="$emit('open-client-details', payment)">
        <p :class="['font-semibold tracking-tight text-white uppercase', isCompact ? 'text-[10px]' : 'text-xs']">
          {{ payment.company_name }}
        </p>
        <p :class="['font-medium text-white/70 mt-1', isCompact ? 'text-[9px]' : 'text-[10px]']">
          {{ payment.company_actual_name }}
        </p>
      </div>
      <!-- Tags Component -->
      <FinanceCollectionKCollectionRowTags
        :key="`tags-${payment.id}-${payment.tags?.length || 0}`"
        :tags="payment.tags || []"
        :whatsapp="payment.company_whatsapp"
        :tag-definitions="tagDefinitions"
        :show-picker="showTagPicker"
        @remove-tag="handleRemoveTag"
        @add-tag="handleAddTag"
        @toggle-picker="showTagPicker = !showTagPicker"
      />
    </td>
    <td :class="isCompact ? 'px-3 py-3' : 'px-4 py-5'">
       <span 
         v-if="payment.plan_name"
         @click="$emit('open-plan-details', payment)"
         class="font-semibold text-white/80 cursor-pointer hover:text-white hover:underline transition-all"
         :class="isCompact ? 'text-[10px]' : 'text-xs'"
       >
         {{ payment.plan_name }}
       </span>
       <span v-else class="font-semibold text-white/40" :class="isCompact ? 'text-[10px]' : 'text-xs'">-</span>
    </td>
    <td :class="['font-medium', isCompact ? 'px-3 py-3' : 'px-4 py-5']">
       <span :class="['font-semibold tabular-nums text-white/60', isCompact ? 'text-[10px]' : 'text-xs']">{{ formatDate(payment.due_date) }}</span>
    </td>
    <td :class="isCompact ? 'px-3 py-3' : 'px-4 py-5'">
       <span :class="['font-black tabular-nums text-white/90 tracking-tight', isCompact ? 'text-[11px]' : 'text-xs']">{{ formatCurrency(payment.amount) }}</span>
    </td>
    <td :class="['text-center', isCompact ? 'px-3 py-3' : 'px-4 py-5']">
      <div class="flex items-center justify-center">
        <FinanceSubscriptionKSubscriptionStatusBadge 
          :status="payment.subscription_status" 
          :size="isCompact ? 'sm' : 'md'"
          @update:status="$emit('update-subscription-status', { id: payment.id, status: $event })"
        />
      </div>
    </td>
    
    <td :class="['text-center', isCompact ? 'px-3 py-3' : 'px-4 py-5']">
      <div class="flex items-center justify-center">
        <FinanceSubscriptionKPaymentStatusBadge 
          :status="payment.payment_status || 'active'" 
          :size="isCompact ? 'sm' : 'md'"
        />
      </div>
    </td>
    <td :class="['whitespace-nowrap', isCompact ? 'px-3 py-3' : 'px-4 py-5']">
       <div v-if="payment.last_alert_at" class="flex flex-col cursor-pointer hover:opacity-80 transition-opacity" @click="$emit('open-alert-details', payment)">
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
      <FinanceCollectionKCollectionRowActions
        :status="payment.status"
        :auto-billing-enabled="payment.auto_billing_enabled"
        :payment-id="payment.id"
        :is-compact="isCompact"
        @edit="$emit('edit', payment)"
        @toggle-status="$emit('toggle-status', payment)"
        @toggle-autobilling="$emit('toggle-autobilling', payment)"
        @open-msg-modal="$emit('open-msg-modal', payment)"
        @open-logs="$emit('open-logs', payment.company_id)"
        @open-history="$emit('open-history', payment.company_id)"
        @delete="$emit('delete', payment)"
      />
    </td>
  </tr>
</template>

<script setup lang="ts">
import { useCollectionRow } from '~/composables/useCollectionRow'

const props = defineProps<{
  payment: any
  isSelected: boolean
  isCompact: boolean
  tagDefinitions: any[]
}>()

// Log para debug do WhatsApp
console.log(`📱 [KFinanceCollectionTableRow] ${props.payment.company_name}: WhatsApp = "${props.payment.company_whatsapp}"`)

const emit = defineEmits([
  'toggle-select', 
  'edit',
  'toggle-status', 
  'toggle-autobilling', 
  'open-msg-modal', 
  'open-logs', 
  'open-history',
  'delete',
  'update-subscription-status',
  'open-client-details',
  'open-plan-details',
  'update-tags',
  'open-alert-details'
])

const { 
  formatCurrency, 
  formatDate, 
  formatDateTimeTiny, 
  formatTimeAgo, 
  isUrgentAlert, 
  avatarClass 
} = useCollectionRow(props.payment)

// Função para obter a cor da tag
const getTagColor = (tagName: string): string => {
  const tag = props.tagDefinitions.find(t => t.name === tagName)
  return tag?.color || '#666666'
}

// Estado para o picker de tags
const showTagPicker = ref(false)

// Handlers para tags
const handleRemoveTag = async (tagName: string) => {
  try {
    const supabase = useSupabaseClient()
    const newTags = (props.payment.tags || []).filter((t: string) => t !== tagName)
    
    const { error } = await supabase
      .from('companies')
      .update({ tags: newTags })
      .eq('id', props.payment.company_id)
    
    if (error) throw error
    
    // Emitir evento para o componente pai atualizar
    emit('update-tags', { id: props.payment.id, tags: newTags })
    
    const { success } = useToast()
    success('Tag removida', `Tag "${tagName}" removida com sucesso`)
  } catch (err: any) {
    const { error: errorToast } = useToast()
    errorToast('Erro ao remover tag', err.message)
  }
}

const handleAddTag = async (tagName: string) => {
  try {
    const supabase = useSupabaseClient()
    const currentTags = props.payment.tags || []
    
    // Evitar duplicatas
    if (currentTags.includes(tagName)) {
      const { warning } = useToast()
      warning('Tag já existe', `A tag "${tagName}" já está adicionada`)
      return
    }
    
    const newTags = [...currentTags, tagName]
    
    const { error } = await supabase
      .from('companies')
      .update({ tags: newTags })
      .eq('id', props.payment.company_id)
    
    if (error) throw error
    
    // Emitir evento para o componente pai atualizar
    emit('update-tags', { id: props.payment.id, tags: newTags })
    
    // Fechar o picker
    showTagPicker.value = false
    
    const { success } = useToast()
    success('Tag adicionada', `Tag "${tagName}" adicionada com sucesso`)
  } catch (err: any) {
    const { error: errorToast } = useToast()
    errorToast('Erro ao adicionar tag', err.message)
  }
}

// Mapear status de pagamento para o formato do badge
const mapPaymentStatus = (status: string): 'paid' | 'pending' | 'overdue' => {
  const statusMap: Record<string, 'paid' | 'pending' | 'overdue'> = {
    'Pago': 'paid',
    'Pendente': 'pending',
    'Atrasado': 'overdue'
  }
  return statusMap[status] || 'pending'
}

// Calcular LTV (Lifetime Value) baseado no valor mensal e duração esperada
const calculateLTV = (payment: any): number => {
  // Se a assinatura tem data de fim, calcular baseado no período
  if (payment.end_date && payment.start_date) {
    const start = new Date(payment.start_date)
    const end = new Date(payment.end_date)
    const months = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 30))
    return payment.amount * Math.max(months, 1)
  }
  
  // Caso contrário, assumir 12 meses (1 ano) como padrão
  return payment.amount * 12
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
