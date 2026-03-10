<template>
  <div class="min-h-screen p-8 md:p-12">
    <div class="max-w-7xl mx-auto space-y-8">
      <UiKLoader 
        v-if="loading" 
        message="Processando Fluxo Financeiro..." 
      />

      <div v-else class="space-y-8 animate-in fade-in duration-700">
        <BlocksKFinanceHeader @sync="fetchStats" @add-expense="isModalOpen = true" />
        
        <!-- TABS -->
        <UiKTabs 
          v-model="activeTab" 
          :tabs="tabs" 
        />

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

// Gera a lista do Board baseado nos pagamentos REAIS do banco
const financialRecords = computed(() => {
  return stats.value.paymentsList.map(payment => ({
    id: payment.id,
    company_name: payment.companies?.name || 'Empresa desconhecida',
    plan_name: payment.plan_name || 'Individual',
    due_date: payment.due_date,
    amount: payment.amount || 0,
    status: payment.status === 'paid' ? 'Pago' : (payment.status === 'overdue' ? 'Atrasado' : 'Pendente'),
    company_whatsapp: payment.companies?.whatsapp || ''
  }))
})

onMounted(async () => {
  await fetchStats()
})
</script>
