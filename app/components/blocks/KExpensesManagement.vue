<template>
  <LayoutsKPageLayout>
    <UiKSkeleton v-if="loading" type="table" :rows="5" />

    <div v-else class="space-y-4 mb-20 animate-in fade-in duration-700">
      <!-- Header com Tabs e Botões -->
      <div class="flex items-center justify-between gap-4">
        <div class="flex items-center gap-2 border-b border-white/10">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            @click="activeTab = tab.id"
            :class="[
              'px-4 py-3 font-bold text-xs uppercase tracking-widest transition-all border-b-2',
              activeTab === tab.id
                ? 'text-red-500 border-red-500'
                : 'text-white/50 border-transparent hover:text-white'
            ]"
          >
            {{ tab.label }}
          </button>
        </div>

        <div class="flex items-center gap-2">
          <button 
            @click="showMetrics = !showMetrics"
            :class="[
              'px-4 py-2.5 rounded-xl border transition-all flex items-center gap-2',
              showMetrics
                ? 'bg-white/10 border-white/20 text-white'
                : 'bg-white/5 border-white/5 text-white/70 hover:text-white hover:border-white/10'
            ]"
            title="Mostrar/Ocultar Indicadores"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="12" y1="2" x2="12" y2="22"></line>
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
            </svg>
            <span class="text-[10px] font-bold uppercase tracking-widest">Indicadores</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" :class="{ 'rotate-180': showMetrics }" class="transition-transform">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </button>

          <button 
            @click="openHistory"
            class="px-4 py-2.5 bg-white/5 hover:bg-white/10 rounded-xl border border-white/5 hover:border-white/10 transition-all flex items-center gap-2 text-white/70 hover:text-white"
            title="Ver histórico"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 8v4l3 3m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/>
            </svg>
            <span class="text-[10px] font-bold uppercase tracking-widest">Histórico</span>
          </button>

          <UiKButtonPrimary icon="plus" @click="showCreateModal = true">
            Nova Despesa
          </UiKButtonPrimary>
        </div>
      </div>

      <!-- Cards de Indicadores -->
      <div v-if="showMetrics" class="grid grid-cols-4 gap-4">
        <div class="p-6 rounded-2xl bg-white/5 border border-white/10">
          <p class="text-[10px] font-bold uppercase tracking-widest text-white/50 mb-2">Total Mês</p>
          <p class="text-2xl font-black text-white">{{ formatCurrency(stats.totalMonth) }}</p>
          <p class="text-[10px] text-white/40 mt-2">{{ stats.countMonth }} despesas</p>
        </div>
        <div class="p-6 rounded-2xl bg-white/5 border border-white/10">
          <p class="text-[10px] font-bold uppercase tracking-widest text-white/50 mb-2">Média</p>
          <p class="text-2xl font-black text-white">{{ formatCurrency(stats.average) }}</p>
          <p class="text-[10px] text-white/40 mt-2">por despesa</p>
        </div>
        <div class="p-6 rounded-2xl bg-white/5 border border-white/10">
          <p class="text-[10px] font-bold uppercase tracking-widest text-white/50 mb-2">Recorrentes</p>
          <p class="text-2xl font-black text-white">{{ stats.recurring }}</p>
          <p class="text-[10px] text-white/40 mt-2">{{ formatCurrency(stats.recurringTotal) }}/mês</p>
        </div>
        <div class="p-6 rounded-2xl bg-white/5 border border-white/10">
          <p class="text-[10px] font-bold uppercase tracking-widest text-white/50 mb-2">Total Geral</p>
          <p class="text-2xl font-black text-white">{{ formatCurrency(stats.total) }}</p>
          <p class="text-[10px] text-white/40 mt-2">{{ stats.count }} despesas</p>
        </div>
      </div>

      <!-- Filtros -->
      <div class="flex items-start gap-4">
        <div class="flex-1 flex gap-3">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Buscar despesa, categoria ou valor..."
            class="flex-1 px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-white/20 text-[10px]"
          />
          <select
            v-model="selectedCategory"
            class="px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-white/20 text-[10px] font-bold uppercase tracking-widest"
          >
            <option value="">Todas Categorias</option>
            <option value="infraestrutura">Infraestrutura</option>
            <option value="software">Software</option>
            <option value="marketing">Marketing</option>
            <option value="pessoal">Pessoal</option>
            <option value="outros">Outros</option>
          </select>
          <select
            v-model="selectedRecurrence"
            class="px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-white/20 text-[10px] font-bold uppercase tracking-widest"
          >
            <option value="">Todas</option>
            <option value="true">Recorrentes</option>
            <option value="false">Únicas</option>
          </select>
          <button
            @click="clearFilters"
            class="px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white/70 hover:text-white transition-all text-[10px] font-bold uppercase tracking-widest"
          >
            Limpar
          </button>
        </div>
      </div>

      <!-- Tabela de Despesas -->
      <div v-if="activeTab !== 'categorias'" class="space-y-4">
        <div v-if="filteredExpenses.length === 0" class="text-center py-20">
          <p class="text-white/40 text-sm">Nenhuma despesa encontrada</p>
        </div>

        <div v-else class="overflow-x-auto">
          <table class="w-full text-left border-separate border-spacing-y-2.5">
            <thead>
              <tr class="text-[9px] font-bold uppercase tracking-[0.2em] text-white/40">
                <th class="px-4 py-3">Descrição</th>
                <th class="px-4 py-3">Categoria</th>
                <th class="px-4 py-3">Tipo</th>
                <th class="px-4 py-3">Valor</th>
                <th class="px-4 py-3">Data</th>
                <th class="px-4 py-3">Ações</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="expense in filteredExpenses" :key="expense.id" 
                  class="group/row bg-white/[0.02] hover:bg-white/[0.05] transition-all rounded-2xl border border-transparent hover:border-white/10">
                <td class="px-4 py-5 first:rounded-l-2xl">
                  <p class="font-bold text-xs text-white uppercase tracking-tight">{{ expense.description }}</p>
                </td>
                <td class="px-4 py-5">
                  <span class="text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-white/70">
                    {{ expense.category || 'Geral' }}
                  </span>
                </td>
                <td class="px-4 py-5">
                  <span :class="['text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-md', expense.is_recurring ? 'bg-yellow-500/20 text-yellow-400' : 'bg-white/5 text-white/70']">
                    {{ expense.is_recurring ? 'Mensal' : 'Único' }}
                  </span>
                </td>
                <td class="px-4 py-5">
                  <span class="text-xs font-black tabular-nums text-red-400">{{ formatCurrency(expense.amount) }}</span>
                </td>
                <td class="px-4 py-5">
                  <p class="text-[9px] text-white/60">{{ formatDate(expense.created_at) }}</p>
                </td>
                <td class="px-4 py-5 last:rounded-r-2xl">
                  <div class="flex items-center gap-2">
                    <button @click="editExpense(expense)" class="p-2 hover:bg-white/10 rounded-lg transition-colors text-white/70 hover:text-white">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    </button>
                    <button @click="deleteExpense(expense.id)" class="p-2 hover:bg-red-500/20 rounded-lg transition-colors text-red-400/70 hover:text-red-400">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Aba de Categorias -->
      <div v-if="activeTab === 'categorias'" class="space-y-4">
        <div class="flex gap-3">
          <input
            v-model="newCategoryName"
            type="text"
            placeholder="Nome da categoria..."
            class="flex-1 px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-white/20 text-[10px]"
          />
          <button
            @click="saveCategory"
            :disabled="!newCategoryName || loading"
            class="px-6 py-2.5 bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white rounded-xl font-bold uppercase tracking-widest text-[10px] transition-all"
          >
            Adicionar
          </button>
        </div>

        <div v-if="categories.length === 0" class="text-center py-16">
          <p class="text-white/40 text-sm">Nenhuma categoria cadastrada</p>
        </div>

        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div v-for="category in categories" :key="category.id" class="p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all">
            <div class="flex items-center justify-between">
              <p class="font-bold text-white text-sm uppercase tracking-tight">{{ category.name }}</p>
              <button
                @click="deleteCategory(category.id)"
                class="p-2 hover:bg-red-500/20 rounded-lg transition-colors text-red-400/70 hover:text-red-400"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <BlocksKGlobalFooter />
    </div>

    <!-- Modal -->
    <UiKModal :is-open="showCreateModal" @close="showCreateModal = false">
      <UiKModalHeader 
        :title="editingExpense ? 'Editar Despesa' : 'Nova Despesa'"
        subtitle="Controle de custos e saídas"
      />

      <div class="space-y-4">
        <div>
          <label class="block text-white/80 text-[10px] font-bold uppercase tracking-widest mb-2">Descrição</label>
          <input v-model="formData.description" type="text" placeholder="Ex: Servidor AWS" class="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-white/20 focus:bg-white/10 transition-all text-sm" />
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-white/80 text-[10px] font-bold uppercase tracking-widest mb-2">Categoria</label>
            <select v-model="formData.category" class="w-full bg-[#1a1a1b] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-white/20 focus:bg-[#222223] transition-all text-sm appearance-none cursor-pointer" style="background-image: url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2212%22 height=%2212%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22white%22 stroke-width=%222%22><polyline points=%226 9 12 15 18 9%22></polyline></svg>'); background-repeat: no-repeat; background-position: right 12px center; padding-right: 36px;">
              <option value="infraestrutura">Infraestrutura</option>
              <option value="software">Software</option>
              <option value="marketing">Marketing</option>
              <option value="pessoal">Pessoal</option>
              <option value="outros">Outros</option>
            </select>
          </div>

          <div>
            <label class="block text-white/80 text-[10px] font-bold uppercase tracking-widest mb-2">Valor (R$)</label>
            <input v-model.number="formData.amount" type="number" placeholder="0.00" step="0.01" class="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-white/20 focus:bg-white/10 transition-all text-sm" />
          </div>
        </div>

        <div>
          <label class="block text-white/80 text-[10px] font-bold uppercase tracking-widest mb-2">Data</label>
          <input v-model="formData.date" type="date" class="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-white/20 focus:bg-white/10 transition-all text-sm" />
        </div>

        <div class="flex items-center gap-3 p-4 bg-white/5 rounded-lg border border-white/10">
          <input v-model="formData.is_recurring" type="checkbox" class="w-4 h-4 rounded bg-white/10 border border-white/20 cursor-pointer accent-red-500" />
          <label class="text-white/80 text-[10px] font-bold uppercase tracking-widest cursor-pointer">Despesa Recorrente (Mensal)</label>
        </div>
      </div>

      <UiKModalActions
        :confirm-text="editingExpense ? 'Atualizar' : 'Criar'"
        :cancel-text="'Cancelar'"
        :loading="loading"
        @confirm="saveExpense"
        @cancel="showCreateModal = false"
      />
    </UiKModal>
  </LayoutsKPageLayout>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'

