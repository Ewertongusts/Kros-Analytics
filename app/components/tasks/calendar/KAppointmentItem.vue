<template>
  <div class="p-2.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors cursor-pointer" @click="$emit('select')">
    <div class="flex items-start justify-between gap-2">
      <KAppointmentInfo :appointment="appointment" />
      <KCalendarStatusBadge :status="appointment.status" />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Task } from '~/composables/useTasks'

defineProps<{ appointment: Task }>()
defineEmits<{ select: [] }>()
</script>