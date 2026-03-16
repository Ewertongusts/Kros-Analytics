<template>
  <div class="p-2.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors cursor-pointer" @click="$emit('select')">
    <div class="flex items-start justify-between gap-2">
      <div class="flex-1 min-w-0">
        <h4 class="text-xs font-medium text-white truncate">{{ appointment.title }}</h4>
        <p class="text-xs text-white/60 mt-0.5">{{ formatAppointmentDate(appointment.due_date) }}</p>
      </div>
      <div class="px-1.5 py-0.5 rounded text-xs font-medium" :class="getStatusColor(appointment.status)">
        {{ getStatusLabel(appointment.status) }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Task } from '~/composables/useTasks'
import { formatAppointmentDate, getStatusLabel, getStatusColor } from '~/utils/calendarUtils'

defineProps<{ appointment: Task }>()
defineEmits<{ select: [] }>()
</script>