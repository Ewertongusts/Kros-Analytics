<template>
  <p class="text-xs text-white/60 mt-0.5">{{ formatAppointmentDate(date) }}</p>
</template>

<script setup lang="ts">
import { formatAppointmentDate } from '~/utils/calendarUtils'

defineProps<{ date: string }>()
</script>