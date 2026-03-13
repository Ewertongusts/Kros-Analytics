<template>
  <Teleport to="body">
    <Transition name="modal">
      <div 
        v-if="isOpen"
        class="fixed inset-0 z-[9999] flex items-center justify-center p-4"
        @click.self="$emit('close')"
      >
        <!-- Overlay -->
        <div class="absolute inset-0 bg-black/80 backdrop-blur-sm"></div>
        
        <!-- Modal -->
        <div class="relative w-full max-w-4xl max-h-[90vh] bg-[#111112] border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
          <!-- Header -->
          <div class="flex items-center justify-between p-6 border-b border-white/5">
            <div>
              <h2 class="text-xl font-black text-white uppercase tracking-tight">Histórico de Ações</h2>
              <p class="text-sm text-white/40 mt-1">Linha do tempo de todas as ações realizadas em assinaturas</p>
            </div>
            <div class="flex items-center gap-2">
              <button 
                @click="$emit('refresh')"
                :disabled="loading"
                class="p-2 hover:bg-white/5 rounded-xl transition-all text-white/60 hover:text-white disabled:opacity-50"
                title="Atualizar histórico"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" :class="loading ? 'animate-spin' : ''">
                  <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
                  <path d="M3 3v5h5"/>
                  <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/>
                  <path d="M16 16h5v5"/>
                </svg>
              </button>
              <button 
                @click="$emit('close')"
                class="p-2 hover:bg-white/5 rounded-xl transition-all text-white/40 hover:text-white"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M18 6 6 18M6 6l12 12"/>
                </svg>
              </button>
            </div>
          </div>
          
          <!-- Body -->
          <div class="flex-1 overflow-y-auto p-6">
            <SubscriptionsKPaymentHistoryTimeline 
              :history="history || []"
              :loading="loading"
            />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  isOpen: boolean
  history?: any[]
  loading?: boolean
}>(), {
  history: () => [],
  loading: false
})

defineEmits(['close', 'refresh'])
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
</style>
