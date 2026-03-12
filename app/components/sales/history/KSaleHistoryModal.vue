<template>
  <UiKModal :is-open="isOpen" size="lg" @close="$emit('close')">
    <template #header>
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-amber-500">
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
            <path d="M3 3v5h5"/>
            <path d="M12 7v5l4 2"/>
          </svg>
        </div>
        <div>
          <h3 class="text-lg font-bold text-white">Histórico de Ações</h3>
          <p class="text-sm text-white/60">{{ sale?.representative_name || sale?.name }}</p>
        </div>
      </div>
    </template>

    <div v-if="loading" class="flex items-center justify-center py-12">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
    </div>

    <div v-else-if="history.length === 0" class="py-12 text-center">
      <p class="text-white/40">Nenhuma ação registrada ainda</p>
    </div>

    <div v-else class="relative">
      <!-- Linha vertical -->
      <div class="absolute left-5 top-0 bottom-0 w-0.5 bg-white/10"></div>

      <!-- Timeline -->
      <div class="space-y-6">
        <div 
          v-for="(item, index) in history" 
          :key="index"
          class="relative pl-12"
        >
          <!-- Ícone -->
          <div 
            :class="[
              'absolute left-0 w-10 h-10 rounded-full flex items-center justify-center',
              getActionColor(item.action_type).bg
            ]"
          >
            <component :is="getActionIcon(item.action_type)" :class="getActionColor(item.action_type).text" />
          </div>

          <!-- Conteúdo -->
          <div class="bg-white/[0.02] border border-white/10 rounded-xl p-4">
            <div class="flex items-start justify-between mb-2">
              <div>
                <p class="text-sm font-bold text-white">{{ getActionTitle(item.action_type) }}</p>
                <p class="text-xs text-white/60 mt-1">{{ formatDateTime(item.created_at) }}</p>
              </div>
              <span 
                :class="[
                  'px-2 py-1 rounded-lg text-[9px] font-bold uppercase',
                  getActionColor(item.action_type).badge
                ]"
              >
                {{ getActionLabel(item.action_type) }}
              </span>
            </div>
            
            <p v-if="item.description" class="text-sm text-white/70 mt-2">{{ item.description }}</p>
            
            <div v-if="item.user_name" class="flex items-center gap-2 mt-3 pt-3 border-t border-white/5">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-white/40">
                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
              <span class="text-xs text-white/40">{{ item.user_name }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </UiKModal>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{
  isOpen: boolean
  sale: any
}>()

const emit = defineEmits<{
  close: []
}>()

const loading = ref(false)
const history = ref<any[]>([])

const fetchHistory = async () => {
  if (!props.sale) return
  
  loading.value = true
  try {
    const supabase = useSupabaseClient()
    
    // Buscar histórico de ações dessa venda
    const { data, error } = await supabase
      .from('sale_history')
      .select('*')
      .eq('sale_id', props.sale.id)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    history.value = data || []
  } catch (err) {
    console.error('Erro ao buscar histórico:', err)
    history.value = []
  } finally {
    loading.value = false
  }
}

watch(() => props.isOpen, (isOpen) => {
  if (isOpen) {
    fetchHistory()
  }
})

const formatDateTime = (date: string) => {
  return new Date(date).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getActionIcon = (type: string) => {
  const icons: any = {
    created: 'svg',
    updated: 'svg',
    whatsapp_sent: 'svg',
    receipt_generated: 'svg',
    status_changed: 'svg',
    deleted: 'svg'
  }
  return icons[type] || 'svg'
}

const getActionColor = (type: string) => {
  const colors: any = {
    created: { bg: 'bg-blue-500/10', text: 'text-blue-500', badge: 'bg-blue-500/10 text-blue-400' },
    updated: { bg: 'bg-purple-500/10', text: 'text-purple-500', badge: 'bg-purple-500/10 text-purple-400' },
    whatsapp_sent: { bg: 'bg-green-500/10', text: 'text-green-500', badge: 'bg-green-500/10 text-green-400' },
    receipt_generated: { bg: 'bg-amber-500/10', text: 'text-amber-500', badge: 'bg-amber-500/10 text-amber-400' },
    status_changed: { bg: 'bg-cyan-500/10', text: 'text-cyan-500', badge: 'bg-cyan-500/10 text-cyan-400' },
    deleted: { bg: 'bg-red-500/10', text: 'text-red-500', badge: 'bg-red-500/10 text-red-400' }
  }
  return colors[type] || colors.created
}

const getActionTitle = (type: string) => {
  const titles: any = {
    created: 'Venda Criada',
    updated: 'Venda Atualizada',
    whatsapp_sent: 'Comprovante Enviado via WhatsApp',
    receipt_generated: 'Comprovante Gerado',
    status_changed: 'Status Alterado',
    deleted: 'Venda Deletada'
  }
  return titles[type] || 'Ação Realizada'
}

const getActionLabel = (type: string) => {
  const labels: any = {
    created: 'Criação',
    updated: 'Edição',
    whatsapp_sent: 'WhatsApp',
    receipt_generated: 'Comprovante',
    status_changed: 'Status',
    deleted: 'Exclusão'
  }
  return labels[type] || 'Ação'
}
</script>
