<template>
  <div>
    <!-- Card Original -->
    <div 
      ref="cardElement"
      draggable="true"
      @dragstart="handleDragStart"
      @drag="handleDrag"
      @dragend="handleDragEnd"
      :style="{ 
        backgroundColor: isOrphan ? 'rgba(24, 24, 27, 0.5)' : '#1c1c1e',
        backdropFilter: isOrphan ? 'blur(8px)' : 'none'
      }"
      :class="[
        'group relative p-3.5 rounded-lg transition-all duration-200 hover:shadow-xl hover:shadow-black/40 cursor-grab active:cursor-grabbing aspect-[4/3]',
        isOrphan ? 'border border-orange-500/40 hover:border-orange-500/60' : 'border border-white/10 hover:border-white/20',
        { 'invisible': isDragging }
      ]"
    >
      <!-- Tags -->
      <div v-if="task.tags && task.tags.length > 0" class="flex flex-wrap gap-1.5 mb-2.5">
        <span
          v-for="(tag, index) in task.tags.slice(0, 2)"
          :key="index"
          class="px-2 py-1 rounded text-[10px] font-semibold bg-white/10 text-white/80 border border-white/20"
        >
          {{ tag }}
        </span>
      </div>

      <!-- Título -->
      <h3 class="font-semibold text-white text-sm leading-snug mb-2.5 line-clamp-2">
        {{ task.title }}
      </h3>

      <!-- Descrição -->
      <p v-if="task.description" class="text-xs text-white/40 line-clamp-1 mb-2.5">
        {{ task.description }}
      </p>

      <!-- Footer -->
      <div class="absolute bottom-3.5 left-3.5 right-3.5 flex items-center justify-between gap-2 pt-2.5 border-t border-white/5">
        <!-- Avatar e Prioridade -->
        <div class="flex items-center gap-2 flex-1 min-w-0">
          <!-- Avatar -->
          <div v-if="task.assigned_to" class="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
            {{ getInitials(task.assigned_to) }}
          </div>
          
          <!-- Prioridade Badge -->
          <span 
            :class="[
              'px-2 py-1 rounded text-[9px] font-bold uppercase',
              task.priority === 'alta' ? 'bg-red-500/20 text-red-400' :
              task.priority === 'media' ? 'bg-yellow-500/20 text-yellow-400' :
              'bg-blue-500/20 text-blue-400'
            ]"
          >
            {{ priorityLabel }}
          </span>
        </div>

        <!-- Data e Ações -->
        <div class="flex items-center gap-1.5">
          <!-- Data -->
          <div v-if="task.due_date" class="flex items-center gap-1 text-white/40 text-[10px]">
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>{{ formatDateShort(task.due_date) }}</span>
          </div>

          <!-- Botões de ação (aparecem no hover) -->
          <div class="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
            <button
              @click.stop="$emit('edit', task)"
              class="p-1 rounded hover:bg-white/10 text-white/60 hover:text-white transition-colors"
              title="Editar"
            >
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button
              @click.stop="handleDuplicate"
              class="p-1 rounded hover:bg-blue-500/20 text-white/60 hover:text-blue-400 transition-colors"
              title="Duplicar"
            >
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </button>
            <button
              @click.stop="$emit('delete', task)"
              class="p-1 rounded hover:bg-red-500/20 text-white/60 hover:text-red-400 transition-colors"
              title="Deletar"
            >
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Clone Flutuante -->
    <Teleport to="body">
      <div
        v-if="isDragging"
        :style="{
          position: 'fixed',
          left: dragX + 'px',
          top: dragY + 'px',
          zIndex: 9999,
          pointerEvents: 'none',
          width: cardWidth + 'px',
          transform: 'scale(1.05) rotate(3deg)',
          opacity: '0.95'
        }"
        class="p-3.5 bg-[#1c1c1e] border border-white/30 rounded-lg shadow-2xl aspect-[4/3]"
      >
        <!-- Tags -->
        <div v-if="task.tags && task.tags.length > 0" class="flex flex-wrap gap-1.5 mb-2.5">
          <span
            v-for="(tag, index) in task.tags.slice(0, 2)"
            :key="index"
            class="px-2 py-1 rounded text-[10px] font-semibold bg-white/10 text-white/80 border border-white/20"
          >
            {{ tag }}
          </span>
        </div>

        <!-- Título -->
        <h3 class="font-semibold text-white text-sm leading-snug mb-2.5 line-clamp-2">
          {{ task.title }}
        </h3>

        <!-- Descrição -->
        <p v-if="task.description" class="text-xs text-white/40 line-clamp-1 mb-2.5">
          {{ task.description }}
        </p>

        <!-- Footer -->
        <div class="absolute bottom-3.5 left-3.5 right-3.5 flex items-center justify-between gap-2 pt-2.5 border-t border-white/5">
          <div class="flex items-center gap-2">
            <div v-if="task.assigned_to" class="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-[10px] font-bold">
              {{ getInitials(task.assigned_to) }}
            </div>
            <span 
              :class="[
                'px-2 py-1 rounded text-[9px] font-bold uppercase',
                task.priority === 'alta' ? 'bg-red-500/20 text-red-400' :
                task.priority === 'media' ? 'bg-yellow-500/20 text-yellow-400' :
                'bg-blue-500/20 text-blue-400'
              ]"
            >
              {{ priorityLabel }}
            </span>
          </div>
          <div v-if="task.due_date" class="flex items-center gap-1 text-white/40 text-[10px]">
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>{{ formatDateShort(task.due_date) }}</span>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'

