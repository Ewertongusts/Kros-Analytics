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
      <p class="text-xs text-white/60">{{ formatDate(sale.created_at) }}</p>
      <p v-if="sale.created_by_name" class="text-[9px] text-white/40 mt-1">Por: {{ sale.created_by_name }}</p>
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
</script>
