<template>
  <div v-if="isOpen" class="fixed inset-0 z-[100] flex items-center justify-center px-4 overflow-hidden">
    <!-- Backdrop -->
    <div @click="close" class="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"></div>

    <!-- Modal Content -->
    <div class="relative bg-kros-surface dark:bg-[#111112] border border-kros-outline dark:border-[#1F1F21] rounded-3xl w-full max-w-2xl overflow-hidden transition-all duration-300 transform scale-100 max-h-[90vh] flex flex-col">
      
      <!-- Header -->
      <div class="px-8 py-6 border-b border-kros-outline dark:border-[#1F1F21] flex items-center justify-between bg-white/[0.02] flex-shrink-0">
        <div>
          <h3 class="text-xl font-bold text-kros-text dark:text-kros-surface tracking-tight uppercase">
            {{ isEditing ? 'Editar' : 'Nova' }} <span class="text-kros-blue">Empresa</span>
          </h3>
          <p class="text-[10px] font-medium opacity-60 uppercase tracking-widest mt-1">Gestão de parceiro e faturamento</p>
        </div>
        <button @click="close" class="p-2 rounded-xl hover:bg-red-500/10 text-red-500/50 hover:text-red-500 transition-all">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
        </button>
      </div>

      <!-- Body -->
      <form @submit.prevent="handleSave" class="overflow-y-auto p-8 space-y-8 custom-scrollbar">
        <!-- 1. Informações Básicas -->
        <div class="space-y-4">
          <h4 class="text-[10px] font-bold text-kros-blue uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
             <span class="w-1 h-1 bg-kros-blue rounded-full"></span> Dados do Negócio
          </h4>
          
          <UiKInput 
            v-model="form.name" 
            label="Nome da Empresa" 
            placeholder="Razão Social ou Nome Fantasia" 
            required 
          />

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <UiKInput 
              v-model="form.representative_name" 
              label="Nome do Representante" 
              placeholder="Ex: João Silva" 
            />
            <UiKInput 
              v-model="form.email" 
              type="email"
              label="E-mail de Contato" 
              placeholder="exemplo@empresa.com" 
            />
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="space-y-1.5">
              <label class="block text-sm font-medium text-white/70">WhatsApp</label>
              <div class="relative">
                <span class="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold opacity-60 text-kros-blue">+55</span>
                <input 
                  type="text" 
                  v-model="form.whatsapp" 
                  placeholder="(00) 00000-0000" 
                  class="w-full bg-kros-surface dark:bg-[#1A1A1A] border border-kros-outline dark:border-[#333333] rounded-lg pl-12 pr-4 py-3 text-kros-text dark:text-kros-surface text-sm outline-none focus:border-kros-blue focus:ring-1 focus:ring-kros-blue"
                />
              </div>
            </div>
             <div class="space-y-1.5">
                <label class="block text-sm font-medium text-white/70">Status Geral</label>
                <div @click="form.is_active = !form.is_active" class="flex items-center justify-between p-3 bg-kros-text/5 dark:bg-white/[0.03] border border-kros-outline dark:border-[#333333] rounded-lg cursor-pointer hover:border-kros-blue/20 transition-all">
                   <span class="text-xs font-medium text-white/80">{{ form.is_active ? 'Conta Ativa' : 'Conta Suspensa' }}</span>
                   <div :class="['w-2 h-2 rounded-full', form.is_active ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-red-500']"></div>
                </div>
             </div>
          </div>
        </div>

        <!-- 2. Configuração Financeira -->
        <div class="space-y-4">
          <h4 class="text-[10px] font-bold text-kros-blue uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
             <span class="w-1 h-1 bg-kros-blue rounded-full"></span> Detalhes da Assinatura
          </h4>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="space-y-1.5">
              <label class="block text-sm font-medium text-kros-text dark:text-kros-surface">Plano de Serviço</label>
              <select v-model="form.plan_name" class="w-full bg-kros-surface dark:bg-[#1A1A1A] border border-kros-outline dark:border-[#333333] rounded-lg px-4 py-3 text-kros-text dark:text-kros-surface text-sm transition-colors duration-200 outline-none focus:border-kros-blue focus:ring-1 focus:ring-kros-blue">
                <option value="" disabled>Selecione um plano...</option>
                <option v-for="plan in plans" :key="plan.id" :value="plan.name">
                  {{ plan.name }} - {{ plan.billing_cycle || 'Mensal' }}
                </option>
                <option value="Personalizado">Personalizado</option>
              </select>
            </div>

            <div class="space-y-1.5">
              <label class="block text-sm font-medium text-kros-text dark:text-kros-surface">Valor Total Faturamento (R$)</label>
              <input 
                type="number" 
                v-model="form.monthly_price" 
                :disabled="form.plan_name !== 'Personalizado'"
                placeholder="0.00" 
                step="0.01"
                class="w-full bg-kros-surface dark:bg-[#1A1A1A] border border-kros-outline dark:border-[#333333] rounded-lg px-4 py-3 text-kros-text dark:text-kros-surface text-sm transition-colors duration-200 outline-none focus:border-kros-blue focus:ring-1 focus:ring-kros-blue disabled:opacity-50 disabled:cursor-not-allowed"
                required
              />
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div class="space-y-1.5">
                <label class="block text-sm font-medium text-kros-text dark:text-kros-surface">Recorrência</label>
                <select v-model="form.billing_cycle" class="w-full bg-kros-surface dark:bg-[#1A1A1A] border border-kros-outline dark:border-[#333333] rounded-lg px-4 py-3 text-kros-text dark:text-kros-surface text-sm transition-colors duration-200 outline-none focus:border-kros-blue focus:ring-1 focus:ring-kros-blue">
                   <option value="Único">Pagamento Único</option>
                   <option value="Mensal">Mensal</option>
                   <option value="Trimestral">Trimestral</option>
                   <option value="Semestral">Semestral</option>
                   <option value="Anual">Anual</option>
                </select>
             </div>
             <div class="space-y-1.5">
                <label class="block text-sm font-medium text-kros-text dark:text-kros-surface">Dia do Vencimento</label>
                <input 
                  type="number" 
                  v-model="form.billing_day" 
                  min="1" 
                  max="31"
                  class="w-full bg-kros-surface dark:bg-[#1A1A1A] border border-kros-outline dark:border-[#333333] rounded-lg px-4 py-3 text-kros-text dark:text-kros-surface text-sm outline-none focus:border-kros-blue focus:ring-1 focus:ring-kros-blue"
                />
             </div>
          </div>
        </div>

        <!-- 3. Tags e Categorias -->
        <div class="space-y-4">
          <h4 class="text-[10px] font-bold text-kros-blue uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
             <span class="w-1 h-1 bg-kros-blue rounded-full"></span> Tags & Categorias
          </h4>

          <div class="space-y-3">
            <div class="flex flex-wrap gap-2 min-h-[40px] p-3 bg-kros-text/[0.03] dark:bg-white/[0.03] border border-kros-outline dark:border-[#1F1F21] rounded-2xl transition-all focus-within:border-kros-blue/40">
              <div 
                v-for="(tag, index) in form.tags" 
                :key="index"
                class="flex items-center gap-2 bg-kros-blue/10 text-kros-blue border border-kros-blue/20 px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-tight"
              >
                {{ tag }}
                <button @click.prevent="removeTag(index)" class="hover:text-red-500 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>
              <input 
                v-model="tagInput"
                @keydown.enter.prevent="addTag"
                @keydown.,.prevent="addTag"
                placeholder="Adicionar tag..."
                class="flex-1 bg-transparent border-none outline-none text-xs text-kros-text dark:text-kros-surface min-w-[120px]"
              />
            </div>
            <p class="text-[9px] font-medium text-white/70 uppercase tracking-widest pl-1">Aperte Enter ou vírgula para separar</p>
            
            <!-- Tag Suggestions -->
            <div v-if="tagDefinitions.length" class="flex flex-wrap gap-2 mt-2">
              <span class="text-[9px] font-bold text-white/80 uppercase tracking-tight py-1.5 mr-1">Sugestões:</span>
              <button 
                v-for="tagDef in tagSuggestions" 
                :key="tagDef.id"
                type="button"
                @click="addPredefinedTag(tagDef.name)"
                class="px-2.5 py-1 rounded-lg border text-[9px] font-black uppercase tracking-tighter transition-all hover:scale-110"
                :style="{ 
                  backgroundColor: `${tagDef.color}10`, 
                  color: tagDef.color, 
                  borderColor: `${tagDef.color}20` 
                }"
              >
                + {{ tagDef.name }}
              </button>
            </div>
          </div>
        </div>

        <!-- 4. Observações -->
        <div class="space-y-1.5">
           <label class="block text-sm font-medium text-kros-text dark:text-kros-surface">Observações do Negócio</label>
           <textarea 
             v-model="form.notes"
             rows="3"
             placeholder="Detalhes adicionais sobre o contrato ou perfil da empresa..."
             class="w-full bg-kros-surface dark:bg-[#1A1A1A] border border-kros-outline dark:border-[#333333] rounded-lg px-4 py-3 text-kros-text dark:text-kros-surface text-sm outline-none focus:border-kros-blue focus:ring-1 focus:ring-kros-blue resize-none"
           ></textarea>
        </div>

        <div class="pt-4 flex gap-4 sticky bottom-0 bg-kros-surface dark:bg-[#111112] py-4 border-t border-kros-outline dark:border-[#1F1F21] mt-auto">
          <button 
            type="button" 
            @click="close"
            class="flex-1 bg-kros-text/5 dark:bg-white/5 hover:bg-kros-text/10 dark:hover:bg-white/10 text-kros-text dark:text-kros-surface font-bold uppercase text-[10px] tracking-widest py-4 rounded-xl transition-all"
          >
            Voltar
          </button>
          <UiKButton 
            type="submit" 
            class="flex-1 !py-4 uppercase text-[10px] tracking-widest font-bold"
          >
            {{ loading ? 'Sincronizando...' : (isEditing ? 'Salvar Alterações' : 'Criar Empresa') }}
          </UiKButton>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch, onMounted, computed } from 'vue'
