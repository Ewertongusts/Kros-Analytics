<template>
  <div 
    draggable="true"
    @dragstart="$emit('dragstart', task)"
    @dragend="$emit('dragend')"
    class="group p-4 bg-gradient-to-br from-white/[0.03] to-white/[0.01] border border-white/10 hover:border-white/20 rounded-xl transition-all hover:shadow-lg hover:shadow-black/20 cursor-move active:opacity-50"
  >
    <!-- Header -->
    <div class="flex items-start justify-between mb-3">
      <div class="flex-1 min-w-0">
        <h3 class="font-bold text-white text-sm mb-1 truncate hover:text-kros-blue cursor-pointer transition-colors">
          {{ task.title }}
        </h3>
        <p class="text-xs text-white/50 truncate">{{ task.description }}</p>
      </div>
      
      <!-- Prioridade Badge -->
      <span 
        :class="[
          'px-2 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider flex-shrink-0 ml-2',
          task.priority === 'alta' ? 'bg-red-500/20 text-red-400' :
          task.priority === 'media' ? 'bg-yellow-500/20 text-yellow-400' :
          'bg-blue-500/20 text-blue-400'
        ]"
      >
        {{ task.priority || 'Média' }}
      </span>
    </div>

    <!-- Conteúdo -->
    <div class="space-y-2 mb-3 text-xs">
      <!-- Responsável -->
      <div v-if="task.assigned_to" class="flex items-center gap-2">
        <span class="text-white/50">👤</span>
        <span class="text-white/70">{{ task.assigned_to }}</span>
      </div>

      <!-- Data de Vencimento -->
      <div v-if="task.due_date" class="flex items-center gap-2">
        <span class="text-white/50">📅</span>
        <span :class="isOverdue ? 'text-red-400 font-bold' : 'text-white/70'">
          {{ formatDate(task.due_date) }}
        </span>
      </div>

      <!-- Empresa -->
      <div v-if="task.company_name" class="flex items-center gap-2">
        <span class="text-white/50">🏢</span>
        <span class="text-white/70 truncate">{{ task.company_name }}</span>
      </div>
    </div>

    <!-- Ações -->
    <div class="flex items-center gap-2 pt-3 border-t border-white/10">
      <button
        @click="$emit('edit', task)"
        class="flex-1 p-2 rounded-lg bg-purple-500/10 text-purple-400 hover:bg-purple-500 hover:text-white transition-all text-[10px] font-bold uppercase tracking-widest"
        title="Editar"
      >
        ✏️ Editar
      </button>
      <button
        @click="$emit('delete', task)"
        class="flex-1 p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-all text-[10px] font-bold uppercase tracking-widest"
        title="Deletar"
      >
        🗑️ Deletar
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  task: any
}>()

defineEmits(['edit', 'delete', 'dragstart', 'dragend'])

const isOverdue = computed(() => {
  if (!props.task.due_date) return false
  return new Date(props.task.due_date) < new Date() && props.task.status !== 'done'
})

const formatDate = (date: string) => {
  if (!date) return '-'
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(date))
}
</script>
