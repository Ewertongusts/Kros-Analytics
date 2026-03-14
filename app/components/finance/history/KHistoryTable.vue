<template>
  <div class="overflow-x-auto no-scrollbar">
    <table class="w-full min-w-[900px] text-left border-separate border-spacing-y-3">
      <thead>
        <tr class="text-[10px] font-bold uppercase tracking-[0.15em] text-white/50">
          <th class="px-4 py-3">Cliente</th>
          <th class="px-4 py-3">Status</th>
          <th class="px-4 py-3">Data Pagamento</th>
          <th class="px-4 py-3">Vencimento</th>
          <th class="px-4 py-3">Valor</th>
          <th class="px-4 py-3">Plano</th>
          <th class="px-4 py-3">Observações</th>
          <th class="px-4 py-3 text-center">Ações</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="payment in payments" :key="payment.id" 
            class="group/row bg-white/[0.02] hover:bg-white/[0.04] transition-all rounded-2xl border border-transparent">
          <td class="px-4 py-5 first:rounded-l-2xl">
            <div class="cursor-pointer hover:opacity-80 transition-opacity" @click="$emit('open-client-details', payment)">
              <p class="font-semibold text-xs tracking-tight text-white uppercase">
                {{ payment.companies?.name }}
              </p>
              <p class="font-medium text-[10px] text-white/70 mt-1">
                {{ payment.companies?.actual_name || payment.companies?.name }}
              </p>
            </div>
          </td>
          <td class="px-4 py-5">
            <span 
              v-if="payment.status === 'paid' || payment.status === 'Pago'"
              class="px-2 py-1 bg-emerald-500/10 text-emerald-400 rounded-lg text-[10px] font-bold uppercase tracking-widest border border-emerald-500/20"
            >
              Pago
            </span>
            <span 
              v-else
              class="px-2 py-1 bg-yellow-500/10 text-yellow-400 rounded-lg text-[10px] font-bold uppercase tracking-widest border border-yellow-500/20"
            >
              Pendente
            </span>
          </td>
          <td class="px-4 py-5 font-medium">
            <span v-if="payment.paid_at" class="text-xs font-bold text-emerald-400 uppercase tracking-widest">{{ formatDate(payment.paid_at) }}</span>
            <span v-else class="text-xs font-medium text-white/30 uppercase tracking-widest">-</span>
          </td>
          <td class="px-4 py-5">
            <span class="text-xs font-medium text-white/40 uppercase tracking-widest">{{ formatDate(payment.due_date) }}</span>
          </td>
          <td class="px-4 py-5 font-bold tabular-nums text-white">
            {{ formatCurrency(payment.amount) }}
          </td>
          <td class="px-4 py-5">
            <span class="px-2 py-1 bg-white/5 rounded-lg text-[10px] font-bold text-white/60 uppercase tracking-widest">{{ payment.plan_name }}</span>
          </td>
          <td class="px-4 py-5">
            <span class="text-[10px] text-white/30 italic truncate max-w-[200px] block transition-all group-hover/row:text-white/60">
              {{ payment.notes || 'Sem observações' }}
            </span>
          </td>
          <td class="px-4 py-5 last:rounded-r-2xl text-center">
            <div class="flex items-center justify-center gap-2">
              <!-- Botão Pagar (se pendente) -->
              <button
                v-if="payment.status === 'pending' || payment.status === 'Pendente'"
                @click="$emit('pay', payment)"
                class="p-2 rounded-lg transition-all border flex items-center justify-center"
                :style="{ backgroundColor: 'var(--kros-blue, #007BFF)', borderColor: 'var(--kros-blue, #007BFF)' }"
                title="Receber Pagamento"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="text-white">
                  <path d="M20 6 9 17l-5-5"/>
                </svg>
              </button>
              
              <!-- Botão Estornar (se pago) -->
              <button
                v-if="payment.status === 'paid' || payment.status === 'Pago'"
                @click="$emit('reverse', payment)"
                class="p-2 bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400 rounded-lg transition-all border border-yellow-500/20 hover:border-yellow-500/40 flex items-center justify-center"
                title="Estornar Pagamento"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
                  <path d="M3 3v5h5"/>
                </svg>
              </button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  payments: any[]
}>()

defineEmits<{
  pay: [payment: any]
  reverse: [payment: any]
  'open-client-details': [payment: any]
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
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
