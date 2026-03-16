<template>
  <div class="grid grid-cols-7 gap-1 mb-2">
    <div v-for="day in weekDays" :key="day" class="text-center text-xs font-semibold text-white/50">
      {{ day }}
    </div>
  </div>
</template>

<script setup lang="ts">
const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab']
</script>