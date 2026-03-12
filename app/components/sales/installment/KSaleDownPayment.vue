<template>
  <div class="space-y-2">
    <SalesUiKSaleCheckbox 
      id="has-down-payment"
      v-model="hasDownPaymentLocal"
    >
      Entrada/Sinal
    </SalesUiKSaleCheckbox>
    
    <SalesUiKSaleInput
      v-if="hasDownPaymentLocal"
      v-model="downPaymentLocal"
      type="number"
      step="0.01"
      :min="0"
      :max="maxValue"
      placeholder="Valor da entrada"
      :error="downPaymentLocal >= maxValue ? 'Entrada não pode ser maior ou igual ao valor total' : ''"
    />

    <!-- Tipo de Pagamento das Parcelas -->
    <div v-if="hasDownPaymentLocal" class="space-y-2 p-3 bg-blue-500/5 border border-blue-500/20 rounded-xl">
      <SalesUiKSaleSelect
        v-model="installmentsPaymentTypeLocal"
        label="💳 Tipo de Pagamento das Parcelas"
        required
        variant="info"
        :hint="`Este é o pagamento das ${installments}x parcelas restantes`"
      >
        <option value="">Selecione...</option>
        <option value="Pix">💳 Pix</option>
        <option value="Dinheiro">💵 Dinheiro</option>
        <option value="Cartão de Crédito">💳 Cartão de Crédito</option>
        <option value="Cartão de Débito">💳 Cartão de Débito</option>
        <option value="Boleto">📄 Boleto</option>
        <option value="Transferência">🏦 Transferência</option>
      </SalesUiKSaleSelect>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  hasDownPayment: boolean
  downPayment: number
  installmentsPaymentType: string
  maxValue: number
  installments: number
}>()

const emit = defineEmits<{
  'update:hasDownPayment': [value: boolean]
  'update:downPayment': [value: number]
  'update:installmentsPaymentType': [value: string]
}>()

const hasDownPaymentLocal = computed({
  get: () => props.hasDownPayment,
  set: (value) => emit('update:hasDownPayment', value)
})

const downPaymentLocal = computed({
  get: () => props.downPayment,
  set: (value) => emit('update:downPayment', Number(value))
})

const installmentsPaymentTypeLocal = computed({
  get: () => props.installmentsPaymentType,
  set: (value) => emit('update:installmentsPaymentType', value)
})
</script>
