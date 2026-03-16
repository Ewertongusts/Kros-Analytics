<template>
  <div v-if="isOpen" class="fixed inset-0 z-[200] flex items-center justify-center px-4">
    <div @click="$emit('close')" class="absolute inset-0 bg-black/90 backdrop-blur-xl"></div>
    
    <div class="relative bg-[#0D0D0E] border border-white/10 rounded-[2.5rem] w-full max-w-md p-6 overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.8)]">
      <div class="mb-4 text-center relative z-10">
        <div class="w-10 h-10 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500 mx-auto mb-2 border border-emerald-500/20">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/></svg>
        </div>
        <h3 class="text-base font-bold uppercase tracking-tight text-white">
          ATIVAR <span class="text-emerald-500">AUTOMAÇÃO</span>
        </h3>
        <p class="text-[8px] text-white/50 uppercase tracking-widest mt-0.5">
          Escolha o período para envio automático
        </p>

        <!-- Recipient info card -->
        <div class="mt-2 flex flex-col items-center justify-center gap-0.5 bg-white/[0.02] border border-white/5 rounded-xl p-2">
          <p class="text-[8px] text-white/40 uppercase tracking-widest font-semibold">Empresa</p>
          <p class="text-xs font-bold text-white leading-tight">{{ payment?.company_name }}</p>
          <p class="text-emerald-400 text-[10px] font-semibold">{{ payment?.company_whatsapp }}</p>
        </div>
      </div>

      <!-- Se já tem CRON ativo: mostrar horário agendado -->
      <div v-if="payment?.cron_enabled && !showPeriodSelection" class="space-y-3 relative z-10">
        <div class="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
          <p class="text-[8px] text-emerald-400 uppercase tracking-widest font-bold mb-2">✓ Agendado</p>
          <div class="space-y-1 text-[10px]">
            <div class="flex items-center justify-between">
              <span class="text-white/70">Horário:</span>
              <span class="text-emerald-400 font-bold">{{ payment?.cron_scheduled_time }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-white/70">Próxima:</span>
              <span class="text-emerald-400 font-bold">{{ formatDate(payment?.cron_next_execution) }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-white/70">Período:</span>
              <span class="text-emerald-400 font-bold capitalize">{{ getPeriodLabel(payment?.cron_period) }}</span>
            </div>
          </div>
        </div>

        <div class="flex gap-2">
          <button 
            @click="showPeriodSelection = true"
            class="flex-1 py-2 text-[9px] font-semibold uppercase tracking-widest text-white/40 hover:text-white hover:bg-white/5 rounded-lg transition-all"
          >
            Alterar
          </button>
          <button 
            @click="handleDisableCron"
            :disabled="submitting"
            class="flex-1 py-2 text-[9px] font-semibold uppercase tracking-widest text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all disabled:opacity-50"
          >
            Desativar
          </button>
        </div>
      </div>

      <!-- Se não tem CRON: mostrar seleção de período -->
      <form v-else @submit.prevent="handleConfirm" class="space-y-3 relative z-10">
        
        <!-- Seleção de Período -->
        <div class="space-y-1.5">
          <label class="text-[8px] font-semibold text-white/50 uppercase tracking-[0.2em] pl-1">
            Período
          </label>
          <div class="grid grid-cols-3 gap-2">
            <button
              v-for="(period, key) in periodOptions"
              :key="key"
              type="button"
              @click="selectedPeriod = key as any"
              :class="[
                'py-2 px-2 rounded-lg text-[9px] font-bold uppercase tracking-widest transition-all',
                selectedPeriod === key
                  ? 'bg-emerald-500 text-black border border-emerald-400'
                  : 'bg-white/5 text-white/70 border border-white/10 hover:border-white/20'
              ]"
            >
              {{ period.label }}
            </button>
          </div>
        </div>

        <!-- Preview do horário -->
        <div v-if="selectedPeriod" class="p-2.5 bg-white/[0.02] border border-emerald-500/20 rounded-lg">
          <p class="text-[8px] text-white/50 uppercase tracking-widest mb-1">Horário</p>
          <p class="text-xl font-bold text-emerald-400">{{ previewTime }}</p>
          <p class="text-[8px] text-white/40 mt-0.5">Próxima: {{ previewNextExecution }}</p>
        </div>

        <!-- Seleção de Modelo -->
        <div class="space-y-1">
          <label class="text-[8px] font-semibold text-white/50 uppercase tracking-[0.2em] pl-1">
            Modelo de Mensagem
          </label>
          <select 
            v-model="selectedTemplateId"
            @change="applyTemplate"
            class="w-full bg-[#111112] border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-emerald-500 transition-all font-medium appearance-none"
          >
            <option value="">Padrão do Sistema...</option>
            <option v-for="tmpl in templates" :key="tmpl.id" :value="tmpl.id">
              {{ tmpl.name }}
            </option>
          </select>
        </div>

        <!-- Preview da Mensagem -->
        <div v-if="customMessageText" class="p-2.5 bg-white/[0.02] border border-white/10 rounded-lg">
          <p class="text-[8px] text-white/50 uppercase tracking-widest mb-1">Prévia da Mensagem</p>
          <p class="text-[10px] text-white/80 leading-relaxed whitespace-pre-wrap break-words">{{ customMessageText }}</p>
        </div>

        <div class="flex gap-2 pt-2 border-t border-white/5">
          <button 
            type="button"
            @click="$emit('close')"
            class="flex-1 py-2 text-[9px] font-semibold uppercase tracking-widest text-white/40 hover:text-white hover:bg-white/5 rounded-lg transition-all"
          >
            Cancelar
          </button>
          <button 
            type="submit"
            :disabled="submitting || !selectedPeriod || !customMessageText"
            class="flex-[2] btn-primary !bg-emerald-500 hover:!bg-emerald-400 py-2 rounded-lg text-[9px] font-bold text-black uppercase tracking-widest transition-all disabled:opacity-50 flex items-center justify-center gap-1"
          >
            <svg v-if="submitting" class="animate-spin text-black" xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
            <span v-else>Agendar</span>
          </button>
        </div>
      </form>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useCronScheduler } from '~/composables/useCronScheduler'
