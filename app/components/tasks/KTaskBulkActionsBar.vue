<template>
  <div v-if="selectedCount > 0" class="fixed bottom-6 left-6 right-6 md:left-auto md:right-6 md:w-auto z-40 animate-in fade-in slide-in-from-bottom-4 duration-300">
    <div class="bg-gradient-to-r from-kros-blue/20 to-purple-500/20 border border-kros-blue/30 rounded-xl p-4 backdrop-blur-sm">
      <div class="flex items-center justify-between gap-4 flex-wrap">
        <div class="flex items-center gap-2">
          <span class="text-sm font-bold text-white">{{ selectedCount }} tarefa{{ selectedCount !== 1 ? 's' : '' }} selecionada{{ selectedCount !== 1 ? 's' : '' }}</span>
        </div>
        
        <div class="flex items-center gap-2">
          <!-- Mudar Status -->
          <select
            @change="handleStatusChange"
            class="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm font-semibold hover:bg-white/20 transition-all focus:outline-none flex items-center gap-2"
          >
            <option value="">📊 Mudar Status</option>
            <option value="todo">📋 A Fazer</option>
            <option value="in_progress">⚙️ Em Andamento</option>
            <option value="done">✅ Concluído</option>
          </select>

          <!-- Mudar Prioridade -->
          <select
            @change="handlePriorityChange"
            class="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm font-semibold hover:bg-white/20 transition-all focus:outline-none"
          >
            <option value="">⭐ Mudar Prioridade</option>
            <option value="alta">🔴 Alta</option>
            <option value="media">🟡 Média</option>
            <option value="baixa">🟢 Baixa</option>
          </select>

          <!-- Deletar -->
          <button
            @click="handleDeleteSelected"
            class="px-3 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-lg text-red-400 text-sm font-semibold transition-all flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
            <span class="hidden sm:inline">Deletar</span>
          </button>

          <!-- Limpar Seleção -->
          <button
            @click="deselectAll"
            class="px-3 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-white text-sm font-semibold transition-all flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            <span class="hidden sm:inline">Limpar</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useTaskBulkActions } from '~/composables/useTaskBulkActions'
import { useTaskToast } from '~/composables/useTaskToast'

const props = defineProps<{
  tasks: any[]
}>()

const emit = defineEmits<{
  'update:status': [taskIds: string[], status: string]
  'update:priority': [taskIds: string[], priority: string]
  'delete': [taskIds: string[]]
}>()

const { selectedCount, getSelectedTaskIds, deselectAll } = useTaskBulkActions()
const { success, warning } = useTaskToast()

const handleStatusChange = (e: Event) => {
  const status = (e.target as HTMLSelectElement).value
  if (!status) return
  
  const taskIds = getSelectedTaskIds()
  emit('update:status', taskIds, status)
  success(`${taskIds.length} tarefa(s) movida(s) para ${status}`)
  deselectAll()
}

const handlePriorityChange = (e: Event) => {
  const priority = (e.target as HTMLSelectElement).value
  if (!priority) return
  
  const taskIds = getSelectedTaskIds()
  emit('update:priority', taskIds, priority)
  success(`Prioridade atualizada para ${taskIds.length} tarefa(s)`)
  deselectAll()
}

const handleDeleteSelected = () => {
  const taskIds = getSelectedTaskIds()
  const confirmed = confirm(`Deseja deletar ${taskIds.length} tarefa(s)?`)
  if (!confirmed) return
  
  emit('delete', taskIds)
  success(`${taskIds.length} tarefa(s) deletada(s)`)
  deselectAll()
}
</script>
