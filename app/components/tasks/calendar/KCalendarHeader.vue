<template>
  <div class="flex items-center justify-between gap-3 p-3 border-b border-white/10">
    <KCalendarHeaderButton icon-path="M15 19l-7-7 7-7" @click="$emit('previous')" />
    <h2 class="text-sm font-semibold text-white">{{ monthYear }}</h2>
    <KCalendarHeaderButton icon-path="M9 5l7 7-7 7" @click="$emit('next')" />
    <KCalendarTodayButton @click="$emit('today')" />
  </div>
</template>

<script setup lang="ts">
defineProps<{ monthYear: string }>()
defineEmits<{ previous: []; next: []; today: [] }>()
</script>