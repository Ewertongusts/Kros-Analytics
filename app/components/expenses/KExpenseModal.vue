<template>
  <Teleport to="body">
    <div v-if="isOpen" class="fixed inset-0 z-[9999] flex items-center justify-center px-4">
      <div @click="$emit('close')" class="fixed inset-0 bg-black/90 backdrop-blur-xl"></div>
      
      <div class="relative bg-[#0D0D0E] border border-white/10 rounded-[2.5rem] w-full max-w-md p-6 shadow-[0_0_100px_rgba(0,0,0,0.8)] max-h-[90vh] overflow-y-auto custom-scrollbar">
        <!-- Header -->
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-[13px] font-black uppercase tracking-[0.2em] text-white">
            {{ isEditing ? 'Editar Despesa' : 'Nova Despesa' }}
          </h2>
          <button
            @click="$emit('close')"
            class="text-white/50 hover:text-white transition-colors flex-shrink-0"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <!-- Form -->
        <form @submit.prevent="handleSubmit" class="space-y-6">
          <!-- Informações Básicas -->
          <div class="space-y-3">
            <h3 class="text-[11px] font-black uppercase tracking-[0.2em] text-[var(--kros-blue)]">Informações Básicas</h3>
            
            <!-- Description -->
            <div class="space-y-2">
              <label class="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/50 pl-1">Descrição *</label>
              <input
                v-model="formData.description"
                type="text"
                required
                placeholder="Ex: Servidor, Aluguel, etc"
                class="w-full bg-white/[0.03] border border-white/10 rounded-xl px-5 py-2.5 text-xs text-white outline-none focus:border-[var(--kros-blue)] transition-all font-medium placeholder:text-white/20"
              />
            </div>

            <!-- Category -->
            <div class="space-y-2">
              <label class="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/50 pl-1">Categoria *</label>
              <select
                v-model="formData.category_id"
                required
                class="w-full bg-white/[0.03] border border-white/10 rounded-xl px-5 py-2.5 text-xs text-white outline-none focus:border-[var(--kros-blue)] transition-all font-medium"
              >
                <option value="">Selecione uma categoria</option>
                <option v-for="cat in categories" :key="cat.id" :value="cat.id">
                  {{ cat.name }}
                </option>
              </select>
            </div>

            <!-- Amount -->
            <div class="space-y-2">
              <label class="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/50 pl-1">Valor (R$) *</label>
              <input
                v-model.number="formData.amount"
                type="number"
                step="0.01"
                required
                placeholder="0.00"
                class="w-full bg-white/[0.03] border border-white/10 rounded-xl px-5 py-2.5 text-xs text-white outline-none focus:border-[var(--kros-blue)] transition-all font-medium placeholder:text-white/20"
              />
            </div>
          </div>

          <!-- Tipo de Despesa -->
          <div class="space-y-3">
            <h3 class="text-[11px] font-black uppercase tracking-[0.2em] text-[var(--kros-blue)]">Tipo de Despesa</h3>
            
            <div class="flex gap-3">
              <button
                type="button"
                @click="formData.is_recurring = false"
                :class="[
                  'flex-1 px-4 py-2.5 rounded-xl font-semibold text-xs uppercase tracking-[0.1em] transition-all',
                  !formData.is_recurring
                    ? 'bg-[var(--kros-blue)] text-white'
                    : 'bg-white/[0.03] border border-white/10 text-white/70 hover:border-[var(--kros-blue)]'
                ]"
              >
                Único
              </button>
              <button
                type="button"
                @click="formData.is_recurring = true"
                :class="[
                  'flex-1 px-4 py-2.5 rounded-xl font-semibold text-xs uppercase tracking-[0.1em] transition-all',
                  formData.is_recurring
                    ? 'bg-[var(--kros-blue)] text-white'
                    : 'bg-white/[0.03] border border-white/10 text-white/70 hover:border-[var(--kros-blue)]'
                ]"
              >
                Recorrente
              </button>
            </div>
          </div>

          <!-- Datas -->
          <div class="space-y-3">
            <h3 class="text-[11px] font-black uppercase tracking-[0.2em] text-[var(--kros-blue)]">Datas</h3>
            
            <!-- Start Date -->
            <div class="space-y-2">
              <label class="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/50 pl-1">Data de Início *</label>
              <input
                v-model="formData.start_date"
                type="date"
                required
                class="w-full bg-white/[0.03] border border-white/10 rounded-xl px-5 py-2.5 text-xs text-white outline-none focus:border-[var(--kros-blue)] transition-all font-medium"
              />
            </div>

            <!-- Frequency (only for recurring) -->
            <div v-if="formData.is_recurring" class="space-y-2">
              <label class="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/50 pl-1">Frequência *</label>
              <select
                v-model="formData.recurring_frequency"
                required
                class="w-full bg-white/[0.03] border border-white/10 rounded-xl px-5 py-2.5 text-xs text-white outline-none focus:border-[var(--kros-blue)] transition-all font-medium"
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
            <div v-if="formData.is_recurring" class="space-y-2">
              <label class="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/50 pl-1">Data de Término (Opcional)</label>
              <input
                v-model="formData.end_date"
                type="date"
                class="w-full bg-white/[0.03] border border-white/10 rounded-xl px-5 py-2.5 text-xs text-white outline-none focus:border-[var(--kros-blue)] transition-all font-medium"
              />
            </div>
          </div>

          <!-- Observações -->
          <div class="space-y-3">
            <h3 class="text-[11px] font-black uppercase tracking-[0.2em] text-[var(--kros-blue)]">Observações</h3>
            
            <div class="space-y-2">
              <label class="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/50 pl-1">Notas (Opcional)</label>
              <textarea
                v-model="formData.notes"
                placeholder="Adicione observações..."
                rows="3"
                class="w-full bg-white/[0.03] border border-white/10 rounded-xl px-5 py-2.5 text-xs text-white outline-none focus:border-[var(--kros-blue)] transition-all font-medium placeholder:text-white/20 resize-none"
              ></textarea>
            </div>
          </div>

          <!-- Buttons -->
          <div class="flex gap-3 pt-4">
            <button
              type="button"
              @click="$emit('close')"
              class="flex-1 px-4 py-2.5 bg-white/[0.03] border border-white/10 rounded-xl text-white font-semibold text-xs uppercase tracking-[0.1em] hover:border-[var(--kros-blue)] transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              :disabled="loading"
              class="flex-1 px-4 py-2.5 bg-[var(--kros-blue)] text-white font-semibold text-xs uppercase tracking-[0.1em] rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {{ loading ? 'Salvando...' : 'Salvar' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </Teleport>
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

.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(0, 123, 255, 0.2);
  border-radius: 10px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 123, 255, 0.4);
}
</style>
