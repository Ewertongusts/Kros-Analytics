<template>
  <thead>
    <tr class="text-[10px] font-bold uppercase tracking-[0.15em] text-white/50">
      <th class="px-6 py-4 w-20">
        <div @click="$emit('sort', 'is_active')" class="flex items-center gap-2 cursor-pointer hover:text-white transition-colors group">
          Status
          <svg v-if="sortColumn === 'is_active'" xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" :class="sortDirection === 'desc' ? 'rotate-180' : ''"><path d="m18 15-6-6-6 6"/></svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="opacity-0 group-hover:opacity-50"><path d="m18 15-6-6-6 6"/></svg>
        </div>
      </th>

      <th class="px-6 py-4">
        <div @click="$emit('sort', 'representative_name')" class="flex items-center gap-2 cursor-pointer hover:text-white transition-colors group">
          Cliente
          <svg v-if="sortColumn === 'representative_name'" xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" :class="sortDirection === 'desc' ? 'rotate-180' : ''"><path d="m18 15-6-6-6 6"/></svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="opacity-0 group-hover:opacity-50"><path d="m18 15-6-6-6 6"/></svg>
        </div>
      </th>

      <th class="px-6 py-4">
        <div @click="$emit('sort', 'name')" class="flex items-center gap-2 cursor-pointer hover:text-white transition-colors group">
          Empresa
          <svg v-if="sortColumn === 'name'" xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" :class="sortDirection === 'desc' ? 'rotate-180' : ''"><path d="m18 15-6-6-6 6"/></svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="opacity-0 group-hover:opacity-50"><path d="m18 15-6-6-6 6"/></svg>
        </div>
      </th>

      <th class="px-6 py-4">
        <div class="flex items-center gap-2">Email</div>
      </th>

      <th class="px-6 py-4">
        <div class="flex items-center gap-2">Telefone</div>
      </th>

      <th class="px-6 py-4 text-center">
        <div @click="$emit('sort', 'created_at')" class="flex items-center justify-center gap-2 cursor-pointer hover:text-white transition-colors group">
          Cadastro
          <svg v-if="sortColumn === 'created_at'" xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" :class="sortDirection === 'desc' ? 'rotate-180' : ''"><path d="m18 15-6-6-6 6"/></svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="opacity-0 group-hover:opacity-50"><path d="m18 15-6-6-6 6"/></svg>
        </div>
      </th>

      <th class="px-6 py-4 text-right">Ações</th>
    </tr>
  </thead>
</template>

<script setup lang="ts">
defineProps<{
  sortColumn: string | null
  sortDirection: 'asc' | 'desc'
}>()

defineEmits<{
  sort: [column: 'is_active' | 'representative_name' | 'name' | 'created_at']
}>()
</script>
