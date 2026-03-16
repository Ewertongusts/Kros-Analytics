<template>
  <div class="w-80 border-l border-white/10 bg-black/20">
    <div class="p-3">
      <div class="flex items-center justify-between mb-3">
        <h3 class="text-sm font-semibold text-white flex items-center gap-2">
          <svg class="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Compromissos da Semana
        </h3>
        
        <!-- Botão Nova Tarefa -->
        <button
          @click="$emit('add-task')"
          class="p-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-colors"
          title="Nova tarefa"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>
      
      <!-- Lista de compromissos -->
      <div class="space-y-2 max-h-96 overflow-y-auto">
        <KTaskCard
          v-for="appointment in appointments"
          :key="appointment.id"
          :task="appointment"
          @click="$emit('select-task', appointment)"
        />
        
        <!-- Estado vazio -->
        <div v-if="appointments.length === 0" class="text-center py-6">
          <svg class="w-8 h-8 text-white/20 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p class="text-xs text-white/40">
            Nenhum compromisso esta semana
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Task } from '~/composables/useTasks'

interface Props {
  appointments: Task[]
}

defineProps<Props>()

defineEmits<{
  'add-task': []
  'select-task': [task: Task]
}>()
</script>