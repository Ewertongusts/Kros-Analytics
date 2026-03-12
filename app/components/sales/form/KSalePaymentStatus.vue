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
      <option value="scheduled">📅 Agendado (data futura)</option>
    </SalesUiKSaleSelect>

    <SalesUiKSaleInput
      v-if="paymentStatusLocal === 'scheduled' || paymentStatusLocal === 'pending'"
      v-model="paymentDateLocal"
      type="date"
      :label="paymentStatusLocal === 'scheduled' ? 'Data Agendada' : 'Data de Vencimento'"
      :required="paymentStatusLocal === 'scheduled'"
      :hint="paymentStatusLocal === 'scheduled' ? 'Data em que o pagamento será realizado' : 'Data limite para recebimento (opcional)'"
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
