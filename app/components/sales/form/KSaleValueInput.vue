<template>
  <SalesUiKSaleInput
    v-model="monthlyPriceLocal"
    type="number"
    step="0.01"
    required
    label="Valor (R$)"
    placeholder="0.00"
    :disabled="isDisabled"
    :hint="isDisabled ? 'Marque &quot;Personalizar esta venda&quot; para alterar o valor' : ''"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  monthlyPrice: number
  saleType: string
  customizeSale: boolean
  planName: string
}>()

const emit = defineEmits<{
  'update:monthlyPrice': [value: number]
}>()

const monthlyPriceLocal = computed({
  get: () => props.monthlyPrice,
  set: (value) => emit('update:monthlyPrice', Number(value))
})

const isDisabled = computed(() => {
  return props.saleType !== 'personalizado' && 
         !props.customizeSale && 
         !props.planName && 
         props.planName !== '__PERSONALIZADO__'
})
</script>
