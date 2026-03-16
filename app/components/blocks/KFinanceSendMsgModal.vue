<template>
  <UiKModal :is-open="isOpen" size="sm" @close="$emit('close')">
    <div class="mb-2 text-center relative z-10">
      <div class="w-8 h-8 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-500 mx-auto mb-1.5 border border-emerald-500/20">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 448 512" fill="currentColor">
          <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l115.3-30.2c32.4 17.7 68.8 27 108.6 27 122.4 0 222-99.6 222-222 0-59.3-23-115.1-65-157.1zM223.9 446.7c-33.1 0-65.6-8.9-93.9-25.7l-6.7-4-69.8 18.3 18.7-68.1-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 54 81.2 54.1 130.5 0 101.7-82.8 184.5-184.6 184.5zm100.5-137c-5.5-2.8-32.6-16.1-37.7-17.9-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-5.5-2.8-23.2-8.5-44.2-27.2-16.4-14.6-27.4-32.7-30.6-38.2-3.2-5.6-.3-8.6 2.5-11.3 2.5-2.5 5.5-6.5 8.3-9.7 2.8-3.2 3.7-5.5 5.6-9.2 1.9-3.7 1-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 13.2 5.7 23.5 9.2 31.6 11.8 13.3 4.2 25.4 3.6 35 2.2 10.7-1.6 32.6-13.3 37.2-26.2 4.6-12.9 4.6-24 3.2-26.2-1.4-2.3-5.1-3.7-10.6-6.5z"/>
        </svg>
      </div>
      <h3 class="text-sm font-black uppercase tracking-tight text-white leading-none">
        ENVIAR <span class="text-kros-blue">MENSAGEM</span>
      </h3>
          <!-- Recipient info card -->
          <div class="mt-2 flex items-center justify-center gap-2 bg-white/[0.02] border border-white/5 rounded-xl px-3 py-1.5">
            <div class="flex items-center justify-center w-6 h-6 rounded-lg bg-kros-blue/10 text-kros-blue shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.62 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 8.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92Z"/></svg>
            </div>
            <div class="text-left">
              <p class="text-[7px] text-white/30 uppercase tracking-[0.2em] font-black leading-none">Destinatário</p>
              <p class="text-[10px] font-black text-white mt-0.5">{{ payment?.company_name }}</p>
              <p class="text-kros-blue text-[8px] font-bold tracking-wider">{{ payment?.company_whatsapp }}</p>
            </div>
          </div>


      <!-- Alerta de "Já Enviado" -->
      <div v-if="lastSentRecord" class="mt-2 p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center gap-2">
        <div class="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-500 flex items-center justify-center shrink-0">
           <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
        </div>
        <div class="text-left">
           <p class="text-[7px] font-black text-amber-500 uppercase tracking-widest leading-none">Atenção!</p>
           <p class="text-[9px] font-bold text-white mt-0.5 whitespace-nowrap">Cobrança enviada em <span class="text-amber-400">{{ formatDateTime(lastSentRecord.created_at) }}</span></p>
        </div>
      </div>
    </div>

    <div v-if="loading" class="flex justify-center py-6">
       <svg class="animate-spin text-kros-blue" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
    </div>

    <form v-else @submit.prevent="handleSend" class="space-y-3 relative z-10">

        <div class="space-y-1.5">
          <label class="text-[9px] font-semibold text-white/50 uppercase tracking-[0.2em] pl-1">Modelo de Mensagem</label>
          <select 
            v-model="selectedTemplateId"
            required
            class="w-full bg-[#111112] border border-white/10 rounded-xl px-3 py-2 text-[10px] text-white outline-none focus:border-kros-blue transition-all font-medium appearance-none"
          >
            <option value="" disabled>Selecione um modelo...</option>
            <option v-for="tmpl in templates" :key="tmpl.id" :value="tmpl.id">
              {{ tmpl.name }}
            </option>
          </select>
        </div>

        <div class="space-y-1.5">
            <label class="text-[9px] font-semibold text-kros-blue uppercase tracking-[0.2em] pl-1">Prévia da Mensagem</label>
            <div class="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-[11px] text-white/80 leading-relaxed max-h-[120px] overflow-y-auto custom-scrollbar shadow-inner whitespace-pre-wrap">
              {{ compiledMessage || 'Selecione um modelo...' }}
            </div>
        </div>

      <UiKModalActions
        cancel-text="Sair"
        confirm-text="Enviar Cobrança"
        :loading="submitting"
        :disabled="!selectedTemplateId || !settings?.api_url"
        submit-type="submit"
        @cancel="$emit('close')"
      />

      <!-- Resposta da API (debug / feedback) -->
      <div v-if="apiResult" :class="[
        'mt-3 rounded-xl p-3 border text-[10px] font-mono leading-relaxed whitespace-pre-wrap break-all',
        apiResult.ok
          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
          : 'bg-red-500/10 border-red-500/30 text-red-300'
      ]">
        <p class="text-[8px] font-bold uppercase tracking-widest mb-1.5 opacity-60">
          {{ apiResult.ok ? '✅ Resposta da API (Sucesso)' : '❌ Resposta da API (Erro)' }}
        </p>
        {{ apiResult.body }}
      </div>
    </form>
  </UiKModal>
</template>

<script setup lang="ts">
import { ref, watch, computed, onMounted } from 'vue'
import { useCrm } from '~/composables/useCrm'

const props = defineProps<{
  isOpen: boolean
  payment: any
}>()

const emit = defineEmits(['close', 'sent'])

