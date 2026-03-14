<template>
  <div v-if="isOpen" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <div class="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 w-full max-w-md">
      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-xl font-bold text-white">
          {{ isEditing ? 'Editar Despesa' : 'Nova Despesa' }}
        </h2>
        <button
          @click="$emit('close')"
          class="text-white/50 hover:text-white transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>

      <!-- Form -->
      <form @submit.prevent="handleSubmit" class="space-y-4">
        <!-- Description -->
        <div>
          <label class="block text-sm font-semibold text-white/80 mb-2">Descrição</label>
          <input
            v-model="formData.description"
            type="text"
            placeholder="Ex: Servidor, Aluguel, etc"
            class="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-[var(--kros-blue)] transition-colors"
          />
        </div>

        <!-- Category -->
        <div>
          <label class="block text-sm font-semibold text-white/80 mb-2">Categoria</label>
          <select
            v-model="formData.category_id"
            class="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[var(--kros-blue)] transition-colors"
          >
            <option value="">Selecione uma categoria</option>
            <option v-for="cat in categories" :key="cat.id" :value="cat.id">
              {{ cat.name }}
            </option>
          </select>
        </div>

        <!-- Amount -->
        <div>
          <label class="block text-sm font-semibold text-white/80 mb-2">Valor (R$)</label>
          <input
            v-model.number="formData.amount"
            type="number"
            step="0.01"
            placeholder="0.00"
            class="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-[var(--kros-blue)] transition-colors"
          />
        </div>

        <!-- Type (Recurring or Unique) -->
        <div>
          <label class="block text-sm font-semibold text-white/80 mb-2">Tipo</label>
          <div class="flex gap-3">
            <button
              type="button"
              @click="formData.is_recurring = false"
              :class="[
                'flex-1 px-4 py-2.5 rounded-xl font-semibold transition-all',
                !formData.is_recurring
                  ? 'bg-[var(--kros-blue)] text-white'
                  : 'bg-white/5 border border-white/10 text-white/70 hover:border-[var(--kros-blue)]'
              ]"
            >
              Único
            </button>
            <button
              type="button"
              @click="formData.is_recurring = true"
              :class="[
                'flex-1 px-4 py-2.5 rounded-xl font-semibold transition-all',
                formData.is_recurring
                  ? 'bg-[var(--kros-blue)] text-white'
                  : 'bg-white/5 border border-white/10 text-white/70 hover:border-[var(--kros-blue)]'
              ]"
            >
              Recorrente
            </button>
          </div>
        </div>

        <!-- Start Date -->
        <div>
          <label class="block text-sm font-semibold text-white/80 mb-2">Data de Início</label>
          <input
            v-model="formData.start_date"
            type="date"
            class="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[var(--kros-blue)] transition-colors"
          />
        </div>

        <!-- Frequency (only for recurring) -->
        <div v-if="formData.is_recurring">
          <label class="block text-sm font-semibold text-white/80 mb-2">Frequência</label>
          <select
            v-model="formData.recurring_frequency"
            class="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[var(--kros-blue)] transition-colors"
          >
            <option value="">Selecione a frequência</option>
            <option value="daily">Diária</option>
            <option value="weekly">Semanal</option>
            <option value="monthly">Mensal</option>
            <option value="quarterly">Trimestral</option>
            <option value="semiannual">Semestral</option>
            <option value="yearly">Anual</option>
          </select>
        </div>

        <!-- End Date (only for recurring) -->
        <div v-if="formData.is_recurring">
          <label class="block text-sm font-semibold text-white/80 mb-2">Data de Término (Opcional)</label>
          <input
            v-model="formData.end_date"
            type="date"
            class="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[var(--kros-blue)] transition-colors"
          />
        </div>

        <!-- Notes -->
        <div>
          <label class="block text-sm font-semibold text-white/80 mb-2">Notas (Opcional)</label>
          <textarea
            v-model="formData.notes"
            placeholder="Adicione observações..."
            rows="3"
            class="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-[var(--kros-blue)] transition-colors resize-none"
          ></textarea>
        </div>

        <!-- Buttons -->
        <div class="flex gap-3 pt-4">
          <button
            type="button"
            @click="$emit('close')"
            class="flex-1 px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white font-semibold hover:border-[var(--kros-blue)] transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            :disabled="loading"
            class="flex-1 px-4 py-2.5 bg-[var(--kros-blue)] text-white font-semibold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {{ loading ? 'Salvando...' : 'Salvar' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { Expense, Category } from '~/composables/useExpenses'

interface Props {
  isOpen: boolean
  expense?: Expense
  categories: Category[]
  loading?: boolean
}

interface Emits {
  (e: 'close'): void
  (e: 'submit', expense: Partial<Expense>): void
}

const props = withDefaults(defineProps<Props>(), {
  loading: false
})

const emit = defineEmits<Emits>()

const isEditing = ref(false)
const formData = ref<Partial<Expense>>({
  description: '',
  category_id: '',
  amount: 0,
  is_recurring: false,
  recurring_frequency: 'monthly',
  start_date: new Date().toISOString().split('T')[0],
  end_date: '',
  notes: ''
})

watch(
  () => props.isOpen,
  (newVal) => {
    if (newVal) {
      if (props.expense) {
        isEditing.value = true
        formData.value = { ...props.expense }
      } else {
        isEditing.value = false
        formData.value = {
          description: '',
          category_id: '',
          amount: 0,
          is_recurring: false,
          recurring_frequency: 'monthly',
          start_date: new Date().toISOString().split('T')[0],
          end_date: '',
          notes: ''
        }
      }
    }
  }
)

const handleSubmit = () => {
  if (!formData.value.description || !formData.value.category_id || !formData.value.amount) {
    alert('Preencha todos os campos obrigatórios')
    return
  }

  emit('submit', formData.value)
}
</script>

<style scoped>
select {
  color-scheme: dark;
}

select option {
  background-color: #1a1a1b;
  color: white;
}

input[type="date"] {
  color-scheme: dark;
}

input[type="date"]::-webkit-calendar-picker-indicator {
  filter: invert(1);
}
</style>
