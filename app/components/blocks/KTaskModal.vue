<template>
  <UiKModal :is-open="isOpen" size="lg" @close="$emit('close')">
    <UiKModalHeader :title="task?.id ? 'Editar Tarefa' : 'Nova Tarefa'" />

    <div class="space-y-3 max-h-[60vh] overflow-y-auto custom-scrollbar">
      <!-- Título -->
      <div>
        <label class="block text-xs font-bold uppercase tracking-widest text-white/50 mb-1.5">Título</label>
        <input 
          v-model="form.title"
          type="text"
          placeholder="Ex: Ligar para cliente X"
          class="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-white/30 focus:border-kros-blue focus:outline-none transition-all"
        />
      </div>

      <!-- Descrição -->
      <div>
        <label class="block text-xs font-bold uppercase tracking-widest text-white/50 mb-1.5">Descrição</label>
        <textarea 
          v-model="form.description"
          rows="2"
          placeholder="Detalhes da tarefa..."
          class="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-white/30 focus:border-kros-blue focus:outline-none transition-all resize-none"
        ></textarea>
      </div>

      <!-- Grid: Prioridade + Status + Data -->
      <div class="grid grid-cols-3 gap-3">
        <!-- Prioridade -->
        <div>
          <label class="block text-xs font-bold uppercase tracking-widest text-white/50 mb-1.5">Prioridade</label>
          <select 
            v-model="form.priority"
            class="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:border-kros-blue focus:outline-none transition-all"
          >
            <option value="baixa">Baixa</option>
            <option value="media">Média</option>
            <option value="alta">Alta</option>
          </select>
        </div>

        <!-- Status -->
        <div>
          <label class="block text-xs font-bold uppercase tracking-widest text-white/50 mb-1.5">Status</label>
          <select 
            v-model="form.status"
            class="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:border-kros-blue focus:outline-none transition-all"
          >
            <option value="todo">A Fazer</option>
            <option value="in_progress">Andamento</option>
            <option value="done">Concluído</option>
          </select>
        </div>

        <!-- Data de Vencimento -->
        <div>
          <label class="block text-xs font-bold uppercase tracking-widest text-white/50 mb-1.5">Vencimento</label>
          <input 
            v-model="form.due_date"
            type="date"
            class="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:border-kros-blue focus:outline-none transition-all"
          />
        </div>
      </div>

      <!-- Vincular a Empresa (Opcional) -->
      <div v-if="companies && companies.length > 0">
        <label class="block text-xs font-bold uppercase tracking-widest text-white/50 mb-1.5">Empresa</label>
        <select 
          v-model="form.company_id"
          class="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:border-kros-blue focus:outline-none transition-all"
        >
          <option :value="null">Nenhuma</option>
          <option v-for="company in companies" :key="company.id" :value="company.id">
            {{ company.name }}
          </option>
        </select>
      </div>
    </div>

    <UiKModalActions
      cancel-text="Cancelar"
      confirm-text="Salvar"
      loading-text="Salvando..."
      :disabled="!form.title"
      :loading="submitting"
      submit-type="button"
      @cancel="$emit('close')"
      @confirm="handleSave"
    />
  </UiKModal>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import type { Task } from '~/composables/useTasks'

const props = defineProps<{
  isOpen: boolean
  task?: Task | null
  companies?: any[]
  submitting?: boolean
  tagDefinitions?: any[]
}>()

const emit = defineEmits(['close', 'save'])

const form = ref<Task>({
  title: '',
  description: '',
  status: 'todo',
  priority: 'media',
  due_date: '',
  company_id: null
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
      company_id: null
    }
  }
}, { immediate: true })

const handleSave = () => {
  if (!form.value.title) return
  emit('save', form.value)
}
</script>
