<template>
  <div class="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
    <transition-group name="slide">
      <div
        v-for="notification in notifications"
        :key="notification.id"
        :class="[
          'p-4 rounded-lg text-white text-sm font-medium animate-in fade-in slide-in-from-right',
          notification.type === 'success' ? 'bg-emerald-500/90' :
          notification.type === 'error' ? 'bg-red-500/90' :
          notification.type === 'warning' ? 'bg-yellow-500/90' :
          'bg-blue-500/90'
        ]"
      >
        {{ notification.message }}
      </div>
    </transition-group>
  </div>
</template>

<script setup lang="ts">
import { useTaskNotifications } from '~/composables/useTaskNotifications'

const { notifications } = useTaskNotifications()
</script>

<style scoped>
.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
}

.slide-enter-from {
  transform: translateX(100%);
  opacity: 0;
}

.slide-leave-to {
  transform: translateX(100%);
  opacity: 0;
}
</style>
