<template>
  <div class="space-y-3">
    <div class="flex items-center justify-between">
      <h4 class="text-sm font-bold text-white">Subtarefas</h4>
      <span class="text-xs text-white/50">{{ completedSubtasks }}/{{ subtasks.length }}</span>
    </div>

    <div class="space-y-2">
      <div v-for="subtask in subtasks" :key="subtask.id" class="flex items-center gap-2 p-2 bg-white/5 rounded-lg">
        <input
          :checked="subtask.completed"
          type="checkbox"
          @change="toggleSubtask(subtask.id)"
          class="w-4 h-4 rounded cursor-pointer"
        />
        <span :class="['flex-1 text-sm', subtask.completed ? 'line-through text-white/50' : 'text-white']">
          {{ subtask.title }}
        </span>
        <button
          @click="deleteSubtask(subtask.id)"
          class="text-red-400 hover:text-red-300 text-xs"
        >
          ✕
        </button>
      </div>
    </div>

    <div class="flex gap-2">
      <input
        v-model="newSubtask"
        type="text"
        placeholder="Adicionar subtarefa..."
        class="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 text-sm focus:outline-none focus:border-white/20"
        @keyup.enter="addSubtask"
      />
      <button
        @click="addSubtask"
        :disabled="!newSubtask.trim()"
        class="px-3 py-2 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white rounded-lg text-sm font-bold transition-all"
      >
        +
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const props = defineProps<{
  subtasks: any[]
}>()

const emit = defineEmits(['add', 'toggle', 'delete'])

const newSubtask = ref('')

const completedSubtasks = computed(() => props.subtasks.filter(s => s.completed).length)

const addSubtask = () => {
  if (newSubtask.value.trim()) {
    emit('add', newSubtask.value)
    newSubtask.value = ''
  }
}

const toggleSubtask = (id: string) => {
  emit('toggle', id)
}

const deleteSubtask = (id: string) => {
  emit('delete', id)
}
</script>
