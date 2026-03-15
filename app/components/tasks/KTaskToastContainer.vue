<template>
  <div class="fixed bottom-6 right-6 z-50 space-y-2 pointer-events-none">
    <transition-group name="toast" tag="div">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        :class="[
          'pointer-events-auto px-4 py-3 rounded-xl font-semibold text-sm animate-in fade-in slide-in-from-right-4 duration-300',
          toast.type === 'success' && 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-300',
          toast.type === 'error' && 'bg-red-500/20 border border-red-500/30 text-red-300',
          toast.type === 'info' && 'bg-blue-500/20 border border-blue-500/30 text-blue-300',
          toast.type === 'warning' && 'bg-yellow-500/20 border border-yellow-500/30 text-yellow-300'
        ]"
      >
        <div class="flex items-center gap-2">
          <span v-if="toast.type === 'success'">✓</span>
          <span v-else-if="toast.type === 'error'">✕</span>
          <span v-else-if="toast.type === 'info'">ℹ</span>
          <span v-else-if="toast.type === 'warning'">⚠</span>
          {{ toast.message }}
        </div>
      </div>
    </transition-group>
  </div>
</template>

<script setup lang="ts">
import { useTaskToast } from '~/composables/useTaskToast'

const { toasts } = useTaskToast()
</script>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
</style>
