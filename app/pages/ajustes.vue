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
          @save="handleSaveProfile"
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
          @save="handleSaveWhiteLabel"
          @upload="handleFileUpload"
        />

        <!-- Tab: Planos -->
        <BlocksKFinancePlans v-if="activeTab === 'plans'" />

        <!-- Tab: Config. API -->
        <BlocksKFinanceCrmSettings v-if="activeTab === 'settings'" />
      </div>
      <!-- GLOW EFFECTS -->
      <div class="fixed -top-40 -right-40 w-96 h-96 bg-kros-blue/5 rounded-full blur-[120px] pointer-events-none"></div>
      <div class="fixed top-1/2 -left-40 w-80 h-80 bg-kros-blue/5 rounded-full blur-[100px] pointer-events-none"></div>
      
      <BlocksKGlobalFooter />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { useWhiteLabel } from '~/composables/useWhiteLabel'

definePageMeta({
  middleware: 'auth'
})

const route = useRoute()
const user = useSupabaseUser()
const { settings: wlSettings, saveSettings: wlSave, fetchSettings: wlFetch, loading: wlLoading, uploadImage: wlUpload } = useWhiteLabel()
const { stats, fetchStats: fetchAnalyticsStats } = useAnalytics()

const activeTab = ref(route.query.tab?.toString() || 'profile')
const wlStatus = ref<{ success: boolean; message: string } | null>(null)

const tabs = [
  { id: 'profile', name: 'Meu Perfil' },
  { id: 'security', name: 'Segurança' },
  { id: 'preferences', name: 'Preferências' },
  { id: 'white-label', name: 'White Label' },
  { id: 'plans', name: 'Catálogo' },
  { id: 'settings', name: 'Config. API' }
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

const handleSaveProfile = async (data: any) => {
  try {
    const supabase = useSupabaseClient()
    
    // Buscar usuário de forma mais robusta
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !authUser) {
      console.error('Erro ao buscar usuário:', authError)
      alert('Erro: Não foi possível identificar o usuário logado. Faça login novamente.')
      return
    }

    const userId = authUser.id
    console.log('Salvando perfil para usuário:', userId, data)

    // Tentar atualizar em user_profiles
    const { error: profileError } = await supabase
      .from('user_profiles')
      .upsert({
        id: userId,
        full_name: data.name,
        name: data.name,
        role: data.role,
        phone: data.phone,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'id'
      })

    if (profileError) {
      console.error('Erro ao salvar em user_profiles:', profileError)
      alert('Erro ao salvar perfil: ' + profileError.message)
      return
    }

    Object.assign(profileData, data)
    alert('Perfil atualizado com sucesso!')
    
    // Limpar cache do composable para forçar reload
    const { clearCurrentUser } = useCurrentUser()
    clearCurrentUser()
  } catch (err: any) {
    console.error('Erro ao salvar perfil:', err)
    alert('Erro ao salvar perfil: ' + err.message)
  }
}

const handleSaveWhiteLabel = async (data: any) => {
  const res = await wlSave(data)
  if (res.success) {
    wlStatus.value = { success: true, message: 'Identidade atualizada com sucesso!' }
  } else {
    wlStatus.value = { success: false, message: 'Erro ao aplicar identidade.' }
  }
  
  setTimeout(() => { wlStatus.value = null }, 3000)
}

const handleFileUpload = async (event: Event, type: 'logo' | 'favicon') => {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return

  console.log(`Fazendo upload de ${type}...`)
  const res = await wlUpload(file, type)
  
  if (res.success && res.url) {
    console.log('Upload sucesso. Nova URL:', res.url)
    
    // Forçar atualização do objeto para garantir reatividade profunda
    const current = { ...wlSettings.value }
    if (type === 'logo') current.logo_url = res.url
    else current.favicon_url = res.url
    
    wlSettings.value = current
    
    wlStatus.value = { success: true, message: `${type.toUpperCase()} carregado com sucesso!` }
  } else {
    console.error('Erro no upload:', res.error)
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
