<template>
  <div class="flex-1 min-w-0">
    <KAppointmentTitle :title="appointment.title" />
    <KAppointmentDate :date="appointment.due_date" />
    <KCalendarPriorityBadge :priority="appointment.priority" />
  </div>
</template>

<script setup lang="ts">
import type { Task } from '~/composables/useTasks'
import KAppointmentTitle from './KAppointmentTitle.vue'
import KAppointmentDate from './KAppointmentDate.vue'
import KCalendarPriorityBadge from './KCalendarPriorityBadge.vue'

defineProps<{ appointment: Task }>()
</script>