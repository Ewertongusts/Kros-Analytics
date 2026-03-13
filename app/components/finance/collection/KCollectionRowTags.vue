<template>
  <div class="flex items-center gap-2 mt-2.5">
    <!-- Indicador de WhatsApp -->
    <div 
      v-if="!hasValidWhatsApp"
      class="group/whatsapp relative"
      title="WhatsApp não cadastrado"
    >
      <div class="w-5 h-5 rounded-md bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
        <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 448 512" fill="currentColor" class="text-orange-500">
          <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l115.3-30.2c32.4 17.7 68.8 27 108.6 27 122.4 0 222-99.6 222-222 0-59.3-23-115.1-65-157.1zM223.9 446.7c-33.1 0-65.6-8.9-93.9-25.7l-6.7-4-69.8 18.3 18.7-68.1-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 54 81.2 54.1 130.5 0 101.7-82.8 184.5-184.6 184.5zm100.5-137c-5.5-2.8-32.6-16.1-37.7-17.9-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-5.5-2.8-23.2-8.5-44.2-27.2-16.4-14.6-27.4-32.7-30.6-38.2-3.2-5.6-.3-8.6 2.5-11.3 2.5-2.5 5.5-6.5 8.3-9.7 2.8-3.2 3.7-5.5 5.6-9.2 1.9-3.7 1-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 13.2 5.7 23.5 9.2 31.6 11.8 13.3 4.2 25.4 3.6 35 2.2 10.7-1.6 32.6-13.3 37.2-26.2 4.6-12.9 4.6-24 3.2-26.2-1.4-2.3-5.1-3.7-10.6-6.5z"/>
        </svg>
      </div>
      <div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1.5 bg-black/95 border border-orange-500/20 rounded-lg shadow-2xl opacity-0 group-hover/whatsapp:opacity-100 transition-all pointer-events-none z-[200] whitespace-nowrap">
        <span class="text-[8px] font-black text-orange-500 uppercase tracking-widest">WhatsApp não cadastrado</span>
      </div>
    </div>
    
    <!-- Tags como bolinhas -->
    <div class="flex items-center gap-1.5 flex-wrap max-w-[180px]">
      <div 
        v-for="tag in tags" 
        :key="tag"
        class="relative"
      >
        <button
          @click.stop="toggleTagTooltip(tag)"
          :style="{ backgroundColor: getTagColor(tag) }"
          class="w-3 h-3 rounded-full shadow-[0_0_8px_rgba(0,0,0,0.3)] border border-white/10 transition-all duration-300 hover:scale-125 cursor-pointer"
        ></button>

        <div 
          v-if="activeTooltip === tag"
          class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 flex items-center gap-2 px-2 py-1.5 bg-black/95 border border-white/10 rounded-lg shadow-2xl z-[200] whitespace-nowrap animate-in fade-in zoom-in-95 duration-200"
        >
          <div :style="{ backgroundColor: getTagColor(tag) }" class="w-2 h-2 rounded-full shrink-0"></div>
          <span class="text-[9px] font-black text-white/90 uppercase tracking-widest">{{ tag }}</span>
          <button 
            @click.stop="handleRemoveTag(tag)"
            class="ml-1 p-0.5 hover:bg-red-500/20 text-white/30 hover:text-red-500 rounded transition-all"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
          </button>
        </div>
      </div>

      <!-- Botão Adicionar Tag -->
      <div class="relative ml-0.5">
        <button 
          @click.stop="$emit('toggle-picker')"
          class="w-3.5 h-3.5 rounded-full border border-dashed border-white/20 flex items-center justify-center text-white/30 hover:text-white hover:border-white/40 transition-all bg-white/5"
          title="Adicionar Tag"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12h14"/></svg>
        </button>

        <div v-if="showPicker" class="absolute top-full left-0 mt-2 w-42 bg-[#111112] border border-white/10 rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.9)] z-[200] p-1 animate-in fade-in zoom-in-95 duration-200">
          <div class="max-h-40 overflow-y-auto custom-scrollbar">
            <button 
              v-for="tag in availableTags" 
              :key="tag.id"
              @click.stop="$emit('add-tag', tag.name)"
              class="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-white/5 transition-all text-left"
            >
              <div :style="{ backgroundColor: tag.color }" class="w-2 h-2 rounded-sm shrink-0"></div>
              <span class="text-[9px] font-bold text-white/60 uppercase tracking-widest truncate">{{ tag.name }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

const props = defineProps<{
  tags: string[]
  whatsapp?: string
  tagDefinitions: any[]
  showPicker: boolean
}>()

const emit = defineEmits(['remove-tag', 'add-tag', 'toggle-picker'])

const activeTooltip = ref<string | null>(null)

const hasValidWhatsApp = computed(() => {
  const rawNum = props.whatsapp?.replace(/\D/g, '') || ''
  return rawNum && rawNum.length >= 10
})

const availableTags = computed(() => {
  return props.tagDefinitions.filter(t => !props.tags?.includes(t.name))
})

const getTagColor = (tagName: string) => {
  const def = props.tagDefinitions.find(t => t.name === tagName)
  return def?.color || '#3B82F6'
}

const toggleTagTooltip = (tag: string) => {
  activeTooltip.value = activeTooltip.value === tag ? null : tag
}

const handleRemoveTag = (tag: string) => {
  activeTooltip.value = null
  emit('remove-tag', tag)
}

// Fechar tooltip ao clicar fora
const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as HTMLElement
  if (!target.closest('.relative')) {
    activeTooltip.value = null
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
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