const props = defineProps<{
  task: any
  isOrphan?: boolean
}>()

const emit = defineEmits(['edit', 'delete', 'duplicate', 'dragstart', 'dragend'])

// Debug
console.log('🔍 KTaskCard props:', { task: props.task.title, isOrphan: props.isOrphan })

const cardElement = ref<HTMLElement | null>(null)
const isDragging = ref(false)
const dragX = ref(0)
const dragY = ref(0)
const cardWidth = ref(0)

const isOverdue = computed(() => {
  if (!props.task.due_date) return false
  return new Date(props.task.due_date) < new Date() && props.task.status !== 'done'
})

const priorityLabel = computed(() => {
  const priority = props.task.priority || 'media'
  return priority.charAt(0).toUpperCase() + priority.slice(1)
})

const formatDate = (date: string) => {
  if (!date) return '-'
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit' }).format(new Date(date))
}

const formatDateShort = (date: string) => {
  if (!date) return '-'
  const d = new Date(date)
  const today = new Date()
  const diffDays = Math.ceil((d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  
  if (diffDays === 0) return 'Hoje'
  if (diffDays === 1) return 'Amanhã'
  if (diffDays === -1) return 'Ontem'
  if (diffDays < 0) return `${Math.abs(diffDays)}d atrás`
  if (diffDays < 7) return `${diffDays}d`
  
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short' }).format(d)
}

const getInitials = (name: string) => {
  if (!name) return '?'
  const parts = name.trim().split(' ')
  if (parts.length === 1) return parts[0]?.charAt(0).toUpperCase() || '?'
  return ((parts[0]?.charAt(0) || '') + (parts[parts.length - 1]?.charAt(0) || '')).toUpperCase() || '?'
}

const handleDuplicate = () => {
  console.log('🎯 Botão duplicar clicado no card:', props.task)
  emit('duplicate', props.task)
}

const handleDragStart = (e: DragEvent) => {
  // Capturar largura do card
  if (cardElement.value) {
    cardWidth.value = cardElement.value.offsetWidth
  }
  
  isDragging.value = true
  
  // Posição inicial
  dragX.value = e.clientX - (cardWidth.value / 2)
  dragY.value = e.clientY - 20
  
  // Remover fantasma padrão
  const emptyImage = new Image()
  e.dataTransfer?.setDragImage(emptyImage, 0, 0)
  
  emit('dragstart', props.task)
}

const handleDrag = (e: DragEvent) => {
  // Durante o drag, atualizar posição
  if (e.clientX !== 0 && e.clientY !== 0) {
    dragX.value = e.clientX - (cardWidth.value / 2)
    dragY.value = e.clientY - 20
  }
}

const handleDragEnd = () => {
  isDragging.value = false
  emit('dragend')
}
</script>
