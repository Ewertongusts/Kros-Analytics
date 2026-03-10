<template>
  <div class="min-h-screen p-8 md:p-12">
    <div class="max-w-7xl mx-auto space-y-8">
      <div v-if="loading" class="flex flex-col items-center justify-center h-[70vh] gap-6 animate-pulse">
        <div class="w-16 h-16 bg-kros-blue/10 rounded-3xl flex items-center justify-center text-kros-blue">
          <svg class="animate-spin" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
        </div>
        <p class="text-[11px] font-black uppercase tracking-[0.4em] opacity-30 text-white">Carregando Fluxo Financeiro...</p>
      </div>

      <div v-else class="space-y-8 animate-in fade-in duration-700">
        <BlocksKFinanceHeader @sync="fetchStats" @add-expense="isModalOpen = true" />
        
        <!-- TABS -->
        <div class="flex items-center gap-2 border-b border-kros-outline dark:border-[#1F1F21] pb-4 overflow-x-auto custom-scrollbar">
            <button v-for="tab in tabs" :key="tab.id" @click="activeTab = tab.id"
              class="px-5 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all whitespace-nowrap"
              :class="activeTab === tab.id ? 'bg-kros-blue text-white shadow-[0_4px_15px_rgba(0,123,255,0.2)]' : 'text-kros-text/40 dark:text-white/40 hover:bg-kros-text/5 dark:hover:bg-white/5 hover:text-kros-text dark:hover:text-white'"
            >
              {{ tab.name }}
            </button>
        </div>

        <!-- TAB VIEWS -->
        <div v-if="activeTab === 'overview'" class="space-y-12 animate-in fade-in duration-500">
          <BlocksKFinanceMetrics :stats="stats" />
          <div class="grid grid-cols-1 xl:grid-cols-2 gap-8">
              <BlocksKFinanceCollectionBoard :payments="financialRecords" />
              <BlocksKFinanceExpenses :expenses="stats.transactionsList" />
          </div>
        </div>

        <div v-if="activeTab === 'collections'" class="space-y-12 animate-in fade-in duration-500">
          <BlocksKFinanceCollectionBoard :payments="financialRecords" />
        </div>

        <div v-if="activeTab === 'expenses'" class="space-y-12 animate-in fade-in duration-500">
          <BlocksKFinanceExpenses :expenses="stats.transactionsList" />
        </div>

        <div v-if="activeTab === 'plans'" class="space-y-12 animate-in fade-in duration-500">
          <BlocksKFinancePlans />
        </div>

        <div v-if="activeTab === 'calendar'" class="space-y-12 animate-in fade-in duration-500">
          <div class="flex flex-col items-center justify-center py-20 opacity-40">
             <h3 class="font-bold uppercase tracking-widest text-[10px] text-white">Calendário em construção</h3>
          </div>
        </div>

        <div v-if="activeTab === 'settings'" class="space-y-12 animate-in fade-in duration-500">
          <BlocksKFinanceCrmSettings />
        </div>
        
        <BlocksKGlobalFooter />
      </div>

      <BlocksKExpenseModal 
        v-if="isModalOpen" 
        :is-open="isModalOpen" 
        :submitting="submitting"
        @close="isModalOpen = false" 
        @save="handleSaveExpense" 
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'

definePageMeta({
  middleware: 'auth'
})

const { stats, loading, fetchStats } = useAnalytics()
const { companies, fetchCompanies } = useCompanies()
const supabase = useSupabaseClient()

const isModalOpen = ref(false)
const submitting = ref(false)

const activeTab = ref('overview')
const tabs = [
  { id: 'overview', name: 'Visão Geral' },
  { id: 'collections', name: 'Cobranças' },
  { id: 'expenses', name: 'Saídas' },
  { id: 'plans', name: 'Planos' },
  { id: 'calendar', name: 'Calendário' },
  { id: 'settings', name: 'Config. API' }
]

const handleSaveExpense = async (data: any) => {
  submitting.value = true
  try {
    const { error } = await supabase
      .from('transactions')
      .insert([
        { 
          description: data.description,
          amount: data.amount,
          type: 'expense',
          category: data.category,
          is_recurring: data.is_recurring,
          created_at: new Date(data.date).toISOString()
        }
      ] as any)
    
    if (error) throw error
    
    isModalOpen.value = false
    await fetchStats() // Atualiza os dados da tela
  } catch (err) {
    console.error('Erro ao salvar despesa:', err)
    alert('Erro ao salvar. Verifique o console.')
  } finally {
    submitting.value = false
  }
}

// Gera a lista do Board baseado nas empresas reais
const financialRecords = computed(() => {
  return companies.value.map(company => ({
    id: company.id,
    company_name: company.name,
    plan_name: company.plan_name || 'Individual',
    due_date: new Date(new Date().getFullYear(), new Date().getMonth(), 10).toISOString(), // Dia 10 simulado
    amount: company.monthly_price || 0,
    status: company.is_active ? 'Pago' : 'Pendente',
    company_whatsapp: company.whatsapp || ''
  }))
})

onMounted(async () => {
  await Promise.all([
    fetchStats(),
    fetchCompanies()
  ])
})
</script>
