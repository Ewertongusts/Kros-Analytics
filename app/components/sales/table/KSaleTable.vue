<template>
  <div class="bg-white/[0.02] border border-white/10 rounded-2xl overflow-hidden">
    <div class="overflow-x-auto">
      <table class="w-full">
        <thead class="bg-white/[0.02] border-b border-white/10">
          <tr>
            <th class="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-widest text-white/60">Cliente</th>
            <th class="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-widest text-white/60">Tipo</th>
            <th class="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-widest text-white/60">Item</th>
            <th class="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-widest text-white/60">Categoria</th>
            <th class="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-widest text-white/60">Valor</th>
            <th class="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-widest text-white/60">Status</th>
            <th class="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-widest text-white/60">Data</th>
            <th class="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-widest text-white/60">Ações</th>
          </tr>
        </thead>
        <tbody>
          <SalesTableKSaleTableRow
            v-for="sale in sales"
            :key="sale.id"
            :sale="sale"
            @edit="$emit('edit', $event)"
            @history="$emit('history', $event)"
            @whatsapp="$emit('whatsapp', $event)"
            @copy="$emit('copy', $event)"
            @report="$emit('report', $event)"
            @delete="$emit('delete', $event)"
          />
          <tr v-if="sales.length === 0">
            <td colspan="8" class="px-6 py-12 text-center">
              <div class="flex flex-col items-center gap-3 opacity-40">
                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="text-white">
                  <circle cx="11" cy="11" r="8"></circle>
                  <path d="m21 21-4.3-4.3"></path>
                </svg>
                <p class="text-sm font-bold uppercase tracking-widest text-white">Nenhuma venda encontrada</p>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  sales: any[]
}>()

defineEmits<{
  edit: [sale: any]
  history: [sale: any]
  whatsapp: [sale: any]
  copy: [sale: any]
  report: [sale: any]
  delete: [sale: any]
}>()
</script>
