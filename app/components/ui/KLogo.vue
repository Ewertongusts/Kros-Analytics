<template>
  <div class="flex items-center gap-4">
    <!-- Icon Container -->
    <div 
      class="flex items-center justify-center overflow-hidden transition-all duration-500"
      :class="[
        sizeClass,
        !settings.logo_url && 'rounded-xl btn-primary border border-kros-blue'
      ]"
    >
      <ClientOnly>
        <img v-if="settings.logo_url" :src="settings.logo_url" :alt="settings.system_name" class="w-full h-full object-contain" />
        <span v-else class="font-black text-white italic tracking-tighter" :class="size === 'sm' ? 'text-sm' : 'text-xl'">
          {{ settings.system_name?.charAt(0).toUpperCase() || 'K' }}
        </span>
      </ClientOnly>
    </div>

    <!-- Text Logo (Hidden when collapsed) -->
    <span v-if="!collapsed && !hideText" class="font-black text-2xl tracking-tighter uppercase italic text-kros-text dark:text-kros-surface">
      {{ settings.system_name || 'Kros' }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useWhiteLabel } from '~/composables/useWhiteLabel'

const { settings } = useWhiteLabel()

const props = withDefaults(defineProps<{
  size?: 'sm' | 'md' | 'lg'
  hideText?: boolean
  collapsed?: boolean
}>(), {
  size: 'md',
  hideText: false,
  collapsed: false
})

const sizeClass = computed(() => {
  switch (props.size) {
    case 'sm': return 'w-10 h-10'
    case 'lg': return 'w-16 h-16'
    case 'md':
    default: return 'w-12 h-12'
  }
})
</script>
