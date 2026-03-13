import { reactive } from 'vue'

export const useSettingsHandlers = () => {
  const supabase = useSupabaseClient()
  const user = useSupabaseUser()

  const handleSaveProfile = async (profileData: any) => {
    try {
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()

      if (authError || !authUser) {
        console.error('Erro ao buscar usuário:', authError)
        return { success: false, error: 'Não foi possível identificar o usuário logado' }
      }

      const userId = authUser.id

      const { error: profileError } = await supabase
        .from('user_profiles')
        .upsert({
          id: userId,
          full_name: profileData.name,
          name: profileData.name,
          role: profileData.role,
          phone: profileData.phone,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'id'
        })

      if (profileError) {
        console.error('Erro ao salvar em user_profiles:', profileError)
        return { success: false, error: profileError.message }
      }

      // Limpar cache do composable para forçar reload
      const { clearCurrentUser } = useCurrentUser()
      clearCurrentUser()

      return { success: true }
    } catch (err: any) {
      console.error('Erro ao salvar perfil:', err)
      return { success: false, error: err.message }
    }
  }

  const handleSaveWhiteLabel = async (wlSave: Function, data: any) => {
    const res = await wlSave(data)
    return res
  }

  const handleFileUpload = async (wlUpload: Function, event: Event, type: 'logo' | 'favicon') => {
    const file = (event.target as HTMLInputElement).files?.[0]
    if (!file) return { success: false, error: 'Nenhum arquivo selecionado' }

    console.log(`Fazendo upload de ${type}...`)
    const res = await wlUpload(file, type)

    if (res.success && res.url) {
      console.log('Upload sucesso. Nova URL:', res.url)
      return { success: true, url: res.url }
    } else {
      console.error('Erro no upload:', res.error)
      return { success: false, error: res.error }
    }
  }

  return {
    handleSaveProfile,
    handleSaveWhiteLabel,
    handleFileUpload
  }
}
