<template>
  <Teleport to="body">
    <div class="fixed top-4 right-4 z-[99999] flex flex-col gap-3 pointer-events-none">
      <TransitionGroup name="toast">
        <div
          v-for="toast in toasts"
          :key="toast.id"
          class="pointer-events-auto bg-[#0D0D0E] border rounded-xl shadow-2xl overflow-hidden min-w-[320px] max-w-[400px] animate-in slide-in-from-right"
          :class="getBorderColor(toast.type)"
        >
          <div class="flex items-start gap-3 p-4">
            <div class="flex-shrink-0 mt-0.5">
              <component :is="getIcon(toast.type)" :class="getIconColor(toast.type)" />
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-semibold text-white">{{ toast.message }}</p>
              <p v-if="toast.description" class="text-xs text-white/60 mt-1">{{ toast.description }}</p>
            </div>
            <button
              @click="removeToast(toast.id)"
              class="flex-shrink-0 text-white/40 hover:text-white/80 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
interface Toast {
  id: number
  type: 'success' | 'error' | 'warning' | 'info'
  message: string
  description?: string
}

const toasts = ref<Toast[]>([])
let toastId = 0

const addToast = (toast: Omit<Toast, 'id'>) => {
  const id = ++toastId
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

const getBorderColor = (type: Toast['type']) => {
  const colors = {
    success: 'border-green-500/30',
    error: 'border-red-500/30',
    warning: 'border-yellow-500/30',
    info: 'border-blue-500/30'
  }
  return colors[type]
}

const getIconColor = (type: Toast['type']) => {
  const colors = {
    success: 'text-green-500',
    error: 'text-red-500',
    warning: 'text-yellow-500',
    info: 'text-blue-500'
  }
  return colors[type]
}

const getIcon = (type: Toast['type']) => {
  return defineComponent({
    setup() {
      const icons = {
        success: () => h('svg', { xmlns: 'http://www.w3.org/2000/svg', width: '20', height: '20', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, [
          h('path', { d: 'M22 11.08V12a10 10 0 1 1-5.93-9.14' }),
          h('polyline', { points: '22 4 12 14.01 9 11.01' })
        ]),
        error: () => h('svg', { xmlns: 'http://www.w3.org/2000/svg', width: '20', height: '20', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, [
          h('circle', { cx: '12', cy: '12', r: '10' }),
          h('line', { x1: '15', y1: '9', x2: '9', y2: '15' }),
          h('line', { x1: '9', y1: '9', x2: '15', y2: '15' })
        ]),
        warning: () => h('svg', { xmlns: 'http://www.w3.org/2000/svg', width: '20', height: '20', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, [
          h('path', { d: 'm21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z' }),
          h('line', { x1: '12', y1: '9', x2: '12', y2: '13' }),
          h('line', { x1: '12', y1: '17', x2: '12.01', y2: '17' })
        ]),
        info: () => h('svg', { xmlns: 'http://www.w3.org/2000/svg', width: '20', height: '20', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, [
          h('circle', { cx: '12', cy: '12', r: '10' }),
          h('line', { x1: '12', y1: '16', x2: '12', y2: '12' }),
          h('line', { x1: '12', y1: '8', x2: '12.01', y2: '8' })
        ])
      }
      return icons[type]
    }
  })
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
