<template>
  <tr class="border-b border-white/5 hover:bg-white/[0.02] transition-colors" :class="isSelected ? 'bg-kros-blue/5' : ''">
    <!-- Checkbox -->
    <td class="px-6 py-4">
      <div @click="$emit('toggle-select', sale.id)" class="w-5 h-5 rounded-md border border-white/5 flex items-center justify-center cursor-pointer hover:border-kros-blue transition-all" :class="isSelected ? 'bg-kros-blue border-kros-blue' : ''">
        <svg v-if="isSelected" xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" class="text-white"><polyline points="20 6 9 17 4 12"></polyline></svg>
      </div>
    </td>

    <!-- Cliente -->
    <td class="px-6 py-4">
      <div class="cursor-pointer hover:opacity-80 transition-opacity" @click="$emit('open-client-details', sale)">
        <p class="text-sm font-bold text-white">{{ sale.representative_name || sale.name }}</p>
        <p v-if="sale.name && sale.representative_name" class="text-[10px] text-white/40">{{ sale.name }}</p>
      </div>
    </td>

    <!-- Tipo -->
    <td class="px-6 py-4">
      <span 
        class="px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-widest whitespace-nowrap"
        :class="{
          'bg-purple-500/10 text-purple-400': sale.sale_type === 'produto',
          'bg-blue-500/10 text-blue-400': sale.sale_type === 'servico',
          'bg-orange-500/10 text-orange-400': sale.sale_type === 'personalizado'
        }"
      >
        {{ sale.sale_type === 'produto' ? 'Produto' : sale.sale_type === 'servico' ? 'Serviço' : 'Personalizado' }}
      </span>
    </td>

    <!-- Plano -->
    <td class="px-6 py-4">
      <p class="text-sm font-medium text-white">{{ sale.plan_name || '-' }}</p>
    </td>

    <!-- Item -->
    <td class="px-6 py-4">
      <p class="text-sm font-medium text-white">{{ sale.custom_name || sale.plan_name || '-' }}</p>
      <p v-if="sale.custom_description" class="text-[10px] text-white/40 mt-1">{{ sale.custom_description }}</p>
    </td>

    <!-- Valor -->
    <td class="px-6 py-4">
      <p class="text-sm font-bold text-white">{{ formatCurrency(sale.monthly_price) }}</p>
    </td>

    <!-- Status -->
    <td class="px-6 py-4">
      <div class="flex items-center gap-2">
        <div :class="['w-2 h-2 rounded-full', sale.payment_status === 'paid' ? 'bg-emerald-500' : sale.payment_status === 'pending' ? 'bg-orange-500' : 'bg-blue-500']"></div>
        <div>
          <span class="text-xs font-medium text-white/80">
            {{ sale.payment_status === 'paid' ? 'Pago' : sale.payment_status === 'pending' ? 'Pendente' : 'Agendado' }}
          </span>
          <p v-if="sale.received_by_name && sale.payment_status === 'paid' && sale.sale_type !== 'servico'" class="text-[9px] text-white/60 mt-1">
            Recebido por: {{ sale.received_by_name }}
          </p>
          <p v-if="sale.payment_date && sale.payment_status !== 'paid'" class="text-[9px] text-white/40 mt-1">
            {{ sale.payment_status === 'scheduled' ? 'Agendado para' : 'Vence em' }}: {{ formatDate(sale.payment_date) }}
          </p>
        </div>
      </div>
    </td>

    <!-- Data -->
    <td class="px-6 py-4">
      <p class="text-xs text-white/60">{{ formatDate(sale.created_at) }}</p>
    </td>

    <!-- Ações -->
    <td class="px-6 py-4">
      <SalesTableKSaleActionButtons
        :payment-status="sale.payment_status"
        @edit="$emit('edit', sale)"
        @history="$emit('history', sale)"
        @whatsapp="$emit('whatsapp', sale)"
        @copy="$emit('copy', sale)"
        @report="$emit('report', sale)"
        @delete="$emit('delete', sale)"
        @mark-paid="$emit('mark-paid', sale)"
        @open-details="$emit('open-details', sale)"
      />
    </td>
  </tr>
</template>

<script setup lang="ts">
const props = defineProps<{
  sale: any
  isSelected?: boolean
}>()

const emit = defineEmits<{
  edit: [sale: any]
  history: [sale: any]
  whatsapp: [sale: any]
  copy: [sale: any]
  report: [sale: any]
  delete: [sale: any]
  'toggle-select': [id: string]
  'mark-paid': [sale: any]
  'open-client-details': [sale: any]
  'open-details': [sale: any]
}>()

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

const formatDateTime = (date: string) => {
  return new Date(date).toLocaleString('pt-BR', { 
    day: '2-digit', 
    month: '2-digit', 
    hour: '2-digit', 
    minute: '2-digit' 
  })
}
</script>
