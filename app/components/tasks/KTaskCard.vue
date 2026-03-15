<template>
  <div>
    <!-- Indicador acima (quando drag está acima) -->
    <div 
      v-if="isDragOver && dragOverPosition === 'above'"
      class="h-1 bg-blue-500 rounded mb-2 shadow-lg shadow-blue-500/50"
    ></div>

    <!-- Card Original -->
    <div 
      ref="cardElement"
      draggable="true"
      @dragstart="handleDragStart"
      @drag="handleDrag"
      @dragover="handleDragOver"
      @dragend="handleDragEnd"
      @animationend="handleAnimationEnd"
      :style="{ 
        backgroundColor: isOrphan ? 'rgba(24, 24, 27, 0.5)' : '#1c1c1e',
        backdropFilter: isOrphan ? 'blur(8px)' : 'none'
      }"
      :class="[
        'group relative p-3.5 rounded-lg cursor-grab active:cursor-grabbing aspect-[4/3]',
        'transition-all duration-300 ease-out',
        'border border-white/10 hover:border-white/20',
        isOrphan ? 'border-orange-500/40 hover:border-orange-500/60' : '',
        { 'invisible': isDragging },
        isDragOver ? 'ring-2 ring-blue-500/50 shadow-lg shadow-blue-500/30 scale-[1.02] card-drag-over-morph' : 'hover:shadow-xl hover:shadow-black/40',
        isSelected ? 'ring-2 ring-green-500/50 shadow-lg shadow-green-500/20 spring-scale' : '',
        props.isEntering ? 'card-entering' : '',
        props.isExiting ? 'card-exiting' : '',
        props.isSettling ? 'card-settling' : ''
      ]"
    >
      <!-- Checkbox de Seleção -->
      <div class="absolute top-2 left-2 z-10">
        <input
          type="checkbox"
          :checked="isSelected"
          @change="$emit('select', task.id)"
          class="w-4 h-4 rounded cursor-pointer"
        />
      </div>

      <!-- Indicador de Sincronização -->
      <div v-if="isSyncing" class="absolute top-2 right-2 z-10">
        <svg class="w-4 h-4 sync-spinner text-blue-400">
          <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="2"/>
        </svg>
      </div>
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

    <!-- Indicador abaixo (quando drag está abaixo) -->
    <div 
      v-if="isDragOver && dragOverPosition === 'below'"
      class="h-1 bg-blue-500 rounded mt-2 shadow-lg shadow-blue-500/50"
    ></div>

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
  isDragOver?: boolean
  dragOverPosition?: 'above' | 'below' | null
  isSelected?: boolean
  isEntering?: boolean
  isExiting?: boolean
  isSettling?: boolean
  isSyncing?: boolean
}>()

// Debug
console.log('🔍 KTaskCard props:', { task: props.task.title, isOrphan: props.isOrphan })

const cardElement = ref<HTMLElement | null>(null)
const isDragging = ref(false)
const dragX = ref(0)
const dragY = ref(0)
const cardWidth = ref(0)
let dragTimeoutId: ReturnType<typeof setTimeout> | null = null

// Reset drag state function
const resetDragState = () => {
  console.log('🔄 RESETTING DRAG STATE')
  isDragging.value = false
  dragX.value = 0
  dragY.value = 0
  cardWidth.value = 0
}

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
  console.log('🎯 DRAG START - Capturing cardWidth')
  
  // CRITICAL: Capture width BEFORE setting isDragging
  if (cardElement.value) {
    cardWidth.value = cardElement.value.offsetWidth
    console.log('📏 Card width captured:', cardWidth.value)
  } else {
    console.warn('⚠️ cardElement is null!')
    cardWidth.value = 300 // Fallback
  }
  
  isDragging.value = true
  
  // Set initial position
  dragX.value = e.clientX - (cardWidth.value / 2)
  dragY.value = e.clientY - 20
  
  console.log('📍 Initial position:', { dragX: dragX.value, dragY: dragY.value })
  
  // Remove default drag image
  const emptyImage = new Image()
  e.dataTransfer?.setDragImage(emptyImage, 0, 0)
  
  // Set timeout to force reset if dragend doesn't fire
  if (dragTimeoutId) clearTimeout(dragTimeoutId)
  dragTimeoutId = setTimeout(() => {
    console.warn('⚠️ Drag timeout - forcing reset')
    resetDragState()
  }, 1000)
  
  emit('dragstart', props.task)
}

