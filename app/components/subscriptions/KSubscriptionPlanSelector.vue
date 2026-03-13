<template>
  <div class="space-y-2">
    <label class="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/50 pl-1">
      Plano *
    </label>
    
    <select 
      :value="modelValue?.id"
      @change="handleSelect"
      required
      class="w-full bg-[#111112] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-kros-blue transition-all font-medium appearance-none"
    >
      <option value="">Selecione um plano...</option>
      <option 
        v-for="plan in plans" 
        :key="plan.id" 
        :value="plan.id"
      >
        {{ plan.name }} - R$ {{ formatCurrency(plan.price) }} / {{ plan.billing_cycle }}
      </option>
    </select>
    
    <!-- Detalhes do plano selecionado -->
    <div 
      v-if="selectedPlan"
      class="mt-3 p-4 bg-purple-500/5 border border-purple-500/20 rounded-xl space-y-2"
    >
      <div class="flex items-center justify-between">
        <span class="text-xs font-bold text-white">{{ selectedPlan.name }}</span>
        <span class="text-xs font-bold text-purple-400">R$ {{ formatCurrency(selectedPlan.price) }}</span>
      </div>
      
      <div v-if="selectedPlan.description" class="text-[10px] text-white/40">
        {{ selectedPlan.description }}
      </div>
      
      <div class="flex items-center gap-4 text-[10px]">
        <span class="text-white/40">Tipo: <span class="text-white">{{ selectedPlan.type }}</span></span>
        <span class="text-white/40">Ciclo: <span class="text-white">{{ selectedPlan.billing_cycle }}</span></span>
      </div>
      
      <div v-if="selectedPlan.category" class="text-[10px] text-white/40">
        Categoria: <span class="text-white">{{ selectedPlan.category }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'

const props = defineProps<{
  modelValue: any
}>()

const emit = defineEmits(['update:modelValue'])

const supabase = useSupabaseClient()
const plans = ref<any[]>([])
const loading = ref(false)

const selectedPlan = computed(() => {
  if (!props.modelValue?.id) return null
  return plans.value.find(p => p.id === props.modelValue.id)
})

const fetchPlans = async () => {
  loading.value = true
  try {
    const { data } = await supabase
      .from('plans')
      .select('*')
      .eq('type', 'Plano Recorrente')
      .order('name')
    
    plans.value = data || []
  } catch (err) {
    console.error('Erro ao buscar planos:', err)
  } finally {
    loading.value = false
  }
}

const handleSelect = (e: Event) => {
  const target = e.target as HTMLSelectElement
  const planId = target.value
  
  if (!planId) {
    emit('update:modelValue', null)
    return
  }
  
  const plan = plans.value.find(p => p.id === planId)
  emit('update:modelValue', plan)
}

const formatCurrency = (value: number) => {
  return value.toFixed(2).replace('.', ',')
}

onMounted(() => {
  fetchPlans()
})
</script>
