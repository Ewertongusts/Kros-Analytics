<template>
  <div v-if="isOpen" class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
    <div class="bg-[#111112] border border-white/10 rounded-3xl w-full max-w-xl shadow-2xl animate-in zoom-in-95 duration-200">
      <!-- Header -->
      <div class="flex items-center justify-between p-4 border-b border-white/10">
        <h2 class="text-lg font-bold text-white">{{ task?.id ? 'Editar Tarefa' : 'Nova Tarefa' }}</h2>
        <button @click="$emit('close')" class="p-2 hover:bg-white/10 rounded-xl transition-all">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-white/50"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
      </div>

      <!-- Body -->
      <div class="p-4 space-y-3 max-h-[60vh] overflow-y-auto">
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
              <option value="low">Baixa</option>
              <option value="medium">Média</option>
              <option value="high">Alta</option>
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

        <!-- Tags -->
        <div>
          <label class="block text-xs font-bold uppercase tracking-widest text-white/50 mb-1.5">Tags</label>
          
          <!-- Tags Selecionadas -->
          <div class="flex flex-wrap gap-2 mb-2">
            <button 
              v-for="tagName in form.tags" 
              :key="tagName"
              @click="removeTag(tagName)"
              :style="{ backgroundColor: getTagColor(tagName) }"
              class="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest text-white transition-all hover:opacity-80 flex items-center gap-1"
            >
              {{ tagName }}
              <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>

          <!-- Botão Add Tag + Dropdown -->
          <div class="relative" v-if="props.tagDefinitions && props.tagDefinitions.length > 0">
            <button 
              @click="isTagDropdownOpen = !isTagDropdownOpen"
              type="button"
              class="px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-xl text-xs font-bold uppercase tracking-widest text-white/50 hover:text-white transition-all flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12h14"/></svg>
              Adicionar Tag
            </button>

            <!-- Dropdown -->
            <div 
              v-if="isTagDropdownOpen"
              class="absolute bottom-full left-0 mb-2 w-64 bg-[#0A0A0B] border border-white/10 rounded-xl shadow-2xl z-50 p-2 max-h-48 overflow-y-auto"
            >
              <button 
                v-for="tag in availableTagsToAdd" 
                :key="tag.id"
                @click="addTag(tag.name)"
                type="button"
                class="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/5 transition-all text-left group"
              >
                <div :style="{ backgroundColor: tag.color }" class="w-3 h-3 rounded-sm"></div>
                <span class="text-xs font-bold uppercase tracking-widest text-white/50 group-hover:text-white">{{ tag.name }}</span>
              </button>
              <div v-if="availableTagsToAdd.length === 0" class="px-3 py-2 text-xs text-white/30 text-center">
                Todas as tags já foram adicionadas
              </div>
            </div>
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

      <!-- Footer -->
      <div class="flex items-center justify-end gap-3 p-4 border-t border-white/10">
        <button 
          @click="$emit('close')"
          class="px-5 py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-bold uppercase tracking-widest transition-all"
        >
          Cancelar
        </button>
        <button 
          @click="handleSave"
          :disabled="!form.title || submitting"
          class="px-5 py-2.5 bg-kros-blue hover:bg-kros-blue/80 text-white rounded-xl text-xs font-bold uppercase tracking-widest transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ submitting ? 'Salvando...' : 'Salvar' }}
        </button>
      </div>
    </div>
  </div>
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
}>()

const emit = defineEmits(['close', 'save'])

const isTagDropdownOpen = ref(false)

const form = ref<Task>({
  title: '',
  description: '',
  status: 'todo',
  priority: 'medium',
  due_date: '',
  company_id: null,
  tags: []
})

watch(() => props.task, (newTask) => {
  if (newTask) {
    form.value = { ...newTask }
  } else {
    form.value = {
      title: '',
      description: '',
      status: 'todo',
      priority: 'medium',
      due_date: '',
      company_id: null,
      tags: []
    }
  }
}, { immediate: true })

const availableTagsToAdd = computed(() => {
  if (!props.tagDefinitions) return []
  return props.tagDefinitions.filter(tag => !form.value.tags?.includes(tag.name))
})

const getTagColor = (tagName: string) => {
  const tag = props.tagDefinitions?.find(t => t.name === tagName)
  return tag?.color || '#007BFF'
}

const addTag = (tagName: string) => {
  if (!form.value.tags) form.value.tags = []
  if (!form.value.tags.includes(tagName)) {
    form.value.tags.push(tagName)
  }
  isTagDropdownOpen.value = false
}

const removeTag = (tagName: string) => {
  if (!form.value.tags) return
  form.value.tags = form.value.tags.filter(t => t !== tagName)
}

const toggleTag = (tag: string) => {
  if (!form.value.tags) form.value.tags = []
  const index = form.value.tags.indexOf(tag)
  if (index === -1) {
    form.value.tags.push(tag)
  } else {
    form.value.tags.splice(index, 1)
  }
}

const handleSave = () => {
  if (!form.value.title) return
  emit('save', form.value)
}
</script>
