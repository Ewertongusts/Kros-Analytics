<template>
  <UiKModal :is-open="isOpen" size="xl" @close="$emit('close')">
    <UiKModalHeader title="Filtros Avançados" />

    <div class="space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar">
      <!-- Busca por Texto -->
      <div>
        <label class="block text-xs font-bold uppercase tracking-widest text-white/50 mb-1.5">🔍 Buscar</label>
        <input 
          v-model="localFilters.search"
          type="text"
          placeholder="Título, descrição, empresa..."
          class="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-white/30 focus:border-blue-500 focus:outline-none transition-all"
        />
      </div>

      <!-- Status -->
      <div>
        <label class="block text-xs font-bold uppercase tracking-widest text-white/50 mb-2">📋 Status</label>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="status in statusOptions"
            :key="status.value"
            @click="toggleFilter('status', status.value)"
            :class="[
              'px-3 py-2 rounded-lg text-xs font-bold transition-all',
              localFilters.status.includes(status.value)
                ? 'bg-blue-500 text-white'
                : 'bg-white/10 text-white/70 hover:bg-white/20'
            ]"
          >
            {{ status.label }}
          </button>
        </div>
      </div>

      <!-- Prioridade -->
      <div>
        <label class="block text-xs font-bold uppercase tracking-widest text-white/50 mb-2">⭐ Prioridade</label>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="priority in priorityOptions"
            :key="priority.value"
            @click="toggleFilter('priority', priority.value)"
            :class="[
              'px-3 py-2 rounded-lg text-xs font-bold transition-all',
              localFilters.priority.includes(priority.value)
                ? priority.activeClass
                : 'bg-white/10 text-white/70 hover:bg-white/20'
            ]"
          >
            {{ priority.label }}
          </button>
        </div>
      </div>

      <!-- Responsável -->
      <div>
        <label class="block text-xs font-bold uppercase tracking-widest text-white/50 mb-2">👤 Responsável</label>
        <div class="space-y-2">
          <div v-for="user in users" :key="user.id" class="flex items-center gap-2">
            <input
              type="checkbox"
              :id="`user-${user.id}`"
              :checked="localFilters.assigned_to.includes(user.email || '')"
              @change="toggleFilter('assigned_to', user.email || '')"
              class="w-4 h-4 rounded accent-blue-500 cursor-pointer"
            />
            <label :for="`user-${user.id}`" class="text-sm text-white/70 cursor-pointer">
              {{ user.name || user.email }}
            </label>
          </div>
        </div>
      </div>

      <!-- Empresa -->
      <div v-if="companies && companies.length > 0">
        <label class="block text-xs font-bold uppercase tracking-widest text-white/50 mb-2">🏢 Empresa</label>
        <div class="space-y-2">
          <div v-for="company in companies" :key="company.id" class="flex items-center gap-2">
            <input
              type="checkbox"
              :id="`company-${company.id}`"
              :checked="localFilters.company_id.includes(company.id)"
              @change="toggleFilter('company_id', company.id)"
              class="w-4 h-4 rounded accent-blue-500 cursor-pointer"
            />
            <label :for="`company-${company.id}`" class="text-sm text-white/70 cursor-pointer">
              {{ company.name }}
            </label>
          </div>
        </div>
      </div>

      <!-- Data de Criação -->
      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="block text-xs font-bold uppercase tracking-widest text-white/50 mb-1.5">📅 Criada De</label>
          <input 
            v-model="localFilters.date_from"
            type="date"
            class="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:border-blue-500 focus:outline-none transition-all"
          />
        </div>
        <div>
          <label class="block text-xs font-bold uppercase tracking-widest text-white/50 mb-1.5">📅 Criada Até</label>
          <input 
            v-model="localFilters.date_to"
            type="date"
            class="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:border-blue-500 focus:outline-none transition-all"
          />
        </div>
      </div>

      <!-- Data de Vencimento -->
      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="block text-xs font-bold uppercase tracking-widest text-white/50 mb-1.5">⏰ Vence De</label>
          <input 
            v-model="localFilters.due_date_from"
            type="date"
            class="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:border-blue-500 focus:outline-none transition-all"
          />
        </div>
        <div>
          <label class="block text-xs font-bold uppercase tracking-widest text-white/50 mb-1.5">⏰ Vence Até</label>
          <input 
            v-model="localFilters.due_date_to"
            type="date"
            class="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:border-blue-500 focus:outline-none transition-all"
          />
        </div>
      </div>

      <!-- Estimativa de Tempo -->
      <div>
        <label class="block text-xs font-bold uppercase tracking-widest text-white/50 mb-2">⏱️ Estimativa</label>
        <div class="space-y-2">
          <div class="flex items-center gap-2">
            <input
              type="checkbox"
              id="has-estimation"
              :checked="localFilters.has_estimation === true"
              @change="(e) => { const target = e.target as HTMLInputElement; localFilters.has_estimation = target.checked ? true : null }"
              class="w-4 h-4 rounded accent-blue-500 cursor-pointer"
            />
            <label for="has-estimation" class="text-sm text-white/70 cursor-pointer">
              Apenas com estimativa
            </label>
          </div>
          <div class="grid grid-cols-2 gap-2">
            <div>
              <label class="block text-xs text-white/50 mb-1">Mín (horas)</label>
              <input 
                v-model.number="localFilters.estimation_min"
                type="number"
                min="0"
                step="0.5"
                class="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:border-blue-500 focus:outline-none transition-all"
              />
            </div>
            <div>
              <label class="block text-xs text-white/50 mb-1">Máx (horas)</label>
              <input 
                v-model.number="localFilters.estimation_max"
                type="number"
                min="0"
                step="0.5"
                class="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:border-blue-500 focus:outline-none transition-all"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Subtarefas -->
      <div>
        <label class="block text-xs font-bold uppercase tracking-widest text-white/50 mb-2">📋 Subtarefas</label>
        <div class="flex gap-2">
          <button
            @click="localFilters.has_subtasks = localFilters.has_subtasks === true ? null : true"
            :class="[
              'px-3 py-2 rounded-lg text-xs font-bold transition-all',
              localFilters.has_subtasks === true
                ? 'bg-blue-500 text-white'
                : 'bg-white/10 text-white/70 hover:bg-white/20'
            ]"
          >
            Com Subtarefas
          </button>
          <button
            @click="localFilters.has_subtasks = localFilters.has_subtasks === false ? null : false"
            :class="[
              'px-3 py-2 rounded-lg text-xs font-bold transition-all',
              localFilters.has_subtasks === false
                ? 'bg-red-500 text-white'
                : 'bg-white/10 text-white/70 hover:bg-white/20'
            ]"
          >
            Sem Subtarefas
          </button>
        </div>
      </div>

      <!-- Tarefas Atrasadas -->
      <div>
        <label class="block text-xs font-bold uppercase tracking-widest text-white/50 mb-2">⚠️ Status</label>
        <div class="flex items-center gap-2">
          <input
            type="checkbox"
            id="overdue-only"
            v-model="localFilters.overdue_only"
            class="w-4 h-4 rounded accent-red-500 cursor-pointer"
          />
          <label for="overdue-only" class="text-sm text-white/70 cursor-pointer">
            Apenas tarefas atrasadas
          </label>
        </div>
      </div>
    </div>

    <UiKModalActions
      cancel-text="Cancelar"
      confirm-text="Aplicar Filtros"
      @cancel="$emit('close')"
      @confirm="applyFilters"
    />
  </UiKModal>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { AdvancedFilters } from '~/composables/useAdvancedFilters'
