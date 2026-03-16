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

// Apply colors to CSS variables
const applyColorsToDOM = (color: string) => {
  if (process.client && color) {
    document.documentElement.style.setProperty('--kros-blue', color)

    const hex = color.replace('#', '')
    const r = parseInt(hex.substring(0, 2), 16)
    const g = parseInt(hex.substring(2, 4), 16)
    const b = parseInt(hex.substring(4, 6), 16)

    if (!isNaN(r) && !isNaN(g) && !isNaN(b)) {
      document.documentElement.style.setProperty('--kros-blue-rgb', `${r}, ${g}, ${b}`)

      const clamp = (v: number) => Math.max(0, Math.min(255, v))
      const toHex = (v: number) => clamp(v).toString(16).padStart(2, '0')

      const darkColor = `#${toHex(r - 40)}${toHex(g - 40)}${toHex(b - 40)}`
      const lightColor = `#${toHex(r + 50)}${toHex(g + 50)}${toHex(b + 50)}`

      const gradient = `linear-gradient(135deg, ${darkColor}, ${color}, ${lightColor})`
      document.documentElement.style.setProperty('--kros-gradient', gradient)
    } else {
      console.error('Invalid RGB values')
    }
  }
}

const initializeColorsFromStorage = () => {
  if (process.client) {
    const stored = localStorage.getItem('kros-white-label-settings')
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        settings.value = parsed
        if (parsed.primary_color) {
          applyColorsToDOM(parsed.primary_color)
        }
      } catch (err) {
        console.error('Error parsing localStorage:', err)
      }
    }
  }
}

export const useWhiteLabel = () => {
  const supabase = useSupabaseClient()

  const fetchSettings = async () => {
    loading.value = true
    try {
      const { data, error } = await (supabase.from('white_label_settings') as any)
        .select('*')
        .limit(1)

      if (error) {
        console.error('Error fetching white label settings:', error)
        return
      }

      if (data && data.length > 0) {
        settings.value = data[0] as WhiteLabelSettings
        localStorage.setItem('kros-white-label-settings', JSON.stringify(settings.value))
        if (settings.value.primary_color) {
          applyColorsToDOM(settings.value.primary_color)
        }
      }
    } catch (err) {
      console.error('Exception fetching settings:', err)
    } finally {
      loading.value = false
    }
  }

  const applyColors = (color: string) => {
    if (process.client && color) {
       document.documentElement.style.setProperty('--kros-blue', color)

       const hex = color.replace('#', '')
       const r = parseInt(hex.substring(0, 2), 16)
       const g = parseInt(hex.substring(2, 4), 16)
       const b = parseInt(hex.substring(4, 6), 16)

       if (!isNaN(r) && !isNaN(g) && !isNaN(b)) {
         document.documentElement.style.setProperty('--kros-blue-rgb', `${r}, ${g}, ${b}`)

         const clamp = (v: number) => Math.max(0, Math.min(255, v))
         const toHex = (v: number) => clamp(v).toString(16).padStart(2, '0')

         const darkColor = `#${toHex(r - 40)}${toHex(g - 40)}${toHex(b - 40)}`
         const lightColor = `#${toHex(r + 50)}${toHex(g + 50)}${toHex(b + 50)}`

         const gradient = `linear-gradient(135deg, ${darkColor}, ${color}, ${lightColor})`
         document.documentElement.style.setProperty('--kros-gradient', gradient)
       } else {
         console.error('Invalid RGB values')
       }
    }
  }

  const saveSettings = async (formData: any) => {
    loading.value = true
    
    try {
      const { data: existing, error: fetchError } = await (supabase.from('white_label_settings') as any)
        .select('id')
        .limit(1)

      if (fetchError) {
        console.error('Error fetching existing settings:', fetchError)
        return { success: false, error: fetchError.message }
      }

      let res;
      const dbSettings = existing && existing.length > 0 ? existing[0] : null
      
      if (dbSettings?.id) {
        res = await (supabase.from('white_label_settings') as any)
          .update(formData)
          .eq('id', dbSettings.id)
      } else {
        res = await (supabase.from('white_label_settings') as any)
          .insert([formData])
      }

      if (res.error) {
        console.error('Save error:', res.error)
        return { success: false, error: res.error.message }
      }

      settings.value = { ...settings.value, ...formData }
      localStorage.setItem('kros-white-label-settings', JSON.stringify(settings.value))
      applyColorsToDOM(formData.primary_color)
      return { success: true }
    } catch (err: any) {
      console.error('Exception saving settings:', err)
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
    applyColors: applyColorsToDOM,
    uploadImage,
    initializeColorsFromStorage
  }
}
