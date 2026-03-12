<template>
  <div class="space-y-12">
    <!-- 1. Configurações da API HTTP -->
    <div class="space-y-8">
      <div class="flex items-center justify-between">
        <div>
          <h3 class="font-bold text-lg text-white">Configurações de Integração CRM</h3>
          <p class="text-[10px] text-white/50 uppercase tracking-widest mt-1">Conecte sua API de envio para WhatsApp, SMS ou Email</p>
        </div>
        
        <!-- Status Indicator -->
        <FinanceCrmKCrmStatusIndicator :status="settings?.last_test_status" />
      </div>

      <!-- API Configuration -->
      <FinanceCrmKCrmApiConfig
        v-model:api-url="configForm.api_url"
        v-model:api-token="configForm.api_token"
        v-model:delay-min="configForm.delay_min"
        v-model:delay-max="configForm.delay_max"
        v-model:break-after="configForm.break_after"
        v-model:break-delay-min="configForm.break_delay_min"
        v-model:break-delay-max="configForm.break_delay_max"
        :loading="loading"
        @save="handleSaveSettings"
      />

      <!-- Testing & Logs (Side by Side) -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <!-- Testing Section -->
        <FinanceCrmKCrmTestPanel
          v-model="testPhone"
          :testing="testing"
          :api-url="configForm.api_url"
          :last-test-at="settings?.last_test_at"
          :last-test-status="settings?.last_test_status"
          :last-test-response="settings?.last_test_response"
          @test="handleTestApi"
        />

        <!-- Connectivity History Section -->
        <FinanceCrmKCrmHistoryPanel :logs="testLogs" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive, watch } from 'vue'
import { useCrm } from '~/composables/useCrm'

const { 
  settings, 
  testLogs,
  loading, 
  testing,
  fetchCrmData, 
  saveSettings, 
  testApi
} = useCrm()

const configForm = reactive({
  api_url: '',
  api_token: '',
  delay_min: 15,
  delay_max: 30,
  break_after: 10,
  break_delay_min: 5,
  break_delay_max: 10
})

const testPhone = ref('5581983717272')

watch(settings, (newVal) => {
  if (newVal) {
    configForm.api_url = newVal.api_url || 'https://api.legendaryhub.com.br/api/messages/send'
    configForm.api_token = newVal.api_token || ''
    configForm.delay_min = newVal.delay_min || 15
    configForm.delay_max = newVal.delay_max || 30
    configForm.break_after = newVal.break_after || 10
    configForm.break_delay_min = newVal.break_delay_min || 5
    configForm.break_delay_max = newVal.break_delay_max || 10
  }
}, { immediate: true })

const handleSaveSettings = async () => {
  try {
    await saveSettings(configForm)
    alert('Configurações salvas com sucesso!')
  } catch (err) {
    alert('Erro ao salvar as configurações. Verifique o console.')
  }
}

const handleTestApi = async () => {
  if (!testPhone.value) {
    alert('Insira um número de telefone para testar.')
    return
  }
  const res = await testApi(testPhone.value)
  if (res.success) {
    alert('Teste concluído com sucesso! Verifique seu WhatsApp.')
  } else {
    alert('Falha no teste: ' + res.message)
  }
}

onMounted(() => {
  fetchCrmData()
})
</script>
