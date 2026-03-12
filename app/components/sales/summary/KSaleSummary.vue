<template>
  <div class="w-[320px] space-y-4 overflow-y-auto custom-scrollbar">
    <!-- Resumo da Venda -->
    <SalesSummaryKSaleSummaryInfo
      :client-name="clientName"
      :item-name="itemName"
      :custom-name="customName"
      :original-value="originalValue"
      :has-discount="hasDiscount"
      :discount-amount="discountAmount"
      :final-value="finalValue"
      :has-down-payment="hasDownPayment"
      :down-payment="downPayment"
      :has-interest="hasInterest"
      :interest-amount="interestAmount"
      :has-installments="hasInstallments"
      :installments="installments"
      :installment-value="installmentValue"
      :payment-type="paymentType"
      :payment-status="paymentStatus"
      :payment-date="paymentDate"
      :created-by="createdBy"
      :received-by="receivedBy"
    />

    <!-- Atalhos Rápidos -->
    <SalesSummaryKSaleQuickActions
      @payment-a-vista="$emit('paymentAVista')"
      @payment3x-sem-juros="$emit('payment3xSemJuros')"
      @payment6x-com-juros="$emit('payment6xComJuros')"
      @payment12x-com-juros="$emit('payment12xComJuros')"
      @desconto10="$emit('desconto10')"
      @desconto20="$emit('desconto20')"
    />

    <!-- Preview das Parcelas -->
    <SalesSummaryKSaleInstallmentPreview
      :has-installments="hasInstallments"
      :installments="installments"
      :has-down-payment="hasDownPayment"
      :down-payment="downPayment"
      :down-payment-type="downPaymentType"
      :installments-payment-type="installmentsPaymentType"
      :installment-value="installmentValue"
      :custom-installments="customInstallments"
      :installments-list="installmentsList"
      :total-installments-amount="totalInstallmentsAmount"
    />
  </div>
</template>

<script setup lang="ts">
defineProps<{
  clientName: string
  itemName: string
  customName: string
  originalValue: number
  hasDiscount: boolean
  discountAmount: number
  finalValue: number
  hasDownPayment: boolean
  downPayment: number
  downPaymentType: string
  hasInterest: boolean
  interestAmount: number
  hasInstallments: boolean
  installments: number
  installmentValue: string
  installmentsPaymentType: string
  paymentType: string
  paymentStatus: string
  paymentDate: string
  createdBy: string
  receivedBy: string
  customInstallments: boolean
  installmentsList: number[]
  totalInstallmentsAmount: number
  isValid: boolean
}>()

defineEmits<{
  'paymentAVista': []
  'payment3xSemJuros': []
  'payment6xComJuros': []
  'payment12xComJuros': []
  'desconto10': []
  'desconto20': []
}>()
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(0, 123, 255, 0.1);
  border-radius: 10px;
}
</style>