import { useTags } from '~/composables/useTags'
import { usePlans } from '~/composables/usePlans'

const props = defineProps<{
  isOpen: boolean
  company?: any
  loading?: boolean
}>()

const emit = defineEmits(['close', 'save'])

const isEditing = ref(false)
const form = reactive({
  id: undefined,
  name: '',
  representative_name: '',
  email: '',
  whatsapp: '',
  notes: '',
  plan_name: 'Plano Light',
  monthly_price: 99,
  billing_cycle: 'Mensal',
  billing_day: 5,
  is_active: true,
  tags: [] as string[]
})

const { tags: tagDefinitions, fetchTags } = useTags()
const { plans, fetchPlans } = usePlans()
const tagInput = ref('')

const tagSuggestions = computed(() => {
  return tagDefinitions.value.filter(td => !form.tags.includes(td.name))
})

const addTag = () => {
  const val = tagInput.value.trim().replace(',', '')
  if (val && !form.tags.includes(val)) {
    form.tags.push(val)
  }
  tagInput.value = ''
}

const addPredefinedTag = (name: string) => {
  if (!form.tags.includes(name)) {
    form.tags.push(name)
  }
}

const removeTag = (index: number) => {
  form.tags.splice(index, 1)
}

onMounted(() => {
  fetchTags()
  fetchPlans() // Carrega planos do Supabase
})

