<template>
  <UiKModal :is-open="isOpen" size="md" @close="$emit('close')">
    <UiKModalHeader :title="`${isEditing ? 'EDITAR' : 'NOVO'} ITEM`" />

    <form @submit.prevent="handleSave" class="space-y-3">
        <div class="space-y-2">
          <label class="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/50 pl-1">Tipo</label>
          <select 
            v-model="form.type"
            required
            class="w-full bg-[#111112] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-kros-blue transition-all font-medium appearance-none"
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

      <UiKModalActions
        cancel-text="Cancelar"
        confirm-text="SALVAR"
        :loading="submitting"
        submit-type="submit"
        @cancel="$emit('close')"
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
