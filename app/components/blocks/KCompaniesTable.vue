<template>
  <div class="p-4 rounded-2xl bg-kros-surface dark:bg-[#111112] border border-kros-outline dark:border-[#1F1F21] overflow-x-auto overflow-visible relative group hover:border-kros-blue/5 transition-all min-h-[400px]">
    <table class="w-full text-left border-separate border-spacing-y-2.5">
      <thead>
        <tr class="text-[10px] font-bold uppercase tracking-[0.15em] text-white/50">
          <th class="px-6 py-4">Status</th>
          <th class="px-6 py-4">Empresa / Parceiro</th>
          <th class="px-6 py-4 text-center">Cadastro</th>
          <th class="px-6 py-4">Plano Ativo</th>
          <th class="px-6 py-4">MRR</th>
          <th class="px-6 py-4">LTV Pago</th>
          <th class="px-6 py-4 text-right">Ações</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="company in sortedCompanies" :key="company.id" 
            class="group/row bg-white dark:bg-black/20 hover:bg-slate-50 dark:hover:bg-white/[0.04] transition-all rounded-xl border border-transparent hover:border-kros-blue/10">
          <td class="px-6 py-5 first:rounded-l-2xl">
            <div class="flex items-center gap-2.5">
              <span :class="['w-2 h-2 rounded-full shadow-[0_0_10px_currentColor]', company.is_active ? 'bg-emerald-500 text-emerald-500 shadow-emerald-500/20' : 'bg-red-500 text-red-500 shadow-red-500/20']"></span>
              <span :class="['text-xs font-bold uppercase tracking-widest', company.is_active ? 'text-emerald-500' : 'text-red-500']">
                {{ company.is_active ? 'Ativa' : 'Inativa' }}
              </span>
            </div>
          </td>
          <td class="px-6 py-5">
            <h4 class="font-semibold text-sm tracking-tight text-white uppercase underline decoration-kros-blue/20 underline-offset-4 mb-2">
              {{ company.name }}
            </h4>
            
            <div v-if="company.tags && company.tags.length" class="flex flex-wrap gap-1.5">
              <span 
                v-for="tag in company.tags" 
                :key="tag"
                :style="getTagStyle(tag)"
                :title="getTagDescription(tag)"
                class="text-[10px] font-bold px-2.5 py-1 rounded-lg border uppercase tracking-wider transition-all cursor-help"
              >
                {{ tag }}
              </span>
            </div>

            <p v-if="company.representative_name" class="text-xs font-medium text-white/60 mt-2.5 uppercase tracking-widest">
              REP: {{ company.representative_name }}
            </p>
          </td>
          <td class="px-6 py-5 text-center">
             <span class="text-xs font-medium text-white/60 uppercase tracking-widest whitespace-nowrap">
               {{ formatDate(company.created_at) }}
             </span>
          </td>
          <td class="px-6 py-5">
            <div class="flex flex-col gap-1.5">
               <span class="text-xs font-bold bg-kros-blue/10 text-kros-blue px-3 py-1.5 rounded-lg border border-kros-blue/20 uppercase tracking-tight w-fit text-center">
                 {{ company.plan_name || 'Individual' }}
               </span>
               <span class="text-[10px] font-semibold text-white/40 uppercase tracking-widest ml-1">
                 • {{ company.billing_cycle || 'Mensal' }}
               </span>
            </div>
          </td>
          <td class="px-6 py-5">
             <span class="font-bold text-xs tracking-tighter text-white/90 whitespace-nowrap">{{ formatCurrency(company.monthly_price || 0) }}</span>
          </td>
          <td class="px-6 py-5">
             <div class="flex flex-col">
                <span class="font-bold text-sm tracking-tighter text-white/90 whitespace-nowrap">{{ formatCurrency(company.ltv || 0) }}</span>
                <span class="text-[10px] font-bold text-white/30 uppercase tracking-widest">Total LTV</span>
             </div>
          </td>
          <td class="px-6 py-5 last:rounded-r-2xl text-right">
             <div class="flex items-center justify-end gap-3 opacity-0 group-hover/row:opacity-100 transition-all">
                <button @click="onEdit(company)" class="p-2.5 rounded-xl bg-kros-text/5 dark:bg-white/5 text-kros-text dark:text-white hover:btn-primary transition-all" title="Editar Empresa">
                   <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                </button>
                <button @click="onDelete(company.id)" class="p-2.5 rounded-xl bg-kros-text/5 dark:bg-white/5 text-red-500 hover:bg-red-500 hover:text-white transition-all" title="Excluir Empresa">
                   <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                </button>
             </div>
          </td>
        </tr>
      </tbody>
    </table>

    <div v-if="companies.length === 0" class="flex flex-col items-center justify-center py-20 opacity-40">
       <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mb-4"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="m9 12 2 2 4-4"/></svg>
       <p class="font-bold uppercase tracking-widest text-xs">Nenhuma empresa encontrada</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useTags } from '~/composables/useTags'

const props = defineProps<{
  companies: any[]
}>()

const emit = defineEmits(['edit', 'delete'])

const { tags: tagDefinitions, fetchTags } = useTags()

const getTagStyle = (tagName: string) => {
  const def = tagDefinitions.value.find(t => t.name === tagName)
  if (def) {
    return {
      backgroundColor: `${def.color}15`,
      color: def.color,
      borderColor: `${def.color}30`
    }
  }
  return {
    backgroundColor: 'rgba(59, 130, 246, 0.05)',
    color: '#3B82F6',
    borderColor: 'rgba(59, 130, 246, 0.1)'
  }
}

const getTagDescription = (tagName: string) => {
  const def = tagDefinitions.value.find(t => t.name === tagName)
  return def?.description || ''
}

onMounted(() => {
  fetchTags()
})

const onEdit = (company: any) => {
  console.log('Botão Editar clicado no componente Tabela', company)
  emit('edit', company)
}

const onDelete = (id: string) => {
  console.log('Botão Excluir clicado no componente Tabela, ID:', id)
  if (!id) {
    console.error('ERRO: ID da empresa está indefinido na linha da tabela!')
  }
  emit('delete', id)
}

const sortedCompanies = computed(() => {
  return [...props.companies].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
})

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)
}

const formatDate = (date: string) => {
  if (!date) return ''
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(date))
}
</script>
