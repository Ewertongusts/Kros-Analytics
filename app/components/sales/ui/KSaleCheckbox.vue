<template>
  <div class="flex items-center gap-2">
    <input 
      type="checkbox" 
      :id="id"
      :checked="modelValue"
      @change="$emit('update:modelValue', ($event.target as HTMLInputElement).checked)"
      class="w-4 h-4 rounded border-white/20 bg-white/5 text-kros-blue focus:ring-kros-blue focus:ring-offset-0"
    />
    <label :for="id" class="text-xs text-white/80 cursor-pointer">
      <slot />
    </label>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  id: string
  modelValue: boolean
}>()

defineEmits<{
  'update:modelValue': [value: boolean]
}>()
</script>
