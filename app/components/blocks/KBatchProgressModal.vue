<template>
  <UiKModal :is-open="isOpen" size="md">
    <div class="p-6 space-y-6">
      <!-- Header -->
      <div class="text-center space-y-2">
        <div class="w-16 h-16 mx-auto rounded-2xl bg-kros-blue/10 border border-kros-blue/20 flex items-center justify-center">
          <svg 
            v-if="!isComplete"
            class="animate-spin text-kros-blue" 
            xmlns="http://www.w3.org/2000/svg" 
            width="32" 
            height="32" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            stroke-width="2" 
            stroke-linecap="round" 
            stroke-linejoin="round"
          >
            <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
          </svg>
          <svg 
            v-else
            class="text-emerald-400" 
            xmlns="http://www.w3.org/2000/svg" 
            width="32" 
            height="32" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            stroke-width="3" 
            stroke-linecap="round" 
            stroke-linejoin="round"
          >
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        </div>
        
        <h3 class="text-lg font-black uppercase tracking-wider text-white">
          {{ title }}
        </h3>
        
        <p class="text-sm text-white/60">
          {{ isComplete ? 'Operação concluída' : 'Processando assinaturas...' }}
        </p>
      </div>

      <!-- Progress Counter -->
      <div class="space-y-3">
        <div class="flex items-center justify-between text-sm">
          <span class="font-bold text-white/70 uppercase tracking-wider">
            Progresso
          </span>
          <span class="font-black text-kros-blue">
            {{ processed }} de {{ total }}
          </span>
        </div>
        
        <!-- Progress Bar -->
        <div class="h-3 bg-white/5 rounded-full overflow-hidden border border-white/10">
          <div 
            class="h-full bg-gradient-to-r from-kros-blue to-blue-400 transition-all duration-300 ease-out"
            :style="{ width: progressPercentage + '%' }"
          ></div>
        </div>
        
        <div class="text-center">
          <span class="text-2xl font-black text-white">
            {{ progressPercentage }}%
          </span>
        </div>
      </div>

      <!-- Results Summary (when complete) -->
      <div v-if="isComplete" class="space-y-3 pt-4 border-t border-white/10">
        <div class="flex items-center justify-between p-3 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
          <span class="text-xs font-bold text-emerald-400 uppercase tracking-wider">
            Sucesso
          </span>
          <span class="text-lg font-black text-emerald-400">
            {{ successCount }}
          </span>
        </div>
        
        <div v-if="failureCount > 0" class="flex items-center justify-between p-3 bg-red-500/10 rounded-lg border border-red-500/20">
          <span class="text-xs font-bold text-red-400 uppercase tracking-wider">
            Erros
          </span>
          <span class="text-lg font-black text-red-400">
            {{ failureCount }}
          </span>
        </div>
      </div>

      <!-- Actions -->
      <div v-if="isComplete" class="flex gap-3">
        <button
          @click="$emit('close')"
          class="flex-1 px-6 py-3 bg-kros-blue hover:bg-blue-600 text-white rounded-xl font-bold uppercase tracking-wider transition-all text-sm"
        >
          Concluir
        </button>
      </div>
      
      <!-- Prevent closing during processing -->
      <div v-else class="text-center text-xs text-white/40">
        Aguarde a conclusão do processamento...
      </div>
      
      <!-- Current Item (optional) -->
      <div v-if="!isComplete && currentItem" class="text-center text-xs text-white/40 truncate">
        Processando: {{ currentItem }}
      </div>
    </div>
  </UiKModal>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  isOpen: boolean
  title: string
  total: number
  processed: number
  successCount: number
  failureCount: number
  currentItem?: string
}>()

defineEmits(['close'])

const isComplete = computed(() => props.processed >= props.total)

const progressPercentage = computed(() => {
  if (props.total === 0) return 0
  return Math.round((props.processed / props.total) * 100)
})
</script>
