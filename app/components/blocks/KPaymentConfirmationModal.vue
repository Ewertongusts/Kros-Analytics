<template>
  <div v-if="isOpen" class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
    <div class="bg-[#0D0D0E] border border-white/10 w-full max-w-sm rounded-[2rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
      
      <!-- Header -->
      <div class="px-6 py-5 border-b border-white/5 bg-gradient-to-r from-kros-blue/5 to-transparent">
        <h3 class="text-xl font-bold text-white tracking-tighter uppercase italic flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="text-kros-blue"><path d="M12 2v20"/><path d="m17 5-5-3-5 3"/><path d="m17 19-5 3-5-3"/><path d="M2 12h20"/><path d="m5 7 3 5-3 5"/><path d="m19 7-3 5 3 5"/></svg>
          RECEBER <span class="text-kros-blue">PAGAMENTO</span>
        </h3>
        <p class="text-[9px] text-white/40 font-bold uppercase tracking-[0.2em] mt-1">
          Empresa: {{ payment.company_name }}
        </p>
      </div>

      <!-- Content -->
      <div class="p-6 space-y-6">
        <!-- Tipo de Pagamento -->
        <div class="space-y-4">
          <label class="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] ml-1">Tipo de Recebimento</label>
          <div class="grid grid-cols-2 gap-3">
            <button 
              @click="paymentType = 'total'"
              :class="[
                'p-3 rounded-xl border transition-all text-left group',
                paymentType === 'total' 
                  ? 'bg-kros-blue/10 border-kros-blue text-white' 
                  : 'bg-white/5 border-white/5 text-white/40 hover:border-white/10'
              ]"
            >
              <div class="text-[10px] font-bold uppercase tracking-tighter mb-0.5">Total</div>
              <div class="text-sm font-bold tracking-tighter" :class="paymentType === 'total' ? 'text-kros-blue' : ''">
                {{ formatCurrency(payment.amount) }}
              </div>
            </button>

            <button 
              @click="paymentType = 'partial'"
              :class="[
                'p-3 rounded-xl border transition-all text-left group',
                paymentType === 'partial' 
                  ? 'bg-kros-blue/10 border-kros-blue/50 text-white' 
                  : 'bg-white/5 border-white/5 text-white/40 hover:border-white/10'
              ]"
            >
              <div class="text-[10px] font-bold uppercase tracking-tighter mb-0.5">Parcial</div>
              <div class="text-[8px] font-medium opacity-50">Inserir valor</div>
            </button>
          </div>
        </div>

        <!-- Input Valor Parcial (condicional) -->
        <div v-if="paymentType === 'partial'" class="space-y-3 animate-in fade-in zoom-in-95 duration-300">
          <label class="text-[9px] font-bold text-white/30 uppercase tracking-[0.2em] ml-1">Valor Recebido</label>
          <div class="relative group">
            <div class="absolute left-4 top-1/2 -translate-y-1/2 text-kros-blue/40 font-bold tracking-tighter text-sm">R$</div>
            <input 
              v-model="partialAmount"
              type="number" 
              class="w-full bg-white/[0.03] border border-white/5 rounded-xl py-3 pl-10 pr-4 text-white font-bold tracking-tight focus:border-kros-blue/30 outline-none transition-all text-sm"
              placeholder="0,00"
            />
          </div>
        </div>

        <!-- Observação -->
        <div class="space-y-4">
          <label class="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] ml-1">Observação Interna</label>
          <textarea 
            v-model="notes"
            rows="2"
            class="w-full bg-white/5 border border-white/5 rounded-xl p-3 text-sm text-white focus:border-white/20 outline-none transition-all resize-none"
            placeholder="Ex: Pago via PIX..."
          ></textarea>
        </div>
      </div>

      <!-- Actions -->
      <div class="p-6 bg-white/[0.02] border-t border-white/5 flex gap-3">
        <button 
          @click="$emit('close')"
          class="flex-1 px-4 py-3 rounded-xl text-[9px] font-bold uppercase tracking-widest text-white/40 hover:bg-white/5 transition-all text-center"
        >
          Sair
        </button>
        <button 
          @click="handleConfirm"
          :disabled="loading || (paymentType === 'partial' && !partialAmount)"
          class="flex-2 px-6 py-3 bg-kros-blue hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-[9px] font-bold uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-kros-blue/10"
        >
          <span v-if="!loading">Baixar Cobrança</span>
          <span v-else class="flex items-center gap-2">
            <svg class="animate-spin h-3 w-3" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            ...
          </span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
  isOpen: boolean
  payment: any
  loading?: boolean
}>()

const emit = defineEmits(['close', 'confirm'])

const paymentType = ref<'total' | 'partial'>('total')
const partialAmount = ref<number | null>(null)
const notes = ref('')

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)
}

const handleConfirm = () => {
  emit('confirm', {
    type: paymentType.value,
    amount: paymentType.value === 'total' ? props.payment.amount : partialAmount.value,
    notes: notes.value
  })
}
</script>
