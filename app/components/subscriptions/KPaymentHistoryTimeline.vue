<template>
  <div class="space-y-4">
    <!-- Filtros -->
    <div class="flex flex-wrap items-center gap-3 mb-6">
      <select 
        v-model="filterType"
        class="px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:border-kros-blue focus:outline-none transition-all appearance-none cursor-pointer"
      >
        <option value="all" class="bg-[#111112] text-white">Todas as ações</option>
        <option value="paid" class="bg-[#111112] text-white">Pagamentos</option>
        <option value="reversed" class="bg-[#111112] text-white">Estornos</option>
        <option value="auto_billing" class="bg-[#111112] text-white">Automação</option>
        <option value="tags" class="bg-[#111112] text-white">Tags</option>
        <option value="messages" class="bg-[#111112] text-white">Mensagens</option>
        <option value="batch" class="bg-[#111112] text-white">Ações em Massa</option>
      </select>

      <select 
        v-model="filterPeriod"
        class="px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:border-kros-blue focus:outline-none transition-all appearance-none cursor-pointer"
      >
        <option value="all" class="bg-[#111112] text-white">Todo o período</option>
        <option value="today" class="bg-[#111112] text-white">Hoje</option>
        <option value="yesterday" class="bg-[#111112] text-white">Ontem</option>
        <option value="7days" class="bg-[#111112] text-white">Últimos 7 dias</option>
        <option value="30days" class="bg-[#111112] text-white">Últimos 30 dias</option>
        <option value="90days" class="bg-[#111112] text-white">Últimos 90 dias</option>
        <option value="custom" class="bg-[#111112] text-white">Período personalizado</option>
      </select>

      <!-- Datas personalizadas -->
      <template v-if="filterPeriod === 'custom'">
        <input 
          v-model="startDate"
          type="date"
          class="px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:border-kros-blue focus:outline-none transition-all"
          placeholder="Data inicial"
        />
        <span class="text-white/40 text-sm">até</span>
        <input 
          v-model="endDate"
          type="date"
          class="px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:border-kros-blue focus:outline-none transition-all"
          placeholder="Data final"
        />
      </template>

      <div class="flex-1"></div>

      <div class="text-[10px] font-bold text-white/40 uppercase tracking-widest">
        {{ filteredHistory.length }} registros
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex items-center justify-center py-20">
      <svg class="animate-spin text-white" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
      </svg>
    </div>

    <!-- Timeline -->
    <div v-else-if="paginatedHistory.length > 0" class="relative">
      <!-- Linha vertical -->
      <div class="absolute left-[19px] top-0 bottom-0 w-[2px] bg-gradient-to-b from-kros-blue/50 via-kros-blue/20 to-transparent"></div>

      <div 
        v-for="(entry, index) in paginatedHistory" 
        :key="entry.id"
        class="relative pl-12 pb-8 group"
      >
        <!-- Ícone -->
        <div 
          :class="[
            'absolute left-0 w-10 h-10 rounded-2xl flex items-center justify-center border-2 transition-all',
            getActionStyle(entry.action_type).bg,
            getActionStyle(entry.action_type).border,
            'group-hover:scale-110'
          ]"
        >
          <component :is="getActionIcon(entry.action_type)" class="w-5 h-5" :class="getActionStyle(entry.action_type).text" />
        </div>

        <!-- Conteúdo -->
        <div class="bg-white/[0.02] border border-white/5 rounded-2xl p-5 hover:border-white/10 transition-all">
          <div class="flex items-start justify-between gap-4 mb-3">
            <div class="flex-1">
              <h4 class="text-sm font-bold text-white mb-1">{{ entry.description }}</h4>
              <div class="flex items-center gap-3 text-[10px] text-white/40 uppercase tracking-widest font-bold">
                <span>{{ entry.user_name || 'Sistema' }}</span>
                <span class="w-1 h-1 rounded-full bg-white/20"></span>
                <span>{{ formatDate(entry.created_at) }}</span>
              </div>
            </div>
            <span 
              :class="[
                'text-[8px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg border',
                getActionStyle(entry.action_type).badge
              ]"
            >
              {{ getActionLabel(entry.action_type) }}
            </span>
          </div>

          <!-- Metadata -->
          <div v-if="entry.metadata && Object.keys(entry.metadata).length > 0" class="mt-3 pt-3 border-t border-white/5">
            <div class="grid grid-cols-2 gap-3 text-xs">
              <div v-if="entry.metadata.old_value !== undefined" class="space-y-1">
                <span class="text-[9px] font-bold text-white/40 uppercase tracking-widest">Valor Anterior</span>
                <p class="text-white/70 font-medium">{{ formatMetadataValue(entry.metadata.old_value) }}</p>
              </div>
              <div v-if="entry.metadata.new_value !== undefined" class="space-y-1">
                <span class="text-[9px] font-bold text-white/40 uppercase tracking-widest">Novo Valor</span>
                <p class="text-white/70 font-medium">{{ formatMetadataValue(entry.metadata.new_value) }}</p>
              </div>
              <div v-if="entry.metadata.tag_name" class="space-y-1">
                <span class="text-[9px] font-bold text-white/40 uppercase tracking-widest">Tag</span>
                <p class="text-white/70 font-medium">{{ entry.metadata.tag_name }}</p>
              </div>
              <div v-if="entry.metadata.batch_count" class="space-y-1">
                <span class="text-[9px] font-bold text-white/40 uppercase tracking-widest">Quantidade</span>
                <p class="text-white/70 font-medium">{{ entry.metadata.batch_count }} registros</p>
              </div>
              <div v-if="entry.metadata.amount" class="space-y-1">
                <span class="text-[9px] font-bold text-white/40 uppercase tracking-widest">Valor</span>
                <p class="text-white/70 font-medium">{{ formatCurrency(entry.metadata.amount) }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Paginação -->
    <div v-if="!loading && filteredHistory.length > itemsPerPage" class="flex items-center justify-between mt-6 pt-6 border-t border-white/5">
      <div class="text-[10px] font-bold text-white/40 uppercase tracking-widest">
        Página {{ currentPage }} de {{ totalPages }}
      </div>
      
      <div class="flex items-center gap-2">
        <button
          @click="goToPage(1)"
          :disabled="currentPage === 1"
          class="px-3 py-2 bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed text-white/70 hover:text-white rounded-lg transition-all text-[10px] font-bold uppercase tracking-wider"
        >
          Primeira
        </button>
        
        <button
          @click="goToPage(currentPage - 1)"
          :disabled="currentPage === 1"
          class="p-2 bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed text-white/70 hover:text-white rounded-lg transition-all"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="m15 18-6-6 6-6"/>
          </svg>
        </button>
        
        <div class="flex items-center gap-1">
          <button
            v-for="page in Math.min(totalPages, 5)"
            :key="page"
            @click="goToPage(page)"
            :class="[
              'px-3 py-2 rounded-lg transition-all text-[10px] font-bold uppercase tracking-wider',
              currentPage === page 
                ? 'bg-kros-blue text-white' 
                : 'bg-white/5 hover:bg-white/10 text-white/70 hover:text-white'
            ]"
          >
            {{ page }}
          </button>
        </div>
        
        <button
          @click="goToPage(currentPage + 1)"
          :disabled="currentPage === totalPages"
          class="p-2 bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed text-white/70 hover:text-white rounded-lg transition-all"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="m9 18 6-6-6-6"/>
          </svg>
        </button>
        
        <button
          @click="goToPage(totalPages)"
          :disabled="currentPage === totalPages"
          class="px-3 py-2 bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed text-white/70 hover:text-white rounded-lg transition-all text-[10px] font-bold uppercase tracking-wider"
        >
          Última
        </button>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else-if="!loading" class="flex flex-col items-center justify-center py-20 opacity-40">
      <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="mb-4 text-white">
        <path d="M12 8v4l3 3m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/>
      </svg>
      <p class="font-bold uppercase tracking-widest text-xs text-white">Nenhum registro encontrado</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, h, watch } from 'vue'

