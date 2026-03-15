<template>
  <Teleport to="body">
    <div
      v-if="isDragging && isOverDropZone"
      class="fixed pointer-events-none z-[9998]"
      :style="{
        left: dropZoneX + 'px',
        top: dropZoneY + 'px',
        width: dropZoneWidth + 'px',
        height: dropZoneHeight + 'px',
      }"
    >
      <!-- Drop Zone Indicator -->
      <div
        class="w-full h-full rounded-xl border-2 border-dashed border-blue-400/60 bg-blue-500/10 flex items-center justify-center"
        :style="{
          boxShadow: 'inset 0 0 30px rgba(59, 130, 246, 0.2), 0 0 40px rgba(59, 130, 246, 0.15)',
          animation: 'drop-zone-pulse 1.5s ease-in-out infinite',
        }"
      >
        <div class="text-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="text-blue-400/60 mx-auto mb-2"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          <p class="text-xs font-bold text-blue-400/60">Solte aqui</p>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  isDragging: boolean
  targetColumn: string | null
  columnElement: HTMLElement | null
}>()

const isOverDropZone = computed(() => {
  return props.isDragging && props.columnElement && props.targetColumn
})

const dropZoneX = computed(() => {
  if (!props.columnElement) return 0
  return props.columnElement.getBoundingClientRect().left
})

const dropZoneY = computed(() => {
  if (!props.columnElement) return 0
  return props.columnElement.getBoundingClientRect().top
})

const dropZoneWidth = computed(() => {
  if (!props.columnElement) return 0
  return props.columnElement.getBoundingClientRect().width
})

const dropZoneHeight = computed(() => {
  if (!props.columnElement) return 0
  return props.columnElement.getBoundingClientRect().height
})
</script>

<style scoped>
@keyframes drop-zone-pulse {
  0%, 100% {
    box-shadow: inset 0 0 20px rgba(59, 130, 246, 0.1), 0 0 30px rgba(59, 130, 246, 0.1);
  }
  50% {
    box-shadow: inset 0 0 40px rgba(59, 130, 246, 0.3), 0 0 50px rgba(59, 130, 246, 0.2);
  }
}
</style>
