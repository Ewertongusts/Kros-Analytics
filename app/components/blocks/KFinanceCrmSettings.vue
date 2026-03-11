<template>
  <div class="space-y-12">
    <!-- 1. Configurações da API HTTP -->
    <div class="space-y-8">
      <div>
        <h3 class="font-bold text-lg text-white">Configurações de Integração CRM</h3>
        <p class="text-[10px] text-white/50 uppercase tracking-widest mt-1">Conecte sua API de envio para WhatsApp, SMS ou Email</p>
      </div>

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

             <!-- Resumo -->
             <div class="bg-kros-blue/5 border border-kros-blue/10 rounded-2xl p-4 flex flex-wrap items-center gap-4">
                <span class="text-[9px] font-bold text-white/40 uppercase tracking-widest pl-1">Resumo da Proteção:</span>
                <div class="flex items-center gap-2">
                   <div class="px-3 py-1 bg-kros-blue/20 rounded-lg text-[9px] font-bold text-kros-blue uppercase tracking-widest border border-kros-blue/20">
                     Intervalo: {{ configForm.delay_min }}s {{ configForm.delay_min !== configForm.delay_max ? 'a ' + configForm.delay_max + 's' : '' }}
                   </div>
                   <div class="px-3 py-1 bg-emerald-500/20 rounded-lg text-[9px] font-bold text-emerald-500 uppercase tracking-widest border border-emerald-500/20">
                     Pausa após {{ configForm.break_after }} msgs: {{ configForm.break_delay_min }} {{ configForm.break_delay_min !== configForm.break_delay_max ? 'a ' + configForm.break_delay_max : '' }} min
                   </div>
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
    </div>

    <!-- 2. Gestor de Modelos de Mensagem -->
    <div class="space-y-8">
      <div class="flex items-center justify-between">
        <div>
          <h3 class="font-bold text-lg text-white">Modelos de Mensagem (Templates)</h3>
          <p class="text-[10px] text-white/50 uppercase tracking-widest mt-1">Defina as mensagens padrão para cobrança com variáveis dinâmicas</p>
        </div>
        <button 
          @click="startNewTemplate"
          class="bg-white/5 hover:bg-white/10 text-white border border-white/10 text-[10px] font-bold uppercase tracking-widest px-6 py-3 rounded-xl transition-all active:scale-95 flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
          Novo Modelo
        </button>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
         
         <!-- Lista de Templates -->
         <div class="space-y-4">
            <div 
               v-for="tmpl in templates" 
               :key="tmpl.id" 
               :class="[
                 'p-5 rounded-2xl border transition-all group flex flex-col gap-3 relative',
                 tmpl.is_default 
                   ? 'bg-kros-blue/5 border-kros-blue/25 shadow-[0_0_20px_rgba(59,130,246,0.05)]' 
                   : 'bg-white/[0.02] border-transparent hover:border-white/10'
               ]"
            >
               <div class="flex items-center justify-between">
                  <div class="flex items-center gap-2 flex-1 overflow-hidden">
                     <h5 class="font-bold text-sm text-white uppercase tracking-tight truncate">{{ tmpl.name }}</h5>
                     <!-- Default Badge -->
                     <span 
                       v-if="tmpl.is_default"
                       class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-kros-blue/15 border border-kros-blue/30 text-kros-blue text-[8px] font-black uppercase tracking-widest shrink-0"
                     >
                       <svg xmlns="http://www.w3.org/2000/svg" width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                       Padrão
                     </span>
                  </div>
                  <div class="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                     <button @click="editTemplate(tmpl)" class="p-1.5 rounded bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-all">
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
                     </button>
                     <button @click="handleDeleteTemplate(tmpl.id!)" class="p-1.5 rounded bg-red-500/10 hover:bg-red-500/20 text-red-500 transition-all">
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                     </button>
                  </div>
               </div>
               <p class="text-xs text-white/40 leading-relaxed max-h-20 overflow-hidden text-ellipsis">{{ tmpl.body }}</p>
            </div>

            <div v-if="templates.length === 0" class="flex flex-col items-center justify-center py-12 opacity-40 border border-dashed border-white/10 rounded-2xl">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="mb-3 text-white"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              <p class="font-bold uppercase tracking-widest text-[9px] text-white">Nenhum modelo criado</p>
            </div>
         </div>

         <!-- Editor de Template -->
         <div v-if="editingTemplate" class="p-6 rounded-3xl bg-kros-surface dark:bg-[#111112] border border-kros-blue/30 relative">
            <h4 class="text-xs font-bold text-kros-blue uppercase tracking-widest mb-6">
              {{ editingTemplate.id ? 'Editando Modelo' : 'Novo Modelo' }}
            </h4>

            <form @submit.prevent="handleSaveTemplate" class="space-y-5">
              <div class="space-y-2">
                <label class="text-[10px] font-semibold text-white/50 uppercase tracking-[0.2em] pl-1">Nome de Identificação</label>
                <input 
                  v-model="editingTemplate.name"
                  type="text"
                  required
                  placeholder="Ex: Cobrança Padrão, Mensagem de Atraso"
                  class="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-kros-blue transition-all"
                />
              </div>

              <div class="space-y-2">
                <div class="flex items-end justify-between">
                   <label class="text-[10px] font-semibold text-white/50 uppercase tracking-[0.2em] pl-1">Corpo da Mensagem</label>
                   <div class="flex gap-1">
                      <button type="button" @click="insertVar('{{empresa}}')" class="px-2 py-1 bg-white/5 hover:bg-white/10 rounded text-[9px] font-bold text-kros-blue">{emp}</button>
                      <button type="button" @click="insertVar('{{valor}}')" class="px-2 py-1 bg-white/5 hover:bg-white/10 rounded text-[9px] font-bold text-kros-blue">{val}</button>
                      <button type="button" @click="insertVar('{{vencimento}}')" class="px-2 py-1 bg-white/5 hover:bg-white/10 rounded text-[9px] font-bold text-kros-blue">{data}</button>
                      <button type="button" @click="insertVar('{{plano}}')" class="px-2 py-1 bg-white/5 hover:bg-white/10 rounded text-[9px] font-bold text-kros-blue">{plano}</button>
                   </div>
                </div>
                <textarea 
                  v-model="editingTemplate.body"
                  required
                  rows="6"
                  placeholder="Olá {{empresa}}, notamos que..."
                  class="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-kros-blue transition-all resize-none overflow-y-auto"
                ></textarea>
                <p v-pre class="text-[9px] text-white/40 leading-relaxed mt-1">Variáveis disponíveis: {{empresa}}, {{vencimento}}, {{valor}}, {{plano}}</p>
              </div>

              <!-- Default Toggle -->
              <div class="flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-xl">
                 <div class="flex items-center gap-2">
                    <div :class="['w-1.5 h-1.5 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.3)]', editingTemplate.is_default ? 'bg-kros-blue' : 'bg-white/20']"></div>
                    <span class="text-[10px] font-bold text-white/50 uppercase tracking-widest">Padrão de Cobrança</span>
                 </div>
                 <label class="relative inline-flex items-center cursor-pointer scale-90">
                    <input type="checkbox" v-model="editingTemplate.is_default" class="sr-only peer">
                    <div class="w-8 h-4 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white/40 peer-checked:after:bg-kros-blue after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-kros-blue/20"></div>
                 </label>
              </div>

              <div class="flex gap-3 pt-2">
                <button 
                  type="button"
                  @click="editingTemplate = null"
                  class="flex-1 py-3 text-[10px] font-semibold uppercase tracking-widest text-white/40 hover:text-white hover:bg-white/5 rounded-xl transition-all"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  :disabled="loading"
                  class="flex-1 bg-white/10 text-white hover:bg-kros-blue py-3 rounded-xl text-[10px] font-semibold uppercase tracking-widest transition-all disabled:opacity-50"
                >
                  Salvar Modelo
                </button>
              </div>
            </form>
         </div>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive, watch } from 'vue'
