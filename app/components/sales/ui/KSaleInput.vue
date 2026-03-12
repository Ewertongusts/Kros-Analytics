<template>
  <div class="space-y-2">
    <label v-if="label" class="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/50 pl-1">
      {{ label }} <span v-if="required" class="text-red-400">*</span>
    </label>
    <input 
      :value="modelValue"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
      :type="type"
      :required="required"
      :placeholder="placeholder"
      :disabled="disabled"
      :step="step"
      :min="min"
      :max="max"
      :class="[
        'w-full bg-white/[0.03] border rounded-xl px-5 py-2.5 text-xs text-white outline-none transition-all font-medium placeholder:text-white/20',
        error ? 'border-red-500 focus:border-red-500' : 'border-white/10 focus:border-kros-blue',
        disabled ? 'opacity-50 cursor-not-allowed' : ''
      ]"
    />
    <p v-if="hint" class="text-[9px] text-white/40 pl-1">{{ hint }}</p>
    <p v-if="error" class="text-[9px] text-red-400 pl-1 flex items-center gap-1">
      <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
      {{ error }}
    </p>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  modelValue: string | number
  label?: string
  type?: string
  required?: boolean
  placeholder?: string
  disabled?: boolean
  step?: string
  min?: string | number
  max?: string | number
  hint?: string
  error?: string
}>()

defineEmits<{
  'update:modelValue': [value: string | number]
}>()
</script>
