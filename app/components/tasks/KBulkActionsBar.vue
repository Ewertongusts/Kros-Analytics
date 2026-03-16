<template>
  <Transition name="slide-up">
    <div 
      v-if="isVisible"
      class="fixed bottom-20 left-1/2 -translate-x-1/2 z-[9999] animate-in slide-in-from-bottom-4 duration-300"
      style="z-index: 9999 !important"
    >
      <div class="bg-[#1a1a1c] border border-white/10 rounded-xl shadow-2xl px-6 py-3 flex items-center gap-4">
        <!-- Info -->
        <div class="flex items-center gap-2 text-white/60 text-sm">
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{{ selectedCount }} {{ selectedCount === 1 ? 'tarefa' : 'tarefas' }} selecionada{{ selectedCount === 1 ? '' : 's' }}</span>
        </div>

        <!-- Divider -->
        <div class="w-px h-6 bg-white/10"></div>

        <!-- Actions -->
        <div class="flex items-center gap-2">
          <!-- Transfer Button -->
          <button
            @click="$emit('transfer')"
            class="px-3 py-1.5 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 hover:text-blue-300 transition-colors text-sm font-medium flex items-center gap-2"
            title="Transferir para coluna"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
            Transferir
          </button>

          <!-- Delete Button -->
          <button
            @click="$emit('delete')"
            class="px-3 py-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 hover:text-red-300 transition-colors text-sm font-medium flex items-center gap-2"
            title="Deletar selecionadas"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Deletar
          </button>

          <!-- Clear Selection Button -->
          <button
            @click="$emit('clear')"
            class="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors text-sm font-medium"
            title="Limpar seleção"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  selectedCount: number
}>()

defineEmits<{
  transfer: []
  delete: []
  clear: []
}>()

const isVisible = computed(() => {
  const visible = props.selectedCount > 0
  console.log('🎯 KBulkActionsBar - selectedCount:', props.selectedCount, 'visible:', visible)
  return visible
})
</script>

<style scoped>
.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s ease;
}

.slide-up-enter-from,
.slide-up-leave-to {
  opacity: 0;
  transform: translateY(16px);
}
</style>
