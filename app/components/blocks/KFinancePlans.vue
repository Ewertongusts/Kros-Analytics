<template>
  <div class="space-y-8">
    <div class="flex items-center justify-between">
      <div>
        <h3 class="font-bold text-lg text-white">Catálogo de Produtos/Serviços</h3>
        <p class="text-[10px] text-white/40 uppercase tracking-widest mt-1">Gerencie planos, serviços e produtos oferecidos</p>
      </div>
      <div class="flex items-center gap-3">
        <button 
          @click="openCategoriesModal"
          class="px-4 py-3 bg-white/5 hover:bg-white/10 text-white/60 hover:text-white rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all flex items-center gap-2 border border-white/10"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/></svg>
          Categorias
        </button>
        <button 
          @click="openNewModal"
          class="btn-primary text-[10px] font-bold uppercase tracking-widest px-6 py-3 rounded-xl transition-all active:scale-95 flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
          Novo Item
        </button>
      </div>
    </div>

    <div v-if="loading" class="flex justify-center py-12">
       <svg class="animate-spin text-kros-blue" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
    </div>
    
    <div v-else-if="error" class="bg-red-500/10 border border-red-500/20 text-red-400 p-6 rounded-xl text-center space-y-4">
      <div class="flex items-center justify-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        <p class="text-sm font-bold">Erro ao carregar planos</p>
      </div>
      <p class="text-xs font-medium opacity-80">{{ error }}</p>
      <button 
        @click="fetchPlans"
        class="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg text-xs font-bold uppercase tracking-widest transition-all"
      >
        Tentar Novamente
      </button>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
       <!-- PLAN CARD -->
       <div v-for="plan in plans" :key="plan.id" class="p-6 rounded-3xl bg-kros-surface dark:bg-[#111112] border border-kros-outline dark:border-[#1F1F21] group hover:border-kros-blue/20 transition-all flex flex-col h-full relative overflow-hidden">
          
          <div class="flex-1 z-10">
            <!-- Tipo e Categoria -->
            <div class="flex items-center gap-2 mb-3">
              <span class="px-2 py-1 rounded-lg text-[9px] font-bold uppercase tracking-widest" :class="{
                'bg-emerald-500/10 text-emerald-400': plan.type === 'Plano Recorrente',
                'bg-blue-500/10 text-blue-400': plan.type === 'Serviço Único',
                'bg-purple-500/10 text-purple-400': plan.type === 'Produto'
              }">
                {{ plan.type || 'Plano Recorrente' }}
              </span>
              <span v-if="plan.category" class="px-2 py-1 rounded-lg bg-white/5 text-white/60 text-[9px] font-bold uppercase tracking-widest">
                {{ plan.category }}
              </span>
            </div>

            <h4 class="text-lg font-bold text-white uppercase tracking-tight">{{ plan.name }}</h4>
            
            <!-- Descrição -->
            <p v-if="plan.description" class="text-[10px] text-white/40 mt-2 line-clamp-2">
              {{ plan.description }}
            </p>

            <div class="mt-4 mb-6">
              <span class="text-2xl font-black text-white">{{ formatCurrency(plan.price) }}</span>
              <span v-if="plan.type === 'Plano Recorrente'" class="text-[9px] font-bold uppercase tracking-widest text-white/40 ml-1">/ {{ (plan.billing_cycle || 'mensal').toLowerCase() }}</span>
            </div>
            
            <div class="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-white/50 mb-8">
               <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="text-emerald-500"><path d="M20 6 9 17l-5-5"/></svg>
               Ativo
            </div>
          </div>

          <div class="flex items-center gap-2 mt-auto z-10 pt-4 border-t border-white/5">
            <button 
              @click="openEditModal(plan)"
              class="flex-1 py-2.5 rounded-xl bg-white/[0.03] hover:bg-white/10 text-white/60 hover:text-white transition-all text-[10px] font-bold uppercase tracking-widest"
            >
              Editar
            </button>
            <button 
              @click="handleDelete(plan.id as string)"
              class="px-4 py-2.5 rounded-xl bg-red-500/5 hover:bg-red-500 text-red-500 hover:text-white transition-all group/del"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
            </button>
          </div>
          
          <!-- Decorative Glow -->
          <div class="absolute -top-10 -right-10 w-32 h-32 bg-kros-blue/10 rounded-full blur-3xl group-hover:bg-kros-blue/20 transition-all"></div>
       </div>
       
       <div v-if="plans.length === 0" class="col-span-full flex flex-col items-center justify-center py-20 opacity-40 bg-white/[0.02] border border-dashed border-white/10 rounded-3xl">
         <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="mb-4 text-white"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2"/><path d="M3 11h18"/></svg>
         <p class="font-bold uppercase tracking-widest text-[10px] text-white">Nenhum plano cadastrado</p>
       </div>
    </div>

    <BlocksKPlanModal
      v-if="isModalOpen"
      :is-open="isModalOpen"
      :initial-data="selectedPlan"
      :submitting="loading"
      @close="closeModal"
      @save="handleSavePlan"
    />

    <BlocksKPlanCategoriesModal
      v-if="isCategoriesModalOpen"
      :is-open="isCategoriesModalOpen"
      @close="isCategoriesModalOpen = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'

const { plans, loading, error, fetchPlans, createPlan, updatePlan, deletePlan } = usePlans()
const { confirm } = useToast()

const isModalOpen = ref(false)
const selectedPlan = ref<any>(null)
const isCategoriesModalOpen = ref(false)

// Buscar planos quando o componente for montado
onMounted(async () => {
  await fetchPlans()
})

// Watch para monitorar mudanças em plans
watch(() => plans.value, (newPlans) => {
  console.log('Plans updated:', newPlans.length, 'items')
}, { deep: true })

const openNewModal = () => {
  selectedPlan.value = null
  isModalOpen.value = true
}

const openCategoriesModal = () => {
  console.log('Abrindo modal de categorias')
  isCategoriesModalOpen.value = true
}

const openEditModal = (plan: any) => {
  selectedPlan.value = { ...plan }
  isModalOpen.value = true
}

const closeModal = () => {
  isModalOpen.value = false
  selectedPlan.value = null
}

const handleSavePlan = async (data: any) => {
  try {
    if (data.id) {
      await updatePlan(data.id, { 
        name: data.name,
        type: data.type,
        category: data.category,
        description: data.description,
        price: data.price, 
        billing_cycle: data.billing_cycle 
      })
    } else {
      await createPlan({ 
        name: data.name,
        type: data.type,
        category: data.category,
        description: data.description,
        price: data.price, 
        billing_cycle: data.billing_cycle 
      })
    }
    closeModal()
  } catch (err) {
    alert('Erro ao salvar plano. Verifique o console.')
  }
}

const handleDelete = async (id: string) => {
  const confirmed = await confirm('Tem certeza que deseja excluir esse plano? Isso não afetará empresas que já o utilizam, mas impedirá novas associações.', 'Excluir plano')
  if (confirmed) {
    try {
      await deletePlan(id)
    } catch (err) {
      alert('Erro ao deletar plano.')
    }
  }
}

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)
}
</script>
