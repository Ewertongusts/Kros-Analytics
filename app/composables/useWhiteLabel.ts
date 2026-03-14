import { ref } from 'vue'

interface WhiteLabelSettings {
  id?: string
  system_name: string
  primary_color: string
  logo_url: string
  favicon_url: string
}

const settings = ref<WhiteLabelSettings>({
  system_name: 'Kros',
  primary_color: '#007BFF',
  logo_url: '',
  favicon_url: ''
})
const loading = ref(true)

export const useWhiteLabel = () => {
  const supabase = useSupabaseClient()

  const fetchSettings = async () => {
    loading.value = true
    try {
      const user = useSupabaseUser()
      
      let query = (supabase.from('white_label_settings') as any)
        .select('*')
      
      if (user.value) {
        query = query.eq('user_id', user.value.id)
      }
      
      query = query.limit(1)

      const { data, error } = await query.single()

      if (data && !error) {
        settings.value = data as WhiteLabelSettings
        if (settings.value.primary_color) {
          applyColors(settings.value.primary_color)
        }
      }
    } catch (err) {
      console.error('Error fetching white label settings:', err)
    } finally {
      loading.value = false
    }
  }

  const applyColors = (color: string) => {
    if (process.client && color) {
       document.documentElement.style.setProperty('--kros-blue', color)

       // Extract RGB for translucent effects
       const hex = color.replace('#', '')
       const r = parseInt(hex.substring(0, 2), 16)
       const g = parseInt(hex.substring(2, 4), 16)
       const b = parseInt(hex.substring(4, 6), 16)

       if (!isNaN(r) && !isNaN(g) && !isNaN(b)) {
         document.documentElement.style.setProperty('--kros-blue-rgb', `${r}, ${g}, ${b}`)

         // Gerar 3 tons para o gradiente
         const clamp = (v: number) => Math.max(0, Math.min(255, v))
         const toHex = (v: number) => clamp(v).toString(16).padStart(2, '0')

         // Tom escuro (-40)
         const darkColor = `#${toHex(r - 40)}${toHex(g - 40)}${toHex(b - 40)}`
         // Tom claro (+50)
         const lightColor = `#${toHex(r + 50)}${toHex(g + 50)}${toHex(b + 50)}`

         const gradient = `linear-gradient(135deg, ${darkColor}, ${color}, ${lightColor})`
         document.documentElement.style.setProperty('--kros-gradient', gradient)
       }
    }
  }

  const saveSettings = async (formData: any) => {
    loading.value = true
    try {
      // Find if we have an ID to update
      const { data: existing } = await (supabase.from('white_label_settings') as any)
        .select('id')
        .limit(1)
        .single()

      let res;
      const dbSettings = existing as any
      if (dbSettings?.id) {
        res = await (supabase.from('white_label_settings') as any)
          .update(formData)
          .eq('id', dbSettings.id)
      } else {
        res = await (supabase.from('white_label_settings') as any)
          .insert([formData])
      }

      if (!res.error) {
        settings.value = { ...settings.value, ...formData }
        applyColors(formData.primary_color)
        return { success: true }
      }
      return { success: false, error: res.error.message }
    } catch (err: any) {
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }

  const uploadImage = async (file: File, path: string) => {
    loading.value = true
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${path}-${Math.random().toString(36).substring(2)}.${fileExt}`
      const filePath = `branding/${fileName}`

      const { data, error } = await supabase.storage
        .from('system-assets')
        .upload(filePath, file, {
          upsert: true
        })

      if (error) {
        console.error('Supabase Storage Error:', error)
        throw error
      }

      const { data: { publicUrl } } = supabase.storage
        .from('system-assets')
        .getPublicUrl(filePath)

      return { success: true, url: publicUrl }
    } catch (err: any) {
      console.error('Error uploading image:', err)
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }

  return {
    settings,
    loading,
    fetchSettings,
    saveSettings,
    applyColors,
    uploadImage
  }
}
