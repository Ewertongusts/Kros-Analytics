<template>
  <tr class="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
    <!-- Cliente -->
    <td class="px-6 py-4">
      <div>
        <p class="text-sm font-bold text-white">{{ sale.representative_name || sale.name }}</p>
        <p v-if="sale.name && sale.representative_name" class="text-[10px] text-white/40">{{ sale.name }}</p>
      </div>
    </td>

    <!-- Tipo -->
    <td class="px-6 py-4">
      <span 
        class="px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-widest"
        :class="{
          'bg-purple-500/10 text-purple-400': sale.sale_type === 'produto',
          'bg-blue-500/10 text-blue-400': sale.sale_type === 'servico',
          'bg-orange-500/10 text-orange-400': sale.sale_type === 'personalizado'
        }"
      >
        {{ sale.sale_type === 'produto' ? '📦 Produto' : sale.sale_type === 'servico' ? '🛠️ Serviço' : '✨ Personalizado' }}
      </span>
    </td>

    <!-- Item -->
    <td class="px-6 py-4">
      <p class="text-sm font-medium text-white">{{ sale.plan_name || sale.custom_name }}</p>
      <p v-if="sale.custom_description" class="text-[10px] text-white/40 mt-1">{{ sale.custom_description }}</p>
    </td>

    <!-- Categoria -->
    <td class="px-6 py-4">
      <span v-if="sale.custom_category" class="px-2 py-1 rounded-lg bg-white/5 text-white/60 text-[9px] font-bold uppercase">
        {{ sale.custom_category }}
      </span>
      <span v-else class="text-white/30 text-xs">—</span>
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
          <p v-if="sale.received_by_name && sale.payment_status === 'paid'" class="text-[9px] text-emerald-400 mt-1">
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
      <div>
        <p class="text-[10px] text-white/40 uppercase tracking-wider mb-1">Criação</p>
        <p class="text-xs text-white/60">{{ formatDate(sale.created_at) }}</p>
        <p v-if="sale.created_by_name" class="text-[9px] text-white/40 mt-0.5">Por: {{ sale.created_by_name }}</p>
      </div>
      <div v-if="sale.last_receipt_sent_at" class="mt-3 pt-3 border-t border-white/5">
        <p class="text-[10px] text-green-400 uppercase tracking-wider mb-1 flex items-center gap-1">
          <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 448 512" fill="currentColor">
            <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"/>
          </svg>
          Último envio
        </p>
        <p class="text-xs text-green-400 font-medium">{{ formatDateTime(sale.last_receipt_sent_at) }}</p>
      </div>
    </td>

    <!-- Ações -->
    <td class="px-6 py-4">
      <SalesTableKSaleActionButtons
        @edit="$emit('edit', sale)"
        @whatsapp="$emit('whatsapp', sale)"
        @copy="$emit('copy', sale)"
        @report="$emit('report', sale)"
        @delete="$emit('delete', sale)"
      />
    </td>
  </tr>
</template>

<script setup lang="ts">
const props = defineProps<{
  sale: any
}>()

const emit = defineEmits<{
  edit: [sale: any]
  whatsapp: [sale: any]
  copy: [sale: any]
  report: [sale: any]
  delete: [sale: any]
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
