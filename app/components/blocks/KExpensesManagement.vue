<template>
  <LayoutsKPageLayout>
    <UiKSkeleton v-if="loading" type="table" :rows="5" />

    <div v-else class="space-y-4 mb-20 animate-in fade-in duration-700">
      <!-- Header com Tabs e Botões -->
      <div class="flex items-center justify-between gap-4 mb-6">
        <div class="flex items-center gap-2 border-b border-white/10">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            @click="activeTab = tab.id"
            :class="[
              'px-4 py-3 font-bold text-xs uppercase tracking-widest transition-all border-b-2',
              activeTab === tab.id
                ? 'border-b-2 transition-colors'
                : 'text-white/50 border-transparent hover:text-white'
            ]"
            :style="activeTab === tab.id ? { color: `var(--kros-blue, #FF0000)`, borderColor: `var(--kros-blue, #FF0000)` } : {}"
          >
            {{ tab.label }}
          </button>
        </div>

        <div class="flex items-center gap-2">
          <UiKButtonPrimary icon="plus" @click="() => { resetForm(); showCreateModal = true }">
            Nova Despesa
          </UiKButtonPrimary>
        </div>
      </div>

      <!-- Cards de Indicadores -->
      <div v-if="showMetrics && activeTab !== 'historico' && activeTab !== 'categorias' && activeTab !== 'metricas'" class="grid grid-cols-4 gap-4">
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
          <p class="text-[10px] font-bold uppercase tracking-widest text-white/50 mb-2">Maior</p>
          <p class="text-2xl font-black text-white">{{ formatCurrency(stats.max) }}</p>
          <p class="text-[10px] text-white/40 mt-2">despesa</p>
        </div>
        <div class="p-6 rounded-2xl bg-white/5 border border-white/10">
          <p class="text-[10px] font-bold uppercase tracking-widest text-white/50 mb-2">Total Geral</p>
          <p class="text-2xl font-black text-white">{{ formatCurrency(stats.total) }}</p>
          <p class="text-[10px] text-white/40 mt-2">{{ stats.count }} despesas</p>
        </div>
      </div>

      <!-- Filtros -->
      <div v-if="activeTab !== 'categorias' && activeTab !== 'historico' && activeTab !== 'metricas'">
        <!-- Linha 1: Search (flex-1), Category, Month, Spacer, Botão Data, Clear Button -->
        <div class="flex items-center gap-3">
          <!-- Search (expande para ocupar espaço) -->
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Buscar despesa..."
            class="flex-1 px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-[var(--kros-blue)] text-[10px] transition-colors"
          />
          <!-- Category -->
          <select
            v-model="selectedCategory"
            class="px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[var(--kros-blue)] text-[10px] font-bold uppercase tracking-widest transition-colors"
          >
            <option value="">Todas Categorias</option>
            <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
          </select>
          <!-- Status -->
          <select
            v-model="selectedStatus"
            class="px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[var(--kros-blue)] text-[10px] font-bold uppercase tracking-widest transition-colors"
          >
            <option value="">Todos Status</option>
            <option value="paid">Pago</option>
            <option value="pending">Pendente</option>
            <option value="overdue">Vencida</option>
          </select>
          <!-- Month -->
          <select
            v-model="selectedMonth"
            class="px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[var(--kros-blue)] text-[10px] font-bold uppercase tracking-widest transition-colors"
          >
            <option value="">Todos Meses</option>
            <option value="1">Janeiro</option>
            <option value="2">Fevereiro</option>
            <option value="3">Março</option>
            <option value="4">Abril</option>
            <option value="5">Maio</option>
            <option value="6">Junho</option>
            <option value="7">Julho</option>
            <option value="8">Agosto</option>
            <option value="9">Setembro</option>
            <option value="10">Outubro</option>
            <option value="11">Novembro</option>
            <option value="12">Dezembro</option>
          </select>
          <!-- Spacer invisível -->
          <div class="flex-1"></div>
          <!-- Botão Expandir/Recolher Filtros de Data -->
          <button
            @click="showDateFilters = !showDateFilters"
            :class="[
              'px-3 py-2.5 rounded-xl border transition-all flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest',
              showDateFilters
                ? 'bg-white/10 border-[var(--kros-blue)] text-[var(--kros-blue)]'
                : 'bg-white/5 border-white/10 text-white/70 hover:border-[var(--kros-blue)] hover:text-[var(--kros-blue)]'
            ]"
            title="Expandir/Recolher filtros de data"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
            <span>{{ showDateFilters ? 'Ocultar' : 'Data' }}</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" :class="{ 'rotate-180': showDateFilters }" class="transition-transform">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </button>
          <!-- Clear Button (à direita) -->
          <button
            @click="clearFilters"
            class="px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white/70 transition-all text-[10px] font-bold uppercase tracking-widest hover:border-[var(--kros-blue)] hover:text-[var(--kros-blue)]"
          >
            Limpar
          </button>
        </div>

        <!-- Linha 2: Year, Date Range, Spacer (Expansível) -->
        <div v-if="showDateFilters" class="flex items-center gap-3 animate-in fade-in duration-200">
          <!-- Year -->
          <select
            v-model="selectedYear"
            class="px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[var(--kros-blue)] text-[10px] font-bold uppercase tracking-widest transition-colors"
          >
            <option value="">Todos Anos</option>
            <option value="2024">2024</option>
            <option value="2025">2025</option>
            <option value="2026">2026</option>
          </select>
          <!-- Date Range -->
          <div class="flex items-center gap-2">
            <input
              v-model="startDate"
              type="date"
              class="px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[var(--kros-blue)] text-[10px] transition-colors"
              title="Data Início"
            />
            <span class="text-white/50 text-[10px] font-bold">a</span>
            <input
              v-model="endDate"
              type="date"
              class="px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[var(--kros-blue)] text-[10px] transition-colors"
              title="Data Fim"
            />
          </div>
          <!-- Spacer invisível (ocupa espaço vazio à direita) -->
          <div class="flex-1"></div>
        </div>
      </div>

      <!-- Tabela de Despesas -->
      <div v-if="activeTab !== 'categorias' && activeTab !== 'historico' && activeTab !== 'metricas'" class="space-y-4">
        <div v-if="filteredExpenses.length === 0" class="text-center py-20">
          <p class="text-white/40 text-sm">Nenhuma despesa encontrada</p>
        </div>

        <div v-else class="overflow-x-auto">
          <table class="w-full text-left border-separate border-spacing-y-2.5">
            <thead>
              <tr class="text-[9px] font-bold uppercase tracking-[0.2em] text-white/40">
                <th class="px-4 py-3">Descrição</th>
                <th class="px-4 py-3">Categoria</th>
                <th class="px-4 py-3">Valor</th>
                <th class="px-4 py-3">Data Início</th>
                <th class="px-4 py-3">Recorrência</th>
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
                  <span class="text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-md" :style="{ backgroundColor: getCategoryColor(expense.category_id) + '20', color: getCategoryColor(expense.category_id) }">
                    {{ getCategoryName(expense.category_id) }}
                  </span>
                </td>
                <td class="px-4 py-5">
                  <span class="text-xs font-black tabular-nums text-red-400">{{ formatCurrency(expense.amount) }}</span>
                </td>
                <td class="px-4 py-5">
                  <p class="text-[9px] text-white/60">{{ formatDate(expense.created_at) }}</p>
                </td>
                <td class="px-4 py-5">
                  <span v-if="expense.is_recurring" class="text-[9px] font-bold uppercase tracking-widest px-2 py-1 bg-blue-500/20 text-blue-400 rounded">
                    {{ getFrequencyLabel(expense.recurring_frequency) }}
                  </span>
                  <span v-else class="text-[9px] font-bold uppercase tracking-widest px-2 py-1 bg-white/10 text-white/60 rounded">
                    Única
                  </span>
                </td>
                <td class="px-4 py-5 last:rounded-r-2xl">
                  <div class="flex items-center gap-2">
                    <button 
                      v-if="expense.status === 'pending'"
                      @click="handleMarkAsPaid(expense.id)" 
                      class="p-2 hover:bg-green-500/20 rounded-lg transition-colors text-green-400/70 hover:text-green-400"
                      title="Marcar como pago"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    </button>
                    <span v-else class="text-[9px] font-bold text-green-400 uppercase tracking-widest px-2 py-1 bg-green-500/10 rounded">Pago</span>
                    <button @click="editExpense(expense)" class="p-2 hover:bg-white/10 rounded-lg transition-colors text-white/70 hover:text-white">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    </button>
                    <button @click="confirmDelete(expense.id, 'expense')" class="p-2 hover:bg-red-500/20 rounded-lg transition-colors text-red-400/70 hover:text-red-400">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Aba de Histórico de Pagamentos -->
      <div v-if="activeTab === 'historico'" class="space-y-4">
        <div v-if="paidExpenses.length === 0" class="text-center py-20">
          <p class="text-white/40 text-sm">Nenhum pagamento registrado</p>
        </div>
        <div v-else>
          <KPaymentHistory
            :payments="paidExpenses"
            :categories="categories"
            :loading="loading"
            @edit="editExpense"
            @delete="confirmDelete($event, 'expense')"
          />
        </div>
      </div>

      <!-- Aba de Métricas de Pagamentos -->
      <div v-if="activeTab === 'metricas'" class="space-y-4">
        <div v-if="paidExpenses.length === 0" class="text-center py-20">
          <p class="text-white/40 text-sm">Nenhum pagamento registrado para exibir métricas</p>
        </div>
        <div v-else>
          <!-- Cards de Métricas do Histórico de Pagamentos -->
          <div class="grid grid-cols-4 gap-4">
            <div class="p-6 rounded-2xl bg-white/5 border border-white/10">
              <p class="text-[10px] font-bold uppercase tracking-widest text-white/50 mb-2">Total Pago</p>
              <p class="text-2xl font-black text-green-400">{{ formatCurrency(paymentMetrics.totalPaid) }}</p>
              <p class="text-[10px] text-white/40 mt-2">{{ paymentMetrics.count }} pagamentos</p>
            </div>
            <div class="p-6 rounded-2xl bg-white/5 border border-white/10">
              <p class="text-[10px] font-bold uppercase tracking-widest text-white/50 mb-2">Média por Pagamento</p>
              <p class="text-2xl font-black text-white">{{ formatCurrency(paymentMetrics.average) }}</p>
              <p class="text-[10px] text-white/40 mt-2">valor médio</p>
            </div>
            <div class="p-6 rounded-2xl bg-white/5 border border-white/10">
              <p class="text-[10px] font-bold uppercase tracking-widest text-white/50 mb-2">Período</p>
              <p class="text-2xl font-black text-white">{{ paymentMetrics.dateRange.split(' ')[0] }}</p>
              <p class="text-[10px] text-white/40 mt-2">últimos pagamentos</p>
            </div>
            <div class="p-6 rounded-2xl bg-white/5 border border-white/10">
              <p class="text-[10px] font-bold uppercase tracking-widest text-white/50 mb-2">Status</p>
              <p class="text-2xl font-black text-blue-400">{{ paymentMetrics.count }}</p>
              <p class="text-[10px] text-white/40 mt-2">registros</p>
            </div>
          </div>

          <!-- Métricas Adicionais -->
          <div class="mt-6 space-y-4">
            <!-- Maior e Menor Pagamento -->
            <div class="grid grid-cols-2 gap-4">
              <div class="p-6 rounded-2xl bg-white/5 border border-white/10">
                <p class="text-[10px] font-bold uppercase tracking-widest text-white/50 mb-2">Maior Pagamento</p>
                <p class="text-2xl font-black text-white">{{ formatCurrency(paymentMetrics.maxPayment) }}</p>
                <p class="text-[10px] text-white/40 mt-2">valor máximo</p>
              </div>
              <div class="p-6 rounded-2xl bg-white/5 border border-white/10">
                <p class="text-[10px] font-bold uppercase tracking-widest text-white/50 mb-2">Menor Pagamento</p>
                <p class="text-2xl font-black text-white">{{ formatCurrency(paymentMetrics.minPayment) }}</p>
                <p class="text-[10px] text-white/40 mt-2">valor mínimo</p>
              </div>
            </div>

            <!-- Métricas por Categoria -->
            <div>
              <h3 class="text-sm font-bold uppercase tracking-widest text-white mb-4">Pagamentos por Categoria</h3>
              <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div v-for="(amount, categoryId) in paymentMetrics.byCategory" :key="categoryId" class="p-4 rounded-xl bg-white/5 border border-white/10">
                  <p class="text-[10px] font-bold uppercase tracking-widest text-white/50 mb-2">{{ getCategoryName(categoryId) }}</p>
                  <p class="text-xl font-black text-white">{{ formatCurrency(amount) }}</p>
                </div>
              </div>
            </div>

            <!-- Estatísticas Adicionais -->
            <div class="grid grid-cols-3 gap-4">
              <div class="p-4 rounded-xl bg-white/5 border border-white/10">
                <p class="text-[10px] font-bold uppercase tracking-widest text-white/50 mb-2">Despesas Recorrentes Pagas</p>
                <p class="text-2xl font-black text-blue-400">{{ paymentMetrics.recurringPaid }}</p>
              </div>
              <div class="p-4 rounded-xl bg-white/5 border border-white/10">
                <p class="text-[10px] font-bold uppercase tracking-widest text-white/50 mb-2">Despesas Únicas Pagas</p>
                <p class="text-2xl font-black text-purple-400">{{ paymentMetrics.uniquePaid }}</p>
              </div>
              <div class="p-4 rounded-xl bg-white/5 border border-white/10">
                <p class="text-[10px] font-bold uppercase tracking-widest text-white/50 mb-2">Período Completo</p>
                <p class="text-sm font-black text-white">{{ paymentMetrics.dateRange }}</p>
              </div>
            </div>
          </div>
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
              <div class="flex items-center gap-3">
                <div class="w-4 h-4 rounded" :style="{ backgroundColor: category.color }"></div>
                <p class="font-bold text-white text-sm uppercase tracking-tight">{{ category.name }}</p>
              </div>
              <button
                @click="confirmDelete(category.id, 'category')"
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

    <!-- Modal de Despesa -->
    <UiKModal :is-open="showCreateModal" @close="showCreateModal = false">
      <UiKModalHeader 
        :title="editingExpense ? 'Editar Despesa' : 'Nova Despesa'"
        subtitle="Controle de custos e saídas"
      />

      <form @submit.prevent="saveExpense" class="flex flex-col max-h-[70vh]">
        <div class="flex-1 overflow-y-auto space-y-4 px-1">
          <div>
            <label class="block text-white/80 text-[10px] font-bold uppercase tracking-widest mb-2">Descrição</label>
            <input v-model="formData.description" type="text" placeholder="Ex: Servidor AWS" class="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-white/20 focus:bg-white/10 transition-all text-sm" />
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-white/80 text-[10px] font-bold uppercase tracking-widest mb-2">Categoria</label>
              <select v-model="formData.category_id" class="w-full bg-[#1a1a1b] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-white/20 focus:bg-[#222223] transition-all text-sm appearance-none cursor-pointer" style="background-image: url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2212%22 height=%2212%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22white%22 stroke-width=%222%22><polyline points=%226 9 12 15 18 9%22></polyline></svg>'); background-repeat: no-repeat; background-position: right 12px center; padding-right: 36px;">
                <option value="">Selecione uma categoria</option>
                <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
              </select>
            </div>

            <div>
              <label class="block text-white/80 text-[10px] font-bold uppercase tracking-widest mb-2">Valor (R$)</label>
              <input v-model.number="formData.amount" type="number" placeholder="0.00" step="0.01" class="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-white/20 focus:bg-white/10 transition-all text-sm" />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-white/80 text-[10px] font-bold uppercase tracking-widest mb-2">Data de Início</label>
              <input v-model="formData.date" type="date" class="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-white/20 focus:bg-white/10 transition-all text-sm" />
            </div>

            <div>
              <label class="block text-white/80 text-[10px] font-bold uppercase tracking-widest mb-2">Data de Vencimento</label>
              <input v-model="formData.due_date" type="date" class="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-white/20 focus:bg-white/10 transition-all text-sm" />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-white/80 text-[10px] font-bold uppercase tracking-widest mb-2">Status</label>
              <select v-model="formData.status" class="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[var(--kros-blue)] focus:bg-white/10 transition-all text-sm appearance-none cursor-pointer" style="background-image: url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2212%22 height=%2212%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22white%22 stroke-width=%222%22><polyline points=%226 9 12 15 18 9%22></polyline></svg>'); background-repeat: no-repeat; background-position: right 12px center; padding-right: 36px;">
                <option value="pending">Pendente</option>
                <option value="paid">Pago</option>
                <option value="overdue">Vencida</option>
              </select>
            </div>
          </div>

          <div>
            <label class="block text-white/80 text-[10px] font-bold uppercase tracking-widest mb-2">Notas (Opcional)</label>
            <textarea v-model="formData.notes" placeholder="Adicione observações..." class="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-white/20 focus:bg-white/10 transition-all text-sm resize-none h-16"></textarea>
          </div>

          <div class="space-y-2">
            <label class="flex items-center gap-2 cursor-pointer">
              <input 
                v-model="formData.is_recurring" 
                type="checkbox" 
                class="w-4 h-4 rounded"
              />
              <span class="text-white/80 text-[10px] font-bold uppercase tracking-widest">Despesa Recorrente</span>
            </label>

            <select v-if="formData.is_recurring" v-model="formData.recurring_frequency" class="w-full bg-[#1a1a1b] border border-white/10 rounded-lg px-3 py-2 text-white text-sm">
              <option value="daily">Diária</option>
              <option value="weekly">Semanal</option>
              <option value="monthly">Mensal</option>
              <option value="quarterly">Trimestral</option>
              <option value="semiannual">Semestral</option>
              <option value="yearly">Anual</option>
            </select>
          </div>
        </div>

        <div class="border-t border-white/10 pt-4 mt-4 flex-shrink-0">
          <UiKModalActions
            :confirm-text="editingExpense ? 'Atualizar' : 'Criar'"
            :cancel-text="'Cancelar'"
            :loading="loading"
            submit-type="submit"
            @cancel="showCreateModal = false"
          />
        </div>
      </form>
    </UiKModal>

    <!-- Modal de Confirmação de Delete -->
    <UiKModal :is-open="showDeleteConfirm" @close="showDeleteConfirm = false">
      <UiKModalHeader 
        :title="deleteConfirmType === 'expense' ? 'Deletar Despesa' : 'Deletar Categoria'"
        :subtitle="deleteConfirmType === 'expense' ? 'Esta ação não pode ser desfeita' : 'Categorias com despesas não podem ser deletadas'"
      />

      <div class="py-6 text-center">
        <p class="text-white/70">Tem certeza que deseja continuar?</p>
      </div>

      <UiKModalActions
        confirm-text="Deletar"
        cancel-text="Cancelar"
        :loading="loading"
        submit-type="button"
        @confirm="performDelete"
        @cancel="showDeleteConfirm = false"
      />
    </UiKModal>
  </LayoutsKPageLayout>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue'
