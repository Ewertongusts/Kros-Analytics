import { ref, type Ref } from 'vue'
import type { SupabaseClient } from '@supabase/supabase-js'

export const useSaleForm = (
  form: any,
  hasDiscount: Ref<boolean>,
  hasDownPayment: Ref<boolean>,
  hasInterest: Ref<boolean>,
  hasInstallments: Ref<boolean>,
  customInstallments: Ref<boolean>,
  installmentsList: Ref<number[]>,
  discountAmount: Ref<number>,
  finalValue: Ref<number>,
  totalInterestAmount: Ref<number>,
  remainingAmount: Ref<number>,
  installmentValue: Ref<string>,
  currentUserId: Ref<string>,
  currentUserName: Ref<string>,
  currentUserEmail: Ref<string>,
  formatCurrency: (val: number) => string,
  formatDate: (date: string) => string,
  calculateInstallmentValue: () => void
) => {
  const setPaymentAVista = () => {
    hasInstallments.value = false
    hasDownPayment.value = false
    hasInterest.value = false
    customInstallments.value = false
    form.installments = 1
    form.down_payment = 0
    form.interest_rate = 0
    form.installments_payment_type = ''
  }

  const setPayment3xSemJuros = () => {
    hasInstallments.value = true
    hasDownPayment.value = false
    hasInterest.value = false
    customInstallments.value = false
    form.installments = 3
    form.down_payment = 0
    form.interest_rate = 0
    form.installments_payment_type = ''
    calculateInstallmentValue()
  }

  const setPayment6xComJuros = () => {
    hasInstallments.value = true
    hasDownPayment.value = false
    hasInterest.value = true
    customInstallments.value = false
    form.installments = 6
    form.down_payment = 0
    form.interest_rate = 2
    form.interest_type = 'percentage_total'
    form.installments_payment_type = ''
    calculateInstallmentValue()
  }

  const setPayment12xComJuros = () => {
    hasInstallments.value = true
    hasDownPayment.value = false
    hasInterest.value = true
    customInstallments.value = false
    form.installments = 12
    form.down_payment = 0
    form.interest_rate = 3
    form.interest_type = 'percentage_total'
    form.installments_payment_type = ''
    calculateInstallmentValue()
  }

  const setDesconto10 = () => {
    hasDiscount.value = true
    form.discount_type = 'percentage'
    form.discount_value = 10
  }

  const setDesconto20 = () => {
    hasDiscount.value = true
    form.discount_type = 'percentage'
    form.discount_value = 20
  }

  const generateSaleText = () => {
    let text = `🛍️ *RESUMO DA VENDA*\n\n`
    text += `👤 *Cliente:* ${form.representative_name || '—'}\n`
    if (form.name) text += `🏢 *Empresa:* ${form.name}\n`
    if (form.plan_name && form.plan_name !== '__PERSONALIZADO__') {
      text += `📦 *Item:* ${form.plan_name}\n`
    }
    if (form.custom_name) text += `✨ *Nome:* ${form.custom_name}\n`
    
    text += `\n💰 *VALORES*\n`
    text += `Valor: ${formatCurrency(form.monthly_price)}\n`
    
    if (hasDiscount.value && discountAmount.value > 0) {
      text += `Desconto: -${formatCurrency(discountAmount.value)}\n`
      text += `*Valor Final: ${formatCurrency(finalValue.value)}*\n`
    }
    
    if (hasDownPayment.value && form.down_payment > 0) {
      text += `Entrada: ${formatCurrency(form.down_payment)}\n`
    }
    
    if (hasInterest.value && totalInterestAmount.value > 0) {
      text += `Juros: +${formatCurrency(totalInterestAmount.value)}\n`
    }
    
    text += `\n💳 *PAGAMENTO*\n`
    text += `Forma: ${form.payment_type || '—'}\n`
    
    if (hasInstallments.value) {
      text += `Parcelas: ${form.installments}x de ${installmentValue.value}\n`
      if (hasDownPayment.value && form.installments_payment_type) {
        text += `Parcelas em: ${form.installments_payment_type}\n`
      }
    }
    
    if (form.payment_status) {
      const status = form.payment_status === 'paid' ? '✅ Pago' : 
                     form.payment_status === 'pending' ? '⏳ Pendente' : 
                     '📅 Agendado'
      text += `Status: ${status}\n`
    }
    
    if (form.payment_date) {
      text += `Data: ${formatDate(form.payment_date)}\n`
    }
    
    text += `\n👤 *Criado por:* ${currentUserName.value}\n`
    
    if (form.notes) {
      text += `\n📝 *Observações:*\n${form.notes}\n`
    }
    
    return text
  }

  const shareViaWhatsApp = () => {
    const text = generateSaleText()
    const phone = form.whatsapp.replace(/\D/g, '')
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(text)}`
    window.open(url, '_blank')
  }

  const exportAsImage = async () => {
    alert('Funcionalidade de exportar imagem será implementada em breve!')
  }

  const exportAsPDF = async () => {
    alert('Funcionalidade de exportar PDF será implementada em breve!')
  }

  const fillFormWithSaleData = async (saleData: any, nextTick: () => Promise<void>) => {
    console.log('Preenchendo formulário com dados:', saleData)
    
    form.representative_name = saleData.representative_name || ''
    form.name = saleData.name || ''
    form.email = saleData.email || ''
    form.whatsapp = saleData.whatsapp || ''
    form.plan_name = saleData.plan_name || ''
    form.custom_name = saleData.custom_name || ''
    form.custom_category = saleData.custom_category || ''
    form.custom_description = saleData.custom_description || ''
    form.monthly_price = saleData.monthly_price || 0
    form.payment_type = saleData.payment_type || ''
    form.installments_payment_type = saleData.installments_payment_type || ''
    form.installments = saleData.installments || 1
    form.down_payment = saleData.down_payment || 0
    form.interest_rate = saleData.interest_rate || 0
    form.interest_type = saleData.interest_type || 'percentage_per_installment'
    form.discount_value = saleData.discount_value || 0
    form.discount_type = saleData.discount_type || 'percentage'
    form.payment_status = saleData.payment_status || ''
    form.payment_date = saleData.payment_date || ''
    form.notes = saleData.notes || ''
    
    // Ativar checkboxes baseado nos dados
    hasDiscount.value = saleData.discount_value > 0
    hasInstallments.value = saleData.installments > 1
    hasDownPayment.value = saleData.down_payment > 0
    hasInterest.value = saleData.interest_rate > 0
    customInstallments.value = !!(saleData.custom_installments && Array.isArray(saleData.custom_installments))
    
    if (customInstallments.value && saleData.custom_installments) {
      installmentsList.value = [...saleData.custom_installments]
    }
    
    // Recalcular valores
    await nextTick()
    if (hasInstallments.value) {
      calculateInstallmentValue()
    }
  }

  const prepareSaleData = () => {
    return {
      ...form,
      payment_date: form.payment_date || null,
      custom_name: form.custom_name || null,
      custom_category: form.custom_category || null,
      custom_description: form.custom_description || null,
      installments: hasInstallments.value ? form.installments : 1,
      down_payment: hasDownPayment.value ? form.down_payment : 0,
      installments_payment_type: (hasInstallments.value && hasDownPayment.value) ? form.installments_payment_type : null,
      interest_rate: hasInterest.value ? form.interest_rate : 0,
      interest_type: hasInterest.value ? form.interest_type : null,
      discount_value: hasDiscount.value ? form.discount_value : 0,
      discount_type: hasDiscount.value ? form.discount_type : null,
      final_value: finalValue.value
    }
  }

  const resetForm = () => {
    form.representative_name = ''
    form.name = ''
    form.email = ''
    form.whatsapp = ''
    form.plan_name = ''
    form.custom_name = ''
    form.custom_category = ''
    form.custom_description = ''
    form.monthly_price = 0
    form.payment_type = ''
    form.installments_payment_type = ''
    form.installments = 1
    form.down_payment = 0
    form.interest_rate = 0
    form.interest_type = 'percentage_per_installment'
    form.discount_value = 0
    form.discount_type = 'percentage'
    form.payment_status = ''
    form.payment_date = ''
    form.notes = ''
    hasDiscount.value = false
    hasInstallments.value = false
    hasDownPayment.value = false
    hasInterest.value = false
    customInstallments.value = false
    installmentValue.value = ''
    installmentsList.value = []
  }

  return {
    setPaymentAVista,
    setPayment3xSemJuros,
    setPayment6xComJuros,
    setPayment12xComJuros,
    setDesconto10,
    setDesconto20,
    generateSaleText,
    shareViaWhatsApp,
    exportAsImage,
    exportAsPDF,
    fillFormWithSaleData,
    prepareSaleData,
    resetForm
  }
}
