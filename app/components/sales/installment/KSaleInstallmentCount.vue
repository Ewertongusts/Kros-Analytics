<template>
  <div class="grid grid-cols-2 gap-3">
    <SalesUiKSaleInput
      v-model="installmentsLocal"
      type="number"
      :min="2"
      :max="12"
      required
      label="Nº de Parcelas"
      placeholder="Ex: 3"
      @update:model-value="$emit('calculate')"
    />

    <SalesUiKSaleInput
      :model-value="installmentValue"
      type="text"
      disabled
      label="Valor da Parcela"
      placeholder="R$ 0,00"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  installments: number
  installmentValue: string
}>()

const emit = defineEmits<{
  'update:installments': [value: number]
  'calculate': []
}>()

const installmentsLocal = computed({
  get: () => props.installments,
  set: (value) => emit('update:installments', Number(value))
})
</script>
