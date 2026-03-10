<template>
  <div v-if="isOpen" class="fixed inset-0 z-[200] flex items-center justify-center px-4">
    <div @click="$emit('close')" class="absolute inset-0 bg-black/90 backdrop-blur-xl"></div>
    
      <div class="relative bg-[#0D0D0E] border border-white/10 rounded-[2.5rem] w-full max-w-lg p-8 overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.8)]">
        <div class="mb-8 text-center relative z-10">
          <div class="w-12 h-12 bg-kros-blue/10 rounded-2xl flex items-center justify-center text-kros-blue mx-auto mb-4 border border-kros-blue/20 shadow-[0_0_30px_rgba(0,123,255,0.2)]">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 2 11 13"/><path d="m22 2-7 20-4-9-9-4Z"/></svg>
          </div>
          <h3 class="text-lg font-bold italic uppercase tracking-tighter text-white">
            ENVIAR <span class="text-kros-blue text-glow-blue">MENSAGEM</span>
          </h3>
          <p class="text-[10px] text-white/50 uppercase tracking-widest mt-1">Para: <span class="text-white">{{ payment?.company_name }}</span> ({{ payment?.company_whatsapp }})</p>
        </div>

      <div v-if="loading" class="flex justify-center py-10">
         <svg class="animate-spin text-kros-blue" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
      </div>

      <form v-else @submit.prevent="handleSend" class="space-y-6 relative z-10">
        
        <div v-if="!settings?.api_token || !settings?.api_url" class="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[10px] font-bold uppercase tracking-widest text-center">
            Atenção: A API de envio não está configurada no painel.
        </div>

        <div class="space-y-2">
          <label class="text-[10px] font-semibold text-white/50 uppercase tracking-[0.2em] pl-1">Modelo de Mensagem</label>
          <select 
            v-model="selectedTemplateId"
            required
            class="w-full bg-[#111112] border border-white/10 rounded-xl px-4 py-3.5 text-xs text-white outline-none focus:border-kros-blue transition-all font-medium appearance-none"
          >
            <option value="" disabled>Selecione um modelo...</option>
            <option v-for="tmpl in templates" :key="tmpl.id" :value="tmpl.id">
              {{ tmpl.name }}
            </option>
          </select>
        </div>

        <div class="space-y-2">
            <label class="text-[10px] font-semibold text-kros-blue uppercase tracking-[0.2em] pl-1">Prévia da Mensagem</label>
            <div class="w-full bg-kros-blue/5 border border-kros-blue/20 rounded-xl p-5 text-sm text-white/90 leading-relaxed font-medium min-h-[120px] shadow-inner whitespace-pre-wrap">
              {{ compiledMessage || 'Selecione um modelo para ver a prévia...' }}
            </div>
        </div>

        <div class="flex gap-3 pt-4 border-t border-white/5">
          <button 
            type="button"
            @click="$emit('close')"
            class="flex-1 py-3.5 text-[10px] font-semibold uppercase tracking-widest text-white/40 hover:text-white hover:bg-white/5 rounded-xl transition-all"
          >
            Cancelar
          </button>
          <button 
            type="submit"
            :disabled="submitting || !selectedTemplateId || !settings?.api_url"
            class="flex-[2] bg-kros-blue text-white py-3.5 rounded-xl text-[10px] font-semibold uppercase tracking-widest shadow-[0_10px_30px_rgba(0,123,255,0.2)] hover:bg-blue-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <svg v-if="submitting" class="animate-spin" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
            <span v-else>📤 ENVIAR AGORA</span>
          </button>
        </div>
      </form>

      <!-- Glow -->
      <div class="absolute -top-20 -left-20 w-48 h-48 bg-kros-blue/10 rounded-full blur-[80px] pointer-events-none"></div>
    </div>
  </div>
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

onMounted(() => {
  fetchCrmData()
})

const handleSend = async () => {
  if (!settings.value?.api_url) return
  
  submitting.value = true
  try {
    const rawNum = props.payment.company_whatsapp?.replace(/\D/g, '') || ''
    
    // API Call Exemplo fornecido pelo user:
    const response = await fetch(settings.value.api_url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${settings.value.api_token}`
      },
      body: JSON.stringify({
        number: rawNum,
        body: compiledMessage.value
      })
    })

    if (!response.ok) {
        throw new Error(`Erro da API: ${response.statusText}`)
    }

    emit('sent')
  } catch (err: any) {
    console.error('Erro ao enviar mensagem:', err)
    alert('Ops! Ocorreu um erro ao tentar enviar a mensagem. Verifique o console e a sua API.')
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.text-glow-blue {
  text-shadow: 0 0 15px rgba(59, 130, 246, 0.5);
}
</style>
