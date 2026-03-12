<template>
  <div class="animate-pulse">
    <!-- Skeleton para tabela de cobranças -->
    <div v-if="type === 'table'" class="space-y-3">
      <div v-for="i in rows" :key="i" class="flex items-center gap-4 p-4 bg-white/[0.02] rounded-2xl border border-white/5">
        <div class="w-5 h-5 bg-white/5 rounded-md"></div>
        <div class="flex items-center gap-3 flex-1">
          <div class="w-9 h-9 bg-white/5 rounded-full"></div>
          <div class="flex-1 space-y-2">
            <div class="h-3 bg-white/5 rounded w-1/3"></div>
            <div class="h-2 bg-white/5 rounded w-1/4"></div>
          </div>
        </div>
        <div class="h-3 bg-white/5 rounded w-16"></div>
        <div class="h-3 bg-white/5 rounded w-16"></div>
        <div class="h-3 bg-white/5 rounded w-20"></div>
        <div class="h-3 bg-white/5 rounded w-20"></div>
        <div class="w-6 h-6 bg-white/5 rounded-full"></div>
        <div class="flex gap-2">
          <div class="w-8 h-8 bg-white/5 rounded-xl"></div>
          <div class="w-8 h-8 bg-white/5 rounded-xl"></div>
          <div class="w-8 h-8 bg-white/5 rounded-xl"></div>
        </div>
      </div>
    </div>

    <!-- Skeleton para cards -->
    <div v-else-if="type === 'card'" class="p-6 bg-white/[0.02] rounded-2xl border border-white/5 space-y-4">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 bg-white/5 rounded-xl"></div>
        <div class="flex-1 space-y-2">
          <div class="h-4 bg-white/5 rounded w-1/3"></div>
          <div class="h-3 bg-white/5 rounded w-1/4"></div>
        </div>
      </div>
      <div class="space-y-2">
        <div class="h-3 bg-white/5 rounded w-full"></div>
        <div class="h-3 bg-white/5 rounded w-5/6"></div>
        <div class="h-3 bg-white/5 rounded w-4/6"></div>
      </div>
    </div>

    <!-- Skeleton genérico -->
    <div v-else :class="['bg-white/5 rounded', className]" :style="{ width, height }"></div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  type?: 'table' | 'card' | 'default'
  rows?: number
  width?: string
  height?: string
  className?: string
}>()
</script>
