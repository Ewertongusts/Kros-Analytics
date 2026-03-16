<template>
  <div class="px-1.5 py-0.5 rounded text-xs font-medium" :class="getStatusColor(status)">
    {{ getStatusLabel(status) }}
  </div>
</template>

<script setup lang="ts">
import { getStatusLabel, getStatusColor } from '~/utils/calendarUtils'

defineProps<{ status: string }>()
</script>