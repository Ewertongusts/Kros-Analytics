<template>
  <div class="overflow-x-auto no-scrollbar">
    <table class="w-full min-w-[900px] text-left border-separate border-spacing-y-3">
      <thead>
        <tr class="text-[10px] font-bold uppercase tracking-[0.15em] text-white/50">
          <th class="px-4 py-3">Empresa</th>
          <th class="px-4 py-3">Data Pagamento</th>
          <th class="px-4 py-3">Vencimento Original</th>
          <th class="px-4 py-3">Valor Pago</th>
          <th class="px-4 py-3">Plano</th>
          <th class="px-4 py-3 text-right">Observações</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="payment in payments" :key="payment.id" 
            class="group/row bg-white/[0.02] hover:bg-white/[0.04] transition-all rounded-2xl border border-transparent">
          <td class="px-4 py-5 first:rounded-l-2xl">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 font-bold text-[10px] border border-emerald-500/10">
                {{ payment.companies?.name?.charAt(0) || 'E' }}
              </div>
              <span class="font-semibold text-sm text-white uppercase tracking-tight">{{ payment.companies?.name }}</span>
            </div>
          </td>
          <td class="px-4 py-5 font-medium">
            <span class="text-xs font-bold text-emerald-400 uppercase tracking-widest">{{ formatDate(payment.paid_at) }}</span>
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
          <td class="px-4 py-5 last:rounded-r-2xl text-right">
            <span class="text-[10px] text-white/30 italic truncate max-w-[200px] block transition-all group-hover/row:text-white/60">
              {{ payment.notes || 'Sem observações' }}
            </span>
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
