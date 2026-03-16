<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center">
        <!-- Backdrop -->
        <div 
          class="absolute inset-0 bg-black/50 backdrop-blur-sm"
          @click="$emit('close')"
        ></div>

        <!-- Modal -->
        <div class="relative bg-[#1a1a1c] border border-white/10 rounded-xl shadow-2xl w-full max-w-2xl mx-4 animate-in fade-in zoom-in-95 duration-200">
          <!-- Header -->
          <div class="p-4 border-b border-white/5">
            <h2 class="text-lg font-semibold text-white">
              Transferir {{ selectedCount }} {{ selectedCount === 1 ? 'tarefa' : 'tarefas' }}
            </h2>
            <p class="text-sm text-white/40 mt-1">
              Selecione a coluna de destino
            </p>
          </div>

          <!-- Transfer Flow -->
          <div class="p-6">
            <div class="flex items-center gap-4">
              <!-- Origin Column (Fixed) -->
              <div class="flex-1">
                <p class="text-xs text-white/40 mb-2 font-medium">DE (Origem)</p>
                <div class="p-4 rounded-lg bg-white/5 border border-white/10">
                  <div class="flex items-center gap-2">
                    <div 
                      class="w-3 h-3 rounded-full flex-shrink-0"
                      :style="{ backgroundColor: originColumn?.color || '#8b5cf6' }"
                    ></div>
                    <p class="font-medium text-white">{{ originColumn?.name || 'Desconhecida' }}</p>
                  </div>
                </div>
              </div>

              <!-- Arrow -->
              <div class="flex-shrink-0">
                <svg class="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </div>

              <!-- Destination Column (Selectable) -->
              <div class="flex-1">
                <p class="text-xs text-white/40 mb-2 font-medium">PARA (Destino)</p>
                <div class="space-y-2 max-h-[300px] overflow-y-auto">
                  <button
                    v-for="column in columns"
                    :key="column.column_id"
                    @click="selectColumn(column)"
                    :class="[
                      'w-full p-3 rounded-lg text-left transition-all',
                      'border border-white/10 hover:border-white/20',
                      'hover:bg-white/5 active:bg-white/10',
                      selectedColumn?.column_id === column.column_id ? 'ring-2 ring-green-500/50 bg-green-500/10' : ''
                    ]"
                  >
                    <div class="flex items-center gap-2">
                      <div 
                        class="w-3 h-3 rounded-full flex-shrink-0"
                        :style="{ backgroundColor: column.color }"
                      ></div>
                      <p class="font-medium text-white text-sm">{{ column.name }}</p>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div class="p-4 border-t border-white/5 flex gap-2">
            <button
              @click="$emit('close')"
              class="flex-1 px-4 py-2 rounded-lg border border-white/10 hover:border-white/20 text-white/60 hover:text-white transition-colors"
            >
              Cancelar
            </button>
            <button
              @click="handleTransfer"
              :disabled="!selectedColumn || isTransferring"
              :class="[
                'flex-1 px-4 py-2 rounded-lg font-medium transition-all',
                selectedColumn && !isTransferring
                  ? 'bg-green-500/20 hover:bg-green-500/30 text-green-400 hover:text-green-300'
                  : 'bg-white/5 text-white/30 cursor-not-allowed'
              ]"
            >
              <span v-if="!isTransferring">Transferir</span>
              <span v-else class="flex items-center justify-center gap-2">
                <svg class="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="2"/>
                </svg>
                Transferindo...
              </span>
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Task } from '~/composables/useTasks'

const props = defineProps<{
  isOpen: boolean
  columns: any[]
  selectedCount: number
  selectedTaskIds?: string[]
  tasks?: any[]
}>()

const emit = defineEmits<{
  close: []
  transfer: [columnId: string]
}>()

const selectedColumn = ref<any>(null)
const isTransferring = ref(false)

const originColumn = computed(() => {
  if (!props.selectedTaskIds || !props.tasks || props.selectedTaskIds.length === 0) {
    return null
  }
  
  // Pegar a coluna da primeira tarefa selecionada
  const firstTaskId = props.selectedTaskIds[0]
  const firstTask = props.tasks.find(t => t.id === firstTaskId)
  
  if (!firstTask) return null
  
  // Encontrar a coluna correspondente
  return props.columns.find(c => c.column_id === firstTask.column_id)
})

const selectColumn = (column: any) => {
  selectedColumn.value = column
}

const handleTransfer = async () => {
  if (!selectedColumn.value) return
  
  isTransferring.value = true
  try {
    emit('transfer', selectedColumn.value.column_id)
    // Reset after transfer
    selectedColumn.value = null
  } finally {
    isTransferring.value = false
  }
}
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
</style>
