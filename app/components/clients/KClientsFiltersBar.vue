<template>
  <div class="flex flex-col lg:flex-row lg:items-center gap-4 p-6 bg-white/[0.02] rounded-2xl border border-white/5">
    <!-- Busca -->
    <div class="flex-1 relative">
      <input
        :value="searchQuery"
        @input="$emit('update:searchQuery', $event.target.value)"
        type="text"
        placeholder="Buscar por nome, empresa, email ou telefone..."
        class="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white text-[10px] placeholder:text-white/30 focus:outline-none focus:border-kros-blue/50 transition-all"
      />
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="absolute right-3 top-1/2 -translate-y-1/2 text-white/30">
        <circle cx="11" cy="11" r="8"></circle>
        <path d="m21 21-4.35-4.35"></path>
      </svg>
    </div>

    <!-- Filtro de Status -->
    <div class="flex items-center gap-2 relative">
      <span class="text-[10px] font-bold text-white/50 uppercase tracking-widest">Status:</span>
      <div class="relative">
        <select
          :value="statusFilter"
          @change="$emit('update:statusFilter', $event.target.value)"
          class="px-3 py-2.5 pr-8 bg-white/5 border border-white/10 rounded-lg text-white text-[10px] font-bold uppercase tracking-widest focus:outline-none focus:border-kros-blue/50 transition-all cursor-pointer appearance-none"
        >
          <option value="all">Todos</option>
          <option value="active">Ativas</option>
          <option value="inactive">Inativas</option>
        </select>
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="absolute right-2 top-1/2 -translate-y-1/2 text-white/50 pointer-events-none">
          <path d="m6 9 6 6 6-6"/>
        </svg>
      </div>
    </div>

    <!-- Info de resultados -->
    <div class="text-[10px] font-bold text-white/50 uppercase tracking-widest whitespace-nowrap">
      {{ totalCount }} resultado{{ totalCount !== 1 ? 's' : '' }}
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  searchQuery: string
  statusFilter: 'all' | 'active' | 'inactive'
  totalCount: number
}>()

defineEmits<{
  'update:searchQuery': [value: string]
  'update:statusFilter': [value: 'all' | 'active' | 'inactive']
}>()
</script>

<style scoped>
select {
  color-scheme: dark;
}

select option {
  background-color: #1a1a1b;
  color: #ffffff;
  padding: 8px;
}

select option:checked {
  background: linear-gradient(#0066ff, #0066ff);
  background-color: #0066ff;
  color: #ffffff;
}
</style>
