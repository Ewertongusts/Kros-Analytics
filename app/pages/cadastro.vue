<template>
  <BlocksKAuthWrapper>
    <template #title>Criar Conta no {{ settings.system_name || 'Kros' }}</template>
    <template #subtitle>Junte-se ao {{ settings.system_name || 'Kros' }} e transforme sua gestão financeira.</template>
    
    <template #default>
      <BlocksKRegisterForm />
    </template>
  </BlocksKAuthWrapper>
</template>

<script setup lang="ts">
import { useWhiteLabel } from '~/composables/useWhiteLabel'

definePageMeta({
  middleware: 'guest'
})

const { settings } = useWhiteLabel()
</script>
