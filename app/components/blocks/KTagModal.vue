<template>
  <div v-if="isOpen" class="fixed inset-0 z-[200] flex items-center justify-center px-4">
    <div @click="$emit('close')" class="absolute inset-0 bg-black/90 backdrop-blur-xl"></div>
    
      <div class="relative bg-[#0D0D0E] border border-white/10 rounded-[2.5rem] w-full max-w-[440px] p-8 overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.8)]">
        <div class="mb-8 text-center">
          <h3 class="text-lg font-bold italic uppercase tracking-tighter text-white">
            {{ initialData?.id ? 'EDITAR' : 'NOVA' }} <span class="text-kros-blue text-glow-blue">TAG</span>
          </h3>
          <div class="h-1 w-8 bg-kros-blue mx-auto mt-3 rounded-full opacity-50"></div>
        </div>

      <form @submit.prevent="handleSave" class="space-y-6">
        <div class="space-y-2">
          <label class="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/50 pl-1">Nome da Tag</label>
          <input 
            v-model="form.name"
            type="text"
            required
            placeholder="Ex: VIP, Tecnologia, Urgente"
            class="w-full bg-white/[0.03] border border-white/10 rounded-xl px-5 py-3.5 text-xs text-white outline-none focus:border-kros-blue transition-all font-medium placeholder:text-white/20"
          />
        </div>

        <div class="space-y-3">
          <label class="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/50 pl-1">Cor da Identidade</label>
          <div class="flex flex-wrap gap-3 p-5 bg-white/[0.02] border border-white/5 rounded-2xl">
            <button 
              v-for="color in PRESET_COLORS" 
              :key="color"
              type="button"
              @click="form.color = color"
              class="w-8 h-8 rounded-full border-2 transition-all transform hover:scale-110"
              :class="[form.color === color ? 'border-white' : 'border-transparent']"
              :style="{ backgroundColor: color }"
            ></button>
            <div class="flex items-center gap-3 ml-2 border-l border-white/10 pl-4">
              <div class="relative w-8 h-8">
                 <input 
                  v-model="form.color"
                  type="color"
                  class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div class="w-full h-full rounded-full border border-white/20 flex items-center justify-center bg-white/5 overflow-hidden">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="text-white opacity-50"><path d="m15 3 6 6"/><path d="m14 11-4-4"/><path d="m8.5 12.5-3.5 3.5"/><path d="m20.2 2.8-7.5 7.5L3 21"/><circle cx="5" cy="19" r="2"/></svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="space-y-2">
          <label class="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/50 pl-1">Descrição Explicativa (Hover)</label>
          <textarea 
            v-model="form.description"
            rows="3"
            placeholder="O que esta tag representa?"
            class="w-full bg-white/[0.03] border border-white/10 rounded-xl px-5 py-3.5 text-xs text-white outline-none focus:border-kros-blue transition-all resize-none font-medium placeholder:text-white/20"
          ></textarea>
        </div>

        <div class="flex gap-3 pt-2">
          <button 
            type="button"
            @click="$emit('close')"
            class="flex-1 py-3.5 text-[10px] font-semibold uppercase tracking-widest text-white/40 hover:text-white hover:bg-white/5 rounded-xl transition-all"
          >
            Cancelar
          </button>
          <button 
            type="submit"
            :disabled="submitting"
            class="flex-1 bg-kros-blue text-white py-3.5 rounded-xl text-[10px] font-semibold uppercase tracking-widest shadow-[0_10px_30px_rgba(0,123,255,0.2)] hover:bg-blue-600 transition-all disabled:opacity-50"
          >
            {{ submitting ? 'SINC...' : 'CONFIRMAR' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, watch } from 'vue'
import type { TagDefinition } from '~/composables/useTags'

const props = defineProps<{
  isOpen: boolean
  initialData?: TagDefinition
  submitting?: boolean
}>()

const emit = defineEmits(['close', 'save'])

const PRESET_COLORS = [
  '#3B82F6', // Azul
  '#10B981', // Verde
  '#F59E0B', // Âmbar
  '#EF4444', // Vermelho
  '#8B5CF6', // Roxo
  '#EC4899', // Rosa
  '#06B6D4', // Ciano
  '#FFFFFF'  // Branco
]

const form = reactive<TagDefinition>({
  id: undefined,
  name: '',
  color: '#3B82F6',
  description: ''
})

watch(() => props.isOpen, (val) => {
  if (val) {
    if (props.initialData) {
      form.id = props.initialData.id
      form.name = props.initialData.name
      form.color = props.initialData.color
      form.description = props.initialData.description
    } else {
      form.id = undefined
      form.name = ''
      form.color = '#3B82F6'
      form.description = ''
    }
  }
})

const handleSave = () => {
  emit('save', { ...form })
}
</script>

<style scoped>
.text-glow-blue {
  text-shadow: 0 0 15px rgba(59, 130, 246, 0.5);
}
</style>
