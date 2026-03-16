import { ref } from 'vue'

export const useUserAvatar = () => {
  const supabase = useSupabaseClient()
  const uploading = ref(false)

  const uploadAvatar = async (file: File, userId: string) => {
    uploading.value = true
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `avatar-${userId}-${Math.random().toString(36).substring(2)}.${fileExt}`
      const filePath = `avatars/${fileName}`

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
      console.error('Error uploading avatar:', err)
      return { success: false, error: err.message }
    } finally {
      uploading.value = false
    }
  }

  const deleteAvatar = async (avatarUrl: string) => {
    try {
      // Extract file path from URL
      const urlParts = avatarUrl.split('/')
      const fileName = urlParts[urlParts.length - 1]
      const filePath = `avatars/${fileName}`

      const { error } = await supabase.storage
        .from('system-assets')
        .remove([filePath])

      if (error) {
        console.error('Error deleting avatar:', error)
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (err: any) {
      console.error('Error deleting avatar:', err)
      return { success: false, error: err.message }
    }
  }

  return {
    uploading,
    uploadAvatar,
    deleteAvatar
  }
}