<template>
  <div v-if="isOpen" class="fixed inset-0 z-[200] flex items-center justify-center px-4">
    <div @click="$emit('close')" class="absolute inset-0 bg-black/80 backdrop-blur-sm"></div>
    <div class="relative bg-[#111112] border border-white/10 rounded-2xl p-6 max-w-md w-full shadow-2xl animate-in zoom-in-95 fade-in duration-200">
      <div class="flex items-center gap-3 mb-4">
        <div class="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
        </div>
        <div>
          <h3 class="text-sm font-black text-white uppercase tracking-tight">Marcar como Pago</h3>
          <p class="text-[10px] text-white/40 font-bold uppercase tracking-wider mt-0.5">{{ payments.length }} pagamentos selecionados</p>
        </div>
      </div>

      <div class="mb-4 p-3 bg-white/[0.02] rounded-xl border border-white/5">
        <p class="text-[10px] font-bold text-white/60 uppercase tracking-wider mb-2">Empresas:</p>
        <div class="max-h-32 overflow-y-auto custom-scrollbar space-y-1">
          <div v-for="payment in payments" :key="payment.id" class="flex items-center justify-between text-[10px] py-1">
            <span class="text-white/70 font-medium">{{ payment.company_name }}</span>
            <span class="text-white font-bold">{{ formatCurrency(payment.amount) }}</span>
          </div>
        </div>
      </div>

      <div class="flex items-center justify-between p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20 mb-4">
        <span class="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Total</span>
        <span class="text-sm font-black text-emerald-500">{{ formatCurrency(total) }}</span>
      </div>

      <div class="flex gap-3">
        <button 
          @click="$emit('close')"
          class="flex-1 py-3 text-[10px] font-bold text-white/40 hover:text-white uppercase tracking-widest hover:bg-white/5 rounded-xl transition-all"
        >
          Cancelar
        </button>
        <button 
          @click="$emit('confirm')"
          class="flex-1 py-3 bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all"
        >
          Confirmar
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { formatCurrency } from '~/utils/validators'

const props = defineProps<{
  isOpen: boolean
  payments: any[]
}>()

defineEmits(['close', 'confirm'])

const total = computed(() => {
  return props.payments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0)
})
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
  border-radius: 4px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.2);
}
</style>
