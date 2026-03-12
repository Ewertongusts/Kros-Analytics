<template>
  <div class="mb-4 text-center">
    <h3 class="text-lg font-bold uppercase tracking-tight text-white">
      {{ isEditing ? 'EDITAR' : 'NOVA' }} VENDA - <span :class="{
        'text-purple-400': saleType === 'produto',
        'text-blue-400': saleType === 'servico',
        'text-orange-400': saleType === 'personalizado'
      }">
        {{ saleTypeLabel }}
      </span>
    </h3>
    <div class="h-1 w-8 bg-kros-blue mx-auto mt-3 rounded-full"></div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  saleType: string
  isEditing: boolean
}>()

const saleTypeLabel = computed(() => {
  if (props.saleType === 'produto') return '📦 PRODUTO'
  if (props.saleType === 'servico') return '🛠️ SERVIÇO'
  return '✨ PERSONALIZADO'
})
</script>
