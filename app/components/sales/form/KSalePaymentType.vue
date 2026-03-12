<template>
  <SalesUiKSaleSelect
    v-model="paymentTypeLocal"
    :label="hasInstallments && hasDownPayment ? '💵 Tipo de Pagamento da Entrada' : 'Tipo de Pagamento'"
    required
    :hint="hasInstallments && hasDownPayment ? 'Este é o pagamento da entrada/sinal' : ''"
  >
    <option value="">Selecione...</option>
    <option value="Pix">💳 Pix</option>
    <option value="Dinheiro">💵 Dinheiro</option>
    <option value="Cartão de Crédito">💳 Cartão de Crédito</option>
    <option value="Cartão de Débito">💳 Cartão de Débito</option>
    <option value="Boleto">📄 Boleto</option>
    <option value="Transferência">🏦 Transferência</option>
  </SalesUiKSaleSelect>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  paymentType: string
  hasInstallments: boolean
  hasDownPayment: boolean
}>()

const emit = defineEmits<{
  'update:paymentType': [value: string]
}>()

const paymentTypeLocal = computed({
  get: () => props.paymentType,
  set: (value) => emit('update:paymentType', value)
})
</script>
