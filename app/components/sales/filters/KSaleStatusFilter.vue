<template>
  <div class="flex flex-col gap-2">
    <label class="text-[10px] font-bold uppercase tracking-widest text-white/60">
      Status de Pagamento
    </label>
    <select 
      :value="status"
      @change="$emit('update:status', ($event.target as HTMLSelectElement).value)"
      class="px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:border-kros-blue focus:outline-none transition-all cursor-pointer"
    >
      <option value="todos" class="bg-[#0a0a0a] text-white">Todos os status</option>
      <option value="paid" class="bg-[#0a0a0a] text-white">Pago</option>
      <option value="pending" class="bg-[#0a0a0a] text-white">Pendente</option>
      <option value="scheduled" class="bg-[#0a0a0a] text-white">Agendado</option>
      <option value="overdue" class="bg-[#0a0a0a] text-white">Atrasado</option>
    </select>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  status: string
}>()

defineEmits(['update:status'])
</script>
