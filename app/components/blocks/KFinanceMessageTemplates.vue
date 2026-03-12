<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between pb-2 border-b border-white/5">
      <div>
        <h3 class="font-bold text-sm text-white uppercase tracking-widest">Modelos de Mensagem</h3>
        <p class="text-[9px] text-white/30 uppercase font-bold tracking-tighter mt-0.5">Gestão de Templates Automatizados</p>
      </div>
      <button 
        @click="startNewTemplate"
        v-if="!editingTemplate"
        class="bg-white/5 hover:bg-white/10 text-white border border-white/10 text-[10px] font-bold uppercase tracking-widest px-6 py-3 rounded-xl transition-all active:scale-95 flex items-center gap-2"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
        Novo Modelo
      </button>
    </div>

    <!-- Grid de Templates -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
       <!-- Cards -->
       <div 
          v-for="tmpl in templates" 
          :key="tmpl.id" 
          @click="editTemplate(tmpl)"
          :class="[
            'p-5 rounded-3xl border transition-all duration-500 group flex flex-col gap-4 relative cursor-pointer overflow-hidden backdrop-blur-sm',
            tmpl.is_default 
              ? 'bg-kros-blue/10 border-kros-blue/30' 
              : 'bg-white/[0.02] border-white/5 hover:border-white/20 hover:bg-white/[0.04]'
          ]"
       >
          <!-- Glossy overlay -->
          <div class="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none"></div>

          <div class="flex items-start justify-between relative z-10">
             <div class="flex items-center gap-2.5 min-w-0">
                <div :class="['w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border transition-colors', tmpl.is_default ? 'bg-kros-blue/20 border-kros-blue/30 text-kros-blue' : 'bg-white/5 border-white/10 text-white/40 group-hover:text-white']">
                   <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                </div>
                <div class="flex flex-col min-w-0">
                   <h5 class="font-black text-[10px] text-white uppercase tracking-[0.1em] truncate">{{ tmpl.name }}</h5>
                   <div v-if="tmpl.is_default" class="flex items-center gap-1.5 mt-0.5">
                      <div class="w-1 h-1 rounded-full bg-kros-blue animate-pulse"></div>
                      <span class="text-[7px] font-black uppercase text-kros-blue tracking-tighter">Padrão</span>
                   </div>
                </div>
             </div>

             <div class="flex items-center gap-1 translate-x-1">
                <button @click.stop="handleDeleteTemplate(tmpl.id!)" class="p-1.5 rounded-lg bg-red-500/0 hover:bg-red-500/15 text-white/20 hover:text-red-500 transition-all">
                   <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                </button>
             </div>
          </div>

          <div class="relative z-10 bg-black/30 p-3.5 rounded-2xl border border-white/5">
             <p class="text-[10px] text-white/50 leading-relaxed max-h-[60px] overflow-hidden line-clamp-2 italic">
               "{{ tmpl.body }}"
             </p>
          </div>

          <!-- Bottom Meta -->
          <div class="flex items-center justify-between text-[7px] font-black uppercase tracking-widest text-white/20 group-hover:text-white/40 transition-colors relative z-10">
             <span>{{ tmpl.body.length }} Chars</span>
             <span class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                Editar <svg xmlns="http://www.w3.org/2000/svg" width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m15 18 6-6-6-6"/></svg>
             </span>
          </div>
       </div>
    </div>

    <!-- MODAL DE EDIÇÃO -->
    <Teleport to="body">
      <Transition 
        enter-active-class="transition duration-300 ease-out"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition duration-200 ease-in"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div v-if="editingTemplate" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div class="absolute inset-0 bg-black/80 backdrop-blur-md" @click="editingTemplate = null"></div>

          <div class="relative w-full max-w-md animate-in zoom-in-95 duration-300">
            <div class="p-6 rounded-[2rem] bg-[#0D0D0E] border border-white/10 shadow-[0_40px_100px_rgba(0,0,0,0.8)] overflow-hidden">

               <div class="flex items-center justify-between mb-5 relative z-10">
                  <div>
                     <h4 class="text-[9px] font-black text-kros-blue uppercase tracking-[0.4em]">
                       {{ editingTemplate.id ? 'Ajustar Modelo' : 'Novo Modelo' }}
                     </h4>
                     <p class="text-[7px] text-white/20 uppercase font-black tracking-widest mt-0.5">Parâmetros de envio</p>
                  </div>
                  <button @click="editingTemplate = null" class="p-1.5 hover:bg-white/5 rounded-full transition-all text-white/20 hover:text-white shrink-0">
                     <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                  </button>
               </div>

               <form @submit.prevent="handleSaveTemplate" class="space-y-4 relative z-10">
                 <div class="grid grid-cols-1 gap-4 items-end">
                    <div class="space-y-2">
                      <label class="text-[8px] font-bold text-white/30 uppercase tracking-[0.2em] pl-1">Identificação</label>
                      <input 
                        v-model="editingTemplate.name"
                        type="text"
                        required
                        placeholder="Nome do modelo"
                        class="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-kros-blue transition-all"
                      />
                    </div>
                    
                    <div :class="['flex items-center justify-between p-3 rounded-xl border transition-all h-[44px]', editingTemplate.is_default ? 'bg-kros-blue/5 border-kros-blue/20' : 'bg-white/[0.02] border-white/10']">
                       <span class="text-[9px] font-black text-white/40 uppercase tracking-widest pl-1">Modelo Padrão?</span>
                       <label class="relative inline-flex items-center cursor-pointer scale-75">
                          <input type="checkbox" v-model="editingTemplate.is_default" class="sr-only peer">
                          <div class="w-10 h-5 bg-white/10 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:bg-kros-blue after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white/40 after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-kros-blue/20 transition-all"></div>
                       </label>
                    </div>
                 </div>

                 <div class="space-y-2">
                   <div class="flex items-end justify-between px-1">
                      <label class="text-[8px] font-bold text-white/30 uppercase tracking-[0.2em]">Mensagem</label>
                      <div class="flex gap-1.5">
                         <button v-for="v in ['empresa', 'valor', 'vencimento']" :key="v" type="button" @click="insertVar(`{{${v}}}`)" class="px-2 py-1 bg-white/5 hover:bg-kros-blue/20 rounded-md text-[7px] font-black text-kros-blue transition-all border border-white/10 uppercase tracking-tighter">
                            +{{ v.substring(0,3) }}
                         </button>
                      </div>
                   </div>
                   <textarea 
                     v-model="editingTemplate.body"
                     required
                     rows="5"
                     placeholder="Olá {{empresa}}..."
                     class="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs text-white/90 outline-none focus:border-kros-blue transition-all resize-none leading-relaxed custom-scrollbar"
                   ></textarea>
                 </div>

                 <button 
                   type="submit"
                   :disabled="loading"
                   class="w-full btn-primary py-4 rounded-xl text-[9px] font-black uppercase tracking-[0.4em] transition-all disabled:opacity-50 shadow-xl mt-2"
                 >
                   {{ loading ? 'SALVANDO...' : 'GUARDAR ALTERAÇÕES' }}
                 </button>
               </form>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useCrm, type MessageTemplate } from '~/composables/useCrm'

const { 
  templates, 
  loading, 
  fetchCrmData, 
  createTemplate, 
  updateTemplate, 
  deleteTemplate 
} = useCrm()

const editingTemplate = ref<MessageTemplate | null>(null)

const startNewTemplate = () => {
  editingTemplate.value = {
    name: '',
    body: '',
    is_default: false
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
    await fetchCrmData()
  } catch (err) {
    alert('Erro ao salvar modelo.')
  }
}

const handleDeleteTemplate = async (id: string) => {
  const confirmed = await confirm('Deseja excluir este modelo?', 'Excluir modelo')
  if (confirmed) {
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

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
}
</style>
