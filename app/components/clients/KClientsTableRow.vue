<template>
  <tr class="group/row bg-white/[0.02] hover:bg-white/[0.04] transition-all rounded-2xl border border-transparent hover:border-white/10">
    <!-- Status -->
    <td class="px-6 py-5 first:rounded-l-2xl">
      <div class="flex items-center gap-2.5">
        <span :class="['w-2 h-2 rounded-full shadow-[0_0_10px_currentColor]', company.is_active ? 'bg-emerald-500 shadow-emerald-500/20' : 'bg-red-500 shadow-red-500/20']"></span>
        <span :class="['text-xs font-bold uppercase tracking-widest', company.is_active ? 'text-emerald-500' : 'text-red-500']">
          {{ company.is_active ? 'Ativa' : 'Inativa' }}
        </span>
      </div>
    </td>

    <!-- Cliente -->
    <td class="px-6 py-5 min-w-[200px]">
      <h4 class="font-semibold text-xs tracking-tight text-white uppercase whitespace-nowrap overflow-hidden text-ellipsis">
        {{ company.representative_name || company.name }}
      </h4>
    </td>

    <!-- Empresa -->
    <td class="px-6 py-5">
      <span class="text-xs font-medium text-white/60 uppercase tracking-widest">
        {{ company.name }}
      </span>
    </td>

    <!-- Email -->
    <td class="px-6 py-5">
      <span class="text-xs font-medium text-white/60 break-all">
        {{ company.email || '-' }}
      </span>
    </td>

    <!-- Telefone -->
    <td class="px-6 py-5">
      <span class="text-xs font-medium text-white/60">
        {{ company.phone || '-' }}
      </span>
    </td>

    <!-- Data de Cadastro -->
    <td class="px-6 py-5 text-center">
      <span class="text-xs font-medium text-white/60 uppercase tracking-widest whitespace-nowrap">
        {{ formatDate(company.created_at) }}
      </span>
    </td>

    <!-- Ações -->
    <td class="px-6 py-5 last:rounded-r-2xl text-right">
      <div class="flex items-center justify-end gap-3 opacity-0 group-hover/row:opacity-100 transition-all">
        <button 
          @click="$emit('view', company)"
          class="p-2.5 rounded-lg bg-white/5 hover:bg-kros-blue/20 text-white/70 hover:text-kros-blue transition-all" 
          title="Visualizar detalhes"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
            <circle cx="12" cy="12" r="3"></circle>
          </svg>
        </button>

        <button 
          @click="$emit('edit', company)"
          class="p-2.5 rounded-lg bg-white/5 hover:bg-blue-500/20 text-white/70 hover:text-blue-400 transition-all" 
          title="Editar"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
          </svg>
        </button>

        <button 
          @click="$emit('delete', company.id)"
          class="p-2.5 rounded-lg bg-white/5 hover:bg-red-500/20 text-white/70 hover:text-red-400 transition-all" 
          title="Excluir"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 6h18"></path>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            <line x1="10" y1="11" x2="10" y2="17"></line>
            <line x1="14" y1="11" x2="14" y2="17"></line>
          </svg>
        </button>
      </div>
    </td>
  </tr>
</template>

<script setup lang="ts">
defineProps<{
  company: any
}>()

defineEmits<{
  view: [company: any]
  edit: [company: any]
  delete: [id: string]
}>()

const formatDate = (date: string) => {
  if (!date) return '-'
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(date))
}
</script>
