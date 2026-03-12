<template>
  <div class="space-y-2">
    <SalesUiKSaleCheckbox 
      id="custom-installments"
      v-model="customInstallmentsLocal"
    >
      Valores diferentes por parcela
    </SalesUiKSaleCheckbox>

    <div v-if="customInstallmentsLocal" class="space-y-2 max-h-[200px] overflow-y-auto custom-scrollbar p-2">
      <div v-for="(_, index) in installmentsListLocal" :key="index" class="flex items-center gap-2">
        <span class="text-[10px] font-bold text-white/60 w-20">{{ index + 1 }}ª parcela</span>
        <div class="relative flex-1">
          <span class="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-white/40">R$</span>
          <input 
            v-model.number="installmentsListLocal[index]"
            type="number"
            step="0.01"
            min="0"
            placeholder="0,00"
            class="w-full bg-white/[0.03] border border-white/10 rounded-lg pl-10 pr-3 py-2 text-xs text-white outline-none focus:border-kros-blue transition-all font-medium placeholder:text-white/20"
          />
        </div>
      </div>
      
      <div class="pt-2 border-t border-white/10 flex justify-between items-center">
        <span class="text-[10px] font-bold uppercase tracking-wider text-white/60">Total das parcelas:</span>
        <span class="text-xs font-bold text-white">{{ formatCurrency(totalCustomInstallments) }}</span>
      </div>
      
      <div v-if="hasDownPayment" class="flex justify-between items-center text-[10px]">
        <span class="text-white/60">Valor restante a parcelar:</span>
        <span class="font-bold text-white">{{ formatCurrency(remainingAmount) }}</span>
      </div>
      
      <p v-if="Math.abs(totalCustomInstallments - remainingAmount) > 0.01" class="text-[9px] text-orange-400 flex items-center gap-1 p-2 bg-orange-500/10 rounded-lg">
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
        Diferença de {{ formatCurrency(Math.abs(totalCustomInstallments - remainingAmount)) }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  customInstallments: boolean
  installmentsList: number[]
  installments: number
  remainingAmount: number
  hasDownPayment: boolean
}>()

const emit = defineEmits<{
  'update:customInstallments': [value: boolean]
  'update:installmentsList': [value: number[]]
}>()

const customInstallmentsLocal = computed({
  get: () => props.customInstallments,
  set: (value) => emit('update:customInstallments', value)
})

const installmentsListLocal = computed({
  get: () => props.installmentsList,
  set: (value) => emit('update:installmentsList', value)
})

const totalCustomInstallments = computed(() => {
  return props.installmentsList.reduce((sum, val) => sum + (val || 0), 0)
})

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
