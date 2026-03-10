<template>
  <div class="space-y-1.5">
    <label v-if="label" :for="id" class="block text-sm font-semibold text-kros-text dark:text-white/80">
      {{ label }}
    </label>
    <div class="relative flex items-center">
      <input
        :id="id"
        :type="type"
        :value="modelValue"
        @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
        :placeholder="placeholder"
        :required="required"
        class="w-full bg-kros-surface dark:bg-[#1A1A1A] border border-kros-outline dark:border-[#333333] rounded-lg px-4 py-3 text-kros-text dark:text-kros-surface text-sm transition-colors duration-200 outline-none focus:border-kros-blue focus:ring-1 focus:ring-kros-blue placeholder:text-kros-text/40 dark:placeholder:text-white/40"
        :class="{'pr-12': $slots.trailing || $slots.icon}"
      />
      <div v-if="$slots.icon || $slots.trailing" class="absolute right-4 flex items-center gap-2">
        <slot name="icon"></slot>
        <slot name="trailing"></slot>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  id?: string
  label?: string
  modelValue?: string
  type?: string
  placeholder?: string
  required?: boolean
}>(), {
  id: () => Math.random().toString(36).substr(2, 9),
  type: 'text',
  modelValue: '',
  placeholder: '',
  required: false
})
defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()
</script>
