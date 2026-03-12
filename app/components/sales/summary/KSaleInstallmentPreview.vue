<template>
  <div v-if="hasInstallments && installments > 0" class="bg-white/[0.02] border border-white/10 rounded-2xl p-4">
    <h4 class="text-[10px] font-bold uppercase tracking-widest text-white/60 mb-3">📅 Preview das Parcelas</h4>
    
    <div class="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar">
      <!-- Entrada -->
      <div v-if="hasDownPayment && downPayment > 0" class="flex items-center justify-between p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
        <div class="flex items-center gap-2">
          <span class="text-[10px] font-bold text-emerald-400">ENTRADA</span>
        </div>
        <div class="text-right">
          <p class="text-xs font-bold text-white">{{ formatCurrency(downPayment) }}</p>
          <p class="text-[9px] text-emerald-400">{{ downPaymentType || '—' }}</p>
        </div>
      </div>

      <!-- Parcelas -->
      <div v-for="i in installments" :key="i" class="flex items-center justify-between p-2 bg-white/[0.02] border border-white/10 rounded-lg">
        <div class="flex items-center gap-2">
          <span class="text-[10px] font-bold text-white/60">{{ i }}ª parcela</span>
        </div>
        <div class="text-right">
          <p class="text-xs font-bold text-white">
            {{ customInstallments && installmentsList[i-1] !== undefined ? formatCurrency(Number(installmentsList[i-1])) : installmentValue }}
          </p>
          <p class="text-[9px] text-blue-400">{{ installmentsPaymentType || downPaymentType || '—' }}</p>
        </div>
      </div>
    </div>

    <!-- Total -->
    <div class="mt-3 pt-3 border-t border-white/10 flex justify-between items-center">
      <span class="text-[10px] font-bold uppercase tracking-widest text-white/60">Total Geral:</span>
      <span class="text-lg font-black text-kros-blue">
        {{ formatCurrency((hasDownPayment ? downPayment : 0) + totalInstallmentsAmount) }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  hasInstallments: boolean
  installments: number
  hasDownPayment: boolean
  downPayment: number
  downPaymentType: string
  installmentsPaymentType: string
  installmentValue: string
  customInstallments: boolean
  installmentsList: number[]
  totalInstallmentsAmount: number
}>()

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)
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
  background: rgba(0, 123, 255, 0.1);
  border-radius: 10px;
}
</style>
