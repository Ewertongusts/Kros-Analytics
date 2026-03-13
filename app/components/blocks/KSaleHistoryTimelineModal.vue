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
              <h2 class="text-xl font-black text-white uppercase tracking-tight">Histórico de Vendas</h2>
              <p class="text-sm text-white/40 mt-1">Linha do tempo de todas as ações realizadas em vendas</p>
            </div>
            <button 
              @click="$emit('close')"
              class="p-2 hover:bg-white/5 rounded-xl transition-all text-white/40 hover:text-white"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M18 6 6 18M6 6l12 12"/>
              </svg>
            </button>
          </div>
          
          <!-- Body -->
          <div class="flex-1 overflow-y-auto p-6">
            <SalesHistoryKSaleHistoryTimeline 
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

defineEmits(['close'])
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
