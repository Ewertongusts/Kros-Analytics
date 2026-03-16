<template>
  <div class="fixed bottom-8 right-8 flex flex-col gap-3 z-50">
    <!-- Contador de seleção -->
    <div class="bg-blue-500 text-white px-4 py-2 rounded-full shadow-lg text-sm font-semibold">
      {{ selectedCount }} selecionado(s)
    </div>
    
    <!-- Botão Deletar -->
    <button
      @click="$emit('delete-selected')"
      :style="{ backgroundColor: '#ef4444' }"
      class="w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all hover:scale-110 hover:opacity-90"
      title="Deletar selecionados"
    >
      <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
      </svg>
    </button>

    <!-- Botão Limpar seleção -->
    <button
      @click="$emit('clear-selection')"
      :style="{ backgroundColor: 'var(--kros-blue, #3b82f6)' }"
      class="w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all hover:scale-110 hover:opacity-90"
      title="Limpar seleção"
    >
      <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  selectedCount: number
}>()

defineEmits<{
  'delete-selected': []
  'clear-selection': []
}>()
</script>
