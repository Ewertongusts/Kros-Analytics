<template>
  <div class="space-y-2">
    <SalesUiKSaleCheckbox 
      id="has-installments"
      v-model="hasInstallmentsLocal"
    >
      Pagamento parcelado
    </SalesUiKSaleCheckbox>

    <div v-if="hasInstallmentsLocal" class="space-y-3 p-4 bg-white/[0.02] border border-white/10 rounded-xl">
      <!-- Entrada/Sinal -->
      <SalesInstallmentKSaleDownPayment
        v-model:has-down-payment="hasDownPaymentLocal"
        v-model:down-payment="downPaymentLocal"
        v-model:installments-payment-type="installmentsPaymentTypeLocal"
        :max-value="maxValue"
        :installments="installmentsLocal"
      />

      <!-- Juros -->
      <SalesInstallmentKSaleInterest
        v-model:has-interest="hasInterestLocal"
        v-model:interest-type="interestTypeLocal"
        v-model:interest-rate="interestRateLocal"
        :base-amount="baseAmount"
        :installments="installmentsLocal"
        @calculate="$emit('calculate')"
      />

      <!-- Número de Parcelas -->
      <SalesInstallmentKSaleInstallmentCount
        v-model:installments="installmentsLocal"
        :installment-value="installmentValue"
        @calculate="$emit('calculate')"
      />

      <!-- Parcelas Personalizadas -->
      <SalesInstallmentKSaleCustomInstallments
        v-model:custom-installments="customInstallmentsLocal"
        v-model:installments-list="installmentsListLocal"
        :installments="installmentsLocal"
        :remaining-amount="remainingAmount"
        :has-down-payment="hasDownPaymentLocal"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  hasInstallments: boolean
  hasDownPayment: boolean
  downPayment: number
  installmentsPaymentType: string
  hasInterest: boolean
  interestType: string
  interestRate: number
  installments: number
  customInstallments: boolean
  installmentsList: number[]
  maxValue: number
  baseAmount: number
  remainingAmount: number
  installmentValue: string
}>()

const emit = defineEmits<{
  'update:hasInstallments': [value: boolean]
  'update:hasDownPayment': [value: boolean]
  'update:downPayment': [value: number]
  'update:installmentsPaymentType': [value: string]
  'update:hasInterest': [value: boolean]
  'update:interestType': [value: string]
  'update:interestRate': [value: number]
  'update:installments': [value: number]
  'update:customInstallments': [value: boolean]
  'update:installmentsList': [value: number[]]
  'calculate': []
}>()

const hasInstallmentsLocal = computed({
  get: () => props.hasInstallments,
  set: (value) => emit('update:hasInstallments', value)
})

const hasDownPaymentLocal = computed({
  get: () => props.hasDownPayment,
  set: (value) => emit('update:hasDownPayment', value)
})

const downPaymentLocal = computed({
  get: () => props.downPayment,
  set: (value) => emit('update:downPayment', value)
})

const installmentsPaymentTypeLocal = computed({
  get: () => props.installmentsPaymentType,
  set: (value) => emit('update:installmentsPaymentType', value)
})

const hasInterestLocal = computed({
  get: () => props.hasInterest,
  set: (value) => emit('update:hasInterest', value)
})

const interestTypeLocal = computed({
  get: () => props.interestType,
  set: (value) => emit('update:interestType', value)
})

const interestRateLocal = computed({
  get: () => props.interestRate,
  set: (value) => emit('update:interestRate', value)
})

const installmentsLocal = computed({
  get: () => props.installments,
  set: (value) => emit('update:installments', value)
})

const customInstallmentsLocal = computed({
  get: () => props.customInstallments,
  set: (value) => emit('update:customInstallments', value)
})

const installmentsListLocal = computed({
  get: () => props.installmentsList,
  set: (value) => emit('update:installmentsList', value)
})
</script>