const handleDrag = (e: DragEvent) => {
  // CRITICAL: Only update if we have valid coordinates
  if (e.clientX !== 0 && e.clientY !== 0) {
    dragX.value = e.clientX - (cardWidth.value / 2)
    dragY.value = e.clientY - 20
    console.log('🎯 Drag position:', { dragX: dragX.value, dragY: dragY.value })
  }
}

const handleDragOver = (e: DragEvent) => {
  // Drag is still active, keep updating position
  if (isDragging.value && e.clientX !== 0 && e.clientY !== 0) {
    dragX.value = e.clientX - (cardWidth.value / 2)
    dragY.value = e.clientY - 20
  }
}

const handleDragEnd = () => {
  console.log('🛑 DRAG END - Resetting state')
  if (dragTimeoutId) clearTimeout(dragTimeoutId)
  
  // Reset IMEDIATAMENTE para evitar que o card fique invisível
  resetDragState()
  
  // Adicionar ripple effect ao soltar (após reset)
  if (cardElement.value) {
    cardElement.value.classList.add('ripple-effect')
    setTimeout(() => {
      cardElement.value?.classList.remove('ripple-effect')
    }, 600)
  }
  
  emit('dragend')
}

// Document-level dragend listener as final fallback
const handleDocumentDragEnd = () => {
  if (isDragging.value) {
    console.warn('⚠️ Document dragend fired - resetting')
    resetDragState()
  }
}

// Handler para quando animação termina
const handleAnimationEnd = () => {
  if (props.isEntering || props.isSettling) {
    console.log('✅ Animation complete for task:', props.task.id)
    emit('transition-complete')
  }
}

onMounted(() => {
  if (typeof window !== 'undefined') {
    document.addEventListener('dragend', handleDocumentDragEnd)
  }
})

onUnmounted(() => {
  if (typeof window !== 'undefined') {
    document.removeEventListener('dragend', handleDocumentDragEnd)
  }
  if (dragTimeoutId) clearTimeout(dragTimeoutId)
})
</script>


<style scoped>
/* Transições profissionais para cards */
.group {
  --transition-duration: 300ms;
  --transition-timing: cubic-bezier(0.4, 0, 0.2, 1);
}

/* Animação de entrada suave */
@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Animação de reordenação suave */
@keyframes reorder {
  0% {
    opacity: 1;
  }
  100% {
    opacity: 1;
  }
}

/* Aplicar animação de entrada */
.group {
  animation: slideInUp var(--transition-duration) var(--transition-timing) forwards;
}

/* Transição suave para drag-over */
.group:has(+ .group[class*="ring-blue"]) {
  transform: translateY(4px);
}

/* Easing profissional para todas as transições */
:deep(.transition-all) {
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}

/* Sombra dinâmica durante hover */
.group:hover {
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.2);
}

/* Transição suave para seleção */
.group[class*="ring-green"] {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.4);
  }
  50% {
    box-shadow: 0 0 0 8px rgba(34, 197, 94, 0);
  }
}

/* Transição suave para drag-over com scale */
.group[class*="scale-\[1\.02\]"] {
  transition: all 200ms cubic-bezier(0.34, 1.56, 0.64, 1);
}

/* Indicador de drag-over suave */
.h-1 {
  animation: slideIn 200ms cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: scaleX(0.8);
  }
  to {
    opacity: 1;
    transform: scaleX(1);
  }
}
</style>
