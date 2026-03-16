<template>
  <div v-if="isOpen" :class="[
    'fixed z-[200] transition-all duration-500 ease-in-out',
    isMinimized 
      ? 'bottom-8 right-8 w-80 pointer-events-none' 
      : 'inset-0 flex items-center justify-center px-4 pointer-events-auto'
  ]">
    <!-- Overlay -->
    <div 
      v-if="!isMinimized"
      @click="!submitting ? $emit('close') : isMinimized = true" 
      class="absolute inset-0 bg-black/90 backdrop-blur-xl transition-opacity duration-500"
    ></div>
    
    <div :class="[
      'relative bg-[#0D0D0E] border border-white/10 overflow-hidden transition-all duration-500 pointer-events-auto flex flex-col',
      isMinimized ? 'rounded-3xl p-5 w-full shadow-2xl h-auto' : 'rounded-[2rem] w-full max-w-xl max-h-[85vh]'
    ]">
      
      <!-- Widget Minimizado -->
      <FinanceBatchKBatchMinimizedWidget
        v-if="isMinimized"
        :progress="progress"
        :total="payments.length"
        :countdown="countdown"
        @expand="isMinimized = false"
      />

      <!-- Header Full -->
      <FinanceBatchKBatchMsgHeader
        v-if="!isMinimized"
        :recipient-count="payments.length"
        :show-minimize="submitting"
        :show-list="showChecklist"
        @minimize="isMinimized = true"
        @toggle-list="showChecklist = !showChecklist"
      />
      
      <!-- Lista de Destinatários -->
      <FinanceBatchKBatchMsgRecipientList
        v-if="!isMinimized && showChecklist"
        :payments="payments"
        :sent-status="sentStatus"
        :skip-recent="skipRecent"
        :check-skip-limit="checkSkipLimit"
      />

      <!-- Main Content (Scrollable) -->
      <div v-if="!isMinimized" class="flex-1 overflow-y-auto p-6 custom-scrollbar space-y-6">
        <div v-if="loading" class="flex justify-center py-10 opacity-30">
          <svg class="animate-spin text-kros-blue" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
        </div>

        <div v-else class="space-y-6">
          <template v-if="!submitting">
            <!-- Template Selector -->
            <FinanceBatchKBatchMsgTemplateSelector
              v-model:selected-ids="selectedTemplateIds"
              v-model:manual-message="manualMessage"
              :templates="templates"
            />

            <!-- Message Editor -->
            <FinanceBatchKBatchMsgEditor v-model="manualMessage" />

            <!-- Skip Filter -->
            <FinanceBatchKBatchMsgSkipFilter
              v-model="skipRecent"
              v-model:days="skipRecentDays"
            />

          </template>

          <!-- Progress -->
          <FinanceBatchKBatchMsgProgress
            :progress="progress"
            :total="payments.length"
            :current-company="currentCompanyName"
            :countdown="countdown"
          />
        </div>
      </div>

      <!-- Action Footer (Fixed) -->
      <div v-if="!isMinimized" class="p-6 border-t border-white/5 bg-black/40">
        <div class="flex gap-3">
          <button 
            type="button" 
            @click="$emit('close')"
            class="flex-1 py-4 text-xs font-black uppercase tracking-widest text-white/20 hover:text-white transition-all"
          >
            Sair
          </button>
          <button 
            v-if="!submitting"
            @click="handleSendBatch"
            :disabled="selectedTemplateIds.length === 0 || !settings?.api_url"
            class="flex-[2] btn-primary py-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-2xl"
          >
            DISPARAR AGORA
          </button>
          <button 
            v-else
            @click="isMinimized = true"
            class="flex-[2] bg-kros-blue py-4 rounded-xl text-xs font-black uppercase text-white hover:opacity-90 transition-all"
          >
            MINIMIZAR
          </button>
        </div>
      </div>

      <!-- Glow -->
      <div v-if="!isMinimized" class="absolute -top-20 -left-20 w-48 h-48 bg-kros-blue/10 rounded-full blur-[80px] pointer-events-none"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import { useCrm } from '~/composables/useCrm'
import { useBatchSending } from '~/composables/useBatchSending'
import { useRouter } from 'vue-router'

const props = defineProps<{
  isOpen: boolean
  payments: any[]
}>()

const emit = defineEmits(['close', 'sent'])

const { settings, templates, loading, fetchCrmData } = useCrm()
const { 
  submitting, 
  progress, 
  countdown, 
  sentStatus, 
  initializeStatus, 
  loadLastSentRecords, 
  checkSkipLimit,
  sendBatch,
  currentCompanyName
} = useBatchSending()

const isMinimized = ref(false)
const showChecklist = ref(false)
const selectedTemplateIds = ref<string[]>([])
const manualMessage = ref('')
const skipRecent = ref(true)
const skipRecentDays = ref(3)

onMounted(async () => {
  await fetchCrmData()
  
  // Seleciona o template padrão
  if (templates.value && templates.value.length > 0) {
    const defaultTmpl = templates.value.find(t => t.is_default)
    if (defaultTmpl?.id) {
      selectedTemplateIds.value = [defaultTmpl.id]
      manualMessage.value = defaultTmpl.body
    } else {
      const first = templates.value[0]
      if (first?.id) {
        selectedTemplateIds.value = [first.id]
        manualMessage.value = first.body
      }
    }
  }

  // Inicializa status
  initializeStatus(props.payments)
  await loadLastSentRecords(props.payments)

  // Bloquear navegação durante envio
  const router = useRouter()
  const { warning } = useToast()
  
  const unsubscribe = router.beforeEach((to, from, next) => {
    if (submitting.value) {
      warning('Campanha em andamento!', 'Aguarde a conclusão antes de sair da página.')
      next(false)
    } else {
      next()
    }
  })

  onBeforeUnmount(() => {
    unsubscribe()
  })
})

const handleSendBatch = async () => {
  const { success, warning } = useToast()
  
  const errors = await sendBatch({
    payments: props.payments,
    templates: templates.value,
    selectedTemplateIds: selectedTemplateIds.value,
    manualMessage: manualMessage.value,
    settings: settings.value,
    skipRecent: skipRecent.value,
    skipRecentDays: skipRecentDays.value,
    onClose: () => props.isOpen
  })

  isMinimized.value = false
  
  if (errors && errors.length === 0) {
    success('Campanha finalizada', 'Todas as mensagens foram enviadas com sucesso!')
  } else if (errors) {
    warning('Campanha finalizada com erros', `${errors.length} mensagens falharam. Verifique os logs.`)
  }
  
  emit('sent')
}
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.1);
}
</style>
