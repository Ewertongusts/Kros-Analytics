import { ref } from 'vue'
import { useBatchMessaging } from './useBatchMessaging'

export const useBatchSending = () => {
  const { compileTemplate, isWithinSkipLimit, fetchLastSentRecords, sendMessage, logMessage } = useBatchMessaging()
  
  const submitting = ref(false)
  const progress = ref(0)
  const countdown = ref(0)
  const currentCompanyName = ref('')
  const errors = ref<{company: string, error: string}[]>([])
  const sentStatus = ref<Record<string, 'pending' | 'sending' | 'success' | 'error' | 'skipped'>>({})
  const lastSentRecords = ref<Record<string, any>>({})

  const initializeStatus = (payments: any[]) => {
    payments.forEach(p => {
      sentStatus.value[p.id] = 'pending'
    })
  }

  const loadLastSentRecords = async (payments: any[]) => {
    lastSentRecords.value = await fetchLastSentRecords(payments)
  }

  const checkSkipLimit = (paymentId: string, skipDays: number) => {
    const record = lastSentRecords.value[paymentId]
    if (!record) return false
    return isWithinSkipLimit(record.created_at, skipDays)
  }

  const sendBatch = async (params: {
    payments: any[]
    templates: any[]
    selectedTemplateIds: string[]
    manualMessage: string
    settings: any
    skipRecent: boolean
    skipRecentDays: number
    onClose: () => boolean
  }) => {
    const { payments, templates, selectedTemplateIds, manualMessage, settings, skipRecent, skipRecentDays, onClose } = params
    
    if (!settings?.api_url || selectedTemplateIds.length === 0) return
    
    const activeTemplates = templates.filter(t => t && t.id && selectedTemplateIds.includes(t.id))
    if (activeTemplates.length === 0 && !manualMessage) return

    submitting.value = true
    progress.value = 0
    errors.value = []
    countdown.value = 0
    currentCompanyName.value = ''
    
    let messagesSentInCurrentBatch = 0

    for (let i = 0; i < payments.length; i++) {
      const payment = payments[i]
      currentCompanyName.value = payment.company_name

      // Check Skip Filter
      if (skipRecent && checkSkipLimit(payment.id, skipRecentDays)) {
        sentStatus.value[payment.id] = 'skipped'
        progress.value++
        continue
      }

      sentStatus.value[payment.id] = 'sending'
      
      // Check for Long Break
      const breakAfter = settings.break_after || 10
      if (messagesSentInCurrentBatch > 0 && messagesSentInCurrentBatch % breakAfter === 0) {
        const bMin = (settings.break_delay_min || 5) * 60
        const bMax = (settings.break_delay_max || 10) * 60
        const breakTime = Math.floor(Math.random() * (bMax - bMin + 1)) + bMin
        
        for (let c = breakTime; c > 0; c--) {
          countdown.value = c
          await new Promise(resolve => setTimeout(resolve, 1000))
          if (!onClose()) return // Interrompe se fechar
        }
        countdown.value = 0
        messagesSentInCurrentBatch = 0
      }

      let bodyToUse = manualMessage
      if (selectedTemplateIds.length > 1) {
        const tmpl = activeTemplates[Math.floor(Math.random() * activeTemplates.length)]
        if (tmpl) bodyToUse = tmpl.body
      }
      
      try {
        const rawNum = payment.company_whatsapp?.replace(/\D/g, '') || ''
        
        // Validação: Verificar se tem número válido
        if (!rawNum || rawNum.length < 10) {
          throw new Error('Número de WhatsApp inválido ou não cadastrado')
        }
        
        const compiledMessage = compileTemplate(bodyToUse, payment)
        
        await sendMessage(rawNum, compiledMessage)

        await logMessage({
          company_name: payment.company_name,
          whatsapp: rawNum,
          message_body: compiledMessage,
          status: 'Sucesso - Batch HTTP',
          payment_id: payment.id
        })

        messagesSentInCurrentBatch++
        sentStatus.value[payment.id] = 'success'

      } catch (err: any) {
        console.error(`Erro ao enviar para ${payment.company_name}:`, err)
        errors.value.push({ company: payment.company_name, error: err.message })
        sentStatus.value[payment.id] = 'error'
        
        await logMessage({
          company_name: payment.company_name,
          whatsapp: payment.company_whatsapp || 'N/A',
          message_body: bodyToUse,
          status: `Falha (Batch HTTP): ${err.message}`,
          payment_id: payment.id
        })
      } finally {
        progress.value++
      }
      
      // Delay randômico entre mensagens (se não for a última)
      if (i < payments.length - 1) {
        const dMin = settings.delay_min || 15
        const dMax = settings.delay_max || 30
        const randomDelay = Math.floor(Math.random() * (dMax - dMin + 1)) + dMin
        
        for (let c = randomDelay; c > 0; c--) {
          countdown.value = c
          await new Promise(resolve => setTimeout(resolve, 1000))
          if (!onClose()) return // Parar se fechar
        }
        countdown.value = 0
      }
    }

    submitting.value = false
    currentCompanyName.value = ''
    
    return errors.value
  }

  const reset = () => {
    submitting.value = false
    progress.value = 0
    countdown.value = 0
    currentCompanyName.value = ''
    errors.value = []
    sentStatus.value = {}
    lastSentRecords.value = {}
  }

  return {
    submitting,
    progress,
    countdown,
    currentCompanyName,
    errors,
    sentStatus,
    lastSentRecords,
    initializeStatus,
    loadLastSentRecords,
    checkSkipLimit,
    sendBatch,
    reset
  }
}