import KPaymentHistory from '~/components/blocks/KPaymentHistory.vue'

definePageMeta({
  middleware: 'auth'
})

const { 
  expenses, 
  categories, 
  loading, 
  fetchExpenses, 
  fetchCategories, 
  upsertExpense, 
  deleteExpense: deleteExpenseFromComposable, 
  upsertCategory, 
  deleteCategory: deleteCategoryFromComposable,
  markExpenseAsPaid: markExpenseAsPaidComposable,
  getPendingExpenses,
  getPaidExpenses
} = useExpenses()

// Watch for categories changes
watch(() => categories.value, (newVal) => {
  console.log('Component: categories changed:', newVal.length, 'items')
  console.log('Component: categories content:', newVal)
}, { deep: true })

const showCreateModal = ref(false)
const editingExpense = ref<any>(null)
const searchQuery = ref('')
const selectedCategory = ref('')
const activeTab = ref('todos')
const newCategoryName = ref('')
const showDeleteConfirm = ref(false)
const deleteConfirmId = ref<string | null>(null)
const deleteConfirmType = ref<'expense' | 'category' | null>(null)
const selectedMonth = ref('')
const selectedYear = ref('')
const startDate = ref('')
const endDate = ref('')
const showDateFilters = ref(false)
const selectedStatus = ref('')

