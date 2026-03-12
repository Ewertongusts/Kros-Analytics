<template>
  <div 
    :class="[
      'bg-white/5 border rounded-xl p-4 transition-all cursor-pointer group',
      borderClass
    ]"
  >
    <div class="flex items-start justify-between mb-2">
      <h4 
        :class="[
          'text-sm font-bold flex-1 transition-colors',
          titleClass
        ]"
        @click="$emit('edit')"
      >
        {{ task.title }}
      </h4>
      <div class="flex items-center gap-1">
        <button 
          v-if="canMoveLeft"
          @click="$emit('move-left')" 
          class="p-1 hover:bg-white/10 rounded" 
          title="Mover para esquerda"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-white/30 hover:text-white"><polyline points="15 18 9 12 15 6"></polyline></svg>
        </button>
        <button 
          v-if="canMoveRight"
          @click="$emit('move-right')" 
          class="p-1 hover:bg-white/10 rounded" 
          :title="task.status === 'in_progress' ? 'Concluir' : 'Mover para direita'"
        >
          <svg v-if="task.status === 'in_progress'" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-emerald-500/50 hover:text-emerald-500"><polyline points="20 6 9 17 4 12"></polyline></svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-white/30 hover:text-white"><polyline points="9 18 15 12 9 6"></polyline></svg>
        </button>
        <button 
          v-if="task.status === 'done'"
          @click="$emit('reopen')" 
          class="p-1 hover:bg-white/10 rounded" 
          title="Reabrir"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-white/30 hover:text-white"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/></svg>
        </button>
        <button 
          @click="$emit('delete')" 
          class="p-1 hover:bg-red-500/20 rounded" 
          title="Deletar"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-red-500/50 hover:text-red-500"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
        </button>
      </div>
    </div>
    
    <p v-if="task.description" :class="['text-xs mb-3 line-clamp-2', task.status === 'done' ? 'text-white/30' : 'text-white/50']">
      {{ task.description }}
    </p>
    
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-2">
        <span 
          v-if="task.status !== 'done'"
          :class="[
            'px-2 py-0.5 text-[9px] font-bold rounded uppercase',
            task.priority === 'high' ? 'bg-red-500/10 text-red-500' :
            task.priority === 'medium' ? 'bg-yellow-500/10 text-yellow-500' :
            'bg-green-500/10 text-green-500'
          ]"
        >
          {{ task.priority === 'high' ? 'Alta' : task.priority === 'medium' ? 'Média' : 'Baixa' }}
        </span>
        <span 
          v-for="tag in task.tags" 
          :key="tag" 
          :class="['px-2 py-0.5 text-[9px] font-bold rounded uppercase', task.status === 'done' ? 'bg-white/10 text-white/30' : 'bg-white/10 text-white/50']"
        >
          {{ tag }}
        </span>
      </div>
      <span v-if="task.due_date && task.status !== 'done'" class="text-[10px] text-white/30">{{ formatDate(task.due_date) }}</span>
      <span v-if="task.status === 'done'" class="text-[10px] text-emerald-500">✓</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Task } from '~/composables/useTasks'

const props = defineProps<{
  task: Task
}>()

defineEmits(['edit', 'move-left', 'move-right', 'reopen', 'delete'])

const canMoveLeft = computed(() => props.task.status !== 'todo')
const canMoveRight = computed(() => props.task.status !== 'done')

const borderClass = computed(() => {
  switch (props.task.status) {
    case 'todo': return 'border-white/10 hover:border-blue-500/30'
    case 'in_progress': return 'border-yellow-500/20 hover:border-yellow-500/50'
    case 'done': return 'border-emerald-500/20 hover:border-emerald-500/50'
    default: return 'border-white/10'
  }
})

const titleClass = computed(() => {
  switch (props.task.status) {
    case 'todo': return 'text-white group-hover:text-blue-500'
    case 'in_progress': return 'text-white group-hover:text-yellow-500'
    case 'done': return 'text-white/50 line-through group-hover:text-emerald-500'
    default: return 'text-white'
  }
})

const formatDate = (date: string) => {
  if (!date) return ''
  const d = new Date(date)
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
}
</script>
