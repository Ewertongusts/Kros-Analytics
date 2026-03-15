<template>
  <div>
    <!-- Card Original -->
    <div 
      ref="cardElement"
      draggable="true"
      @dragstart="handleDragStart"
      @drag="handleDrag"
      @dragend="handleDragEnd"
      :class="{ 'invisible': isDragging }"
      class="group relative p-4 bg-gradient-to-br from-white/[0.05] to-white/[0.02] border border-white/15 hover:border-white/30 rounded-lg transition-all duration-200 hover:shadow-xl hover:shadow-black/30 cursor-grab active:cursor-grabbing hover:bg-gradient-to-br hover:from-white/[0.08] hover:to-white/[0.03]"
    >
      <!-- Indicador de Prioridade (barra lateral) -->
      <div 
        :class="[
          'absolute left-0 top-0 bottom-0 w-1 rounded-l-lg transition-all',
          task.priority === 'alta' ? 'bg-red-500' :
          task.priority === 'media' ? 'bg-yellow-500' :
          'bg-blue-500'
        ]"
      />

      <!-- Header com Prioridade -->
      <div class="flex items-start justify-between gap-3 mb-3">
        <div class="flex-1 min-w-0">
          <h3 class="font-semibold text-white text-sm leading-tight mb-1 line-clamp-2 group-hover:text-kros-blue transition-colors">
            {{ task.title }}
          </h3>
          <p v-if="task.description" class="text-xs text-white/50 line-clamp-1">
            {{ task.description }}
          </p>
        </div>
        
        <!-- Prioridade Badge -->
        <span 
          :class="[
            'px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider flex-shrink-0 whitespace-nowrap',
            task.priority === 'alta' ? 'bg-red-500/20 text-red-300 border border-red-500/30' :
            task.priority === 'media' ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30' :
            'bg-blue-500/20 text-blue-300 border border-blue-500/30'
          ]"
        >
          {{ priorityLabel }}
        </span>
      </div>

      <!-- Metadados -->
      <div class="space-y-2 mb-4 text-xs">
        <!-- Responsável -->
        <div v-if="task.assigned_to" class="flex items-center gap-2 text-white/60">
          <svg class="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span class="truncate">{{ task.assigned_to }}</span>
        </div>

        <!-- Data de Vencimento -->
        <div v-if="task.due_date" class="flex items-center gap-2" :class="isOverdue ? 'text-red-400 font-medium' : 'text-white/60'">
          <svg class="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span>{{ formatDate(task.due_date) }}</span>
          <span v-if="isOverdue" class="ml-auto text-[9px] font-bold px-1.5 py-0.5 bg-red-500/20 rounded">ATRASADA</span>
        </div>

        <!-- Empresa -->
        <div v-if="task.company_name" class="flex items-center gap-2 text-white/60">
          <svg class="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          <span class="truncate">{{ task.company_name }}</span>
        </div>
      </div>

      <!-- Footer com Ações -->
      <div class="flex items-center gap-2 pt-3 border-t border-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <button
          @click="$emit('edit', task)"
          class="flex-1 px-2 py-1.5 rounded-md bg-purple-500/10 text-purple-300 hover:bg-purple-500/20 border border-purple-500/20 hover:border-purple-500/40 transition-all text-[10px] font-semibold uppercase tracking-wider"
          title="Editar"
        >
          Editar
        </button>
        <button
          @click="$emit('delete', task)"
          class="flex-1 px-2 py-1.5 rounded-md bg-red-500/10 text-red-300 hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/40 transition-all text-[10px] font-semibold uppercase tracking-wider"
          title="Deletar"
        >
          Deletar
        </button>
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
        class="p-4 bg-gradient-to-br from-white/[0.05] to-white/[0.02] border border-white/50 rounded-lg shadow-2xl"
      >
        <!-- Indicador de Prioridade -->
        <div 
          :class="[
            'absolute left-0 top-0 bottom-0 w-1 rounded-l-lg',
            task.priority === 'alta' ? 'bg-red-500' :
            task.priority === 'media' ? 'bg-yellow-500' :
            'bg-blue-500'
          ]"
        />

        <!-- Header -->
        <div class="flex items-start justify-between gap-3 mb-3">
          <div class="flex-1 min-w-0">
            <h3 class="font-semibold text-white text-sm leading-tight mb-1 line-clamp-2">
              {{ task.title }}
            </h3>
            <p v-if="task.description" class="text-xs text-white/50 line-clamp-1">
              {{ task.description }}
            </p>
          </div>
          
          <span 
            :class="[
              'px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider flex-shrink-0 whitespace-nowrap',
              task.priority === 'alta' ? 'bg-red-500/20 text-red-300 border border-red-500/30' :
              task.priority === 'media' ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30' :
              'bg-blue-500/20 text-blue-300 border border-blue-500/30'
            ]"
          >
            {{ priorityLabel }}
          </span>
        </div>

        <!-- Metadados -->
        <div class="space-y-2 text-xs">
          <div v-if="task.assigned_to" class="flex items-center gap-2 text-white/60">
            <svg class="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span class="truncate">{{ task.assigned_to }}</span>
          </div>

          <div v-if="task.due_date" class="flex items-center gap-2" :class="isOverdue ? 'text-red-400 font-medium' : 'text-white/60'">
            <svg class="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>{{ formatDate(task.due_date) }}</span>
          </div>

          <div v-if="task.company_name" class="flex items-center gap-2 text-white/60">
            <svg class="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <span class="truncate">{{ task.company_name }}</span>
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
}>()

const emit = defineEmits(['edit', 'delete', 'dragstart', 'dragend'])

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
