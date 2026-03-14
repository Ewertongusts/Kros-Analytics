<template>
  <div class="grid grid-cols-4 gap-4">
    <div class="p-6 rounded-2xl bg-white/5 border border-white/10">
      <p class="text-[10px] font-bold uppercase tracking-widest text-white/50 mb-2">Total Pago</p>
      <p class="text-2xl font-black text-green-400">{{ formatCurrency(summary.totalPaid) }}</p>
      <p class="text-[10px] text-white/40 mt-2">{{ summary.count }} pagamentos</p>
    </div>
    <div class="p-6 rounded-2xl bg-white/5 border border-white/10">
      <p class="text-[10px] font-bold uppercase tracking-widest text-white/50 mb-2">Média</p>
      <p class="text-2xl font-black text-white">{{ formatCurrency(summary.average) }}</p>
      <p class="text-[10px] text-white/40 mt-2">por pagamento</p>
    </div>
    <div class="p-6 rounded-2xl bg-white/5 border border-white/10">
      <p class="text-[10px] font-bold uppercase tracking-widest text-white/50 mb-2">Período</p>
      <p class="text-2xl font-black text-white">{{ dateRange }}</p>
      <p class="text-[10px] text-white/40 mt-2">últimos pagamentos</p>
    </div>
    <div class="p-6 rounded-2xl bg-white/5 border border-white/10">
      <p class="text-[10px] font-bold uppercase tracking-widest text-white/50 mb-2">Status</p>
      <p class="text-2xl font-black text-blue-400">{{ summary.count }}</p>
      <p class="text-[10px] text-white/40 mt-2">registros</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Summary {
  totalPaid: number
  count: number
  average: number
  byCategory: Record<string, number>
}

interface Props {
  summary: Summary
}

defineProps<Props>()

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)
}

const dateRange = computed(() => {
  return 'Últimos 30 dias'
})
</script>