const tabs = [
  { id: 'metricas', label: 'Métricas' },
  { id: 'todos', label: 'Todos' },
  { id: 'recorrentes', label: 'Recorrentes' },
  { id: 'unicos', label: 'Únicos' },
  { id: 'historico', label: 'Histórico de Pagamentos' },
  { id: 'categorias', label: 'Categorias' }
]

const formData = reactive({
  description: '',
  category_id: '',
  amount: 0,
  status: 'pending' as 'pending' | 'paid',
  notes: '',
  date: new Date().toISOString().split('T')[0],
  due_date: new Date().toISOString().split('T')[0],
  is_recurring: false,
  recurring_frequency: 'monthly' as 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'semiannual' | 'yearly'
})

const stats = computed(() => {
  const now = new Date()
  const currentMonth = now.getMonth()
  const currentYear = now.getFullYear()

  const monthExpenses = expenses.value.filter((e: any) => {
    const date = new Date(e.created_at)
    return date.getMonth() === currentMonth && date.getFullYear() === currentYear
  })

  const amounts = monthExpenses.map((e: any) => e.amount)
  const totalMonth = amounts.reduce((a: number, b: number) => a + b, 0)
  const total = expenses.value.reduce((a: number, b: any) => a + b.amount, 0)
  const average = monthExpenses.length > 0 ? totalMonth / monthExpenses.length : 0
  const max = amounts.length > 0 ? Math.max(...amounts) : 0
  const pending = getPendingExpenses.value.reduce((a: number, b: any) => a + b.amount, 0)
  const paid = getPaidExpenses.value.reduce((a: number, b: any) => a + b.amount, 0)

  return {
    totalMonth,
    countMonth: monthExpenses.length,
    average,
    max,
    total,
    count: expenses.value.length,
    pending,
    paid
  }
})

