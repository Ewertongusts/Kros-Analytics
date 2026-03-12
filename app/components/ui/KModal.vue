<template>
  <Teleport to="body">
    <div v-if="isOpen" class="fixed inset-0 z-[9999] flex items-center justify-center px-4">
      <div @click="$emit('close')" class="fixed inset-0 bg-black/90 backdrop-blur-xl"></div>
      
      <div 
        :class="[
          'relative bg-[#0D0D0E] border border-white/10 rounded-[2.5rem] shadow-[0_0_100px_rgba(0,0,0,0.8)]',
          sizeClass,
          maxHeightClass
        ]"
      >
        <slot />
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
const props = defineProps<{
  isOpen: boolean
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  maxHeight?: string
}>()

defineEmits<{
  close: []
}>()

const sizeClass = computed(() => {
  const sizes = {
    sm: 'w-full max-w-md p-6',
    md: 'w-full max-w-2xl p-6',
    lg: 'w-full max-w-4xl p-6',
    xl: 'w-full max-w-6xl p-6',
    '2xl': 'w-full max-w-[900px] p-6'
  }
  return sizes[props.size || 'md']
})

const maxHeightClass = computed(() => {
  return props.maxHeight || 'max-h-[90vh]'
})
</script>
