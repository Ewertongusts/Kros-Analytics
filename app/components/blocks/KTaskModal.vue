<template>
  <UiKModal :is-open="isOpen" size="md" @close="$emit('close')">
    <div class="p-5">
      <!-- Header Compacto -->
      <div class="flex items-center justify-between mb-5">
        <h2 class="text-base font-semibold text-white">{{ task?.id ? 'Editar Tarefa' : 'Nova Tarefa' }}</h2>
        <button 
          @click="$emit('close')"
          class="p-1.5 hover:bg-white/5 rounded-lg transition-colors text-white/40 hover:text-white"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div class="space-y-3">
        <!-- Título -->
        <div>
          <label class="block text-[10px] font-medium uppercase tracking-wider text-white/40 mb-1.5">Título</label>
          <input 
            v-model="form.title"
            type="text"
            placeholder="Ex: Ligar para cliente X"
            class="w-full px-3 py-2 bg-[#1c1c1e] border border-white/10 rounded-lg text-sm text-white placeholder-white/30 focus:border-white/20 focus:outline-none transition-all"
          />
        </div>

        <!-- Descrição -->
        <div>
          <label class="block text-[10px] font-medium uppercase tracking-wider text-white/40 mb-1.5">Descrição</label>
          <textarea 
            v-model="form.description"
            rows="2"
            placeholder="Detalhes da tarefa..."
            class="w-full px-3 py-2 bg-[#1c1c1e] border border-white/10 rounded-lg text-sm text-white placeholder-white/30 focus:border-white/20 focus:outline-none transition-all resize-none"
          ></textarea>
        </div>

        <!-- Grid: Prioridade + Status + Data -->
        <div class="grid grid-cols-3 gap-2">
          <!-- Prioridade -->
          <div>
            <label class="block text-[10px] font-medium uppercase tracking-wider text-white/40 mb-1.5">Prioridade</label>
            <select 
              v-model="form.priority"
              class="w-full px-2 py-2 bg-[#1c1c1e] border border-white/10 rounded-lg text-xs text-white focus:border-white/20 focus:outline-none transition-all"
            >
              <option value="baixa">Baixa</option>
              <option value="media">Média</option>
              <option value="alta">Alta</option>
            </select>
          </div>

          <!-- Status -->
          <div>
            <label class="block text-[10px] font-medium uppercase tracking-wider text-white/40 mb-1.5">Status</label>
            <select 
              v-model="form.status"
              class="w-full px-2 py-2 bg-[#1c1c1e] border border-white/10 rounded-lg text-xs text-white focus:border-white/20 focus:outline-none transition-all"
            >
              <option value="todo">A Fazer</option>
              <option value="in_progress">Andamento</option>
              <option value="done">Concluído</option>
            </select>
          </div>

          <!-- Data de Vencimento -->
          <div>
            <label class="block text-[10px] font-medium uppercase tracking-wider text-white/40 mb-1.5">Vencimento</label>
            <input 
              v-model="form.due_date"
              type="date"
              class="w-full px-2 py-2 bg-[#1c1c1e] border border-white/10 rounded-lg text-xs text-white focus:border-white/20 focus:outline-none transition-all"
            />
          </div>
        </div>

        <!-- Vincular a Empresa (Opcional) -->
        <div v-if="companies && companies.length > 0">
          <label class="block text-[10px] font-medium uppercase tracking-wider text-white/40 mb-1.5">Empresa</label>
          <select 
            v-model="form.company_id"
            class="w-full px-3 py-2 bg-[#1c1c1e] border border-white/10 rounded-lg text-sm text-white focus:border-white/20 focus:outline-none transition-all"
          >
            <option :value="undefined">Nenhuma</option>
            <option v-for="company in companies" :key="company.id" :value="company.id">
              {{ company.name }}
            </option>
          </select>
        </div>
      </div>

      <!-- Footer Compacto -->
      <div class="flex items-center gap-2 mt-5 pt-4 border-t border-white/5">
        <button
          @click="$emit('close')"
          class="flex-1 px-3 py-2 bg-[#1c1c1e] hover:bg-white/5 border border-white/10 rounded-lg text-sm text-white/60 hover:text-white transition-all font-medium"
        >
          Cancelar
        </button>
        <button
          @click="handleSave"
          :disabled="!form.title || submitting"
          :style="{ 
            backgroundColor: submitting || !form.title ? 'var(--kros-blue, #3b82f6)' : 'var(--kros-blue, #3b82f6)',
            opacity: submitting || !form.title ? 0.5 : 1
          }"
          class="flex-1 px-3 py-2 rounded-lg text-sm text-white transition-all font-medium disabled:cursor-not-allowed hover:opacity-90"
        >
          {{ submitting ? 'Salvando...' : 'Salvar' }}
        </button>
      </div>
    </div>
  </UiKModal>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { Task } from '~/composables/useTasks'

const props = defineProps<{
  isOpen: boolean
  task?: Task | null
  companies?: any[]
  submitting?: boolean
  tagDefinitions?: any[]
  defaultColumnId?: string
}>()

const emit = defineEmits(['close', 'save'])

const form = ref<Task>({
  title: '',
  description: '',
  status: 'todo',
  priority: 'media',
  due_date: '',
  company_id: undefined,
  column_id: props.defaultColumnId
})

watch(() => props.task, (newTask) => {
  if (newTask) {
    form.value = { ...newTask }
  } else {
    form.value = {
      title: '',
      description: '',
      status: 'todo',
      priority: 'media',
      due_date: '',
      company_id: undefined,
      column_id: props.defaultColumnId
    }
  }
}, { immediate: true })

watch(() => props.defaultColumnId, (newColumnId) => {
  if (!props.task) {
    form.value.column_id = newColumnId
  }
})

const handleSave = () => {
  if (!form.value.title) return
  emit('save', form.value)
}
</script>