const filteredExpenses = computed(() => {
  let filtered = expenses.value

  if (activeTab.value === 'recorrentes') {
    filtered = filtered.filter((e: any) => e.is_recurring === true)
  } else if (activeTab.value === 'unicos') {
    filtered = filtered.filter((e: any) => e.is_recurring !== true)
  }

  if (searchQuery.value) {
    filtered = filtered.filter((e: any) => 
      e.description.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
  }

  if (selectedCategory.value) {
    filtered = filtered.filter((e: any) => e.category_id === selectedCategory.value)
  }

  if (selectedStatus.value) {
    filtered = filtered.filter((e: any) => {
      if (selectedStatus.value === 'paid') {
        return e.status === 'paid'
      } else if (selectedStatus.value === 'pending') {
        return e.status === 'pending'
      } else if (selectedStatus.value === 'overdue') {
        // Vencida: data de vencimento passou e ainda não foi paga
        if (e.status === 'paid') return false
        if (!e.due_date) return false
        const dueDate = new Date(e.due_date)
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        return dueDate < today
      }
      return true
    })
  }

  if (selectedMonth.value || selectedYear.value) {
    filtered = filtered.filter((e: any) => {
      const date = new Date(e.created_at)
      const month = date.getMonth() + 1
      const year = date.getFullYear()
      
      if (selectedMonth.value && selectedYear.value) {
        return month === parseInt(selectedMonth.value) && year === parseInt(selectedYear.value)
      } else if (selectedMonth.value) {
        return month === parseInt(selectedMonth.value)
      } else if (selectedYear.value) {
        return year === parseInt(selectedYear.value)
      }
      return true
    })
  }

  if (startDate.value || endDate.value) {
    filtered = filtered.filter((e: any) => {
      const expenseDate = new Date(e.created_at)
      if (startDate.value && endDate.value) {
        const start = new Date(startDate.value)
        const end = new Date(endDate.value)
        return expenseDate >= start && expenseDate <= end
      } else if (startDate.value) {
        const start = new Date(startDate.value)
        return expenseDate >= start
      } else if (endDate.value) {
        const end = new Date(endDate.value)
        return expenseDate <= end
      }
      return true
    })
  }

  return filtered.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
})

const paidExpenses = computed(() => {
  const paid = getPaidExpenses.value.sort((a: any, b: any) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
  console.log('🔍 [KExpensesManagement] paidExpenses computed:', paid.length, 'items')
  console.log('🔍 [KExpensesManagement] getPaidExpenses.value:', getPaidExpenses.value)
  return paid
})

const paymentMetrics = computed(() => {
  const paid = paidExpenses.value
  
  if (paid.length === 0) {
    return {
      totalPaid: 0,
      count: 0,
      average: 0,
      maxPayment: 0,
      minPayment: 0,
      byCategory: {},
      recurringPaid: 0,
      uniquePaid: 0,
      dateRange: 'N/A'
    }
  }

  const amounts = paid.map((e: any) => e.amount)
  const totalPaid = amounts.reduce((a: number, b: number) => a + b, 0)
  const average = totalPaid / paid.length
  const maxPayment = Math.max(...amounts)
  const minPayment = Math.min(...amounts)
  
  // Agrupar por categoria
  const byCategory: Record<string, number> = {}
  paid.forEach((e: any) => {
    const catId = e.category_id
    byCategory[catId] = (byCategory[catId] || 0) + e.amount
  })
  
  // Contar recorrentes e únicos
  const recurringPaid = paid.filter((e: any) => e.is_recurring).length
  const uniquePaid = paid.filter((e: any) => !e.is_recurring).length
  
  // Calcular período
  const dates = paid.map((e: any) => new Date(e.updated_at))
  const minDate = new Date(Math.min(...dates.map(d => d.getTime())))
  const maxDate = new Date(Math.max(...dates.map(d => d.getTime())))
  const dateRange = minDate.toLocaleDateString('pt-BR') + ' a ' + maxDate.toLocaleDateString('pt-BR')

  return {
    totalPaid,
    count: paid.length,
    average,
    maxPayment,
    minPayment,
    byCategory,
    recurringPaid,
    uniquePaid,
    dateRange
  }
})

const getCategoryName = (categoryId: string) => {
  return categories.value.find((c: any) => c.id === categoryId)?.name || 'Outros'
}

const getCategoryColor = (categoryId: string) => {
  return categories.value.find((c: any) => c.id === categoryId)?.color || '#6B7280'
}

const getFrequencyLabel = (frequency: string | undefined) => {
  const labels: Record<string, string> = {
    'daily': 'Diária',
    'weekly': 'Semanal',
    'monthly': 'Mensal',
    'quarterly': 'Trimestral',
    'semiannual': 'Semestral',
    'yearly': 'Anual'
  }
  return labels[frequency || ''] || 'Desconhecida'
}

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)
}

