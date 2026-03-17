<template>
  <div class="space-y-2">
    <label v-if="showLabel !== false" class="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/50 pl-1">
      Plano *
    </label>
    
    <!-- Modo Edição: Mostrar plano como desabilitado -->
    <div v-if="isEditing && selectedPlan" class="relative group">
      <input 
        :value="`${selectedPlan.name} - R$ ${formatCurrency(selectedPlan.price)} / ${selectedPlan.billing_cycle}`"
        disabled
        type="text"
        class="w-full bg-white/[0.03] border border-white/10 rounded-xl px-5 py-2.5 text-xs text-white/40 outline-none font-medium disabled:opacity-50 disabled:cursor-not-allowed"
      />
      <!-- Ícone de proibido ao passar o mouse -->
      <div class="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-white/40">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/>
          <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
        </svg>
      </div>
    </div>

    <!-- Modo Criação: Select dropdown -->
    <select 
      v-else
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
  isEditing?: boolean
  showLabel?: boolean
}>()

const emit = defineEmits(['update:modelValue'])

const supabase = useSupabaseClient()
const plans = ref<any[]>([])
const loading = ref(false)

const selectedPlan = computed(() => {
  if (!props.modelValue?.id) {
    console.log('🔍 [KSubscriptionPlanSelector] selectedPlan: modelValue.id é vazio')
    return null
  }
  const found = plans.value.find(p => p.id === props.modelValue.id)
  console.log(`🔍 [KSubscriptionPlanSelector] selectedPlan: procurando ${props.modelValue.id}, encontrado:`, found)
  return found
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
  if (props.isEditing) return // Não permite mudança se isEditing for true
  
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

watch(() => props.modelValue, (val) => {
  console.log('👀 [KSubscriptionPlanSelector] modelValue mudou:', val)
  if (val && val.id) {
    console.log(`👀 [KSubscriptionPlanSelector] Procurando plano ${val.id} nos ${plans.value.length} planos carregados`)
    const found = plans.value.find(p => p.id === val.id)
    console.log(`👀 [KSubscriptionPlanSelector] Plano encontrado:`, found)
  }
}, { deep: true })

onMounted(() => {
  fetchPlans()
})
</script>
