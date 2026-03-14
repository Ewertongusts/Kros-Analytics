<template>
  <div class="min-h-screen p-8 md:p-12 overflow-hidden">
    <div class="max-w-6xl mx-auto space-y-10">
      <BlocksKPageHeader title="Configurações" subtitle="Ajustes do Sistema e Preferências" />
      
      <!-- TABS -->
      <UiKTabs v-model="activeTab" :tabs="tabs" class="animate-in fade-in duration-1000 delay-200" />

      <!-- CONTENT VIEWS -->
      <div class="relative bg-[#0D0D0E]/50 border border-white/10 rounded-[2.5rem] p-8 md:p-12 backdrop-blur-xl animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
        
        <!-- Tab: Perfil -->
        <BlocksKSettingsProfile 
          v-if="activeTab === 'profile'" 
          :user="user" 
          :profile-data="profileData"
          @save="handleSaveProfileWrapper"
        />

        <!-- Tab: Segurança -->
        <BlocksKSettingsSecurity v-if="activeTab === 'security'" />

        <!-- Tab: Preferências -->
        <BlocksKSettingsPreferences v-if="activeTab === 'preferences'" />

        <!-- Tab: White Label -->
        <BlocksKSettingsWhiteLabel 
          v-if="activeTab === 'white-label'"
          :settings="wlSettings"
          :loading="wlLoading"
          :status="wlStatus"
          @save="handleSaveWhiteLabelWrapper"
          @upload="handleFileUploadWrapper"
        />

        <!-- Tab: Planos -->
        <BlocksKFinancePlans v-if="activeTab === 'plans'" />

        <!-- Tab: Config. API -->
        <BlocksKFinanceCrmSettings v-if="activeTab === 'settings'" />

        <!-- Tab: Webhooks - DESATIVADO POR ENQUANTO -->
        <!-- <BlocksKWebhooksManagement v-if="activeTab === 'webhooks'" /> -->
      </div>
      <!-- GLOW EFFECTS -->
      <div class="fixed -top-40 -right-40 w-96 h-96 bg-kros-blue/5 rounded-full blur-[120px] pointer-events-none"></div>
      <div class="fixed top-1/2 -left-40 w-80 h-80 bg-kros-blue/5 rounded-full blur-[100px] pointer-events-none"></div>
      
      <BlocksKGlobalFooter />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useWhiteLabel } from '~/composables/useWhiteLabel'
import { useSettingsHandlers } from '~/composables/useSettingsHandlers'

definePageMeta({
  middleware: 'auth'
})

const route = useRoute()
const user = useSupabaseUser()
const { settings: wlSettings, saveSettings: wlSave, fetchSettings: wlFetch, loading: wlLoading, uploadImage: wlUpload } = useWhiteLabel()
const { stats, fetchStats: fetchAnalyticsStats } = useAnalytics()
const { handleSaveProfile, handleSaveWhiteLabel, handleFileUpload } = useSettingsHandlers()

const activeTab = ref(route.query.tab?.toString() || 'profile')
const wlStatus = ref<{ success: boolean; message: string } | null>(null)

const tabs = [
  { id: 'profile', name: 'Meu Perfil' },
  { id: 'security', name: 'Segurança' },
  { id: 'preferences', name: 'Preferências' },
  { id: 'white-label', name: 'White Label' },
  { id: 'plans', name: 'Catálogo' },
  { id: 'settings', name: 'Config. API' }
  // { id: 'webhooks', name: 'Webhooks' } // DESATIVADO POR ENQUANTO
]

const profileData = reactive({
  name: user.value?.user_metadata?.full_name || '',
  role: 'admin',
  phone: '(81) 98371-7272'
})

onMounted(async () => {
  await wlFetch()
  await fetchAnalyticsStats()
})

const handleSaveProfileWrapper = async (data: any) => {
  const res = await handleSaveProfile(data)
  if (res.success) {
    Object.assign(profileData, data)
    alert('Perfil atualizado com sucesso!')
  } else {
    alert('Erro ao salvar perfil: ' + res.error)
  }
}

const handleSaveWhiteLabelWrapper = async (data: any) => {
  const res = await handleSaveWhiteLabel(wlSave, data)
  if (res.success) {
    wlStatus.value = { success: true, message: 'Identidade atualizada com sucesso!' }
  } else {
    wlStatus.value = { success: false, message: 'Erro ao aplicar identidade.' }
  }

  setTimeout(() => { wlStatus.value = null }, 3000)
}

const handleFileUploadWrapper = async (event: Event, type: 'logo' | 'favicon') => {
  const res = await handleFileUpload(wlUpload, event, type)

  if (res.success && res.url) {
    const current = { ...wlSettings.value }
    if (type === 'logo') current.logo_url = res.url
    else current.favicon_url = res.url

    wlSettings.value = current

    wlStatus.value = { success: true, message: `${type.toUpperCase()} carregado com sucesso!` }
  } else {
    wlStatus.value = { success: false, message: `Erro ao fazer upload do ${type}.` }
  }

  setTimeout(() => { wlStatus.value = null }, 3000)
}
</script>

<style scoped>
.text-glow-blue {
  text-shadow: 0 0 10px rgba(var(--kros-blue-rgb, 0, 123, 255), 0.3);
}
</style>
