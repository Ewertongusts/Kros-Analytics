import type { Ref } from 'vue'

export const useSaleInstallments = (
  form: any,
  remainingAmount: Ref<number>,
  customInstallments: Ref<boolean>,
  installmentValue: Ref<string>,
  installmentsList: Ref<number[]>,
  formatCurrency: (val: number) => string
) => {
  const calculateInstallmentValue = () => {
    if (remainingAmount.value > 0 && form.installments > 0) {
      const value = Math.round((remainingAmount.value / form.installments) * 100) / 100
      installmentValue.value = formatCurrency(value)
      
      if (customInstallments.value) {
        installmentsList.value = Array(form.installments).fill(value)
      }
    } else {
      installmentValue.value = ''
    }
  }

  return {
    calculateInstallmentValue
  }
}
