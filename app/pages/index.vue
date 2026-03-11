<template>
  <BlocksKAuthWrapper>
    <template #title>Bem-vindo ao {{ settings.system_name || 'Kros' }}</template>
    <template #subtitle>Acesse sua inteligência financeira com segurança.</template>
    
    <template #default>
      <BlocksKLoginForm />
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
