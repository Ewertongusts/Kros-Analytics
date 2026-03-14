<template>
  <div class="group relative bg-gradient-to-br from-white/[0.03] to-white/[0.01] border border-white/10 hover:border-white/20 rounded-2xl p-4 transition-all duration-300 hover:shadow-xl hover:shadow-black/20 h-[280px] flex flex-col">
    <!-- Checkbox de Seleção -->
    <div class="absolute top-4 left-4 z-10">
      <div 
        @click="$emit('toggle-select', sale.id)" 
        class="w-5 h-5 rounded-md border border-white/10 flex items-center justify-center cursor-pointer hover:border-kros-blue transition-all" 
        :class="isSelected ? 'bg-kros-blue border-kros-blue' : 'bg-white/5'"
      >
        <svg v-if="isSelected" xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" class="text-white">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
      </div>
    </div>

    <!-- Header -->
    <div class="flex items-start justify-between mb-3 pl-8">
      <div class="flex-1 min-w-0">
        <h3 
          @click="$emit('open-client-details', sale)"
          class="font-bold text-white text-sm mb-1 cursor-pointer hover:text-kros-blue transition-colors truncate"
        >
          {{ sale.representative_name || sale.name }}
        </h3>
        <p class="text-xs text-white/50 truncate">{{ sale.name }}</p>
      </div>
      
      <!-- Badge de Tipo -->
      <span 
        :class="[
          'px-2 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider flex-shrink-0 ml-2',
          sale.sale_type === 'produto' ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-blue-400'
        ]"
      >
        {{ sale.sale_type === 'produto' ? 'Produto' : 'Serviço' }}
      </span>
    </div>

    <!-- Conteúdo -->
    <div class="flex-1 space-y-2 overflow-hidden">
      <!-- Item -->
      <div class="flex items-center justify-between">
        <span class="text-[10px] font-bold text-white/50 uppercase tracking-widest">Item</span>
        <span 
          @click="$emit('open-details', sale)"
          class="text-xs font-semibold text-white/80 cursor-pointer hover:text-white transition-colors truncate max-w-[60%] text-right"
        >
          {{ sale.plan_name || sale.custom_name }}
        </span>
      </div>

      <!-- Valor -->
      <div class="flex items-center justify-between">
        <span class="text-[10px] font-bold text-white/50 uppercase tracking-widest">Valor</span>
        <span class="text-sm font-black text-white">{{ formatCurrency(sale.monthly_price) }}</span>
      </div>

      <!-- Status -->
      <div class="flex items-center justify-between">
        <span class="text-[10px] font-bold text-white/50 uppercase tracking-widest">Status</span>
        <span 
          :class="[
            'px-2 py-1 rounded-lg text-[9px] font-bold uppercase',
            sale.payment_status === 'paid' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
          ]"
        >
          {{ sale.payment_status === 'paid' ? 'Pago' : 'Pendente' }}
        </span>
      </div>

      <!-- Data -->
      <div class="flex items-center justify-between">
        <span class="text-[10px] font-bold text-white/50 uppercase tracking-widest">Data</span>
        <span class="text-xs text-white/70">{{ formatDate(sale.created_at) }}</span>
      </div>
    </div>

    <!-- Ações -->
    <div class="grid grid-cols-4 gap-2 mt-3 pt-3 border-t border-white/10">
      <!-- Editar -->
      <button
        @click="$emit('edit', sale)"
        class="aspect-square p-3 rounded-xl bg-purple-500/10 text-purple-400 hover:bg-purple-500 hover:text-white transition-all flex items-center justify-center"
        title="Editar"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
        </svg>
      </button>

      <!-- Marcar Pago/Pendente -->
      <button
        @click="$emit('mark-paid', sale)"
        :class="[
          'aspect-square p-3 rounded-xl transition-all flex items-center justify-center',
          sale.payment_status === 'paid' 
            ? 'bg-amber-500/10 text-amber-400 hover:bg-amber-500 hover:text-white' 
            : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-white'
        ]"
        :title="sale.payment_status === 'paid' ? 'Marcar como Pendente' : 'Marcar como Pago'"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M20 6 9 17l-5-5"/>
        </svg>
      </button>

      <!-- WhatsApp -->
      <button
        @click="$emit('whatsapp', sale)"
        class="aspect-square p-3 rounded-xl bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-white transition-all flex items-center justify-center"
        title="Enviar WhatsApp"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 448 512" fill="currentColor">
          <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l115.3-30.2c32.4 17.7 68.8 27 108.6 27 122.4 0 222-99.6 222-222 0-59.3-23-115.1-65-157.1zM223.9 446.7c-33.1 0-65.6-8.9-93.9-25.7l-6.7-4-69.8 18.3 18.7-68.1-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 54 81.2 54.1 130.5 0 101.7-82.8 184.5-184.6 184.5zm100.5-137c-5.5-2.8-32.6-16.1-37.7-17.9-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-5.5-2.8-23.2-8.5-44.2-27.2-16.4-14.6-27.4-32.7-30.6-38.2-3.2-5.6-.3-8.6 2.5-11.3 2.5-2.5 5.5-6.5 8.3-9.7 2.8-3.2 3.7-5.5 5.6-9.2 1.9-3.7 1-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 13.2 5.7 23.5 9.2 31.6 11.8 13.3 4.2 25.4 3.6 35 2.2 10.7-1.6 32.6-13.3 37.2-26.2 4.6-12.9 4.6-24 3.2-26.2-1.4-2.3-5.1-3.7-10.6-6.5z"/>
        </svg>
      </button>

      <!-- Deletar -->
      <button
        @click="$emit('delete', sale)"
        class="aspect-square p-3 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center"
        title="Deletar"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M3 6h18"/>
          <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
          <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
          <line x1="10" y1="11" x2="10" y2="17"/>
          <line x1="14" y1="11" x2="14" y2="17"/>
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  sale: any
  isSelected: boolean
}>()

defineEmits(['toggle-select', 'edit', 'mark-paid', 'whatsapp', 'delete', 'open-client-details', 'open-details'])

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)
}

const formatDate = (date: string) => {
  if (!date) return '-'
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(date))
}
</script>