interface Expense {
  id: string
  description: string
  category: string
  amount: number
  is_recurring: boolean
  created_at: string
}

const supabase = useSupabaseClient()
const loading = ref(false)
const showCreateModal = ref(false)
const editingExpense = ref<Expense | null>(null)
const expenses = ref<Expense[]>([])
const searchQuery = ref('')
const selectedCategory = ref('')
const selectedRecurrence = ref('')
const showMetrics = ref(false)
const activeTab = ref('todos')
const categories = ref<any[]>([])
const showCategoryModal = ref(false)
const editingCategory = ref<any | null>(null)
const newCategoryName = ref('')

const tabs = [
  { id: 'todos', label: 'Todos' },
  { id: 'recorrentes', label: 'Recorrentes' },
  { id: 'unicos', label: 'Únicos' },
  { id: 'categorias', label: 'Categorias' }
]

const formData = reactive({
  description: '',
  category: 'infraestrutura',
  amount: 0,
  is_recurring: false,
  date: new Date().toISOString().split('T')[0]
})

const stats = computed(() => {
  const now = new Date()
  const currentMonth = now.getMonth()
  const currentYear = now.getFullYear()

  const monthExpenses = expenses.value.filter(e => {
    const date = new Date(e.created_at)
    return date.getMonth() === currentMonth && date.getFullYear() === currentYear
  })

  const totalMonth = monthExpenses.reduce((acc, e) => acc + e.amount, 0)
  const recurring = expenses.value.filter(e => e.is_recurring).length
  const recurringTotal = expenses.value.filter(e => e.is_recurring).reduce((acc, e) => acc + e.amount, 0)
  const total = expenses.value.reduce((acc, e) => acc + e.amount, 0)
  const average = expenses.value.length > 0 ? total / expenses.value.length : 0

  return {
    totalMonth,
    countMonth: monthExpenses.length,
    average,
    recurring,
    recurringTotal,
    total,
    count: expenses.value.length
  }
})