const props = withDefaults(defineProps<{
  history: any[]
  loading: boolean
}>(), {
  history: () => [],
  loading: false
})

const filterType = ref('all')
const filterPeriod = ref('all')
const startDate = ref('')
const endDate = ref('')
const currentPage = ref(1)
const itemsPerPage = 10

const filteredHistory = computed(() => {
  if (!props.history || !Array.isArray(props.history)) return []
  
  let filtered = props.history
  
  // Filtro por tipo
  if (filterType.value !== 'all') {
    const typeMap: Record<string, string[]> = {
      paid: ['paid'],
      reversed: ['reversed'],
      auto_billing: ['auto_billing_enabled', 'auto_billing_disabled'],
      tags: ['tag_added', 'tag_removed'],
      messages: ['message_sent'],
      batch: ['batch_paid', 'batch_reversed']
    }
    
    const types = typeMap[filterType.value] || []
    filtered = filtered.filter(h => types.includes(h.action_type))
  }
  
  // Filtro por período
  if (filterPeriod.value !== 'all') {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    
    filtered = filtered.filter(h => {
      const entryDate = new Date(h.created_at)
      
      switch (filterPeriod.value) {
        case 'today':
          return entryDate >= today
        case 'yesterday':
          return entryDate >= yesterday && entryDate < today
        case '7days':
          const last7Days = new Date(today)
          last7Days.setDate(last7Days.getDate() - 7)
          return entryDate >= last7Days
        case '30days':
          const last30Days = new Date(today)
          last30Days.setDate(last30Days.getDate() - 30)
          return entryDate >= last30Days
        case '90days':
          const last90Days = new Date(today)
          last90Days.setDate(last90Days.getDate() - 90)
          return entryDate >= last90Days
        case 'custom':
          if (startDate.value && endDate.value) {
            const start = new Date(startDate.value)
            const end = new Date(endDate.value)
            end.setHours(23, 59, 59, 999) // Incluir o dia todo
            return entryDate >= start && entryDate <= end
          } else if (startDate.value) {
            const start = new Date(startDate.value)
            return entryDate >= start
          } else if (endDate.value) {
            const end = new Date(endDate.value)
            end.setHours(23, 59, 59, 999)
            return entryDate <= end
          }
          return true
        default:
          return true
      }
    })
  }
  
  return filtered
})

