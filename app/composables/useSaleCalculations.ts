import { computed, type Ref } from 'vue'

interface SaleForm {
  monthly_price: number
  discount_type: string
  discount_value: number
  down_payment: number
  installments: number
  interest_type: string
  interest_rate: number
  representative_name: string
  whatsapp: string
  payment_type: string
  payment_status: string
  payment_date: string
}

export const useSaleCalculations = (
  form: SaleForm,
  hasDiscount: Ref<boolean>,
  hasDownPayment: Ref<boolean>,
  hasInterest: Ref<boolean>,
  hasInstallments: Ref<boolean>
) => {
  const discountAmount = computed(() => {
    if (!hasDiscount.value) return 0
    
    if (form.discount_type === 'percentage') {
      return form.monthly_price * (form.discount_value / 100)
    } else {
      return form.discount_value
    }
  })

  const finalValue = computed(() => {
    return form.monthly_price - discountAmount.value
  })

  const baseAmountWithoutInterest = computed(() => {
    return finalValue.value - (hasDownPayment.value ? form.down_payment : 0)
  })

  const totalInterestAmount = computed(() => {
    if (!hasInterest.value || !hasInstallments.value) {
      return 0
    }
    
    const baseAmount = baseAmountWithoutInterest.value
    
    if (form.interest_type === 'percentage_per_installment') {
      const totalPercentage = form.interest_rate * form.installments
      return baseAmount * (totalPercentage / 100)
    } else if (form.interest_type === 'percentage_total') {
      return baseAmount * (form.interest_rate / 100)
    } else if (form.interest_type === 'fixed_per_installment') {
      return form.interest_rate * form.installments
    } else {
      return form.interest_rate
    }
  })

  const remainingAmount = computed(() => {
    return baseAmountWithoutInterest.value + totalInterestAmount.value
  })

  const isFormValid = computed(() => {
    if (!form.representative_name || !form.whatsapp) return false
    if (!form.monthly_price || form.monthly_price <= 0) return false
    if (!form.payment_type) return false
    if (!form.payment_status) return false
    
    if (form.payment_status === 'scheduled' && !form.payment_date) return false
    
    if (hasInstallments.value) {
      if (!form.installments || form.installments < 2) return false
      
      if (hasDownPayment.value && form.down_payment > 0) {
        if (!form.installments_payment_type) return false
        if (form.down_payment >= form.monthly_price) return false
      }
    }
    
    return true
  })

  return {
    discountAmount,
    finalValue,
    baseAmountWithoutInterest,
    totalInterestAmount,
    remainingAmount,
    isFormValid
  }
}
