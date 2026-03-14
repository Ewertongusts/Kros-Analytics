<template>
  <div v-if="isOpen" class="fixed inset-0 z-[10000] flex items-center justify-center px-4">
    <div @click="$emit('close')" class="fixed inset-0 bg-black/90 backdrop-blur-xl"></div>
    
    <div class="relative bg-[#0D0D0E] border border-white/10 rounded-2xl w-full max-w-[420px] p-6 shadow-[0_0_100px_rgba(0,0,0,0.8)] animate-in fade-in zoom-in-95 duration-300 flex flex-col max-h-[85vh]">
      <!-- Header -->
      <div class="flex items-center justify-between mb-4 pb-4 border-b border-white/10">
        <h2 class="text-lg font-bold text-white uppercase tracking-widest">{{ headerTitle }}</h2>
        <button 
          @click="$emit('close')"
          class="p-1.5 hover:bg-white/10 rounded-lg transition-all text-white/50 hover:text-white"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M18 6 6 18M6 6l12 12"/>
          </svg>
        </button>
      </div>

      <!-- Content with scroll -->
      <div class="space-y-4 overflow-y-auto flex-1 pr-2 custom-scrollbar">
        <!-- Informações do Item -->
        <div class="bg-white/5 border border-white/10 rounded-xl p-4">
          <h3 class="text-xs font-bold text-white/70 uppercase tracking-widest mb-3">{{ itemInfoTitle }}</h3>
          
          <div class="space-y-2">
            <!-- Nome do Item -->
            <div>
              <p class="text-[9px] font-bold text-white/50 uppercase tracking-widest mb-0.5">Nome</p>
              <p class="text-xs font-semibold text-white">{{ itemName }}</p>
            </div>

            <!-- Tipo -->
            <div>
              <p class="text-[9px] font-bold text-white/50 uppercase tracking-widest mb-0.5">Tipo</p>
              <div class="flex items-center gap-2">
                <span :class="[
                  'px-2 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-widest',
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
              <p class="text-[9px] font-bold text-white/50 uppercase tracking-widest mb-0.5">Descrição</p>
              <p class="text-xs text-white/80 leading-relaxed">{{ itemDescription }}</p>
            </div>

            <!-- Valor Base -->
            <div>
              <p class="text-[9px] font-bold text-white/50 uppercase tracking-widest mb-0.5">Valor Base</p>
              <p class="text-base font-bold text-white">{{ formatCurrency(itemPrice) }}</p>
            </div>
          </div>
        </div>

        <!-- Observações da Venda -->
        <div class="bg-white/5 border border-white/10 rounded-xl p-4">
          <h3 class="text-xs font-bold text-white/70 uppercase tracking-widest mb-2">Observações</h3>
          
          <div v-if="notes" class="bg-white/5 rounded-lg p-2 border border-white/10">
            <p class="text-xs text-white/80 leading-relaxed whitespace-pre-wrap">{{ notes }}</p>
          </div>
          <div v-else class="text-xs text-white/50 italic">Nenhuma observação</div>
        </div>

        <!-- Informações Extras do Plano/Produto/Serviço -->
        <div v-if="planCategory || planNotes" class="bg-white/5 border border-white/10 rounded-xl p-4">
          <h3 class="text-xs font-bold text-white/70 uppercase tracking-widest mb-2">{{ planInfoTitle }}</h3>
          
          <div class="space-y-2">
            <div v-if="planCategory">
              <p class="text-[9px] font-bold text-white/50 uppercase tracking-widest mb-0.5">Categoria</p>
              <p class="text-xs text-white/80">{{ planCategory }}</p>
            </div>

            <div v-if="planNotes">
              <p class="text-[9px] font-bold text-white/50 uppercase tracking-widest mb-0.5">Anotações</p>
              <p class="text-xs text-white/80 leading-relaxed whitespace-pre-wrap">{{ planNotes }}</p>
            </div>
          </div>
        </div>

        <!-- Informações da Venda/Assinatura -->
        <div class="bg-white/5 border border-white/10 rounded-xl p-4">
          <h3 class="text-xs font-bold text-white/70 uppercase tracking-widest mb-3">{{ saleInfoTitle }}</h3>
          
          <div class="grid grid-cols-2 gap-3">
            <div>
              <p class="text-[9px] font-bold text-white/50 uppercase tracking-widest mb-0.5">Cliente</p>
              <p class="text-xs font-semibold text-white">{{ clientName }}</p>
            </div>

            <div>
              <p class="text-[9px] font-bold text-white/50 uppercase tracking-widest mb-0.5">Valor Final</p>
              <p class="text-xs font-semibold text-white">{{ formatCurrency(saleValue) }}</p>
            </div>

            <div>
              <p class="text-[9px] font-bold text-white/50 uppercase tracking-widest mb-0.5">Status</p>
              <span :class="[
                'px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-widest inline-block',
                statusColor
              ]">
                {{ statusLabel }}
              </span>
            </div>

            <div>
              <p class="text-[9px] font-bold text-white/50 uppercase tracking-widest mb-0.5">Data</p>
              <p class="text-xs font-semibold text-white">{{ formatDate(saleDate) }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="mt-4 pt-4 border-t border-white/10 flex justify-end">
        <button 
          @click="$emit('close')"
          class="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg border border-white/10 transition-all text-white font-bold uppercase tracking-widest text-[9px]"
        >
          Fechar
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useSaleFormatters } from '~/composables/useSaleFormatters'
import { computed, watch } from 'vue'

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