const { settings, templates, loading, fetchCrmData } = useCrm()
const submitting = ref(false)
const selectedTemplateId = ref('')
const apiResult = ref<{ ok: boolean; body: string } | null>(null)
const lastSentRecord = ref<any>(null)

const fetchLastSent = async () => {
   if (!props.payment?.company_name) return
   try {
      const { data, error } = await (useSupabaseClient() as any)
         .from('message_logs')
         .select('*')
         .eq('company_name', props.payment.company_name)
         .or('status.ilike.%Sucesso%,status.ilike.%Enviado%')
         .order('created_at', { ascending: false })
         .limit(1)
         .single()
      
      if (data) lastSentRecord.value = data
   } catch (err) {
      // Ignora erro se não encontrar nada
   }
}

const formatDateTime = (date: string) => {
   if (!date) return '-'
   return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(date))
}

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)
}

const formatDate = (date: string) => {
  if (!date) return '-'
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(date))
}

const compiledMessage = computed(() => {
  if (!selectedTemplateId.value) return ''
  const tmpl = templates.value.find(t => t.id === selectedTemplateId.value)
  if (!tmpl) return ''
  
  let msg = tmpl.body || ''
  if (props.payment) {
    msg = msg.replace(/\{\{empresa\}\}/g, props.payment.company_name)
    msg = msg.replace(/\{\{valor\}\}/g, formatCurrency(props.payment.amount))
    msg = msg.replace(/\{\{vencimento\}\}/g, formatDate(props.payment.due_date))
    msg = msg.replace(/\{\{plano\}\}/g, props.payment.plan_name)
  }
  return msg
})

// Auto-selecionar template padrão
watch(templates, (newTemplates) => {
  if (newTemplates.length > 0 && !selectedTemplateId.value) {
    const defaultTmpl = newTemplates.find(t => t.is_default)
    if (defaultTmpl) {
      selectedTemplateId.value = defaultTmpl.id || ''
    }
  }
}, { immediate: true })

onMounted(async () => {
  await fetchCrmData()
  // Segunda tentativa caso o watch immediate não tenha pegado por timing
  if (templates.value.length > 0 && !selectedTemplateId.value) {
    const defaultTmpl = templates.value.find(t => t.is_default)
    if (defaultTmpl) selectedTemplateId.value = defaultTmpl.id || ''
  }
  fetchLastSent()
})

const handleSend = async () => {
  if (!settings.value?.api_url) return
  
  // Validação: Verificar se tem número válido
  let rawNum = props.payment.company_whatsapp?.replace(/\D/g, '') || ''
  
  // Garantir que o número tenha o código do país (55)
  if (rawNum && !rawNum.startsWith('55')) {
    rawNum = '55' + rawNum
  }
  
  if (!rawNum || rawNum.length < 12) { // Mínimo: 55 + DDD (2) + número (8/9)
    apiResult.value = { ok: false, body: 'Número de WhatsApp inválido ou não cadastrado. Por favor, cadastre um número válido antes de enviar mensagens.' }
    return
  }
  
  console.log('📱 [handleSend] Número formatado:', rawNum)
  
  submitting.value = true
  apiResult.value = null
  try {
    // Usamos a nossa rota de proxy no Backend (Nitro) para evitar bloqueio de CORS do Navegador
    const response = await fetch('/api/messages/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ number: rawNum, body: compiledMessage.value })
    })

    // Tenta capturar o corpo da resposta como texto sempre
    let bodyText = ''
    try { bodyText = await response.text() } catch { bodyText = '(sem corpo na resposta)' }

    apiResult.value = { ok: response.ok, body: bodyText }

    if (response.ok) {
      emit('sent')
      
      // Mostrar notificação de sucesso
      const { success } = useToast()
      success('Mensagem enviada', `Cobrança enviada para ${props.payment.company_name}`)
      
      // Atualizar last_alert_at no banco de dados
      try {
        await (useSupabaseClient() as any)
          .from('payments')
          .update({ last_alert_at: new Date().toISOString() })
          .eq('company_id', props.payment.company_id)
      } catch (err) {
        console.error('Erro ao atualizar last_alert_at:', err)
      }
      
      // Cria log
      await (useSupabaseClient() as any).from('message_logs').insert({
         company_id: props.payment.company_id,
         company_name: props.payment.company_name,
         whatsapp: rawNum,
         message_body: compiledMessage.value,
         status: 'Sucesso - Enviado (Manual)',
         is_cron: false
      })
    } else {
      // Mostrar notificação de erro
      const { error } = useToast()
      error('Erro ao enviar', `Não foi possível enviar para ${props.payment.company_name}`)
      
      await (useSupabaseClient() as any).from('message_logs').insert({
         company_id: props.payment.company_id,
         company_name: props.payment.company_name,
         whatsapp: rawNum,
         message_body: compiledMessage.value,
         status: 'Erro de Envio (Manual)',
         is_cron: false
      })
    }
  } catch (err: any) {
    console.error('Erro ao enviar mensagem:', err)
    
    // Mostrar notificação de erro
    const { error } = useToast()
    error('Erro ao enviar', err?.message || 'Erro de rede desconhecido')
    
    apiResult.value = { ok: false, body: err?.message || 'Erro de rede desconhecido' }
    await (useSupabaseClient() as any).from('message_logs').insert({
       company_id: props.payment.company_id,
       company_name: props.payment.company_name,
       whatsapp: props.payment.company_whatsapp || 'N/A',
       message_body: compiledMessage.value,
       status: `Falha (Manual): ${err?.message}`,
       is_cron: false
    })
  } finally {
    submitting.value = false
  }
}
</script>
