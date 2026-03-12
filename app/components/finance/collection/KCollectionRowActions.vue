<template>
  <div :class="['flex items-center justify-end pr-1 relative', isCompact ? 'gap-1' : 'gap-2']">
    <!-- Toggle Status -->
    <button 
      @click="$emit('toggle-status')"
      :title="status === 'Pago' ? 'Desfazer Pagamento (Estornar)' : 'Marcar como Pago'"
      :class="[
        'rounded-xl transition-all',
        isCompact ? 'p-1.5' : 'p-2.5',
        status === 'Pago' 
          ? 'bg-amber-500/10 text-amber-500 hover:bg-amber-500 hover:text-white' 
          : 'bg-blue-500/10 text-blue-500 hover:bg-blue-500 hover:text-white'
      ]"
    >
      <svg v-if="status !== 'Pago'" xmlns="http://www.w3.org/2000/svg" :width="isCompact ? 12 : 14" :height="isCompact ? 12 : 14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
      <svg v-else xmlns="http://www.w3.org/2000/svg" :width="isCompact ? 12 : 14" :height="isCompact ? 12 : 14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"/></svg>
    </button>

    <!-- Auto Billing -->
    <UiKAutoBillingBtn 
      :is-active="autoBillingEnabled"
      :is-compact="isCompact"
      @click="$emit('toggle-autobilling')"
    />

    <!-- WhatsApp -->
    <button 
      @click="$emit('open-msg-modal')"
      title="Cobrar via WhatsApp"
      :class="[
        'rounded-xl bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white transition-all',
        isCompact ? 'p-1.5' : 'p-2.5'
      ]"
    >
      <svg xmlns="http://www.w3.org/2000/svg" :width="isCompact ? 12 : 14" :height="isCompact ? 12 : 14" viewBox="0 0 448 512" fill="currentColor">
        <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l115.3-30.2c32.4 17.7 68.8 27 108.6 27 122.4 0 222-99.6 222-222 0-59.3-23-115.1-65-157.1zM223.9 446.7c-33.1 0-65.6-8.9-93.9-25.7l-6.7-4-69.8 18.3 18.7-68.1-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 54 81.2 54.1 130.5 0 101.7-82.8 184.5-184.6 184.5zm100.5-137c-5.5-2.8-32.6-16.1-37.7-17.9-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-5.5-2.8-23.2-8.5-44.2-27.2-16.4-14.6-27.4-32.7-30.6-38.2-3.2-5.6-.3-8.6 2.5-11.3 2.5-2.5 5.5-6.5 8.3-9.7 2.8-3.2 3.7-5.5 5.6-9.2 1.9-3.7 1-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 13.2 5.7 23.5 9.2 31.6 11.8 13.3 4.2 25.4 3.6 35 2.2 10.7-1.6 32.6-13.3 37.2-26.2 4.6-12.9 4.6-24 3.2-26.2-1.4-2.3-5.1-3.7-10.6-6.5z"/>
      </svg>
    </button>

    <!-- Logs -->
    <UiKPaymentLogStatusBtn 
      :payment-id="paymentId"
      :is-compact="isCompact"
      @open-logs="$emit('open-logs')"
    />

    <!-- History -->
    <UiKPaymentHistoryBtn 
      :is-compact="isCompact"
      @open-history="$emit('open-history')"
    />
  </div>
</template>

<script setup lang="ts">
defineProps<{
  status: string
  autoBillingEnabled: boolean
  paymentId: string
  isCompact: boolean
}>()

defineEmits(['toggle-status', 'toggle-autobilling', 'open-msg-modal', 'open-logs', 'open-history'])
</script>