import { useCrm } from '~/composables/useCrm'
import { useToast } from '~/composables/useToast'

const props = defineProps<{
  isOpen: boolean
  payment: any
}>()

const emit = defineEmits(['close', 'confirm'])

const { calculateNextExecution, getPeriodLabel, formatDate } = useCronScheduler()
const { templates, loading, fetchCrmData } = useCrm()
const { success, error } = useToast()

const selectedPeriod = ref<'morning' | 'afternoon' | 'evening' | null>(null)
const selectedTemplateId = ref('')
const customMessageText = ref('')
const submitting = ref(false)
const showPeriodSelection = ref(false)

const periodOptions = {
  morning: { label: 'Manhã', range: '7h - 11h' },
  afternoon: { label: 'Tarde', range: '11h - 14h' },
  evening: { label: 'Noite', range: '14h - 19h' }
}

const previewTime = computed(() => {
  if (!selectedPeriod.value) return ''
  const { time } = calculateNextExecution(selectedPeriod.value)
  return time
})

const previewNextExecution = computed(() => {
  if (!selectedPeriod.value) return ''
  const { nextExecution } = calculateNextExecution(selectedPeriod.value)
  return formatDate(nextExecution)
})

const handleConfirm = async () => {
  if (!selectedPeriod.value) return
  
  submitting.value = true
  try {
    const { time, nextExecution } = calculateNextExecution(selectedPeriod.value)
    
    emit('confirm', {
      message: customMessageText.value,
      period: selectedPeriod.value,
      scheduledTime: time,
      nextExecution: nextExecution.toISOString()
    })
  } finally {
    submitting.value = false
  }
}

const handleDisableCron = async () => {
  submitting.value = true
  try {
    emit('confirm', { action: 'disable' })
  } finally {
    submitting.value = false
  }
}

const applyTemplate = () => {
  if (selectedTemplateId.value) {
    const tmpl = templates.value.find(t => t.id === selectedTemplateId.value)
    if (tmpl) {
      customMessageText.value = tmpl.body
    }
  } else {
    // Usar padrão do sistema
    customMessageText.value = 'Olá {{empresa}}!\nAviso da sua mensalidade referente ao plano: {{plano}}.\n\nFatura no valor de {{valor}} com vencimento até o dia {{vencimento}}.\nObrigado!'
  }
}

onMounted(async () => {
  await fetchCrmData()
  
  if (!props.payment?.cron_enabled) {
    showPeriodSelection.value = true
  } else {
    showPeriodSelection.value = false
  }
  
  // Carregar mensagem padrão ou do template
  if (props.payment?.cron_message) {
    customMessageText.value = props.payment.cron_message
  } else if (templates.value && templates.value.length > 0) {
    const firstTemplate = templates.value[0] as any
    customMessageText.value = firstTemplate.body || ''
    selectedTemplateId.value = firstTemplate.id || ''
  } else {
    customMessageText.value = 'Olá {{empresa}}!\nAviso da sua mensalidade referente ao plano: {{plano}}.\n\nFatura no valor de {{valor}} com vencimento até o dia {{vencimento}}.\nObrigado!'
  }
})
</script>
