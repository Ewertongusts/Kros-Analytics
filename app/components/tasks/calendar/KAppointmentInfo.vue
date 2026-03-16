<template>
  <div class="flex-1 min-w-0">
    <KAppointmentTitle :title="appointment.title" />
    <KAppointmentDate :date="appointment.due_date" />
    <KCalendarPriorityBadge :priority="appointment.priority" />
  </div>
</template>

<script setup lang="ts">
import type { Task } from '~/composables/useTasks'

defineProps<{ appointment: Task }>()
</script>