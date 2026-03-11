<template>
  <div class="space-y-12">
    <!-- 1. Configurações da API HTTP -->
    <div class="space-y-8">
      <div class="flex items-center justify-between">
        <div>
          <h3 class="font-bold text-lg text-white">Configurações de Integração CRM</h3>
          <p class="text-[10px] text-white/50 uppercase tracking-widest mt-1">Conecte sua API de envio para WhatsApp, SMS ou Email</p>
        </div>
        
        <!-- Status Indicator -->
        <div class="flex items-center gap-3 px-4 py-2 bg-white/5 rounded-2xl border border-white/10">
           <div class="relative flex items-center justify-center w-2.5 h-2.5">
              <div :class="[
                'absolute inset-0 rounded-full animate-ping opacity-20',
                settings?.last_test_status === 'success' ? 'bg-emerald-500' : (settings?.last_test_status === 'error' ? 'bg-red-500' : 'bg-white/20')
              ]"></div>
              <div :class="[
                'w-2 h-2 rounded-full relative z-10',
                settings?.last_test_status === 'success' ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : (settings?.last_test_status === 'error' ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]' : 'bg-white/20')
              ]"></div>
           </div>
           <span class="text-[9px] font-bold uppercase tracking-widest" :class="settings?.last_test_status === 'success' ? 'text-emerald-400' : (settings?.last_test_status === 'error' ? 'text-red-400' : 'text-white/40')">
              {{ settings?.last_test_status === 'success' ? 'WhatsApp Conectado' : (settings?.last_test_status === 'error' ? 'Falha na Conexão' : 'Não Testado') }}
           </span>
        </div>
      </div>

      <!-- ROW 1: API Configuration (Full Width) -->
      <div class="p-8 rounded-3xl bg-kros-surface dark:bg-[#111112] border border-kros-outline dark:border-[#1F1F21]">
        <form @submit.prevent="handleSaveSettings" class="space-y-8">
          <!-- API Keys -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="space-y-2">
              <label class="text-[10px] font-semibold text-kros-blue uppercase tracking-[0.2em] pl-1">URL da API (Webhook/Endpoint)</label>
              <input 
                v-model="configForm.api_url"
                type="url"
                required
                placeholder="https://api.exemplo.com/messages/send"
                class="w-full bg-white/[0.03] border border-white/10 rounded-xl px-5 py-3.5 text-xs text-white outline-none focus:border-kros-blue transition-all font-medium placeholder:text-white/20"
              />
            </div>
            <div class="space-y-2">
              <label class="text-[10px] font-semibold text-kros-blue uppercase tracking-[0.2em] pl-1">Bearer Token de Autorização</label>
              <input 
                v-model="configForm.api_token"
                type="password"
                placeholder="Insira o seu token de conexão..."
                class="w-full bg-white/[0.03] border border-white/10 rounded-xl px-5 py-3.5 text-xs text-white outline-none focus:border-kros-blue transition-all font-medium placeholder:text-white/20"
              />
            </div>
          </div>

          <!-- Anti-Ban Settings -->
          <div class="pt-6 border-t border-white/5 space-y-6">
             <div class="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                <h4 class="text-xs font-bold text-white uppercase tracking-widest">Configurações Anti-Bloqueio (Tempos Randômicos)</h4>
             </div>

             <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <!-- Intervalo entre msgs -->
                <div class="space-y-3">
                   <label class="text-[10px] font-semibold text-white/40 uppercase tracking-[0.2em] pl-1">Intervalo entre Mensagens</label>
                   <div class="flex items-center gap-2">
                      <input v-model.number="configForm.delay_min" type="number" class="w-full bg-white/[0.02] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-kros-blue" placeholder="Min (seg)" />
                      <span class="text-white/20 text-xs">a</span>
                      <input v-model.number="configForm.delay_max" type="number" class="w-full bg-white/[0.02] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-kros-blue" placeholder="Max (seg)" />
                   </div>
                   <p class="text-[8px] text-white/30 uppercase font-black pl-1">Segundos (Randômico)</p>
                </div>

                <!-- Após quantas mensagens -->
                <div class="space-y-3">
                   <label class="text-[10px] font-semibold text-white/40 uppercase tracking-[0.2em] pl-1">Pausa após quanto envios</label>
                   <input v-model.number="configForm.break_after" type="number" class="w-full bg-white/[0.02] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-kros-blue" placeholder="Ex: 15" />
                   <p class="text-[8px] text-white/30 uppercase font-black pl-1">Contagem de Mensagens</p>
                </div>

                <!-- Intervalo maior -->
                <div class="space-y-3">
                   <label class="text-[10px] font-semibold text-white/40 uppercase tracking-[0.2em] pl-1">Duração da Pausa Longa</label>
                   <div class="flex items-center gap-2">
                      <input v-model.number="configForm.break_delay_min" type="number" class="w-full bg-white/[0.02] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-kros-blue" placeholder="Min (min)" />
                      <span class="text-white/20 text-xs text-nowrap">a</span>
                      <input v-model.number="configForm.break_delay_max" type="number" class="w-full bg-white/[0.02] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-kros-blue" placeholder="Max (min)" />
                   </div>
                   <p class="text-[8px] text-white/30 uppercase font-black pl-1">Minutos (Randômico)</p>
                </div>
             </div>
          </div>

          <div class="flex justify-end pt-4">
            <button 
              type="submit"
              :disabled="loading"
              class="btn-primary text-[10px] font-extrabold uppercase tracking-[0.2em] px-10 py-4 rounded-2xl transition-all active:scale-95 disabled:opacity-50"
            >
              {{ loading ? 'PROCESSANDO...' : 'SALVAR TODAS AS CONFIGURAÇÕES' }}
            </button>
          </div>
        </form>
      </div>

      <!-- ROW 2: Testing & Logs (Side by Side) -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <!-- Testing Section -->
        <div class="p-8 rounded-3xl bg-white/[0.02] border border-white/10 flex flex-col gap-8 h-full">
           <div>
              <h4 class="text-xs font-bold text-white uppercase tracking-widest">Testar Envio Manual</h4>
              <p class="text-[9px] text-white/40 uppercase tracking-widest mt-1">Validação instantânea de conectividade</p>
           </div>

           <div class="space-y-5">
              <div class="space-y-2">
                 <label class="text-[9px] font-bold text-white/30 uppercase tracking-widest pl-1">Número de Destino</label>
                 <input 
                   v-model="testPhone"
                   type="text"
                   placeholder="5581900000000"
                   class="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3.5 text-xs text-white outline-none focus:border-kros-blue transition-all"
                 />
              </div>

              <button 
                @click="handleTestApi"
                :disabled="testing || !configForm.api_url"
                class="w-full py-4 bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                 <div v-if="testing" class="w-3 h-3 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                 {{ testing ? 'ENVIANDO...' : 'TESTAR AGORA' }}
              </button>
           </div>

           <!-- Last Result -->
           <div v-if="settings?.last_test_at" class="pt-6 border-t border-white/5 mt-auto">
              <div class="flex items-center justify-between mb-3">
                 <span class="text-[9px] font-bold text-white/30 uppercase tracking-[0.2em]">Último Verificado</span>
                 <span class="text-[9px] font-black text-white/60 uppercase tracking-widest bg-white/5 px-2 py-0.5 rounded-md">{{ formatDate(settings.last_test_at) }}</span>
              </div>
              <div :class="[
                'p-3.5 rounded-2xl flex items-center gap-3 transition-all duration-500',
                settings.last_test_status === 'success' 
                 ? 'bg-emerald-500/5 border border-emerald-500/20 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.05)]' 
                 : 'bg-red-500/5 border border-red-500/20 text-red-400 shadow-[0_0_20px_rgba(239,68,68,0.05)]'
              ]">
                 <div :class="['w-8 h-8 rounded-full flex items-center justify-center shrink-0 border', settings.last_test_status === 'success' ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-red-500/10 border-red-500/20']">
                    <svg v-if="settings.last_test_status === 'success'" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                    <svg v-else xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                 </div>
                 <div class="flex-1 min-w-0">
                    <p class="text-[10px] font-bold uppercase tracking-widest opacity-60 mb-0.5">{{ settings.last_test_status === 'success' ? 'Conexão Estável' : 'Conexão Interrompida' }}</p>
                    <p class="text-[11px] font-medium leading-tight truncate">{{ settings.last_test_response }}</p>
                 </div>
              </div>
           </div>
        </div>

        <!-- Connectivity History Section -->
        <div class="p-8 rounded-3xl bg-[#0D0D0E] border border-white/5 flex flex-col gap-6 shadow-2xl relative overflow-hidden h-full">
           <div class="flex items-center justify-between relative z-10">
              <div>
                 <h4 class="text-[11px] font-bold text-white uppercase tracking-[0.2em]">Histórico de Conectividade</h4>
                 <p class="text-[8px] text-white/30 uppercase font-black mt-1">Registros de depuração</p>
              </div>
              <div class="w-8 h-8 bg-white/5 rounded-xl border border-white/10 flex items-center justify-center text-white/40">
                 <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m19 11-8-8-8 8"/><path d="M12 21V3"/></svg>
              </div>
           </div>
           
           <div v-if="testLogs.length === 0" class="py-12 text-center opacity-20 relative z-10">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="mx-auto mb-3 opacity-50"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="M3 15h18"/></svg>
              <p class="text-[9px] font-black uppercase tracking-[0.3em]">Ambiente Limpo</p>
           </div>

           <div v-else class="space-y-3 max-h-[360px] overflow-y-auto pr-2 custom-scrollbar relative z-10">
              <div v-for="log in testLogs" :key="log.id" class="group flex flex-col gap-2.5 p-4 bg-white/[0.02] border border-white/5 rounded-2xl transition-all duration-300 hover:bg-white/[0.04] hover:border-white/15">
                 <div class="flex items-center justify-between">
                    <div class="flex items-center gap-3">
                       <div :class="[
                          'w-1.5 h-1.5 rounded-full ring-4',
                          log.status.includes('Sucesso') ? 'bg-emerald-500 ring-emerald-500/10' : 'bg-red-500 ring-red-500/10'
                       ]"></div>
                       <span class="text-[10px] font-bold text-white tracking-tight">{{ log.whatsapp }}</span>
                    </div>
                    <span class="text-[8px] font-bold text-white/20 uppercase tracking-widest group-hover:text-white/40 transition-colors">{{ formatDate(log.created_at) }}</span>
                 </div>

                 <div class="flex items-center justify-between bg-black/40 px-3 py-2 rounded-xl border border-white/5">
                     <p class="text-[9px] font-semibold tracking-tight truncate max-w-[180px]" :class="log.status.includes('Sucesso') ? 'text-emerald-400/80' : 'text-red-400/80'">
                        {{ log.status }}
                     </p>
                     <div :class="['text-[8px] font-black uppercase px-1.5 py-0.5 rounded-md', log.status.includes('Sucesso') ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500']">
                        {{ log.status.includes('Sucesso') ? 'OK' : 'ERR' }}
                     </div>
                 </div>
              </div>
           </div>

           <!-- Glow decorativo no fundo -->
           <div class="absolute -bottom-10 -right-10 w-40 h-40 bg-kros-blue/5 rounded-full blur-[60px] pointer-events-none"></div>
        </div>
      </div>
    </div>



  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive, watch } from 'vue'
