<template>
  <div class="space-y-12">
    <!-- 1. Configurações da API HTTP -->
    <div class="space-y-8">
      <div>
        <h3 class="font-bold text-lg text-white">Configurações de Integração CRM</h3>
        <p class="text-[10px] text-white/50 uppercase tracking-widest mt-1">Conecte sua API de envio para WhatsApp, SMS ou Email</p>
      </div>

      <div class="p-8 rounded-3xl bg-kros-surface dark:bg-[#111112] border border-kros-outline dark:border-[#1F1F21]">
        <form @submit.prevent="handleSaveSettings" class="space-y-6">
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
          <div class="flex justify-end pt-2">
            <button 
              type="submit"
              :disabled="loading"
              class="bg-kros-blue hover:bg-blue-600 text-white text-[10px] font-bold uppercase tracking-widest px-8 py-3.5 rounded-xl transition-all shadow-[0_4px_20px_rgba(0,123,255,0.4)] active:scale-95 disabled:opacity-50"
            >
              {{ loading ? 'Salvando...' : 'Salvar Configurações API' }}
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
            <div v-for="tmpl in templates" :key="tmpl.id" class="p-5 rounded-2xl bg-white/[0.02] border border-transparent hover:border-kros-blue/20 transition-all group flex flex-col gap-3">
               <div class="flex items-center justify-between">
                  <h5 class="font-bold text-sm text-white uppercase tracking-tight">{{ tmpl.name }}</h5>
                  <div class="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                     <button @click="editTemplate(tmpl)" class="p-1.5 rounded bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-all">
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
                     </button>
                     <button @click="handleDeleteTemplate(tmpl.id!)" class="p-1.5 rounded bg-red-500/10 hover:bg-red-500/20 text-red-500 transition-all">
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                     </button>
                  </div>
               </div>
               <p class="text-xs text-white/50 leading-relaxed max-h-20 overflow-hidden text-ellipsis">{{ tmpl.body }}</p>
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
  api_token: ''
})

const editingTemplate = ref<MessageTemplate | null>(null)

watch(settings, (newVal) => {
  if (newVal) {
    configForm.api_url = newVal.api_url || 'https://api.legendaryhub.com.br/api/messages/send'
    configForm.api_token = newVal.api_token || ''
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