// Debug logs
watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    console.log('🎯 [KSaleDetailsCard] Modal aberto com props:')
    console.log('  itemName:', props.itemName)
    console.log('  itemType:', props.itemType)
    console.log('  itemDescription:', props.itemDescription)
    console.log('  itemPrice:', props.itemPrice)
    console.log('  saleValue:', props.saleValue)
    console.log('  paymentStatus:', props.paymentStatus)
    console.log('  clientName:', props.clientName)
    console.log('  planCategory:', props.planCategory)
    console.log('  planNotes:', props.planNotes)
  }
})

const headerTitle = computed(() => {
  if (props.itemType === 'Assinatura') {
    return 'Detalhes do Plano'
  }
  return 'Detalhes da Venda'
})

const itemInfoTitle = computed(() => {
  if (props.itemType === 'Assinatura') {
    return 'Plano Cadastrado'
  }
  return 'Item Cadastrado'
})

const saleInfoTitle = computed(() => {
  if (props.itemType === 'Assinatura') {
    return 'Informações da Assinatura'
  }
  return 'Informações da Venda'
})

const statusLabel = computed(() => {
  if (props.itemType === 'Assinatura') {
    // Para assinaturas: active, suspended, cancelled, trial, pending
    const statusMap: Record<string, string> = {
      'active': 'Ativa',
      'suspended': 'Suspensa',
      'cancelled': 'Cancelada',
      'trial': 'Teste',
      'pending': 'Pendente'
    }
    return statusMap[props.paymentStatus] || props.paymentStatus
  }
  // Para vendas: paid, pending, overdue
  return props.paymentStatus === 'paid' ? 'Pago' : props.paymentStatus === 'pending' ? 'Pendente' : 'Atrasado'
})

const statusColor = computed(() => {
  if (props.itemType === 'Assinatura') {
    const colorMap: Record<string, string> = {
      'active': 'bg-green-500/20 text-green-400',
      'suspended': 'bg-yellow-500/20 text-yellow-400',
      'cancelled': 'bg-red-500/20 text-red-400',
      'trial': 'bg-blue-500/20 text-blue-400',
      'pending': 'bg-orange-500/20 text-orange-400'
    }
    return colorMap[props.paymentStatus] || 'bg-gray-500/20 text-gray-400'
  }
  return props.paymentStatus === 'paid' ? 'bg-green-500/20 text-green-400' :
         props.paymentStatus === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
         'bg-red-500/20 text-red-400'
})

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