const filteredExpenses = computed(() => {
  return expenses.value.filter(e => {
    const matchSearch = e.description.toLowerCase().includes(searchQuery.value.toLowerCase())
    const matchCategory = !selectedCategory.value || e.category === selectedCategory.value
    const matchRecurrence = !selectedRecurrence.value || e.is_recurring.toString() === selectedRecurrence.value
    return matchSearch && matchCategory && matchRecurrence
  })
})

const getCategoryColor = (category: string) => {
  const colors: Record<string, string> = {
    infraestrutura: 'bg-blue-500/20 text-blue-400',
    software: 'bg-purple-500/20 text-purple-400',
    marketing: 'bg-pink-500/20 text-pink-400',
    pessoal: 'bg-green-500/20 text-green-400',
    outros: 'bg-gray-500/20 text-gray-400'
  }
  return colors[category] || colors.outros
}

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)
}

const formatDate = (date: string) => {
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(date))
}

const fetchExpenses = async () => {
  try {
    const { data, error } = await (supabase.from('transactions') as any)
      .select('*')
      .eq('type', 'expense')
      .order('created_at', { ascending: false })

    if (error) throw error
    expenses.value = data || []
  } catch (err) {
    console.error('Erro ao buscar despesas:', err)
  }
}

const saveExpense = async () => {
  if (!formData.description || !formData.amount) {
    alert('Preencha todos os campos')
    return
  }

  loading.value = true
  try {
    const dateValue = formData.date ? new Date(formData.date).toISOString() : new Date().toISOString()
    
    if (editingExpense.value) {
      const { error } = await (supabase.from('transactions') as any)
        .update({
          description: formData.description,
          category: formData.category,
          amount: formData.amount,
          is_recurring: formData.is_recurring,
          created_at: dateValue
        })
        .eq('id', editingExpense.value.id)

      if (error) throw error
      alert('✅ Despesa atualizada!')
    } else {
      const { error } = await (supabase.from('transactions') as any)
        .insert({
          description: formData.description,
          category: formData.category,
          amount: formData.amount,
          type: 'expense',
          is_recurring: formData.is_recurring,
          created_at: dateValue
        })

      if (error) throw error
      alert('✅ Despesa criada!')
    }

    showCreateModal.value = false
    resetForm()
    await fetchExpenses()
  } catch (err: any) {
    alert('❌ Erro: ' + err.message)
  } finally {
    loading.value = false
  }
}

