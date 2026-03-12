<template>
  <div class="space-y-2">
    <SalesUiKSaleCheckbox 
      id="has-interest"
      v-model="hasInterestLocal"
    >
      📈 Adicionar juros nas parcelas
    </SalesUiKSaleCheckbox>

    <div v-if="hasInterestLocal" class="space-y-3 p-3 bg-orange-500/5 border border-orange-500/20 rounded-xl">
      <div class="grid grid-cols-2 gap-3">
        <SalesUiKSaleSelect
          v-model="interestTypeLocal"
          label="Tipo de Juros"
          variant="warning"
          @update:model-value="$emit('calculate')"
        >
          <option value="percentage_per_installment">📊 Percentual por parcela (ex: 2% cada)</option>
          <option value="percentage_total">📈 Percentual fixo total (ex: 10% no total)</option>
          <option value="fixed_per_installment">💵 Valor em reais por parcela (ex: R$ 5 cada)</option>
          <option value="fixed_total">💰 Valor fixo total em reais (ex: R$ 50 no total)</option>
        </SalesUiKSaleSelect>

        <SalesUiKSaleInput
          v-model="interestRateLocal"
          type="number"
          step="0.01"
          :min="0"
          :label="interestTypeLocal.includes('percentage') ? 'Percentual (%)' : 'Valor (R$)'"
          :placeholder="interestTypeLocal.includes('percentage') ? 'Ex: 2.5' : 'Ex: 10.00'"
          @update:model-value="$emit('calculate')"
        />
      </div>

      <div class="p-2 bg-orange-500/10 rounded-lg text-[9px] space-y-1">
        <p class="text-orange-300/60">
          {{ interestDescription }}
        </p>
      </div>

      <div class="p-2 bg-orange-500/10 rounded-lg">
        <div class="flex justify-between items-center text-[10px]">
          <span class="text-orange-400">Valor sem juros:</span>
          <span class="font-bold text-white">{{ formatCurrency(baseAmount) }}</span>
        </div>
        <div class="flex justify-between items-center text-[10px] mt-1">
          <span class="text-orange-400">Juros aplicados:</span>
          <span class="font-bold text-orange-300">{{ formatCurrency(totalInterest) }}</span>
        </div>
        <div class="flex justify-between items-center text-xs mt-2 pt-2 border-t border-orange-500/20">
          <span class="text-orange-400 font-bold">Total com juros:</span>
          <span class="font-bold text-white">{{ formatCurrency(baseAmount + totalInterest) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  hasInterest: boolean
  interestType: string
  interestRate: number
  baseAmount: number
  installments: number
}>()

const emit = defineEmits<{
  'update:hasInterest': [value: boolean]
  'update:interestType': [value: string]
  'update:interestRate': [value: number]
  'calculate': []
}>()

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
  set: (value) => emit('update:interestRate', Number(value))
})

const totalInterest = computed(() => {
  if (!props.hasInterest) return 0
  
  if (props.interestType === 'percentage_per_installment') {
    const totalPercentage = props.interestRate * props.installments
    return props.baseAmount * (totalPercentage / 100)
  } else if (props.interestType === 'percentage_total') {
    return props.baseAmount * (props.interestRate / 100)
  } else if (props.interestType === 'fixed_per_installment') {
    return props.interestRate * props.installments
  } else {
    return props.interestRate
  }
})

const interestDescription = computed(() => {
  if (props.interestType === 'percentage_per_installment') {
    return `${props.interestRate}% de juros por parcela (total: ${(props.interestRate * props.installments).toFixed(2)}%)`
  } else if (props.interestType === 'percentage_total') {
    return `${props.interestRate}% de juros no total`
  } else if (props.interestType === 'fixed_per_installment') {
    return `${formatCurrency(props.interestRate)} por parcela (total: ${formatCurrency(props.interestRate * props.installments)})`
  } else {
    return `${formatCurrency(props.interestRate)} de juros no total`
  }
})

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)
}
</script>
