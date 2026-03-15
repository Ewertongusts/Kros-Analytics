<template>
  <Teleport to="body">
    <div
      v-if="isCurrentlyDragging"
      class="fixed pointer-events-none z-50"
      :style="{
        left: mouseX + 'px',
        top: mouseY + 'px',
        transform: 'translate(-50%, -50%)'
      }"
    >
      <!-- Preview Card -->
      <div class="w-72 p-3 bg-gradient-to-br from-blue-500/20 to-blue-500/10 border border-blue-400/60 rounded-xl shadow-2xl shadow-blue-500/50 backdrop-blur-md">
        <!-- Header -->
        <div class="flex items-start justify-between mb-2">
          <div class="flex-1 min-w-0">
            <h3 class="font-bold text-white text-sm truncate">{{ task.title }}</h3>
            <p class="text-[10px] text-white/60 truncate">{{ task.description }}</p>
          </div>
          <span
            :class="[
              'px-2 py-1 rounded text-[8px] font-bold uppercase flex-shrink-0 ml-2',
              task.priority === 'alta' ? 'bg-red-500/40 text-red-200' :
              task.priority === 'media' ? 'bg-yellow-500/40 text-yellow-200' :
              'bg-blue-500/40 text-blue-200'
            ]"
          >
            {{ task.priority || 'Média' }}
          </span>
        </div>

        <!-- Info -->
        <div class="space-y-1 text-[9px]">
          <div v-if="task.assigned_to" class="flex items-center gap-2">
            <UiKAvatar :name="task.assigned_to" size="xs" />
            <span class="text-white/80">{{ task.assigned_to }}</span>
          </div>
          <div v-if="task.company_name" class="flex items-center gap-2 text-white/80">
            <span>🏢</span>
            <span>{{ task.company_name }}</span>
          </div>
        </div>

        <!-- Badge -->
        <div class="mt-2 flex items-center gap-2">
          <span class="px-2 py-1 bg-blue-400/30 text-blue-200 rounded text-[8px] font-bold">
            ✨ Movendo...
          </span>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

const props = defineProps<{
  task: any
  isDragging: boolean
  draggedTaskId: string | null
}>()

const mouseX = ref(0)
const mouseY = ref(0)

const isCurrentlyDragging = computed(() => 
  props.isDragging && props.draggedTaskId === props.task.id
)

const handleMouseMove = (e: MouseEvent) => {
  if (isCurrentlyDragging.value) {
    mouseX.value = e.clientX
    mouseY.value = e.clientY
  }
}

onMounted(() => {
  window.addEventListener('mousemove', handleMouseMove)
})

onUnmounted(() => {
  window.removeEventListener('mousemove', handleMouseMove)
})
</script>
