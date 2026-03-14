<template>
  <div class="p-5 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all h-[400px] flex flex-col" :class="isSelected ? 'bg-kros-blue/5 border-kros-blue/20' : ''">
    <!-- Header -->
    <div class="flex items-start justify-between gap-4 mb-3 flex-shrink-0">
      <div class="flex items-center gap-3 flex-1 min-w-0">
        <div @click="$emit('toggle-select', payment.id)" class="w-9 h-9 rounded-xl border border-white/5 flex items-center justify-center cursor-pointer hover:border-kros-blue transition-all flex-shrink-0" :class="isSelected ? 'bg-kros-blue border-kros-blue' : ''">
          <svg v-if="isSelected" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" class="text-white"><polyline points="20 6 9 17 4 12"></polyline></svg>
        </div>
        <div class="min-w-0 flex-1 cursor-pointer" @click="$emit('open-client-details', payment)">
          <h5 class="text-xs font-bold text-white uppercase tracking-tight truncate">{{ payment.company_name }}</h5>
          <p class="text-[9px] text-white/40 font-medium tracking-wide truncate">{{ payment.company_actual_name || payment.company_name }}</p>
        </div>
      </div>

      <span 
        :class="[
          'text-[7px] font-black uppercase tracking-widest px-2 py-1 rounded-lg border flex-shrink-0',
          getStatusClass(payment.subscription_status)
        ]"
      >
        {{ getStatusLabel(payment.subscription_status) }}
      </span>
    </div>

    <!-- Info Grid -->
    <div class="grid grid-cols-2 gap-2 mb-3 pb-3 border-b border-white/5 flex-shrink-0">
      <div>
        <p class="text-[8px] text-white/40 font-bold uppercase tracking-widest mb-1">Plano</p>
        <p class="text-[10px] text-white/70 font-bold uppercase truncate">{{ payment.plan_name }}</p>
      </div>
      <div>
        <p class="text-[8px] text-white/40 font-bold uppercase tracking-widest mb-1">Vencimento</p>
        <p class="text-[10px] text-white/60 font-medium">Dia {{ payment.due_day }}</p>
      </div>
      <div>
        <p class="text-[8px] text-white/40 font-bold uppercase tracking-widest mb-1">Valor</p>
        <p class="text-sm text-white font-black tabular-nums">{{ formatCurrency(payment.amount) }}</p>
      </div>
      <div>
        <p class="text-[8px] text-white/40 font-bold uppercase tracking-widest mb-1">Pagamento</p>
        <span 
          :class="[
            'text-[7px] font-black uppercase tracking-widest px-2 py-1 rounded border inline-block',
            payment.payment_status === 'paid' || payment.payment_status === 'Pago'
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
              : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
          ]"
        >
          {{ payment.payment_status === 'paid' || payment.payment_status === 'Pago' ? 'Pago' : 'Pendente' }}
        </span>
      </div>
    </div>

    <!-- Tags -->
    <div v-if="payment.tags && payment.tags.length > 0" class="flex flex-wrap gap-1 mb-3 flex-shrink-0">
      <span 
        v-for="tag in payment.tags.slice(0, 3)" 
        :key="tag"
        class="px-2 py-1 rounded-lg text-[8px] font-bold uppercase tracking-widest"
        :style="{ 
          backgroundColor: getTagColor(tag) + '20', 
          color: getTagColor(tag),
          border: `1px solid ${getTagColor(tag)}40`
        }"
      >
        {{ tag }}
      </span>
      <span v-if="payment.tags.length > 3" class="px-2 py-1 bg-white/5 text-white/40 rounded-lg text-[8px] font-bold">
        +{{ payment.tags.length - 3 }}
      </span>
    </div>

    <!-- Observações -->
    <div class="bg-gradient-to-br from-black/50 to-black/30 p-3 rounded-xl border border-white/5 text-[9px] text-white/50 leading-relaxed tracking-tight font-medium relative flex-1 overflow-hidden mb-3 break-words">
      <p class="line-clamp-2 italic">{{ payment.notes || 'Sem observações' }}</p>
    </div>

    <!-- Actions -->
    <div class="grid grid-cols-4 gap-1.5 flex-shrink-0">
      <!-- Editar -->
      <button
        @click="$emit('edit', payment)"
        class="p-2.5 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 rounded-lg transition-all border border-purple-500/20 hover:border-purple-500/40 flex flex-col items-center justify-center gap-1"
        title="Editar"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
        <span class="text-[7px] font-bold uppercase tracking-widest">Editar</span>
      </button>
      
      <!-- Gerar Fatura -->
      <button
        @click="$emit('toggle-status', payment)"
        class="p-2.5 rounded-lg transition-all border flex flex-col items-center justify-center gap-1"
        :class="payment.payment_status === 'paid' || payment.payment_status === 'Pago' 
          ? 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/20 hover:border-emerald-500/40'
          : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/20 hover:border-emerald-500/40'"
        title="Gerar Fatura"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9 12l2 2 4-4"/></svg>
        <span class="text-[7px] font-bold uppercase tracking-widest">Fatura</span>
      </button>

      <!-- Auto Cobrança -->
      <button
        @click="$emit('toggle-autobilling', payment)"
        class="p-2.5 rounded-lg transition-all border flex flex-col items-center justify-center gap-1"
        :class="payment.auto_billing_enabled 
          ? 'bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border-blue-500/20 hover:border-blue-500/40'
          : 'bg-white/5 hover:bg-white/10 text-white/40 hover:text-white/60 border-white/10 hover:border-white/20'"
        title="Cobrança Automática"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/></svg>
        <span class="text-[7px] font-bold uppercase tracking-widest">Auto</span>
      </button>
      
      <!-- WhatsApp -->
      <button
        @click="$emit('open-msg-modal', payment)"
        class="p-2.5 bg-green-500/10 hover:bg-green-500/20 text-green-400 rounded-lg transition-all border border-green-500/20 hover:border-green-500/40 flex flex-col items-center justify-center gap-1"
        title="Enviar Mensagem"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 1 1-7.6-14h.8A8.38 8.38 0 0 1 21 11.5Z"/><path d="M12 12h.01"/><path d="M16 12h.01"/><path d="M8 12h.01"/></svg>
        <span class="text-[7px] font-bold uppercase tracking-widest">Msg</span>
      </button>

      <!-- Logs -->
      <button
        @click="$emit('open-logs', payment)"
        class="p-2.5 bg-white/5 hover:bg-white/10 text-white/40 hover:text-white/60 rounded-lg transition-all border border-white/10 hover:border-white/20 flex flex-col items-center justify-center gap-1"
        title="Ver Logs"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M16 13H8"/><path d="M16 17H8"/><path d="M10 9H8"/></svg>
        <span class="text-[7px] font-bold uppercase tracking-widest">Logs</span>
      </button>

      <!-- Histórico -->
      <button
        @click="$emit('open-history', payment)"
        class="p-2.5 bg-white/5 hover:bg-white/10 text-white/40 hover:text-white/60 rounded-lg transition-all border border-white/10 hover:border-white/20 flex flex-col items-center justify-center gap-1"
        title="Ver Histórico"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
        <span class="text-[7px] font-bold uppercase tracking-widest">Hist</span>
      </button>

      <!-- Status Assinatura -->
      <button
        @click="$emit('update-subscription-status', { id: payment.id, status: getNextStatus(payment.subscription_status) })"
        class="p-2.5 bg-white/5 hover:bg-white/10 text-white/40 hover:text-white/60 rounded-lg transition-all border border-white/10 hover:border-white/20 flex flex-col items-center justify-center gap-1"
        title="Alterar Status"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/><path d="M22 3v5h-5"/></svg>
        <span class="text-[7px] font-bold uppercase tracking-widest">Status</span>
      </button>

      <!-- Deletar -->
      <button
        @click="$emit('delete', payment)"
        class="p-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-all border border-red-500/20 hover:border-red-500/40 flex flex-col items-center justify-center gap-1"
        title="Deletar"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
        <span class="text-[7px] font-bold uppercase tracking-widest">Del</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  payment: any
  isSelected: boolean
  tagDefinitions: any[]
}>()

