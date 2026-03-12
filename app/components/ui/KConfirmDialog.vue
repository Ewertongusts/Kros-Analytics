<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="isOpen" class="fixed inset-0 z-[99999] flex items-center justify-center px-4">
        <div @click="handleCancel" class="fixed inset-0 bg-black/80 backdrop-blur-sm"></div>
        
        <div class="relative bg-[#0D0D0E] border border-white/10 rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in zoom-in duration-200">
          <div class="flex items-start gap-4">
            <div 
              :class="[
                'flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center',
                variant === 'whatsapp' ? 'bg-green-500/10' : 'bg-yellow-500/10'
              ]"
            >
              <svg 
                v-if="variant === 'whatsapp'"
                xmlns="http://www.w3.org/2000/svg" 
                width="20" 
                height="20" 
                viewBox="0 0 448 512" 
                fill="currentColor" 
                class="text-green-500"
              >
                <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"/>
              </svg>
              <svg 
                v-else
                xmlns="http://www.w3.org/2000/svg" 
                width="20" 
                height="20" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                stroke-width="2" 
                stroke-linecap="round" 
                stroke-linejoin="round" 
                class="text-yellow-500"
              >
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
              :class="[
                'flex-1 px-4 py-2.5 rounded-xl text-white transition-all text-sm font-semibold',
                variant === 'whatsapp' 
                  ? 'bg-green-500 hover:bg-green-600' 
                  : 'bg-red-500 hover:bg-red-600'
              ]"
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
const variant = ref<'default' | 'whatsapp'>('default')
const resolveCallback = ref<((value: boolean) => void) | null>(null)

const show = (msg: string, ttl: string | undefined, resolve: (value: boolean) => void, variantType?: 'default' | 'whatsapp') => {
  message.value = msg
  title.value = ttl || 'Confirmar ação'
  variant.value = variantType || 'default'
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
