<template>
  <div v-if="isOpen" class="fixed inset-0 z-[9999] flex items-center justify-center px-4 overflow-y-auto py-8">
    <div @click="$emit('close')" class="fixed inset-0 bg-black/90 backdrop-blur-xl"></div>
    
      <div class="relative bg-[#0D0D0E] border border-white/10 rounded-[2.5rem] w-full max-w-[500px] p-8 overflow-visible shadow-[0_0_100px_rgba(0,0,0,0.8)] my-auto">
        <div class="mb-8 text-center">
          <h3 class="text-lg font-bold uppercase tracking-tight text-white">
            {{ isEditing ? 'EDITAR' : 'NOVO' }} <span class="text-kros-blue">ITEM</span>
          </h3>
          <div class="h-1 w-8 bg-kros-blue mx-auto mt-3 rounded-full"></div>
        </div>

      <form @submit.prevent="handleSave" class="space-y-6">
        <div class="space-y-2">
          <label class="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/50 pl-1">Tipo</label>
          <select 
            v-model="form.type"
            required
            class="w-full bg-[#111112] border border-white/10 rounded-xl px-4 py-3.5 text-xs text-white outline-none focus:border-kros-blue transition-all font-medium appearance-none"
          >
            <option value="Plano Recorrente">Plano Recorrente</option>
            <option value="Serviço Único">Serviço Único</option>
            <option value="Produto">Produto</option>
          </select>
        </div>

        <div class="space-y-2">
          <label class="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/50 pl-1">Nome</label>
          <input 
            v-model="form.name"
            type="text"
            required
            placeholder="Ex: Plano Pro, Landing Page, Consultoria IA"
            class="w-full bg-white/[0.03] border border-white/10 rounded-xl px-5 py-3.5 text-xs text-white outline-none focus:border-kros-blue transition-all font-medium placeholder:text-white/20"
          />
        </div>

        <div class="space-y-2">
          <label class="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/50 pl-1">Categoria (Opcional)</label>
          <input 
            v-model="form.category"
            type="text"
            placeholder="Ex: CRM, IA, Landing Page, Implementação"
            class="w-full bg-white/[0.03] border border-white/10 rounded-xl px-5 py-3.5 text-xs text-white outline-none focus:border-kros-blue transition-all font-medium placeholder:text-white/20"
          />
        </div>

        <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
            <label class="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/50 pl-1">Valor (R$)</label>
            <input 
                v-model.number="form.price"
                type="number"
                step="0.01"
                required
                placeholder="0.00"
                class="w-full bg-white/[0.03] border border-white/10 rounded-xl px-5 py-3.5 text-xs text-white outline-none focus:border-kros-blue transition-all font-medium placeholder:text-white/20"
            />
            </div>

            <div v-if="form.type === 'Plano Recorrente'" class="space-y-2">
            <label class="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/50 pl-1">Recorrência</label>
            <select 
                v-model="form.billing_cycle"
                required
                class="w-full bg-[#111112] border border-white/10 rounded-xl px-4 py-3.5 text-xs text-white outline-none focus:border-kros-blue transition-all font-medium appearance-none"
            >
                <option value="Mensal">Mensal</option>
                <option value="Semestral">Semestral</option>
                <option value="Anual">Anual</option>
            </select>
            </div>
        </div>

        <div class="flex gap-3 pt-2">
          <button 
            type="button"
            @click="$emit('close')"
            class="flex-1 py-3.5 text-[10px] font-semibold uppercase tracking-widest text-white/40 hover:text-white hover:bg-white/5 rounded-xl transition-all"
          >
            Cancelar
          </button>
          <button 
            type="submit"
            :disabled="submitting"
            class="flex-1 btn-primary py-3.5 rounded-xl text-[10px] font-semibold uppercase tracking-widest transition-all disabled:opacity-50"
          >
            {{ submitting ? 'SALVANDO...' : 'SALVAR' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, watch, computed } from 'vue'
import type { PlanDefinition } from '~/composables/usePlans'

const props = defineProps<{
  isOpen: boolean
  initialData?: PlanDefinition | null
  submitting?: boolean
}>()

const emit = defineEmits(['close', 'save'])

const isEditing = computed(() => !!props.initialData?.id)

const form = reactive({
  id: '',
  name: '',
  type: 'Plano Recorrente',
  category: '',
  price: 0,
  billing_cycle: 'Mensal'
})

watch(() => props.isOpen, (val) => {
  if (val) {
    if (props.initialData) {
        form.id = props.initialData.id || ''
        form.name = props.initialData.name
        form.type = props.initialData.type || 'Plano Recorrente'
        form.category = props.initialData.category || ''
        form.price = props.initialData.price
        form.billing_cycle = props.initialData.billing_cycle
    } else {
        form.id = ''
        form.name = ''
        form.type = 'Plano Recorrente'
        form.category = ''
        form.price = 0
        form.billing_cycle = 'Mensal'
    }
  }
})

const handleSave = () => {
  emit('save', { ...form })
}
</script>

<style scoped>
</style>