const formatDate = (date: string) => {
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(date))
}

const saveExpense = async () => {
  if (!formData.description || !formData.amount || !formData.category_id) {
    alert('Preencha todos os campos')
    return
  }

  const dateValue = formData.date ? new Date(formData.date).toISOString() : new Date().toISOString()
  const dueDateValue = formData.due_date ? new Date(formData.due_date).toISOString() : null
  
  const result = await upsertExpense({
    id: editingExpense.value?.id,
    description: formData.description,
    category_id: formData.category_id,
    amount: formData.amount,
    status: formData.status,
    notes: formData.notes,
    is_recurring: formData.is_recurring,
    recurring_frequency: formData.is_recurring ? formData.recurring_frequency : undefined,
    created_at: dateValue,
    due_date: dueDateValue,
    updated_at: new Date().toISOString()
  })

  if (result.success) {
    showCreateModal.value = false
    resetForm()
  } else {
    alert('Erro: ' + result.error)
  }
}

const editExpense = (expense: any) => {
  editingExpense.value = expense
  formData.description = expense.description
  formData.category_id = expense.category_id
  formData.amount = expense.amount
  formData.status = expense.status || 'pending'
  formData.notes = expense.notes || ''
  formData.is_recurring = expense.is_recurring || false
  formData.recurring_frequency = expense.recurring_frequency || 'monthly'
  formData.date = expense.created_at.split('T')[0]
  formData.due_date = expense.due_date ? expense.due_date.split('T')[0] : new Date().toISOString().split('T')[0]
  showCreateModal.value = true
}

