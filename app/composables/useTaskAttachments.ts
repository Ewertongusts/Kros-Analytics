import { ref } from 'vue'

export interface Attachment {
  id: string
  task_id: string
  file_name: string
  file_size: number
  file_type: string
  file_url: string
  uploaded_by: string
  created_at: string
}

export const useTaskAttachments = () => {
  const attachments = ref<Attachment[]>([])
  const loading = ref(false)
  const uploading = ref(false)

  const fetchAttachments = async (taskId: string) => {
    loading.value = true
    try {
      const supabase = useSupabaseClient()
      const { data, error } = await supabase
        .from('task_attachments')
        .select('*')
        .eq('task_id', taskId)
        .order('created_at', { ascending: false })

      if (error) throw error
      attachments.value = data || []
    } catch (error) {
      console.error('Erro ao buscar anexos:', error)
      attachments.value = []
    } finally {
      loading.value = false
    }
  }

  const uploadAttachment = async (taskId: string, file: File, uploadedBy: string) => {
    uploading.value = true
    try {
      const supabase = useSupabaseClient()
      const fileName = `${Date.now()}-${file.name}`
      const filePath = `tasks/${taskId}/${fileName}`

      // Upload para storage
      const { error: uploadError } = await supabase.storage
        .from('task-attachments')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      // Obter URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('task-attachments')
        .getPublicUrl(filePath)

      // Salvar registro no banco
      const { data, error: dbError } = await supabase
        .from('task_attachments')
        .insert([{
          task_id: taskId,
          file_name: file.name,
          file_size: file.size,
          file_type: file.type,
          file_url: publicUrl,
          uploaded_by: uploadedBy
        }] as any)
        .select()

      if (dbError) throw dbError

      if (data && data.length > 0) {
        attachments.value.unshift(data[0] as unknown as Attachment)
      }

      return { success: true, data: (data?.[0] as unknown as Attachment) || undefined }
    } catch (error) {
      console.error('Erro ao fazer upload:', error)
      return { success: false, error }
    } finally {
      uploading.value = false
    }
  }

  const deleteAttachment = async (attachmentId: string, filePath: string) => {
    try {
      const supabase = useSupabaseClient()

      // Deletar do storage
      const { error: storageError } = await supabase.storage
        .from('task-attachments')
        .remove([filePath])

      if (storageError) throw storageError

      // Deletar registro do banco
      const { error: dbError } = await supabase
        .from('task_attachments')
        .delete()
        .eq('id', attachmentId)

      if (dbError) throw dbError

      attachments.value = attachments.value.filter(a => a.id !== attachmentId)
      return { success: true }
    } catch (error) {
      console.error('Erro ao deletar anexo:', error)
      return { success: false, error }
    }
  }

  const getFileIcon = (fileType: string) => {
    if (fileType.includes('image')) return '🖼️'
    if (fileType.includes('pdf')) return '📄'
    if (fileType.includes('word') || fileType.includes('document')) return '📝'
    if (fileType.includes('sheet') || fileType.includes('excel')) return '📊'
    if (fileType.includes('video')) return '🎥'
    if (fileType.includes('audio')) return '🎵'
    if (fileType.includes('zip') || fileType.includes('rar')) return '📦'
    return '📎'
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
  }

  return {
    attachments,
    loading,
    uploading,
    fetchAttachments,
    uploadAttachment,
    deleteAttachment,
    getFileIcon,
    formatFileSize
  }
}