import { useUsers } from '~/composables/useUsers'

interface Props {
  isOpen: boolean
  filters: AdvancedFilters
  companies?: any[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'close': []
  'apply': [filters: AdvancedFilters]
}>()

const { users, fetchUsers } = useUsers()

const localFilters = ref<AdvancedFilters>({ ...props.filters })

const statusOptions = [
  { label: 'A Fazer', value: 'todo' },
  { label: 'Em Andamento', value: 'in_progress' },
  { label: 'Concluído', value: 'done' }
]

const priorityOptions = [
  { label: 'Alta', value: 'alta', activeClass: 'bg-red-500 text-white' },
  { label: 'Média', value: 'media', activeClass: 'bg-yellow-500 text-white' },
  { label: 'Baixa', value: 'baixa', activeClass: 'bg-green-500 text-white' }
]

const toggleFilter = (filterName: string, value: any) => {
  const filter = localFilters.value[filterName as keyof AdvancedFilters] as any[]
  if (Array.isArray(filter)) {
    const index = filter.indexOf(value)
    if (index > -1) {
      filter.splice(index, 1)
    } else {
      filter.push(value)
    }
  }
}

const applyFilters = () => {
  emit('apply', localFilters.value)
  emit('close')
}

watch(() => props.isOpen, (isOpen) => {
  if (isOpen) {
    localFilters.value = { ...props.filters }
    if (users.value.length === 0) {
      fetchUsers()
    }
  }
})

watch(() => props.filters, (newFilters) => {
  localFilters.value = { ...newFilters }
}, { deep: true })
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.2);
}
</style>
