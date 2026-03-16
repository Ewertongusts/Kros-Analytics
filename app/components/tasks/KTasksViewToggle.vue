<template>
  <div class="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
    <div class="flex gap-1 bg-black/40 border border-white/10 rounded-full p-1.5 backdrop-blur-xl shadow-2xl">
      <!-- Lista -->
      <button
        @click="$emit('update:modelValue', 'list')"
        :class="[
          'p-2 rounded-full transition-all duration-300',
          modelValue === 'list'
            ? 'text-white shadow-lg'
            : 'text-white/50 hover:text-white/70'
        ]"
        :style="modelValue === 'list' ? { backgroundColor: 'var(--kros-blue, #FF0000)', boxShadow: '0 0 12px var(--kros-blue, #FF0000)' } : {}"
        title="Vista em Lista"
      >
        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
        </svg>
      </button>

      <!-- Kanban -->
      <button
        @click="$emit('update:modelValue', 'kanban')"
        :class="[
          'p-2 rounded-full transition-all duration-300',
          modelValue === 'kanban'
            ? 'text-white shadow-lg'
            : 'text-white/50 hover:text-white/70'
        ]"
        :style="modelValue === 'kanban' ? { backgroundColor: 'var(--kros-blue, #FF0000)', boxShadow: '0 0 12px var(--kros-blue, #FF0000)' } : {}"
        title="Vista Kanban"
      >
        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M3 4a1 1 0 011-1h4a1 1 0 011 1v14a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm8 0a1 1 0 011-1h4a1 1 0 011 1v14a1 1 0 01-1 1h-4a1 1 0 01-1-1V4zm8 0a1 1 0 011-1h4a1 1 0 011 1v14a1 1 0 01-1 1h-4a1 1 0 01-1-1V4z" />
        </svg>
      </button>

      <!-- Grid -->
      <button
        @click="$emit('update:modelValue', 'grid')"
        :class="[
          'p-2 rounded-full transition-all duration-300',
          modelValue === 'grid'
            ? 'text-white shadow-lg'
            : 'text-white/50 hover:text-white/70'
        ]"
        :style="modelValue === 'grid' ? { backgroundColor: 'var(--kros-blue, #FF0000)', boxShadow: '0 0 12px var(--kros-blue, #FF0000)' } : {}"
        title="Vista em Grid"
      >
        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M3 3a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1V3zm10 0a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1h-6a1 1 0 01-1-1V3zM3 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zm10 0a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1h-6a1 1 0 01-1-1v-6z" />
        </svg>
      </button>

      <!-- Calendário -->
      <button
        @click="$emit('update:modelValue', 'calendar')"
        :class="[
          'p-2 rounded-full transition-all duration-300',
          modelValue === 'calendar'
            ? 'text-white shadow-lg'
            : 'text-white/50 hover:text-white/70'
        ]"
        :style="modelValue === 'calendar' ? { backgroundColor: 'var(--kros-blue, #FF0000)', boxShadow: '0 0 12px var(--kros-blue, #FF0000)' } : {}"
        title="Vista Calendário"
      >
        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  modelValue: 'kanban' | 'list' | 'grid' | 'calendar'
}>()

defineEmits<{
  'update:modelValue': [value: 'kanban' | 'list' | 'grid' | 'calendar']
}>()
</script>
