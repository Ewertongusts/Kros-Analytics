<template>
  <div v-if="isOpen" class="fixed inset-0 z-[200] flex items-center justify-center px-4">
    <div @click="$emit('close')" class="absolute inset-0 bg-black/90 backdrop-blur-xl"></div>
    
      <div class="relative bg-[#0D0D0E] border border-white/10 rounded-[2.5rem] w-full max-w-lg p-6 overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.8)]">
        <div class="mb-5 text-center relative z-10">
          <div class="w-10 h-10 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500 mx-auto mb-3 border border-emerald-500/20">
             <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/></svg>
          </div>
          <h3 class="text-lg font-bold italic uppercase tracking-tighter text-white">
            ATIVAR <span class="text-emerald-500 text-glow-emerald">AUTOMAÇÃO (CRON)</span>
          </h3>
          <p class="text-[9px] text-white/50 uppercase tracking-widest mt-1 max-w-sm mx-auto">
            Defina uma mensagem específica que o CRON enviará diariamente ou use o modelo global.
          </p>

          <!-- Recipient info card -->
          <div class="mt-3 flex flex-col items-center justify-center gap-1 bg-white/[0.02] border border-white/5 rounded-2xl p-3">
            <p class="text-[9px] text-white/40 uppercase tracking-widest font-semibold">Empresa Alvo</p>
            <p class="text-sm font-bold text-white leading-tight">{{ payment?.company_name }}</p>
            <p class="text-emerald-400 text-xs font-semibold tracking-wider">{{ payment?.company_whatsapp }}</p>
          </div>
        </div>

      <div v-if="loading" class="flex justify-center py-6">
         <svg class="animate-spin text-emerald-500" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
      </div>

      <form v-else @submit.prevent="handleConfirm" class="space-y-4 relative z-10">
        
        <div class="space-y-1.5">
          <label class="text-[9px] font-semibold text-white/50 uppercase tracking-[0.2em] pl-1">Escolher um Modelo Salvo</label>
          <select 
            v-model="selectedTemplateId"
            @change="applyTemplate"
            class="w-full bg-[#111112] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-emerald-500 transition-all font-medium appearance-none"
          >
            <option value="">Mensagem Personalizada Mista (Recomendado)...</option>
            <option v-for="tmpl in templates" :key="tmpl.id" :value="tmpl.id">
              {{ tmpl.name }}
            </option>
          </select>
        </div>

        <div class="space-y-1.5">
            <div class="flex items-end justify-between">
              <label class="text-[9px] font-semibold text-emerald-500 uppercase tracking-[0.2em] pl-1">Mensagem a ser enviada no CRON</label>
            </div>
            <textarea 
               v-model="customMessageText"
               required
               rows="4"
               placeholder="Olá {{empresa}}, essa é uma cobrança do dia {{vencimento}}..."
               class="w-full bg-white/[0.02] border border-emerald-500/20 rounded-xl px-4 py-3 text-sm text-white/90 outline-none focus:border-emerald-500 transition-all resize-none shadow-inner"
            ></textarea>
            <p v-pre class="text-[9px] text-white/40 leading-relaxed mt-1">Variáveis que o CRON lê automaticamente: {{empresa}}, {{vencimento}}, {{valor}}, {{plano}}</p>
        </div>

        <div class="flex gap-3 pt-3 border-t border-white/5">
          <button 
            type="button"
            @click="$emit('close')"
            class="flex-1 py-3 text-[10px] font-semibold uppercase tracking-widest text-white/40 hover:text-white hover:bg-white/5 rounded-xl transition-all"
          >
            Cancelar
          </button>
          <button 
            type="submit"
            :disabled="submitting || !customMessageText"
            class="flex-[2] btn-primary !bg-emerald-500 hover:!bg-emerald-400 py-3 rounded-xl text-[10px] font-bold text-black uppercase tracking-widest transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <svg v-if="submitting" class="animate-spin text-black" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
            <span v-else>ATIVAR</span>
          </button>
        </div>
      </form>

      <!-- Glow -->
      <div class="absolute -top-20 -left-20 w-48 h-48 bg-emerald-500/10 rounded-full blur-[80px] pointer-events-none"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { useCrm } from '~/composables/useCrm'

const props = defineProps<{
  isOpen: boolean
  payment: any
}>()

const emit = defineEmits(['close', 'confirm'])

const { templates, loading, fetchCrmData } = useCrm()
const submitting = ref(false)
const selectedTemplateId = ref('')
const customMessageText = ref('')

onMounted(async () => {
  await fetchCrmData()
  // Define o valor padrão (template mais recente se houver ou padrão de sistema) se a mensagem alvo não tiver
  if (props.payment?.cron_message) {
     customMessageText.value = props.payment.cron_message
  } else if (templates.value && templates.value.length > 0) {
     customMessageText.value = templates.value[0].body
     selectedTemplateId.value = templates.value[0].id || ''
  } else {
     customMessageText.value = 'Olá {{empresa}}!\nAviso da sua mensalidade referente ao plano: {{plano}}.\n\nFatura no valor de {{valor}} com vencimento até o dia {{vencimento}}.\nNossa chave PIX: seuemail@pix.com.br. Obrigado!'
  }
})

const applyTemplate = () => {
   if (selectedTemplateId.value) {
     const tmpl = templates.value.find(t => t.id === selectedTemplateId.value)
     if (tmpl) {
       customMessageText.value = tmpl.body
     }
   }
}

const handleConfirm = () => {
  emit('confirm', customMessageText.value)
}
</script>

<style scoped>
.text-glow-emerald {
  text-shadow: 0 0 15px rgba(16, 185, 129, 0.5);
}
</style>
