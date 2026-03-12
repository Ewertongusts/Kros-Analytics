<template>
  <Teleport to="body">
    <div v-if="isOpen" class="fixed inset-0 z-[9999] flex items-center justify-center px-4">
      <div @click="$emit('close')" class="fixed inset-0 bg-black/90 backdrop-blur-xl"></div>
      
      <div class="relative bg-[#0D0D0E] border border-white/10 rounded-[2.5rem] w-full max-w-[900px] p-6 shadow-[0_0_100px_rgba(0,0,0,0.8)] max-h-[90vh] flex gap-6">
        <!-- Coluna Principal (Formulário) -->
        <div class="flex-1 flex flex-col">
          <SalesKSaleModalHeader 
            :sale-type="saleType"
            :is-editing="!!props.saleData"
          />

          <form @submit.prevent="handleSave" class="space-y-4 overflow-y-auto custom-scrollbar flex-1">
          <!-- Cliente -->
          <SalesFormKSaleClientFields 
            v-model="clientFields"
          />

          <!-- Detalhes da Venda -->
          <SalesFormKSaleFormSection>
            <!-- Seletor de Produto/Serviço -->
            <SalesFormKSaleProductSelector
              v-model:plan-name="form.plan_name"
              v-model:customize-sale="customizeSale"
              :sale-type="saleType"
              :catalog-items="catalogItems"
              @plan-selected="onPlanSelect"
            />

            <!-- Campos Personalizados -->
            <SalesFormKSaleCustomFields
              v-model:custom-name="form.custom_name"
              v-model:custom-category="form.custom_category"
              v-model:custom-description="form.custom_description"
              :sale-type="saleType"
              :customize-sale="customizeSale"
              :plan-name="form.plan_name"
              :categories="categories"
            />

            <!-- Valor -->
            <SalesFormKSaleValueInput
              v-model:monthly-price="form.monthly_price"
              :sale-type="saleType"
              :customize-sale="customizeSale"
              :plan-name="form.plan_name"
            />

            <!-- Desconto -->
            <SalesDiscountKSaleDiscount
              v-model:has-discount="hasDiscount"
              v-model:discount-type="form.discount_type"
              v-model:discount-value="form.discount_value"
              :original-value="form.monthly_price"
            />

            <!-- Tipo de Pagamento -->
            <SalesFormKSalePaymentType
              v-model:payment-type="form.payment_type"
              :has-installments="hasInstallments"
              :has-down-payment="hasDownPayment"
            />

            <!-- Status do Pagamento -->
            <SalesFormKSalePaymentStatus
              v-model:payment-status="form.payment_status"
              v-model:payment-date="form.payment_date"
            />

            <!-- Parcelamento -->
            <SalesInstallmentKSaleInstallment
              v-model:has-installments="hasInstallments"
              v-model:has-down-payment="hasDownPayment"
              v-model:down-payment="form.down_payment"
              v-model:installments-payment-type="form.installments_payment_type"
              v-model:has-interest="hasInterest"
              v-model:interest-type="form.interest_type"
              v-model:interest-rate="form.interest_rate"
              v-model:installments="form.installments"
              v-model:custom-installments="customInstallments"
              v-model:installments-list="installmentsList"
              :max-value="form.monthly_price"
              :base-amount="baseAmountWithoutInterest"
              :remaining-amount="remainingAmount"
              :installment-value="installmentValue"
              @calculate="calculateInstallmentValue"
            />

            <!-- Observações -->
            <SalesFormKSaleNotes
              v-model:notes="form.notes"
            />
          </SalesFormKSaleFormSection>

          <SalesKSaleModalActions
            :is-valid="isFormValid"
            @cancel="$emit('close')"
          />
        </form>
      </div>

      <!-- Coluna Lateral (Resumo) -->
      <SalesSummaryKSaleSummary
        :client-name="form.representative_name"
        :item-name="form.plan_name !== '__PERSONALIZADO__' ? form.plan_name : ''"
        :custom-name="form.custom_name"
        :original-value="form.monthly_price"
        :has-discount="hasDiscount"
        :discount-amount="discountAmount"
        :final-value="finalValue"
        :has-down-payment="hasDownPayment"
        :down-payment="form.down_payment"
        :down-payment-type="form.payment_type"
        :has-interest="hasInterest"
        :interest-amount="totalInterestAmount"
        :has-installments="hasInstallments"
        :installments="form.installments"
        :installment-value="installmentValue"
        :installments-payment-type="form.installments_payment_type"
        :payment-type="form.payment_type"
        :payment-status="form.payment_status"
        :payment-date="form.payment_date"
        :created-by="currentUserName"
        :received-by="form.payment_status === 'paid' ? currentUserName : ''"
        :custom-installments="customInstallments"
        :installments-list="installmentsList"
        :total-installments-amount="remainingAmount"
        :is-valid="isFormValid"
        @payment-a-vista="setPaymentAVista"
        @payment3x-sem-juros="setPayment3xSemJuros"
        @share-whats-app="shareViaWhatsApp"
        @export-image="exportAsImage"
        @export-p-d-f="exportAsPDF"
      />
    </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch, nextTick } from 'vue'