const confirmDelete = (id: string, type: 'expense' | 'category') => {
  console.log('🗑️ [confirmDelete] Opening delete confirmation modal for:', type, id)
  deleteConfirmId.value = id
  deleteConfirmType.value = type
  showDeleteConfirm.value = true
}

const performDelete = async () => {
  console.log('⚡ [performDelete] Delete confirmed! Type:', deleteConfirmType.value, 'ID:', deleteConfirmId.value)
  if (!deleteConfirmId.value || !deleteConfirmType.value) {
    console.warn('⚠️ [performDelete] Missing deleteConfirmId or deleteConfirmType')
    return
  }

  if (deleteConfirmType.value === 'expense') {
    console.log('🗑️ [performDelete] Deleting expense:', deleteConfirmId.value)
    const result = await deleteExpenseFromComposable(deleteConfirmId.value)
    if (!result.success) {
      alert('Erro: ' + result.error)
    }
  } else {
    console.log('🗑️ [performDelete] Deleting category:', deleteConfirmId.value)
    const result = await deleteCategoryFromComposable(deleteConfirmId.value)
    if (!result.success) {
      alert('Erro: ' + result.error)
    }
  }

  showDeleteConfirm.value = false
  deleteConfirmId.value = null
  deleteConfirmType.value = null
}