// Watcher para preencher valor automaticamente ao mudar o plano
watch(() => form.plan_name, (newPlanName) => {
  if (newPlanName && newPlanName !== 'Personalizado') {
    const selectedPlan = plans.value.find(p => p.name === newPlanName)
    if (selectedPlan && props.company && props.company.plan_name !== newPlanName) {
       form.monthly_price = selectedPlan.price
    } else if (selectedPlan && !props.company) {
       form.monthly_price = selectedPlan.price
    }
  }
})


const resetForm = () => {
  form.id = undefined
  form.name = ''
  form.representative_name = ''
  form.email = ''
  form.whatsapp = ''
  form.notes = ''
  form.plan_name = 'Plano Light'
  form.monthly_price = 99
  form.billing_cycle = 'Mensal'
  form.billing_day = 5
  form.is_active = true
  form.tags = []
  tagInput.value = ''
}

const handleSave = () => {
  emit('save', { ...form })
}

const close = () => {
  emit('close')
}

watch(() => props.company, (newVal) => {
  if (newVal) {
    isEditing.value = true
    form.id = newVal.id
    form.name = newVal.name || ''
    form.representative_name = newVal.representative_name || ''
    form.email = newVal.email || ''
    form.whatsapp = newVal.whatsapp || ''
    form.notes = newVal.notes || ''
    form.plan_name = newVal.plan_name || 'Plano Light'
    form.monthly_price = newVal.monthly_price || 0
    form.billing_cycle = newVal.billing_cycle || 'Mensal'
    form.billing_day = newVal.billing_day || 1
    form.is_active = newVal.is_active
    form.tags = newVal.tags || []
  } else {
    isEditing.value = false
    resetForm()
  }
}, { immediate: true })
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(0, 123, 255, 0.1);
  border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 123, 255, 0.3);
}
</style>
