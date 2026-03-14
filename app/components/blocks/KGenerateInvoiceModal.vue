<template>
  <div 
    v-if="isOpen"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
    @click.self="$emit('close')"
  >
    <div class="bg-[#111112] border border-white/10 rounded-2xl p-8 w-full max-w-md shadow-2xl">
      <h2 class="text-xl font-bold text-white mb-4">Gerar Fatura</h2>
      
      <p class="text-white/70 text-sm mb-6">
        Deseja gerar uma nova fatura para <span class="text-white font-semibold">{{ payment?.company_name }}</span>?
      </p>
      
      <div class="bg-white/5 border border-white/10 rounded-xl p-4 mb-6">
        <div class="flex justify-between items-center mb-2">
          <span class="text-white/50 text-xs uppercase tracking-wider">Plano</span>
          <span class="text-white font-semibold">{{ payment?.plan_name }}</span>
        </div>
        <div class="flex justify-between items-center">
          <span class="text-white/50 text-xs uppercase tracking-wider">Valor</span>
          <span class="text-white font-bold text-lg">R$ {{ formatCurrency(payment?.amount) }}</span>
        </div>
      </div>
      
      <div class="flex gap-3">
        <button 
          @click="$emit('close')"
          class="flex-1 px-4 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl border border-white/10 transition-all text-sm font-bold uppercase tracking-wider"
        >
          Cancelar
        </button>
        <button 
          @click="$emit('confirm')"
          class="flex-1 px-4 py-3 text-white rounded-xl transition-all text-sm font-bold uppercase tracking-wider"
          :style="{ backgroundColor: 'var(--kros-blue, #007BFF)' }"
        >
          Gerar Fatura
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  isOpen: boolean
  payment: any
}>()

defineEmits<{
  close: []
  confirm: []
}>()

const formatCurrency = (value: number) => {
  if (!value) return '0,00'
  return value.toFixed(2).replace('.', ',')
}
</script>
