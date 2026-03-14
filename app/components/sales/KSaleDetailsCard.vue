<template>
  <div v-if="isOpen" class="fixed inset-0 z-[10000] flex items-center justify-center px-4">
    <div @click="$emit('close')" class="fixed inset-0 bg-black/90 backdrop-blur-xl"></div>
    
    <div class="relative bg-[#0D0D0E] border border-white/10 rounded-[2.5rem] w-full max-w-[600px] p-8 shadow-[0_0_100px_rgba(0,0,0,0.8)] animate-in fade-in zoom-in-95 duration-300">
      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-xl font-bold text-white uppercase tracking-widest">Detalhes da Venda</h2>
        <button 
          @click="$emit('close')"
          class="p-2 hover:bg-white/10 rounded-lg transition-all text-white/50 hover:text-white"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M18 6 6 18M6 6l12 12"/>
          </svg>
        </button>
      </div>

      <!-- Content -->
      <div class="space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
        <!-- Informações do Item -->
        <div class="bg-white/5 border border-white/10 rounded-xl p-4">
          <h3 class="text-sm font-bold text-white/70 uppercase tracking-widest mb-4">Item Cadastrado</h3>
          
          <div class="space-y-3">
            <!-- Nome do Item -->
            <div>
              <p class="text-[10px] font-bold text-white/50 uppercase tracking-widest mb-1">Nome</p>
              <p class="text-sm font-semibold text-white">{{ itemName }}</p>
            </div>

            <!-- Tipo -->
            <div>
              <p class="text-[10px] font-bold text-white/50 uppercase tracking-widest mb-1">Tipo</p>
              <div class="flex items-center gap-2">
                <span :class="[
                  'px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest',
                  itemType === 'Assinatura' ? 'bg-blue-500/20 text-blue-400' :
                  itemType === 'Serviço' ? 'bg-purple-500/20 text-purple-400' :
                  'bg-amber-500/20 text-amber-400'
                ]">
                  {{ itemType }}
                </span>
              </div>
            </div>

            <!-- Descrição -->
            <div v-if="itemDescription">
              <p class="text-[10px] font-bold text-white/50 uppercase tracking-widest mb-1">Descrição</p>
              <p class="text-sm text-white/80 leading-relaxed">{{ itemDescription }}</p>
            </div>

            <!-- Valor Base -->
            <div>
              <p class="text-[10px] font-bold text-white/50 uppercase tracking-widest mb-1">Valor Base</p>
              <p class="text-lg font-bold text-white">{{ formatCurrency(itemPrice) }}</p>
            </div>
          </div>
        </div>

        <!-- Observações da Venda -->
        <div class="bg-white/5 border border-white/10 rounded-xl p-4">
          <h3 class="text-sm font-bold text-white/70 uppercase tracking-widest mb-4">Observações</h3>
          
          <div v-if="notes" class="bg-white/5 rounded-lg p-3 border border-white/10">
            <p class="text-sm text-white/80 leading-relaxed whitespace-pre-wrap">{{ notes }}</p>
          </div>
          <div v-else class="text-sm text-white/50 italic">Nenhuma observação adicionada</div>
        </div>

        <!-- Informações Extras do Plano/Produto/Serviço -->
        <div v-if="planCategory || planNotes" class="bg-white/5 border border-white/10 rounded-xl p-4">
          <h3 class="text-sm font-bold text-white/70 uppercase tracking-widest mb-4">{{ planInfoTitle }}</h3>
          
          <div class="space-y-3">
            <div v-if="planCategory">
              <p class="text-[10px] font-bold text-white/50 uppercase tracking-widest mb-1">Categoria</p>
              <p class="text-sm text-white/80">{{ planCategory }}</p>
            </div>

            <div v-if="planNotes">
              <p class="text-[10px] font-bold text-white/50 uppercase tracking-widest mb-1">Anotações</p>
              <p class="text-sm text-white/80 leading-relaxed whitespace-pre-wrap">{{ planNotes }}</p>
            </div>
          </div>
        </div>

        <!-- Informações da Venda -->
        <div class="bg-white/5 border border-white/10 rounded-xl p-4">
          <h3 class="text-sm font-bold text-white/70 uppercase tracking-widest mb-4">Informações da Venda</h3>
          
          <div class="grid grid-cols-2 gap-4">
            <div>
              <p class="text-[10px] font-bold text-white/50 uppercase tracking-widest mb-1">Cliente</p>
              <p class="text-sm font-semibold text-white">{{ clientName }}</p>
            </div>

            <div>
              <p class="text-[10px] font-bold text-white/50 uppercase tracking-widest mb-1">Valor Final</p>
              <p class="text-sm font-semibold text-white">{{ formatCurrency(saleValue) }}</p>
            </div>

            <div>
              <p class="text-[10px] font-bold text-white/50 uppercase tracking-widest mb-1">Status</p>
              <span :class="[
                'px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest inline-block',
                paymentStatus === 'paid' ? 'bg-green-500/20 text-green-400' :
                paymentStatus === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                'bg-red-500/20 text-red-400'
              ]">
                {{ paymentStatus === 'paid' ? 'Pago' : paymentStatus === 'pending' ? 'Pendente' : 'Atrasado' }}
              </span>
            </div>

            <div>
              <p class="text-[10px] font-bold text-white/50 uppercase tracking-widest mb-1">Data</p>
              <p class="text-sm font-semibold text-white">{{ formatDate(saleDate) }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="mt-6 flex justify-end">
        <button 
          @click="$emit('close')"
          class="px-6 py-2.5 bg-white/10 hover:bg-white/20 rounded-lg border border-white/10 transition-all text-white font-bold uppercase tracking-widest text-[10px]"
        >
          Fechar
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useSaleFormatters } from '~/composables/useSaleFormatters'
import { computed } from 'vue'

const props = defineProps<{
  isOpen: boolean
  itemName: string
  itemType: string
  itemDescription?: string
  itemPrice: number
  notes?: string
  clientName: string
  saleValue: number
  paymentStatus: string
  saleDate: string
  planCategory?: string
  planNotes?: string
}>()

const emit = defineEmits(['close'])

const { formatCurrency, formatDate } = useSaleFormatters()

const planInfoTitle = computed(() => {
  if (props.itemType === 'produto') {
    return 'Informações do Produto'
  } else if (props.itemType === 'servico') {
    return 'Informações do Serviço'
  } else if (props.itemType === 'personalizado') {
    return 'Informações Personalizadas'
  }
  return 'Informações do Plano'
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
  border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.2);
}
</style>
