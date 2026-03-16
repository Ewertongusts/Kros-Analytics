<template>
  <div v-if="selectedIds.length > 0" class="mb-6 animate-in fade-in slide-in-from-top-2 duration-300">
    <div class="flex items-center justify-between gap-4 px-4 py-3 bg-white/[0.02] rounded-xl border border-white/10">
      <div class="flex items-center gap-4">
        <div class="flex items-center gap-2">
          <span class="text-[10px] font-black text-white/70 uppercase tracking-widest">{{ selectedIds.length }} selecionados</span>
          <span class="text-[11px] font-black text-white uppercase tracking-widest">{{ formatCurrency(selectedTotal) }}</span>
        </div>
        
        <div class="h-6 w-px bg-white/10"></div>
        
        <div class="flex items-center gap-2">
          <div class="h-6 w-px bg-white/10"></div>
          
          <button 
            @click="$emit('batch-action', 'whatsapp-api')"
            class="group/whats relative p-2.5 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white rounded-lg transition-all"
            aria-label="Enviar mensagem de cobrança via WhatsApp para selecionados"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 448 512" fill="currentColor"><path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l115.3-30.2c32.4 17.7 68.8 27 108.6 27 122.4 0 222-99.6 222-222 0-59.3-23-115.1-65-157.1zM223.9 446.7c-33.1 0-65.6-8.9-93.9-25.7l-6.7-4-69.8 18.3 18.7-68.1-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 54 81.2 54.1 130.5 0 101.7-82.8 184.5-184.6 184.5zm100.5-137c-5.5-2.8-32.6-16.1-37.7-17.9-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-5.5-2.8-23.2-8.5-44.2-27.2-16.4-14.6-27.4-32.7-30.6-38.2-3.2-5.6-.3-8.6 2.5-11.3 2.5-2.5 5.5-6.5 8.3-9.7 2.8-3.2 3.7-5.5 5.6-9.2 1.9-3.7 1-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 13.2 5.7 23.5 9.2 31.6 11.8 13.3 4.2 25.4 3.6 35 2.2 10.7-1.6 32.6-13.3 37.2-26.2 4.6-12.9 4.6-24 3.2-26.2-1.4-2.3-5.1-3.7-10.6-6.5z"/></svg>
            <div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-[#111112] border border-white/10 rounded-lg shadow-xl opacity-0 group-hover/whats:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-[100]">
              <p class="text-[9px] font-bold text-white uppercase tracking-wider">WhatsApp</p>
            </div>
          </button>
          
          <button 
            @click="$emit('batch-action', 'auto-billing-on')"
            class="group/on relative p-2.5 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white rounded-lg transition-all"
            aria-label="Ativar cobrança automática para selecionados"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/></svg>
            <div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-[#111112] border border-white/10 rounded-lg shadow-xl opacity-0 group-hover/on:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-[100]">
              <p class="text-[9px] font-bold text-white uppercase tracking-wider">Ativar Auto</p>
            </div>
          </button>
          
          <button 
            @click="$emit('batch-action', 'auto-billing-off')"
            class="group/off relative p-2.5 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white rounded-lg transition-all"
            aria-label="Desativar cobrança automática para selecionados"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m19 10-7 7-7-7"/></svg>
            <div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-[#111112] border border-white/10 rounded-lg shadow-xl opacity-0 group-hover/off:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-[100]">
              <p class="text-[9px] font-bold text-white uppercase tracking-wider">Desativar Auto</p>
            </div>
          </button>
          
          <div class="h-6 w-px bg-white/10"></div>
          
          <button 
            @click="$emit('batch-action', 'delete')"
            class="group/delete relative p-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 rounded-lg transition-all"
            aria-label="Apagar assinaturas selecionadas permanentemente"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
            <div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-[#111112] border border-red-500/30 rounded-lg shadow-xl opacity-0 group-hover/delete:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-[100]">
              <p class="text-[9px] font-bold text-red-400 uppercase tracking-wider">⚠️ Apagar</p>
            </div>
          </button>

          <!-- Bulk Tags -->
          <div class="relative">
            <button 
              @click="isBatchTagPickerOpen = !isBatchTagPickerOpen"
              class="group/addtag relative p-2.5 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white rounded-lg transition-all"
              aria-label="Adicionar tag em massa"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2z"/><path d="M7 7h.01"/></svg>
              <div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-[#111112] border border-white/10 rounded-lg shadow-xl opacity-0 group-hover/addtag:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-[100]">
                <p class="text-[9px] font-bold text-white uppercase tracking-wider">Adicionar Tag</p>
              </div>
            </button>

            <div v-if="isBatchTagPickerOpen" class="absolute top-full left-0 mt-2 w-48 bg-[#111112] border border-white/10 rounded-xl shadow-2xl z-[150] p-1 animate-in slide-in-from-top-2 duration-200">
              <div class="max-h-48 overflow-y-auto custom-scrollbar">
                <div class="px-3 py-2 border-b border-white/5 mb-1">
                  <p class="text-[8px] font-black text-white/30 uppercase tracking-[0.2em]">Adicionar Tag</p>
                </div>
                <button 
                  v-for="tag in tagDefinitions" 
                  :key="tag.id"
                  @click="handleAddTag(tag.name)"
                  class="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-white/5 transition-all text-left group/btag"
                >
                  <div :style="{ backgroundColor: tag.color }" class="w-2 h-2 rounded-sm shrink-0"></div>
                  <span class="text-[9px] font-bold text-white/60 uppercase tracking-widest truncate group-hover/btag:text-white">{{ tag.name }}</span>
                </button>
              </div>
            </div>
          </div>

          <!-- Remove Tags -->
          <div class="relative">
            <button 
              @click="isBatchRemoveTagPickerOpen = !isBatchRemoveTagPickerOpen"
              class="group/removetag relative p-2.5 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white rounded-lg transition-all"
              aria-label="Remover tag em massa"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2z"/><path d="M7 7h.01"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
              <div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-[#111112] border border-white/10 rounded-lg shadow-xl opacity-0 group-hover/removetag:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-[100]">
                <p class="text-[9px] font-bold text-white uppercase tracking-wider">Remover Tag</p>
              </div>
            </button>

            <div v-if="isBatchRemoveTagPickerOpen" class="absolute top-full left-0 mt-2 w-48 bg-[#111112] border border-white/10 rounded-xl shadow-2xl z-[150] p-1 animate-in slide-in-from-top-2 duration-200">
              <div class="max-h-48 overflow-y-auto custom-scrollbar">
                <div class="px-3 py-2 border-b border-white/5 mb-1">
                  <p class="text-[8px] font-black text-white/30 uppercase tracking-[0.2em]">Remover Tag</p>
                </div>
                
                <!-- Opção para remover TODAS as tags -->
                <button 
                  @click="handleRemoveAllTags"
                  class="w-full flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-red-500/20 transition-all text-left group/rtag border-b border-white/5 mb-1"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="text-red-400"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                  <span class="text-[9px] font-black text-red-400 uppercase tracking-widest group-hover/rtag:text-red-300">Remover Todas</span>
                </button>
                
                <button 
                  v-for="tag in tagDefinitions" 
                  :key="tag.id"
                  @click="handleRemoveTag(tag.name)"
                  class="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-red-500/10 transition-all text-left group/rtag"
                >
                  <div :style="{ backgroundColor: tag.color }" class="w-2 h-2 rounded-sm shrink-0"></div>
                  <span class="text-[9px] font-bold text-white/60 uppercase tracking-widest truncate group-hover/rtag:text-red-400">{{ tag.name }}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <button 
        @click="$emit('clear-selection')"
        class="px-3 py-1.5 text-white/40 hover:text-white text-[9px] font-bold uppercase tracking-wider transition-all"
      >
        Limpar
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { formatCurrency } from '~/utils/validators'

defineProps<{
  selectedIds: string[]
  selectedTotal: number
  tagDefinitions: any[]
}>()

const emit = defineEmits(['batch-action', 'add-tag-batch', 'remove-tag-batch', 'remove-all-tags-batch', 'clear-selection'])

const isBatchTagPickerOpen = ref(false)
const isBatchRemoveTagPickerOpen = ref(false)

const handleAddTag = (tagName: string) => {
  emit('add-tag-batch', tagName)
  isBatchTagPickerOpen.value = false
}

const handleRemoveTag = (tagName: string) => {
  emit('remove-tag-batch', tagName)
  isBatchRemoveTagPickerOpen.value = false
}

const handleRemoveAllTags = () => {
  emit('remove-all-tags-batch')
  isBatchRemoveTagPickerOpen.value = false
}
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
  border-radius: 4px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.2);
}
</style>
