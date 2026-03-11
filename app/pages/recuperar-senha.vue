<template>
  <BlocksKAuthWrapper>
    <template #title>Recuperar Senha</template>
    <template #subtitle>Insira seu WhatsApp para que possamos enviar as instruções de recuperação no {{ settings.system_name || 'Kros' }}.</template>
    
    <template #default>
      <BlocksKRecoverPasswordForm />
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
