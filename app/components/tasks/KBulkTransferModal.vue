<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <!-- Backdrop -->
        <div 
          class="absolute inset-0 bg-black/70 backdrop-blur-md"
          @click="$emit('close')"
        ></div>

        <!-- Modal -->
        <div class="relative bg-[#0f0f11] border border-white/5 rounded-xl shadow-2xl w-full max-w-sm mx-4 animate-in fade-in zoom-in-95 duration-200">
          <!-- Header -->
          <div class="p-4 border-b border-white/5">
            <h2 class="text-sm font-bold text-white uppercase tracking-wider">
              Transferir {{ selectedCount }} {{ selectedCount === 1 ? 'tarefa' : 'tarefas' }}
            </h2>
            <p class="text-xs text-white/30 mt-1">
              Selecione a coluna de destino
            </p>
          </div>

          <!-- Transfer Flow -->
          <div class="p-4">
            <div class="flex items-center gap-3">
              <!-- Origin Column (Fixed) -->
              <div class="flex-1 min-w-0">
                <p class="text-xs text-white/40 mb-1.5 font-bold uppercase tracking-wider">DE</p>
                <div class="p-2.5 rounded-lg bg-white/5 border border-white/10">
                  <div class="flex items-center gap-2 min-w-0">
                    <div 
                      class="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      :style="{ backgroundColor: originColumn?.color || '#8b5cf6' }"
                    ></div>
                    <p class="font-medium text-white text-xs truncate">{{ originColumn?.name || 'Desconhecida' }}</p>
                  </div>
                </div>
              </div>

              <!-- Arrow -->
              <div class="flex-shrink-0 pt-6">
                <svg class="w-5 h-5 text-kros-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </div>

              <!-- Destination Column (Selectable) -->
              <div class="flex-1 min-w-0">
                <p class="text-xs text-white/40 mb-1.5 font-bold uppercase tracking-wider">PARA</p>
                <div class="space-y-1.5 max-h-[200px] overflow-y-auto">
                  <button
                    v-for="column in columns.filter(c => c.column_id !== originColumn?.column_id)"
                    :key="column.column_id"
                    @click="selectColumn(column)"
                    :class="[
                      'w-full p-2.5 rounded-lg text-left transition-all text-xs',
                      'border border-white/10 hover:border-white/20',
                      'hover:bg-white/5 active:bg-white/10',
                      selectedColumn?.column_id === column.column_id ? 'bg-white/10 border-white/20' : ''
                    ]"
                  >
                    <div class="flex items-center gap-2 min-w-0">
                      <div 
                        class="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        :style="{ backgroundColor: column.color }"
                      ></div>
                      <p class="font-medium text-white truncate">{{ column.name }}</p>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div class="p-3 border-t border-white/5 flex gap-2">
            <button
              @click="$emit('close')"
              class="flex-1 px-3 py-2 rounded-lg border border-white/10 hover:border-white/15 text-white/50 hover:text-white/70 transition-all text-xs font-semibold uppercase tracking-wide"
            >
              Cancelar
            </button>
            <button
              @click="handleTransfer"
              :disabled="!selectedColumn || isTransferring"
              :class="[
                'flex-1 px-3 py-2 rounded-lg font-bold uppercase tracking-wide text-xs transition-all',
                selectedColumn && !isTransferring
                  ? 'bg-kros-blue hover:bg-kros-blue/90 text-white'
                  : 'bg-white/5 text-white/30 cursor-not-allowed'
              ]"
            >
              <span v-if="!isTransferring">Transferir</span>
              <span v-else class="flex items-center justify-center gap-1.5">
                <svg class="w-3 h-3 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
import { ref, computed, watch } from 'vue'

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

watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    selectedColumn.value = null
  }
})

const originColumn = computed(() => {
  if (!props.selectedTaskIds || !props.tasks || props.selectedTaskIds.length === 0) {
    return null
  }
  
  // Pegar todas as tarefas selecionadas
  const selectedTasks = props.selectedTaskIds
    .map(id => props.tasks!.find(t => t.id === id))
    .filter(t => t !== undefined)
  
  if (selectedTasks.length === 0) return null
  
  // Pegar o column_id da primeira tarefa
  const firstColumnId = selectedTasks[0]!.column_id
  
  // Se a primeira tarefa não tem column_id, é órfã
  if (!firstColumnId) {
    return {
      column_id: 'orphan',
      name: 'Tarefas Órfãs',
      color: '#f97316',
      status: 'orphan'
    }
  }
  
  // Encontrar a coluna correspondente
  const found = props.columns.find(c => c.column_id === firstColumnId)
  
  // Se não encontrou a coluna, retornar um objeto genérico
  if (!found) {
    return {
      column_id: firstColumnId,
      name: 'Tarefas Órfãs',
      color: '#f97316',
      status: 'orphan'
    }
  }
  
  return found
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