import { useCrm, type MessageTemplate } from '~/composables/useCrm'

const { 
  settings, 
  templates, 
  loading, 
  fetchCrmData, 
  saveSettings, 
  createTemplate, 
  updateTemplate, 
  deleteTemplate 
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

const editingTemplate = ref<MessageTemplate | null>(null)

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

const startNewTemplate = () => {
  editingTemplate.value = {
    name: '',
    body: ''
  }
}

const editTemplate = (tmpl: MessageTemplate) => {
  editingTemplate.value = { ...tmpl }
}

const insertVar = (v: string) => {
  if (editingTemplate.value) {
    editingTemplate.value.body += v
  }
}

const handleSaveTemplate = async () => {
  if (!editingTemplate.value) return
  try {
    if (editingTemplate.value.id) {
      await updateTemplate(editingTemplate.value.id, editingTemplate.value)
    } else {
      await createTemplate(editingTemplate.value)
    }
    editingTemplate.value = null
  } catch (err) {
    alert('Erro ao salvar modelo.')
  }
}

const handleDeleteTemplate = async (id: string) => {
  if (confirm('Deseja excluir este modelo?')) {
    try {
      await deleteTemplate(id)
      if (editingTemplate.value?.id === id) {
        editingTemplate.value = null
      }
    } catch (err) {
      alert('Erro ao deletar modelo.')
    }
  }
}

onMounted(() => {
  fetchCrmData()
})
</script>