import { useCrm } from '~/composables/useCrm'

const { 
  settings, 
  testLogs,
  loading, 
  testing,
  fetchCrmData, 
  saveSettings, 
  testApi
} = useCrm()

const configForm = reactive({
  api_url: '',
  api_token: '',
  delay_min: 15,
  delay_max: 30,
  break_after: 10,
  break_delay_min: 5,
  break_delay_max: 10
})

const testPhone = ref('5581983717272')

watch(settings, (newVal) => {
  if (newVal) {
    configForm.api_url = newVal.api_url || 'https://api.legendaryhub.com.br/api/messages/send'
    configForm.api_token = newVal.api_token || ''
    configForm.delay_min = newVal.delay_min || 15
    configForm.delay_max = newVal.delay_max || 30
    configForm.break_after = newVal.break_after || 10
    configForm.break_delay_min = newVal.break_delay_min || 5
    configForm.break_delay_max = newVal.break_delay_max || 10
  }
}, { immediate: true })

const handleSaveSettings = async () => {
  try {
    await saveSettings(configForm)
    alert('Configurações salvas com sucesso!')
  } catch (err) {
    alert('Erro ao salvar as configurações. Verifique o console.')
  }
}

const handleTestApi = async () => {
  if (!testPhone.value) {
    alert('Insira um número de telefone para testar.')
    return
  }
  const res = await testApi(testPhone.value)
  if (res.success) {
    alert('Teste concluído com sucesso! Verifique seu WhatsApp.')
  } else {
    alert('Falha no teste: ' + res.message)
  }
}

const formatDate = (dateValue: string) => {
   const d = new Date(dateValue)
   return d.toLocaleString('pt-BR', { 
     day: '2-digit', month: '2-digit', 
     hour: '2-digit', minute: '2-digit'
   }) + 'h'
}

onMounted(() => {
  fetchCrmData()
})
</script>
