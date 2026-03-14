<template>
  <div class="p-5 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all h-[280px] flex flex-col" :class="selectedIds.includes(payment.id) ? 'bg-kros-blue/5 border-kros-blue/20' : ''">
    <!-- Header -->
    <div class="flex items-start justify-between gap-4 mb-3 flex-shrink-0">
      <div class="flex items-center gap-3 flex-1 min-w-0">
        <div @click="$emit('toggle-select', payment.id)" class="w-9 h-9 rounded-xl border border-white/5 flex items-center justify-center cursor-pointer hover:border-kros-blue transition-all flex-shrink-0" :class="selectedIds.includes(payment.id) ? 'bg-kros-blue border-kros-blue' : ''">
          <svg v-if="selectedIds.includes(payment.id)" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" class="text-white"><polyline points="20 6 9 17 4 12"></polyline></svg>
        </div>
        <div class="min-w-0 flex-1 cursor-pointer" @click="$emit('open-client-details', payment)">
          <h5 class="text-xs font-bold text-white uppercase tracking-tight truncate">{{ payment.companies?.name }}</h5>
          <p class="text-[9px] text-white/40 font-medium tracking-wide truncate">{{ payment.companies?.actual_name || payment.companies?.name }}</p>
        </div>
      </div>

      <span 
        :class="[
          'text-[7px] font-black uppercase tracking-widest px-2 py-1 rounded-lg border flex-shrink-0',
          payment.status === 'paid' || payment.status === 'Pago'
            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
            : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
        ]"
      >
        {{ payment.status === 'paid' || payment.status === 'Pago' ? 'Pago' : 'Pendente' }}
      </span>
    </div>

    <!-- Info Grid -->
    <div class="grid grid-cols-2 gap-2 mb-3 pb-3 border-b border-white/5 flex-shrink-0">
      <div>
        <p class="text-[8px] text-white/40 font-bold uppercase tracking-widest mb-1">Vencimento</p>
        <p class="text-[10px] text-white/60 font-medium">{{ formatDate(payment.due_date) }}</p>
      </div>
      <div>
        <p class="text-[8px] text-white/40 font-bold uppercase tracking-widest mb-1">Pagamento</p>
        <p v-if="payment.paid_at" class="text-[10px] text-emerald-400 font-bold">{{ formatDate(payment.paid_at) }}</p>
        <p v-else class="text-[10px] text-white/30 font-medium">-</p>
      </div>
      <div>
        <p class="text-[8px] text-white/40 font-bold uppercase tracking-widest mb-1">Valor</p>
        <p class="text-sm text-white font-black tabular-nums">{{ formatCurrency(payment.amount) }}</p>
      </div>
      <div>
        <p class="text-[8px] text-white/40 font-bold uppercase tracking-widest mb-1">Plano</p>
        <p class="text-[9px] text-white/60 font-bold uppercase truncate">{{ payment.plan_name }}</p>
      </div>
    </div>

    <!-- Observações -->
    <div class="bg-gradient-to-br from-black/50 to-black/30 p-3 rounded-xl border border-white/5 text-[9px] text-white/50 leading-relaxed tracking-tight font-medium relative flex-1 overflow-hidden mb-3 break-words">
      <p class="line-clamp-3 italic">{{ payment.notes || 'Sem observações' }}</p>
    </div>

    <!-- Actions -->
    <div class="flex items-center gap-2 flex-shrink-0">
      <!-- Botão Pagar (se pendente) -->
      <button
        v-if="payment.status === 'pending' || payment.status === 'Pendente'"
        @click="$emit('pay', payment)"
        class="flex-1 py-2 px-3 rounded-xl transition-all border flex items-center justify-center gap-2 text-[8px] font-black uppercase tracking-[0.15em]"
        :style="{ backgroundColor: 'var(--kros-blue, #007BFF)', borderColor: 'var(--kros-blue, #007BFF)' }"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="text-white">
          <path d="M20 6 9 17l-5-5"/>
        </svg>
        <span class="text-white">Receber</span>
      </button>
      
      <!-- Botão Estornar (se pago) -->
      <button
        v-if="payment.status === 'paid' || payment.status === 'Pago'"
        @click="$emit('reverse', payment)"
        class="flex-1 py-2 px-3 bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400 rounded-xl transition-all border border-yellow-500/20 hover:border-yellow-500/40 flex items-center justify-center gap-2 text-[8px] font-black uppercase tracking-[0.15em]"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
          <path d="M3 3v5h5"/>
        </svg>
        Estornar
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  payment: any
  selectedIds: string[]
}>()

defineEmits<{
  pay: [payment: any]
  reverse: [payment: any]
  'open-client-details': [payment: any]
  'toggle-select': [id: string]
}>()

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)
}

const formatDate = (date: string) => {
  if (!date) return '-'
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' }).format(new Date(date))
}
</script>

<style scoped>
.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
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