const editExpense = (expense: Expense) => {
  editingExpense.value = expense
  formData.description = expense.description
  formData.category = expense.category
  formData.amount = expense.amount
  formData.is_recurring = expense.is_recurring
  formData.date = expense.created_at ? expense.created_at.split('T')[0] : new Date().toISOString().split('T')[0]
  showCreateModal.value = true
}

const deleteExpense = async (id: string) => {
  if (!confirm('Tem certeza?')) return
  try {
    const { error } = await (supabase.from('transactions') as any)
      .delete()
      .eq('id', id)

    if (error) throw error
    await fetchExpenses()
    alert('✅ Deletado!')
  } catch (err: any) {
    alert('❌ Erro: ' + err.message)
  }
}

const resetForm = () => {
  formData.description = ''
  formData.category = 'infraestrutura'
  formData.amount = 0
  formData.is_recurring = false
  formData.date = new Date().toISOString().split('T')[0]
  editingExpense.value = null
}

const clearFilters = () => {
  searchQuery.value = ''
  selectedCategory.value = ''
  selectedRecurrence.value = ''
}

const openHistory = () => {
  console.log('Abrir histórico de despesas')
}

const saveCategory = async () => {
  if (!newCategoryName.value.trim()) return

  loading.value = true
  try {
    const { error } = await (supabase.from('expense_categories') as any)
      .insert({
        name: newCategoryName.value.trim()
      })

    if (error) throw error
    newCategoryName.value = ''
    await fetchCategories()
    alert('Categoria criada!')
  } catch (err: any) {
    alert('Erro: ' + err.message)
  } finally {
    loading.value = false
  }
}

const deleteCategory = async (id: string) => {
  if (!confirm('Tem certeza?')) return
  try {
    const { error } = await (supabase.from('expense_categories') as any)
      .delete()
      .eq('id', id)

    if (error) throw error
    await fetchCategories()
    alert('Categoria deletada!')
  } catch (err: any) {
    alert('Erro: ' + err.message)
  }
}

const fetchCategories = async () => {
  try {
    const { data, error } = await (supabase.from('expense_categories') as any)
      .select('*')
      .order('name', { ascending: true })

    if (error) throw error
    categories.value = data || []
  } catch (err) {
    console.error('Erro ao buscar categorias:', err)
  }
}

onMounted(async () => {
  await fetchExpenses()
  await fetchCategories()
})
</script>

<style scoped>
select {
  color-scheme: dark;
}

select option {
  background-color: #1a1a1b;
  color: white;
}

select option:checked {
  background-color: #0066cc;
  color: white;
}

input[type="date"] {
  color-scheme: dark;
}

input[type="date"]::-webkit-calendar-picker-indicator {
  filter: invert(1);
}
</style>
