<template>
  <div class="space-y-3">
    <label class="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] pl-1 flex justify-between items-center">
      <span>Modelos Ativos</span>
      <span v-if="selectedIds.length > 1" class="text-emerald-500 animate-pulse">ROTAÇÃO ATIVA</span>
    </label>
    
    <div class="flex flex-wrap gap-2 items-center">
      <!-- Selected Tags -->
      <button 
        v-for="id in selectedIds" 
        :key="id"
        @click="toggleTemplate(id)"
        class="px-3 py-1.5 rounded-lg bg-kros-blue text-white border border-white/20 text-[10px] font-black uppercase transition-all shadow-lg hover:scale-95 flex items-center gap-2"
      >
        {{ templates.find(t => t.id === id)?.name || 'Modelo' }}
        <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
      </button>

      <!-- Add Button -->
      <div class="relative">
        <button 
          @click="showPicker = !showPicker"
          class="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all active:scale-90"
          title="Adicionar mais modelos"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" :class="['transition-transform duration-300', showPicker ? 'rotate-45' : '']"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
        </button>

        <!-- Popover Dropdown -->
        <div v-if="showPicker" class="absolute top-full left-0 mt-2 w-56 bg-[#111112] border border-white/10 rounded-xl shadow-2xl z-[50] p-2 animate-in zoom-in-95 fade-in duration-200 origin-top-left">
          <div class="max-h-48 overflow-y-auto custom-scrollbar space-y-1">
            <button 
              v-for="tmpl in availableTemplates"
              :key="tmpl.id"
              @click="toggleTemplate(tmpl.id!); showPicker = false"
              class="w-full text-left px-3 py-2 rounded-lg text-[10px] font-bold text-white/60 hover:text-white hover:bg-white/5 transition-all uppercase tracking-tight"
            >
              {{ tmpl.name }}
            </button>
            <div v-if="availableTemplates.length === 0" class="p-3 text-center opacity-30 text-[9px] font-bold uppercase">
              Todos selecionados
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const props = defineProps<{
  templates: any[]
  selectedIds: string[]
  manualMessage: string
}>()

const emit = defineEmits<{
  'update:selectedIds': [ids: string[]]
  'update:manualMessage': [message: string]
}>()

const showPicker = ref(false)

const availableTemplates = computed(() => {
  return props.templates.filter(t => !props.selectedIds.includes(t.id!))
})

const toggleTemplate = (id: string) => {
  const tmpl = props.templates.find(t => t.id === id)
  if (tmpl) {
    emit('update:manualMessage', tmpl.body)
  }
  
  const idx = props.selectedIds.indexOf(id)
  const newIds = [...props.selectedIds]
  
  if (idx === -1) {
    newIds.push(id)
  } else {
    newIds.splice(idx, 1)
  }
  
  emit('update:selectedIds', newIds)
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
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
}
</style>