const saveCategory = async () => {
  if (!newCategoryName.value.trim()) return

  console.log('saveCategory: Starting with name:', newCategoryName.value)

  const result = await upsertCategory({
    name: newCategoryName.value.trim(),
    color: '#' + Math.floor(Math.random() * 16777215).toString(16),
    is_active: true
  })

  console.log('saveCategory: Result:', result)
  console.log('saveCategory: Categories after save:', categories.value)

  if (result.success) {
    newCategoryName.value = ''
  } else {
    alert('Erro: ' + result.error)
  }
}

const handleMarkAsPaid = async (id: string) => {
  const result = await markExpenseAsPaidComposable(id)
  if (!result.success) {
    alert('Erro: ' + result.error)
  }
}

const resetForm = () => {
  formData.description = ''
  formData.category_id = ''
  formData.amount = 0
  formData.status = 'pending'
  formData.notes = ''
  formData.is_recurring = false
  formData.recurring_frequency = 'monthly'
  formData.date = new Date().toISOString().split('T')[0]
  formData.due_date = new Date().toISOString().split('T')[0]
  editingExpense.value = null
}

const clearFilters = () => {
  searchQuery.value = ''
  selectedCategory.value = ''
  selectedStatus.value = ''
  selectedMonth.value = ''
  selectedYear.value = ''
  startDate.value = ''
  endDate.value = ''
}

onMounted(async () => {
  await fetchCategories()
  await fetchExpenses()
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
