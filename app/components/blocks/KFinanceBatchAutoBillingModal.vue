<template>
  <div v-if="isOpen" class="fixed inset-0 z-[200] flex items-center justify-center px-4">
    <div @click="$emit('close')" class="absolute inset-0 bg-black/90 backdrop-blur-xl"></div>
    
      <div class="relative bg-[#0D0D0E] border border-white/10 rounded-[2.5rem] w-full max-w-lg p-8 overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.8)]">
        <div class="mb-6 text-center relative z-10">
          <div class="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500 mx-auto mb-4 border border-emerald-500/20">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/></svg>
          </div>
          <h3 class="text-lg font-bold uppercase tracking-tight text-white">
            CONFIGURAR <span class="text-emerald-500">AUTOMAÇÃO EM MASSA</span>
          </h3>
          <p class="text-[10px] text-white/40 font-bold uppercase tracking-widest mt-2">{{ payments.length }} empresas selecionadas para CRON</p>
        </div>

      <div v-if="loading" class="flex justify-center py-10">
         <svg class="animate-spin text-emerald-500" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
      </div>

      <form v-else @submit.prevent="handleConfirmBatch" class="space-y-6 relative z-10">
        
        <div class="space-y-2">
          <label class="text-[10px] font-semibold text-white/50 uppercase tracking-[0.2em] pl-1">Escolher um Modelo Salvo</label>
          <select 
            v-model="selectedTemplateId"
            @change="applyTemplate"
            class="w-full bg-[#111112] border border-white/10 rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-emerald-500 transition-all font-medium appearance-none"
          >
            <option value="">Mensagem Personalizada Mista...</option>
            <option v-for="tmpl in templates" :key="tmpl.id" :value="tmpl.id">
              {{ tmpl.name }}
            </option>
          </select>
        </div>

        <div class="space-y-2">
            <label class="text-[10px] font-semibold text-emerald-500 uppercase tracking-[0.2em] pl-1">Mensagem do CRON (Para todos)</label>
            <textarea 
               v-model="customMessageText"
               required
               rows="5"
               placeholder="Olá {{empresa}}, essa é uma cobrança do dia {{vencimento}}..."
               class="w-full bg-white/[0.02] border border-emerald-500/20 rounded-2xl px-4 py-4 text-sm text-white/90 outline-none focus:border-emerald-500 transition-all resize-none shadow-inner"
            ></textarea>
            <p v-pre class="text-[9px] text-white/40 leading-relaxed mt-1">Variáveis aceitas: {{empresa}}, {{vencimento}}, {{valor}}, {{plano}}</p>
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
            :disabled="!customMessageText"
            class="flex-[2] btn-primary !bg-emerald-500 hover:!bg-emerald-400 py-3.5 rounded-xl text-[10px] font-bold text-black uppercase tracking-widest transition-all disabled:opacity-50"
          >
            💾 SALVAR E ATIVAR PARA TODOS
          </button>
        </div>
      </form>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useCrm } from '~/composables/useCrm'

const props = defineProps<{
  isOpen: boolean
  payments: any[]
}>()

const emit = defineEmits(['close', 'confirm'])

const { templates, loading, fetchCrmData } = useCrm()
const selectedTemplateId = ref('')
const customMessageText = ref('')

onMounted(async () => {
  await fetchCrmData()
  if (templates.value && templates.value.length > 0) {
     customMessageText.value = templates.value[0].body
     selectedTemplateId.value = templates.value[0].id || ''
  } else {
     customMessageText.value = 'Olá {{empresa}}!\nAviso da sua mensalidade referente ao plano: {{plano}}.\n\nFatura no valor de {{valor}} com vencimento até o dia {{vencimento}}.'
  }
})

const applyTemplate = () => {
   if (selectedTemplateId.value) {
     const tmpl = templates.value.find(t => t.id === selectedTemplateId.value)
     if (tmpl) customMessageText.value = tmpl.body
   }
}

const handleConfirmBatch = () => {
  emit('confirm', customMessageText.value)
}
</script>

<style scoped>
</style>
