<template>
  <div class="bg-gradient-to-br from-kros-blue/10 to-purple-500/10 border border-kros-blue/30 rounded-2xl p-4">
    <h4 class="text-[10px] font-bold uppercase tracking-widest text-kros-blue mb-3">📊 Resumo da Venda</h4>
    
    <div class="space-y-2">
      <div class="flex justify-between items-center">
        <span class="text-[10px] text-white/60">Cliente:</span>
        <span class="text-xs font-bold text-white truncate ml-2">{{ clientName || '—' }}</span>
      </div>
      
      <div v-if="itemName" class="flex justify-between items-center">
        <span class="text-[10px] text-white/60">Item:</span>
        <span class="text-xs font-bold text-white truncate ml-2">{{ itemName }}</span>
      </div>

      <div v-if="customName" class="flex justify-between items-center">
        <span class="text-[10px] text-white/60">Nome:</span>
        <span class="text-xs font-bold text-white truncate ml-2">{{ customName }}</span>
      </div>
      
      <div class="h-px bg-white/10 my-2"></div>
      
      <div class="flex justify-between items-center">
        <span class="text-[10px] text-white/60">Valor:</span>
        <span :class="hasDiscount && discountAmount > 0 ? 'text-sm font-bold text-white/60 line-through' : 'text-lg font-black text-white'">
          {{ formatCurrency(originalValue) }}
        </span>
      </div>

      <div v-if="hasDiscount && discountAmount > 0" class="flex justify-between items-center">
        <span class="text-[10px] text-emerald-400">Desconto:</span>
        <span class="text-sm font-bold text-emerald-400">- {{ formatCurrency(discountAmount) }}</span>
      </div>

      <div v-if="hasDiscount && discountAmount > 0" class="flex justify-between items-center pt-2 border-t border-emerald-500/20">
        <span class="text-[10px] text-white/60">Valor final:</span>
        <span class="text-lg font-black text-white">{{ formatCurrency(finalValue) }}</span>
      </div>

      <div v-if="hasDownPayment && downPayment > 0" class="flex justify-between items-center pt-2 border-t border-white/10">
        <span class="text-[10px] text-emerald-400">Entrada:</span>
        <span class="text-sm font-bold text-emerald-400">{{ formatCurrency(downPayment) }}</span>
      </div>

      <div v-if="hasInterest && interestAmount > 0" class="flex justify-between items-center">
        <span class="text-[10px] text-orange-400">Juros:</span>
        <span class="text-sm font-bold text-orange-400">+ {{ formatCurrency(interestAmount) }}</span>
      </div>

      <div v-if="hasInstallments" class="flex justify-between items-center pt-2 border-t border-white/10">
        <span class="text-[10px] text-white/60">Parcelas:</span>
        <span class="text-sm font-bold text-kros-blue">{{ installments }}x de {{ installmentValue }}</span>
      </div>

      <div v-if="paymentType" class="flex justify-between items-center">
        <span class="text-[10px] text-white/60">Pagamento:</span>
        <span class="text-xs font-bold text-white">{{ paymentType }}</span>
      </div>

      <div v-if="paymentStatus" class="flex justify-between items-center">
        <span class="text-[10px] text-white/60">Status:</span>
        <span :class="[
          'text-xs font-bold',
          paymentStatus === 'paid' ? 'text-emerald-400' : 
          paymentStatus === 'pending' ? 'text-orange-400' : 
          'text-blue-400'
        ]">
          {{ 
            paymentStatus === 'paid' ? '✅ Pago' : 
            paymentStatus === 'pending' ? '⏳ Pendente' : 
            '📅 Agendado'
          }}
        </span>
      </div>

      <div v-if="paymentDate && (paymentStatus === 'scheduled' || paymentStatus === 'pending')" class="flex justify-between items-center">
        <span class="text-[10px] text-white/60">Data:</span>
        <span class="text-xs font-bold text-white">{{ formatDate(paymentDate) }}</span>
      </div>

      <div class="h-px bg-white/10 my-2"></div>

      <div class="flex justify-between items-center">
        <span class="text-[10px] text-white/60">Criado por:</span>
        <span class="text-xs font-bold text-white">{{ createdBy }}</span>
      </div>

      <div v-if="paymentStatus === 'paid'" class="flex justify-between items-center">
        <span class="text-[10px] text-emerald-400">Recebido por:</span>
        <span class="text-xs font-bold text-emerald-400">{{ receivedBy }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  clientName: string
  itemName: string
  customName: string
  originalValue: number
  hasDiscount: boolean
  discountAmount: number
  finalValue: number
  hasDownPayment: boolean
  downPayment: number
  hasInterest: boolean
  interestAmount: number
  hasInstallments: boolean
  installments: number
  installmentValue: string
  paymentType: string
  paymentStatus: string
  paymentDate: string
  createdBy: string
  receivedBy: string
}>()

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)
}

const formatDate = (date: string) => {
  if (!date) return ''
  return new Date(date + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}
</script>
