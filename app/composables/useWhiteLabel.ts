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
    console.log('🔍 [fetchSettings] Starting to fetch white label settings...')
    try {
      console.log('📡 [fetchSettings] Querying white_label_settings table (no user filter)')
      const { data, error } = await (supabase.from('white_label_settings') as any)
        .select('*')
        .limit(1)

      console.log('📊 [fetchSettings] Query response - Error:', error, 'Data:', data)

      if (error) {
        console.error('❌ [fetchSettings] Error fetching white label settings:', error)
        return
      }

      if (data && data.length > 0) {
        console.log('✅ [fetchSettings] Found settings, updating state:', data[0])
        settings.value = data[0] as WhiteLabelSettings
        if (settings.value.primary_color) {
          console.log('🎨 [fetchSettings] Applying color:', settings.value.primary_color)
          applyColors(settings.value.primary_color)
        }
        console.log('✅ [fetchSettings] White label settings loaded successfully')
      } else {
        console.log('ℹ️ [fetchSettings] No white label settings found')
      }
    } catch (err) {
      console.error('❌ [fetchSettings] Exception:', err)
    } finally {
      loading.value = false
      console.log('✓ [fetchSettings] Fetch complete')
    }
  }

  const applyColors = (color: string) => {
    console.log('🎨 [applyColors] Applying color:', color)
    if (process.client && color) {
       console.log('🎨 [applyColors] Setting CSS variable --kros-blue to:', color)
       document.documentElement.style.setProperty('--kros-blue', color)

       // Extract RGB for translucent effects
       const hex = color.replace('#', '')
       const r = parseInt(hex.substring(0, 2), 16)
       const g = parseInt(hex.substring(2, 4), 16)
       const b = parseInt(hex.substring(4, 6), 16)

       console.log('🎨 [applyColors] RGB values:', { r, g, b })

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
         console.log('🎨 [applyColors] Setting gradient:', gradient)
         document.documentElement.style.setProperty('--kros-gradient', gradient)
         console.log('✅ [applyColors] Colors applied successfully')
       } else {
         console.error('❌ [applyColors] Invalid RGB values')
       }
    } else {
      console.warn('⚠️ [applyColors] Not on client or no color provided')
    }
  }

  const saveSettings = async (formData: any) => {
    loading.value = true
    console.log('💾 [saveSettings] Starting to save white label settings...')
    console.log('📝 [saveSettings] Form data:', formData)
    
    try {
      // Find if we have an ID to update
      console.log('🔍 [saveSettings] Checking for existing settings...')
      const { data: existing, error: fetchError } = await (supabase.from('white_label_settings') as any)
        .select('id')
        .limit(1)

      console.log('📊 [saveSettings] Existing check - Error:', fetchError, 'Data:', existing)

      if (fetchError) {
        console.error('❌ [saveSettings] Error fetching existing settings:', fetchError)
        return { success: false, error: fetchError.message }
      }

      let res;
      const dbSettings = existing && existing.length > 0 ? existing[0] : null
      
      if (dbSettings?.id) {
        // Update existing
        console.log('📝 [saveSettings] Updating existing record with ID:', dbSettings.id)
        console.log('📝 [saveSettings] Update data:', formData)
        res = await (supabase.from('white_label_settings') as any)
          .update(formData)
          .eq('id', dbSettings.id)
        console.log('📊 [saveSettings] Update response - Error:', res.error, 'Data:', res.data)
      } else {
        // Insert new
        console.log('➕ [saveSettings] Creating new record')
        console.log('➕ [saveSettings] Insert data:', formData)
        res = await (supabase.from('white_label_settings') as any)
          .insert([formData])
        console.log('📊 [saveSettings] Insert response - Error:', res.error, 'Data:', res.data)
      }

      if (res.error) {
        console.error('❌ [saveSettings] Save error:', res.error)
        return { success: false, error: res.error.message }
      }

      console.log('✅ [saveSettings] Settings saved successfully')
      settings.value = { ...settings.value, ...formData }
      console.log('🎨 [saveSettings] Applying color:', formData.primary_color)
      applyColors(formData.primary_color)
      return { success: true }
    } catch (err: any) {
      console.error('❌ [saveSettings] Exception:', err)
      return { success: false, error: err.message }
    } finally {
      loading.value = false
      console.log('✓ [saveSettings] Save complete')
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
