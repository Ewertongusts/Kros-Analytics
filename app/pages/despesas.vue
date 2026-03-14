<template>
  <KPageLayout title="Despesas" subtitle="Gerencie suas despesas recorrentes e únicas">
    <!-- Tabs Navigation -->
    <div class="flex gap-2 mb-6 border-b border-white/10">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        @click="activeTab = tab.id"
        :class="[
          'px-4 py-3 font-semibold text-sm transition-colors border-b-2',
          activeTab === tab.id
            ? 'text-[var(--kros-blue)] border-[var(--kros-blue)]'
            : 'text-white/60 border-transparent hover:text-white/80'
        ]"
      >
        {{ tab.label }}
      </button>
    </div>

    <!-- Tab Content -->
    <div class="space-y-4">
      <KMetricsTab v-if="activeTab === 'metricas'" />
      <KAllOccurrencesTab v-if="activeTab === 'todos'" />
      <KRecurringExpensesTab v-if="activeTab === 'recorrentes'" />
      <KUniqueExpensesTab v-if="activeTab === 'unicos'" />
      <KPaymentHistoryTab v-if="activeTab === 'historico'" />
      <KCategoriesManagement v-if="activeTab === 'categorias'" />
    </div>
  </KPageLayout>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import KPageLayout from '~/components/blocks/KPageLayout.vue'
import KMetricsTab from '~/components/expenses/KMetricsTab.vue'
import KAllOccurrencesTab from '~/components/expenses/KAllOccurrencesTab.vue'
import KRecurringExpensesTab from '~/components/expenses/KRecurringExpensesTab.vue'
import KUniqueExpensesTab from '~/components/expenses/KUniqueExpensesTab.vue'
import KPaymentHistoryTab from '~/components/expenses/KPaymentHistoryTab.vue'
import KCategoriesManagement from '~/components/expenses/KCategoriesManagement.vue'

definePageMeta({
  middleware: 'auth'
})

const activeTab = ref('metricas')

const tabs = [
  { id: 'metricas', label: 'Métricas' },
  { id: 'todos', label: 'Todos' },
  { id: 'recorrentes', label: 'Recorrentes' },
  { id: 'unicos', label: 'Únicos' },
  { id: 'historico', label: 'Histórico' },
  { id: 'categorias', label: 'Categorias' }
]
</script>
