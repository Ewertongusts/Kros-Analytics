<template>
  <Teleport to="body">
    <div
      v-if="isDragging && draggedTask"
      class="fixed pointer-events-none z-[9999]"
      :style="{
        left: previewX + 'px',
        top: previewY + 'px',
        transform: 'translate(-50%, -50%)',
      }"
    >
      <!-- Preview Card -->
      <div
        class="w-80 bg-gradient-to-br from-white/10 to-white/5 border border-blue-400/60 rounded-xl p-4 shadow-2xl"
        :style="{
          boxShadow: '0 25px 50px rgba(59, 130, 246, 0.5), 0 0 40px rgba(59, 130, 246, 0.3)',
          transform: 'scale(1.05) rotate(3deg)',
          backdropFilter: 'blur(10px)',
          animation: 'preview-float 2s ease-in-out infinite',
        }"
      >
        <!-- Header -->
        <div class="flex items-start justify-between mb-3">
          <div class="flex-1">
            <h4 class="text-sm font-bold text-white truncate">{{ draggedTask.title }}</h4>
            <p class="text-xs text-white/50 mt-1">{{ draggedTask.description?.substring(0, 50) }}...</p>
          </div>
          <div
            class="px-2 py-1 rounded text-xs font-bold ml-2 flex-shrink-0"
            :class="getPriorityClass(draggedTask.priority)"
          >
            {{ getPriorityLabel(draggedTask.priority) }}
          </div>
        </div>

        <!-- Info Row -->
        <div class="flex items-center gap-2 text-xs text-white/60 mb-3">
          <span v-if="draggedTask.assigned_to" class="flex items-center gap-1">
            👤 {{ draggedTask.assigned_to }}
          </span>
          <span v-if="draggedTask.due_date" class="flex items-center gap-1">
            📅 {{ formatDate(draggedTask.due_date) }}
          </span>
        </div>

        <!-- Status Badge -->
        <div class="flex items-center gap-2">
          <span
            class="px-2 py-1 rounded-lg text-xs font-bold"
            :class="getStatusClass(draggedTask.status)"
          >
            {{ getStatusLabel(draggedTask.status) }}
          </span>
          <span v-if="draggedTask.estimated_hours" class="text-xs text-white/50">
            ⏱️ {{ draggedTask.estimated_hours }}h
          </span>
        </div>
      </div>

      <!-- Glow Effect -->
      <div
        class="absolute inset-0 rounded-xl pointer-events-none"
        :style="{
          boxShadow: 'inset 0 0 30px rgba(59, 130, 246, 0.2)',
          animation: 'glow-pulse 1.5s ease-in-out infinite',
        }"
      />
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue'

interface Task {
  id: string
  title: string
  description?: string
  priority?: string
  status?: string
  assigned_to?: string
  due_date?: string
  estimated_hours?: number
}

const props = defineProps<{
  isDragging: boolean
  draggedTask: Task | null
  dragX: number
  dragY: number
  offsetX: number
  offsetY: number
}>()

const previewX = computed(() => props.dragX - props.offsetX)
const previewY = computed(() => props.dragY - props.offsetY)

const getPriorityClass = (priority?: string) => {
  const classes: Record<string, string> = {
    alta: 'bg-red-500/30 text-red-300 border border-red-500/50',
    media: 'bg-orange-500/30 text-orange-300 border border-orange-500/50',
    baixa: 'bg-green-500/30 text-green-300 border border-green-500/50',
  }
  return classes[priority || 'media'] || classes.media
}

const getPriorityLabel = (priority?: string) => {
  const labels: Record<string, string> = {
    alta: '🔴 Alta',
    media: '🟡 Média',
    baixa: '🟢 Baixa',
  }
  return labels[priority || 'media'] || 'Média'
}

const getStatusClass = (status?: string) => {
  const classes: Record<string, string> = {
    todo: 'bg-blue-500/20 text-blue-300 border border-blue-500/50',
    in_progress: 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/50',
    done: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50',
  }
  return classes[status || 'todo'] || classes.todo
}

const getStatusLabel = (status?: string) => {
  const labels: Record<string, string> = {
    todo: '📋 A Fazer',
    in_progress: '⚙️ Em Andamento',
    done: '✅ Concluído',
  }
  return labels[status || 'todo'] || 'A Fazer'
}

const formatDate = (date: string) => {
  try {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
    })
  } catch {
    return date
  }
}
</script>

<style scoped>
@keyframes glow-pulse {
  0%, 100% {
    box-shadow: inset 0 0 20px rgba(59, 130, 246, 0.1);
  }
  50% {
    box-shadow: inset 0 0 40px rgba(59, 130, 246, 0.3);
  }
}

@keyframes preview-float {
  0%, 100% {
    transform: translateY(0px) scale(1.05) rotate(3deg);
  }
  50% {
    transform: translateY(-5px) scale(1.08) rotate(3deg);
  }
}

@keyframes preview-glow {
  0%, 100% {
    box-shadow: 0 25px 50px rgba(59, 130, 246, 0.4), 0 0 30px rgba(59, 130, 246, 0.2);
  }
  50% {
    box-shadow: 0 30px 60px rgba(59, 130, 246, 0.6), 0 0 50px rgba(59, 130, 246, 0.4);
  }
}
</style>