import { useSaleCalculations } from '~/composables/useSaleCalculations'
import { useSaleFormatters } from '~/composables/useSaleFormatters'
import { useSaleForm } from '~/composables/useSaleForm'
import { useSaleData } from '~/composables/useSaleData'
import { useSaleInstallments } from '~/composables/useSaleInstallments'

const props = defineProps<{
  isOpen: boolean
  saleType: string
  saleData?: any
}>()

const emit = defineEmits(['close', 'save'])

const supabase = useSupabaseClient()
const { fetchCurrentUser } = useCurrentUser()
const { formatCurrency, formatDate } = useSaleFormatters()

const customizeSale = ref(false)
const hasInstallments = ref(false)
const hasDownPayment = ref(false)
const customInstallments = ref(false)
const hasInterest = ref(false)
const hasDiscount = ref(false)
const installmentValue = ref('')
const installmentsList = ref<number[]>([])
const currentUserEmail = ref('')
const currentUserName = ref('')
const currentUserId = ref('')

const form = reactive({
  representative_name: '',
  name: '',
  email: '',
  whatsapp: '',
  plan_name: '',
  custom_name: '',
  custom_category: '',
  custom_description: '',
  monthly_price: 0,
  discount_type: 'percentage',
  discount_value: 0,
  payment_type: '',
  payment_status: '',
  payment_date: '',
  installments_payment_type: '',
  installments: 1,
  down_payment: 0,
  interest_rate: 0,
  interest_type: 'percentage_per_installment',
  notes: ''
})

// Composables
const {
  discountAmount,
  finalValue,
  baseAmountWithoutInterest,
  totalInterestAmount,
  remainingAmount,
  isFormValid
} = useSaleCalculations(form, hasDiscount, hasDownPayment, hasInterest, hasInstallments)

const { calculateInstallmentValue } = useSaleInstallments(
  form,
  remainingAmount,
  customInstallments,
  installmentValue,
  installmentsList,
  formatCurrency
)

const {
  setPaymentAVista,
  setPayment3xSemJuros,
  shareViaWhatsApp,
  exportAsImage,
  exportAsPDF,
  fillFormWithSaleData,
  prepareSaleData,
  resetForm
} = useSaleForm(
  form,
  hasDiscount,
  hasDownPayment,
  hasInterest,
  hasInstallments,
  customInstallments,
  installmentsList,
  discountAmount,
  finalValue,
  totalInterestAmount,
  remainingAmount,
  installmentValue,
  currentUserId,
  currentUserName,
  currentUserEmail,
  formatCurrency,
  formatDate,
  calculateInstallmentValue
)

const {
  catalogItems,
  categories,
  fetchCatalogItems,
  fetchCategories,
  onPlanSelect: onPlanSelectBase
} = useSaleData(supabase, props.saleType)

const onPlanSelect = (item: any) => {
  onPlanSelectBase(item, form)
}

// Computed para campos de cliente
const clientFields = computed({
  get: () => ({
    representative_name: form.representative_name,
    name: form.name,
    email: form.email,
    whatsapp: form.whatsapp
  }),
  set: (value) => {
    form.representative_name = value.representative_name
    form.name = value.name
    form.email = value.email
    form.whatsapp = value.whatsapp
  }
})

const handleSave = async () => {
  const saleData = prepareSaleData()
  emit('save', saleData)
}

// Watchers
watch(() => props.isOpen, async (val) => {
  if (val) {
    const user = await fetchCurrentUser()
    if (user) {
      currentUserId.value = user.id
      currentUserEmail.value = user.email
      currentUserName.value = user.name
    }
    
    if (props.saleType !== 'personalizado') {
      await fetchCatalogItems()
    }
    await fetchCategories()
    
    await nextTick()
    
    if (props.saleData) {
      await fillFormWithSaleData(props.saleData, nextTick)
    }
  } else {
    resetForm()
  }
})

watch(() => props.saleData, async (newData) => {
  if (newData && props.isOpen) {
    await fillFormWithSaleData(newData, nextTick)
  }
}, { deep: true })

watch(() => form.monthly_price, () => {
  if (hasInstallments.value) {
    calculateInstallmentValue()
  }
})

watch([() => form.down_payment, () => form.installments], () => {
  if (hasInstallments.value) {
    calculateInstallmentValue()
  }
})

watch(customInstallments, (val) => {
  if (val && form.installments > 0) {
    const value = Math.round((remainingAmount.value / form.installments) * 100) / 100
    installmentsList.value = Array(form.installments).fill(value)
  }
})

watch(() => form.installments, (newVal) => {
  if (customInstallments.value && newVal > 0) {
    const value = Math.round((remainingAmount.value / newVal) * 100) / 100
    installmentsList.value = Array(newVal).fill(value)
  }
})

onMounted(async () => {
  const user = await fetchCurrentUser()
  if (user) {
    currentUserId.value = user.id
    currentUserEmail.value = user.email
    currentUserName.value = user.name
  }
  
  if (props.isOpen) {
    if (props.saleType !== 'personalizado') {
      await fetchCatalogItems()
    }
    await fetchCategories()
  }
})
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
