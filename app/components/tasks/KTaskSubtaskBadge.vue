<template>
  <div v-if="completionPercentage > 0 || totalSubtasks > 0" class="flex items-center gap-1.5">
    <div class="flex items-center gap-1">
      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-blue-400">
        <polyline points="12 3 20 7.5 20 16.5 12 21 4 16.5 4 7.5 12 3"/>
        <line x1="12" y1="12" x2="20" y2="7.5"/>
        <line x1="12" y1="12" x2="12" y2="21"/>
        <line x1="12" y1="12" x2="4" y2="7.5"/>
      </svg>
      <span class="text-[10px] font-bold text-blue-400">{{ completedSubtasks }}/{{ totalSubtasks }}</span>
    </div>
    <div class="w-12 h-1.5 bg-white/10 rounded-full overflow-hidden">
      <div 
        class="h-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all duration-300"
        :style="{ width: `${completionPercentage}%` }"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

interface Props {
  taskId: string
}

const props = defineProps<Props>()

const { fetchSubtasks } = useSubtasks()

const totalSubtasks = ref(0)
const completedSubtasks = ref(0)
const completionPercentage = ref(0)

const loadSubtaskStats = async () => {
  const subtasks = await fetchSubtasks(props.taskId)
  totalSubtasks.value = subtasks.length
  completedSubtasks.value = subtasks.filter(st => st.status === 'done').length
  completionPercentage.value = totalSubtasks.value > 0 
    ? Math.round((completedSubtasks.value / totalSubtasks.value) * 100)
    : 0
}

onMounted(() => {
  loadSubtaskStats()
})
</script>
