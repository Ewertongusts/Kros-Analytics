<template>
  <UiKModal :is-open="isOpen" size="sm" @close="$emit('close')">
    <UiKModalHeader :title="`${isEditing ? 'EDITAR' : 'NOVO'} ITEM`" />

    <form @submit.prevent="handleSave" class="flex flex-col max-h-[70vh]">
      <div class="space-y-3 overflow-y-auto custom-scrollbar flex-1 pr-2">
        <div class="space-y-2">
          <label class="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/50 pl-1">Tipo *</label>
          <div class="grid grid-cols-3 gap-2">
            <button
              v-for="typeOption in typeOptions"
              :key="typeOption.value"
              type="button"
              @click="form.type = typeOption.value"
              :class="[
                'py-3 px-3 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all border-2',
                form.type === typeOption.value
                  ? `${typeOption.activeBg} ${typeOption.activeBorder} ${typeOption.activeText}`
                  : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:border-white/20'
              ]"
            >
              <div class="text-lg mb-1">{{ typeOption.icon }}</div>
              {{ typeOption.label }}
            </button>
          </div>
        </div>

        <div class="space-y-2">
          <label class="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/50 pl-1">Nome</label>
          <input 
            v-model="form.name"
            type="text"
            required
            placeholder="Ex: Plano Pro, Landing Page, Consultoria IA"
            class="w-full bg-white/[0.03] border border-white/10 rounded-xl px-5 py-2.5 text-xs text-white outline-none focus:border-kros-blue transition-all font-medium placeholder:text-white/20"
          />
        </div>

        <div class="space-y-2">
          <label class="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/50 pl-1">Categoria (Opcional)</label>
          <select 
            v-model="form.category"
            class="w-full bg-[#111112] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-kros-blue transition-all font-medium appearance-none"
          >
            <option value="">Selecione uma categoria...</option>
            <option v-for="cat in categories" :key="cat.id" :value="cat.name">
              {{ cat.icon }} {{ cat.name }}
            </option>
          </select>
        </div>

        <div class="space-y-2">
          <label class="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/50 pl-1">Descrição (Opcional)</label>
          <textarea 
            v-model="form.description"
            rows="2"
            placeholder="Descreva o que está incluído neste item..."
            class="w-full bg-white/[0.03] border border-white/10 rounded-xl px-5 py-2.5 text-xs text-white outline-none focus:border-kros-blue transition-all font-medium placeholder:text-white/20 resize-none"
          ></textarea>
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
                class="w-full bg-white/[0.03] border border-white/10 rounded-xl px-5 py-2.5 text-xs text-white outline-none focus:border-kros-blue transition-all font-medium placeholder:text-white/20"
            />
            </div>

            <div v-if="form.type === 'Plano Recorrente'" class="space-y-2">
            <label class="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/50 pl-1">Recorrência</label>
            <select 
                v-model="form.billing_cycle"
                required
                class="w-full bg-[#111112] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-kros-blue transition-all font-medium appearance-none"
            >
                <option value="Mensal">Mensal</option>
                <option value="Trimestral">Trimestral</option>
                <option value="Semestral">Semestral</option>
                <option value="Anual">Anual</option>
            </select>
            </div>
        </div>
      </div>

      <UiKModalActions
        cancel-text="Cancelar"
        confirm-text="SALVAR"
        :loading="submitting"
        submit-type="submit"
        @cancel="$emit('close')"
        class="mt-4 pt-4 border-t border-white/10 flex-shrink-0"
      />
    </form>
  </UiKModal>
</template>

<script setup lang="ts">
import { reactive, watch, computed, ref, onMounted } from 'vue'
import type { PlanDefinition } from '~/composables/usePlans'

const props = defineProps<{
  isOpen: boolean
  initialData?: PlanDefinition | null
  submitting?: boolean
}>()

const emit = defineEmits(['close', 'save'])

const supabase = useSupabaseClient()
const categories = ref<any[]>([])

const isEditing = computed(() => !!props.initialData?.id)

const typeOptions = [
  {
    value: 'Plano Recorrente',
    label: 'Assinatura',
    icon: '🔄',
    activeBg: 'bg-emerald-500/20',
    activeBorder: 'border-emerald-500',
    activeText: 'text-emerald-400'
  },
  {
    value: 'Serviço Único',
    label: 'Serviço',
    icon: '🛠️',
    activeBg: 'bg-blue-500/20',
    activeBorder: 'border-blue-500',
    activeText: 'text-blue-400'
  },
  {
    value: 'Produto',
    label: 'Produto',
    icon: '📦',
    activeBg: 'bg-purple-500/20',
    activeBorder: 'border-purple-500',
    activeText: 'text-purple-400'
  }
]

const form = reactive({
  id: '',
  name: '',
  type: 'Plano Recorrente',
  category: '',
  description: '',
  price: 0,
  billing_cycle: 'Mensal'
})

const fetchCategories = async () => {
  const { data } = await supabase
    .from('plan_categories')
    .select('*')
    .order('name')
  
  categories.value = data || []
}

onMounted(() => {
  fetchCategories()
})

watch(() => props.initialData, (newData) => {
  if (newData) {
    form.id = newData.id || ''
    form.name = newData.name || ''
    form.type = newData.type || 'Plano Recorrente'
    form.category = newData.category || ''
    form.description = newData.description || ''
    form.price = newData.price || 0
    form.billing_cycle = newData.billing_cycle || 'Mensal'
  } else {
    form.id = ''
    form.name = ''
    form.type = 'Plano Recorrente'
    form.category = ''
    form.description = ''
    form.price = 0
    form.billing_cycle = 'Mensal'
  }
}, { immediate: true })

watch(() => props.isOpen, (val) => {
  if (val) {
    fetchCategories()
  } else {
    // Reset form when modal closes
    if (!props.initialData) {
      form.id = ''
      form.name = ''
      form.type = 'Plano Recorrente'
      form.category = ''
      form.description = ''
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
