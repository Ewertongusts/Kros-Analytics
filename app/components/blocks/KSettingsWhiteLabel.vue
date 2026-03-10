<template>
  <div class="space-y-8 animate-in fade-in duration-500">
     <div class="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div class="space-y-6">
           <div class="space-y-2">
              <label class="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-1">Nome do Sistema</label>
              <input 
                type="text" 
                v-model="wlData.system_name"
                class="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm text-white focus:border-kros-blue outline-none transition-all"
              />
           </div>
           <div class="space-y-2">
              <label class="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-1">Cor Principal (Azul)</label>
              <div class="flex gap-4">
                 <input 
                   type="color" 
                   v-model="wlData.primary_color"
                   class="w-14 h-14 bg-transparent border-0 cursor-pointer p-0"
                 />
                 <input 
                   type="text" 
                   v-model="wlData.primary_color"
                   class="flex-1 bg-white/5 border border-white/10 rounded-2xl px-5 text-sm text-white font-mono uppercase"
                 />
              </div>
           </div>
        </div>

         <div class="space-y-6">
           <!-- Logo Upload -->
           <div class="space-y-3">
              <label class="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-1 flex items-center gap-2">
                 <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="text-kros-blue"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
                 Logotipo do Sistema
              </label>
              
              <div class="flex items-center gap-6 p-4 bg-white/5 border border-white/10 rounded-3xl group">
                 <div class="w-16 h-16 rounded-2xl bg-[#080809] border border-white/5 flex items-center justify-center p-2 overflow-hidden shadow-inner">
                    <img v-if="wlData.logo_url" :src="wlData.logo_url" class="max-w-full max-h-full object-contain" />
                    <div v-else class="text-[10px] font-bold text-white/10 uppercase italic">LOGO</div>
                 </div>
                 
                 <div class="flex-1 space-y-2">
                    <label class="inline-flex items-center px-4 py-2 bg-kros-blue/10 hover:bg-kros-blue/20 border border-kros-blue/20 rounded-xl cursor-pointer transition-all">
                       <span class="text-[9px] font-black text-kros-blue uppercase tracking-widest">Escolher Arquivo</span>
                       <input 
                         type="file" 
                         @change="e => handleFileChange(e, 'logo')" 
                         class="hidden" 
                         accept="image/png,image/svg+xml" 
                       />
                    </label>
                    <p class="text-[9px] text-white/30 font-medium uppercase leading-tight">Recomendado: 512x512px <br/> Formatos: PNG ou SVG</p>
                 </div>
              </div>
           </div>

           <!-- Favicon Upload -->
           <div class="space-y-3">
              <label class="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-1 flex items-center gap-2">
                 <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="text-kros-blue"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                 Favicon (Ícone do Navegador)
              </label>
              
              <div class="flex items-center gap-6 p-4 bg-white/5 border border-white/10 rounded-3xl">
                 <div class="w-16 h-16 rounded-2xl bg-[#080809] border border-white/5 flex items-center justify-center p-4 overflow-hidden shadow-inner">
                    <img v-if="wlData.favicon_url" :src="wlData.favicon_url" class="w-full h-full object-contain" />
                    <div v-else class="text-[10px] font-bold text-white/10 uppercase italic">PNG</div>
                 </div>
                 
                 <div class="flex-1 space-y-2">
                    <label class="inline-flex items-center px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl cursor-pointer transition-all">
                       <span class="text-[9px] font-black text-white/60 uppercase tracking-widest">Escolher Ícone</span>
                       <input 
                         type="file" 
                         @change="e => handleFileChange(e, 'favicon')" 
                         class="hidden" 
                         accept="image/png,image/x-icon" 
                       />
                    </label>
                    <p class="text-[9px] text-white/30 font-medium uppercase leading-tight">Recomendado: 32x32px <br/> Formato: PNG ou ICO</p>
                 </div>
              </div>
           </div>
        </div>
     </div>

      <div class="pt-8 border-t border-white/5 flex gap-4 items-center justify-between mt-4">
         <p v-if="status" :class="status.success ? 'text-emerald-400' : 'text-red-400'" class="text-[10px] font-bold uppercase tracking-widest italic animate-bounce">
           {{ status.message }}
         </p>
         <div class="flex-1"></div>
         <button 
           @click="$emit('save', wlData)"
           :disabled="loading"
           class="btn-primary px-10 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all disabled:opacity-50 shadow-[0_10px_30px_rgba(var(--kros-blue-rgb),0.3)]"
         >
           {{ loading ? 'PROCESSANDO...' : 'APLICAR IDENTIDADE' }}
         </button>
      </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, watch } from 'vue'

const props = defineProps<{
  settings: {
    system_name: string
    primary_color: string
    logo_url: string
    favicon_url: string
  }
  loading: boolean
  status: { success: boolean; message: string } | null
}>()

const emit = defineEmits(['save', 'upload'])

const handleFileChange = (event: Event, type: 'logo' | 'favicon') => {
  emit('upload', event, type)
  // Reseta o valor para permitir selecionar o mesmo arquivo novamente
  const target = event.target as HTMLInputElement
  if (target) target.value = ''
}

const wlData = reactive({ ...props.settings })

// Sincroniza dados locais se a prop mudar (ex: após o upload)
watch(() => props.settings, (newVal) => {
  if (newVal) {
    // Atualização agressiva para garantir reatividade da pré-visualização
    wlData.system_name = newVal.system_name
    wlData.primary_color = newVal.primary_color
    wlData.logo_url = newVal.logo_url
    wlData.favicon_url = newVal.favicon_url
  }
}, { deep: true, immediate: true })
</script>
