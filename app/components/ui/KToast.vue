<template>
  <Teleport to="body">
    <div class="fixed top-4 right-4 z-[300] flex flex-col gap-2 pointer-events-none">
      <TransitionGroup name="toast">
        <div
          v-for="toast in toasts"
          :key="toast.id"
          :class="[
            'pointer-events-auto px-4 py-3 rounded-xl shadow-2xl backdrop-blur-xl border flex items-center gap-3 min-w-[300px] max-w-[400px] animate-in slide-in-from-right-5 fade-in duration-300',
            getToastClass(toast.type)
          ]"
        >
          <div class="flex-shrink-0">
            <svg v-if="toast.type === 'success'" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="text-emerald-500">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            <svg v-else-if="toast.type === 'error'" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="text-red-500">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <svg v-else-if="toast.type === 'warning'" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="text-orange-500">
              <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path>
              <line x1="12" y1="9" x2="12" y2="13"></line>
              <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="text-blue-500">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="16" x2="12" y2="12"></line>
              <line x1="12" y1="8" x2="12.01" y2="8"></line>
            </svg>
          </div>
          
          <div class="flex-1 min-w-0">
            <p class="text-sm font-bold text-white">{{ toast.message }}</p>
            <p v-if="toast.description" class="text-xs text-white/60 mt-0.5">{{ toast.description }}</p>
          </div>
          
          <button
            @click="removeToast(toast.id)"
            class="flex-shrink-0 p-1 hover:bg-white/10 rounded-lg transition-all text-white/40 hover:text-white"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface Toast {
  id: number
  type: 'success' | 'error' | 'warning' | 'info'
  message: string
  description?: string
}

const toasts = ref<Toast[]>([])
let nextId = 0

const getToastClass = (type: string) => {
  switch (type) {
    case 'success':
      return 'bg-emerald-500/10 border-emerald-500/20'
    case 'error':
      return 'bg-red-500/10 border-red-500/20'
    case 'warning':
      return 'bg-orange-500/10 border-orange-500/20'
    default:
      return 'bg-blue-500/10 border-blue-500/20'
  }
}

const addToast = (toast: Omit<Toast, 'id'>) => {
  const id = nextId++
  toasts.value.push({ ...toast, id })
  
  setTimeout(() => {
    removeToast(id)
  }, 5000)
}

const removeToast = (id: number) => {
  const index = toasts.value.findIndex(t => t.id === id)
  if (index > -1) {
    toasts.value.splice(index, 1)
  }
}

defineExpose({ addToast })
</script>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(100%);
}
</style>
