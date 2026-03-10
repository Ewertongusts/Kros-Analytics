import { ref } from 'vue'

export interface TagDefinition {
  id?: string
  name: string
  color: string
  description: string
}

export const useTags = () => {
  const supabase = useSupabaseClient()
  const tags = ref<TagDefinition[]>([])
  const loading = ref(false)

  const fetchTags = async () => {
    loading.value = true
    try {
      const { data, error } = await supabase
        .from('tag_definitions')
        .select('*')
        .order('name', { ascending: true })

      if (error) throw error
      tags.value = data || []
    } catch (e: any) {
      console.error('Erro ao buscar tags:', e.message)
    } finally {
      loading.value = false
    }
  }

  const upsertTag = async (tag: TagDefinition) => {
    loading.value = true
    try {
      const { error } = await (supabase.from('tag_definitions') as any)
        .upsert({
          id: tag.id || undefined,
          name: tag.name,
          color: tag.color,
          description: tag.description
        })

      if (error) throw error
      await fetchTags()
      return { success: true }
    } catch (e: any) {
      return { success: false, error: e.message }
    } finally {
      loading.value = false
    }
  }

  const deleteTag = async (id: string) => {
    loading.value = true
    try {
      const { error } = await supabase
        .from('tag_definitions')
        .delete()
        .eq('id', id)

      if (error) throw error
      await fetchTags()
      return { success: true }
    } catch (e: any) {
      return { success: false, error: e.message }
    } finally {
      loading.value = false
    }
  }

  return {
    tags,
    loading,
    fetchTags,
    upsertTag,
    deleteTag
  }
}
