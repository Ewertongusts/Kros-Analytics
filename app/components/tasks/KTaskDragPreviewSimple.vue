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
      <!-- Preview Card Simples -->
      <div
        class="w-72 bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-md border border-white/30 rounded-lg p-3 shadow-2xl transition-all duration-100"
        :style="{
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4), 0 0 30px rgba(255, 255, 255, 0.1)',
          transform: 'scale(1.02) rotate(2deg)',
        }"
      >
        <!-- Indicador de Prioridade -->
        <div 
          class="absolute left-0 top-0 bottom-0 w-1 rounded-l-lg"
          :class="[
            draggedTask.priority === 'alta' ? 'bg-red-500' :
            draggedTask.priority === 'media' ? 'bg-yellow-500' :
            'bg-blue-500'
          ]"
        />

        <!-- Conteúdo -->
        <div class="pl-2">
          <!-- Título -->
          <h4 class="text-sm font-semibold text-white truncate mb-1">
            {{ draggedTask.title }}
          </h4>

          <!-- Descrição -->
          <p v-if="draggedTask.description" class="text-xs text-white/60 truncate mb-2">
            {{ draggedTask.description }}
          </p>

          <!-- Metadados em uma linha -->
          <div class="flex items-center gap-2 text-xs text-white/50">
            <span v-if="draggedTask.assigned_to" class="flex items-center gap-1 px-2 py-0.5 bg-white/5 rounded">
              👤 {{ draggedTask.assigned_to }}
            </span>
            <span 
              :class="[
                'px-2 py-0.5 rounded font-semibold',
                draggedTask.priority === 'alta' ? 'bg-red-500/20 text-red-300' :
                draggedTask.priority === 'media' ? 'bg-yellow-500/20 text-yellow-300' :
                'bg-blue-500/20 text-blue-300'
              ]"
            >
              {{ priorityLabel }}
            </span>
          </div>
        </div>
      </div>

      <!-- Efeito de Glow -->
      <div
        class="absolute inset-0 rounded-lg pointer-events-none"
        :style="{
          boxShadow: 'inset 0 0 20px rgba(255, 255, 255, 0.1)',
        }"
      />
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Task {
  id: string
  title: string
  description?: string
  priority?: string
  status?: string
  assigned_to?: string
  due_date?: string
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

const priorityLabel = computed(() => {
  const priority = props.draggedTask?.priority || 'media'
  const labels: Record<string, string> = {
    alta: '🔴 Alta',
    media: '🟡 Média',
    baixa: '🟢 Baixa',
  }
  return labels[priority] || 'Média'
})
</script>

<style scoped>
/* Animação suave de entrada */
@keyframes dragEnter {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1.02);
  }
}

div {
  animation: dragEnter 0.15s ease-out;
}
</style>
