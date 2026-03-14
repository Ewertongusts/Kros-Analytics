<template>
  <div class="space-y-3">
    <SalesUiKSaleSelect
      v-model="paymentStatusLocal"
      label="Status do Pagamento"
      required
    >
      <option value="">Selecione...</option>
      <option value="paid">✅ Pago (recebido)</option>
      <option value="pending">⏳ Pendente (a receber)</option>
    </SalesUiKSaleSelect>

    <!-- Quando for Pendente, mostrar campo de data opcional -->
    <SalesUiKSaleInput
      v-if="paymentStatusLocal === 'pending'"
      v-model="paymentDateLocal"
      type="date"
      label="Data de Vencimento"
      hint="Data limite para recebimento (opcional)"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  paymentStatus: string
  paymentDate: string
}>()

const emit = defineEmits<{
  'update:paymentStatus': [value: string]
  'update:paymentDate': [value: string]
}>()

const paymentStatusLocal = computed({
  get: () => props.paymentStatus,
  set: (value) => emit('update:paymentStatus', value)
})

const paymentDateLocal = computed({
  get: () => props.paymentDate,
  set: (value) => emit('update:paymentDate', value)
})
</script>