const paginatedHistory = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return filteredHistory.value.slice(start, end)
})

const totalPages = computed(() => {
  return Math.ceil(filteredHistory.value.length / itemsPerPage)
})

const goToPage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
  }
}

// Reset para página 1 quando filtros mudarem
watch([filterType, filterPeriod, startDate, endDate], () => {
  currentPage.value = 1
})

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr)
  return date.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value)
}

const formatMetadataValue = (value: any) => {
  if (typeof value === 'number') return formatCurrency(value)
  if (typeof value === 'boolean') return value ? 'Sim' : 'Não'
  return String(value)
}

const getActionLabel = (type: string) => {
  const labels: Record<string, string> = {
    created: 'Criado',
    updated: 'Atualizado',
    paid: 'Pago',
    reversed: 'Estornado',
    auto_billing_enabled: 'Automação Ativada',
    auto_billing_disabled: 'Automação Desativada',
    tag_added: 'Tag Adicionada',
    tag_removed: 'Tag Removida',
    batch_paid: 'Pagamento em Massa',
    batch_reversed: 'Estorno em Massa',
    message_sent: 'Mensagem Enviada'
  }
  return labels[type] || type
}

const getActionStyle = (type: string) => {
  const styles: Record<string, any> = {
    created: {
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/30',
      text: 'text-blue-400',
      badge: 'bg-blue-500/10 text-blue-400 border-blue-500/30'
    },
    paid: {
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/30',
      text: 'text-emerald-400',
      badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
    },
    reversed: {
      bg: 'bg-orange-500/10',
      border: 'border-orange-500/30',
      text: 'text-orange-400',
      badge: 'bg-orange-500/10 text-orange-400 border-orange-500/30'
    },
    auto_billing_enabled: {
      bg: 'bg-purple-500/10',
      border: 'border-purple-500/30',
      text: 'text-purple-400',
      badge: 'bg-purple-500/10 text-purple-400 border-purple-500/30'
    },
    auto_billing_disabled: {
      bg: 'bg-gray-500/10',
      border: 'border-gray-500/30',
      text: 'text-gray-400',
      badge: 'bg-gray-500/10 text-gray-400 border-gray-500/30'
    },
    tag_added: {
      bg: 'bg-cyan-500/10',
      border: 'border-cyan-500/30',
      text: 'text-cyan-400',
      badge: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
    },
    tag_removed: {
      bg: 'bg-red-500/10',
      border: 'border-red-500/30',
      text: 'text-red-400',
      badge: 'bg-red-500/10 text-red-400 border-red-500/30'
    },
    message_sent: {
      bg: 'bg-green-500/10',
      border: 'border-green-500/30',
      text: 'text-green-400',
      badge: 'bg-green-500/10 text-green-400 border-green-500/30'
    }
  }
  
  return styles[type] || styles.created
}

const getActionIcon = (type: string) => {
  const icons: Record<string, any> = {
    created: () => h('svg', { xmlns: 'http://www.w3.org/2000/svg', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2.5', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, [
      h('path', { d: 'M12 5v14M5 12h14' })
    ]),
    paid: () => h('svg', { xmlns: 'http://www.w3.org/2000/svg', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2.5', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, [
      h('path', { d: 'M20 6 9 17l-5-5' })
    ]),
    reversed: () => h('svg', { xmlns: 'http://www.w3.org/2000/svg', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2.5', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, [
      h('path', { d: 'M3 7v6h6M21 17v-6h-6' }),
      h('path', { d: 'M21 3 A9 9 0 0 0 9 7l-6 0M3 21 A9 9 0 0 0 15 17l6 0' })
    ]),
    auto_billing_enabled: () => h('svg', { xmlns: 'http://www.w3.org/2000/svg', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2.5', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, [
      h('path', { d: 'M13 2 3 14h9l-1 8 10-12h-9l1-8z' })
    ]),
    tag_added: () => h('svg', { xmlns: 'http://www.w3.org/2000/svg', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2.5', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, [
      h('path', { d: 'M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z' }),
      h('path', { d: 'M12 15v7' })
    ]),
    message_sent: () => h('svg', { xmlns: 'http://www.w3.org/2000/svg', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2.5', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, [
      h('path', { d: 'm3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z' })
    ])
  }
  
  return icons[type] || icons.created
}
</script>
