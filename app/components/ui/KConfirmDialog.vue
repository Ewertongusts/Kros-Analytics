<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="isOpen" class="fixed inset-0 z-[99999] flex items-center justify-center px-4">
        <div @click="handleCancel" class="fixed inset-0 bg-black/80 backdrop-blur-sm"></div>
        
        <div class="relative bg-[#0D0D0E] border border-white/10 rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in zoom-in duration-200">
          <div class="flex items-start gap-4">
            <div class="flex-shrink-0 w-10 h-10 rounded-full bg-yellow-500/10 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-yellow-500">
                <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
                <line x1="12" y1="9" x2="12" y2="13"/>
                <line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
            </div>
            
            <div class="flex-1 min-w-0">
              <h3 class="text-lg font-bold text-white mb-2">{{ title }}</h3>
              <p class="text-sm text-white/70">{{ message }}</p>
            </div>
          </div>
          
          <div class="flex gap-3 mt-6">
            <button
              @click="handleCancel"
              class="flex-1 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white transition-all text-sm font-semibold"
            >
              Cancelar
            </button>
            <button
              @click="handleConfirm"
              class="flex-1 px-4 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white transition-all text-sm font-semibold"
            >
              Confirmar
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
const isOpen = ref(false)
const message = ref('')
const title = ref('Confirmar ação')
const resolveCallback = ref<((value: boolean) => void) | null>(null)

const show = (msg: string, ttl: string | undefined, resolve: (value: boolean) => void) => {
  message.value = msg
  title.value = ttl || 'Confirmar ação'
  resolveCallback.value = resolve
  isOpen.value = true
}

const handleConfirm = () => {
  isOpen.value = false
  if (resolveCallback.value) {
    resolveCallback.value(true)
    resolveCallback.value = null
  }
}

const handleCancel = () => {
  isOpen.value = false
  if (resolveCallback.value) {
    resolveCallback.value(false)
    resolveCallback.value = null
  }
}

defineExpose({ show })
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
