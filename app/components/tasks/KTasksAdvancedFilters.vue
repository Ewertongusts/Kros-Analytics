<template>
  <div class="space-y-4 p-4 bg-white/5 border border-white/10 rounded-xl">
    <h3 class="text-sm font-bold text-white uppercase tracking-widest">Filtros Avançados</h3>
    
    <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
      <!-- Data de Vencimento -->
      <div>
        <label class="block text-xs font-bold text-white/50 uppercase tracking-widest mb-1.5">Data de Vencimento</label>
        <input
          v-model="filters.dueDate"
          type="date"
          class="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-white/20"
        />
      </div>

      <!-- Responsável -->
      <div>
        <label class="block text-xs font-bold text-white/50 uppercase tracking-widest mb-1.5">Responsável</label>
        <select
          v-model="filters.assignedTo"
          class="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-white/20"
        >
          <option value="">Todos</option>
          <option v-for="user in users" :key="user.id" :value="user.id">
            {{ user.name }}
          </option>
        </select>
      </div>

      <!-- Empresa -->
      <div>
        <label class="block text-xs font-bold text-white/50 uppercase tracking-widest mb-1.5">Empresa</label>
        <select
          v-model="filters.company"
          class="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-white/20"
        >
          <option value="">Todas</option>
          <option v-for="company in companies" :key="company.id" :value="company.id">
            {{ company.name }}
          </option>
        </select>
      </div>

      <!-- Tags -->
      <div>
        <label class="block text-xs font-bold text-white/50 uppercase tracking-widest mb-1.5">Tags</label>
        <select
          v-model="filters.tags"
          multiple
          class="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-white/20"
        >
          <option v-for="tag in tags" :key="tag.id" :value="tag.id">
            {{ tag.name }}
          </option>
        </select>
      </div>
    </div>

    <div class="flex gap-2">
      <button
        @click="applyFilters"
        class="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-bold transition-all"
      >
        Aplicar Filtros
      </button>
      <button
        @click="clearFilters"
        class="flex-1 px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg text-sm font-bold transition-all"
      >
        Limpar
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
  users: any[]
  companies: any[]
  tags: any[]
}>()

const emit = defineEmits(['apply', 'clear'])

const filters = ref({
  dueDate: '',
  assignedTo: '',
  company: '',
  tags: []
})

const applyFilters = () => {
  emit('apply', filters.value)
}

const clearFilters = () => {
  filters.value = {
    dueDate: '',
    assignedTo: '',
    company: '',
    tags: []
  }
  emit('clear')
}
</script>
