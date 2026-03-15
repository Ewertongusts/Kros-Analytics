<template>
  <div v-if="selectedCount > 0" class="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 p-4 bg-blue-600 rounded-xl shadow-lg flex items-center gap-4">
    <span class="text-white font-bold">{{ selectedCount }} tarefa{{ selectedCount !== 1 ? 's' : '' }} selecionada{{ selectedCount !== 1 ? 's' : '' }}</span>
    
    <div class="flex gap-2">
      <button
        @click="changeStatus('todo')"
        class="px-3 py-2 bg-blue-500 hover:bg-blue-700 text-white rounded-lg text-sm font-bold transition-all"
      >
        A Fazer
      </button>
      <button
        @click="changeStatus('in_progress')"
        class="px-3 py-2 bg-yellow-500 hover:bg-yellow-700 text-white rounded-lg text-sm font-bold transition-all"
      >
        Em Andamento
      </button>
      <button
        @click="changeStatus('done')"
        class="px-3 py-2 bg-emerald-500 hover:bg-emerald-700 text-white rounded-lg text-sm font-bold transition-all"
      >
        Concluído
      </button>
      <button
        @click="deleteSelected"
        class="px-3 py-2 bg-red-500 hover:bg-red-700 text-white rounded-lg text-sm font-bold transition-all"
      >
        Deletar
      </button>
      <button
        @click="clearSelection"
        class="px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm font-bold transition-all"
      >
        Cancelar
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  selectedCount: number
}>()

const emit = defineEmits(['change-status', 'delete', 'clear'])

const changeStatus = (status: string) => {
  emit('change-status', status)
}

const deleteSelected = () => {
  if (confirm('Tem certeza que deseja deletar as tarefas selecionadas?')) {
    emit('delete')
  }
}

const clearSelection = () => {
  emit('clear')
}
</script>