defineEmits<{
  'toggle-select': [id: string]
  'open-client-details': [payment: any]
  'edit': [payment: any]
  'open-msg-modal': [payment: any]
  'toggle-status': [payment: any]
  'toggle-autobilling': [payment: any]
  'open-logs': [payment: any]
  'open-history': [payment: any]
  'update-subscription-status': [data: { id: string, status: string }]
  'delete': [payment: any]
}>()

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)
}

const getStatusClass = (status: string) => {
  switch (status) {
    case 'active': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
    case 'pending': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
    case 'trial': return 'bg-blue-500/10 text-blue-400 border-blue-500/20'
    case 'suspended': return 'bg-orange-500/10 text-orange-400 border-orange-500/20'
    case 'cancelled': return 'bg-red-500/10 text-red-400 border-red-500/20'
    default: return 'bg-white/5 text-white/70 border-white/20'
  }
}

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'active': return 'Ativa'
    case 'pending': return 'Pendente'
    case 'trial': return 'Trial'
    case 'suspended': return 'Suspensa'
    case 'cancelled': return 'Cancelada'
    default: return status
  }
}

const getNextStatus = (currentStatus: string) => {
  const statusCycle = ['active', 'suspended', 'cancelled']
  const currentIndex = statusCycle.indexOf(currentStatus)
  return statusCycle[(currentIndex + 1) % statusCycle.length]
}

const getTagColor = (tagName: string) => {
  // Cores padrão para tags comuns
  const colors: Record<string, string> = {
    'VIP': '#FFD700',
    'Premium': '#9333EA',
    'Básico': '#3B82F6',
    'Trial': '#10B981',
    'Atrasado': '#EF4444'
  }
  return colors[tagName] || '#6B7280'
}
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  word-break: break-word;
  overflow-wrap: break-word;
}

.break-words {
  word-break: break-word;
  overflow-wrap: break-word;
}
</style>
