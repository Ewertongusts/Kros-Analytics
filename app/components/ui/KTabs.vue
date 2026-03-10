<template>
  <div class="flex items-center gap-2 border-b border-kros-outline dark:border-[#1F1F21] pb-4 overflow-x-auto custom-scrollbar no-scrollbar">
    <button 
      v-for="tab in tabs" 
      :key="tab.id" 
      @click="$emit('update:modelValue', tab.id)"
      class="px-5 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all whitespace-nowrap relative group"
      :class="modelValue === tab.id 
        ? 'bg-kros-blue text-white' 
        : 'text-kros-text/40 dark:text-white/40 hover:bg-white/5 hover:text-white'"
    >
      {{ tab.name }}
    </button>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  tabs: Array<{ id: string; name: string }>
  modelValue: string
}>()

defineEmits(['update:modelValue'])
</script>

<style scoped>
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
