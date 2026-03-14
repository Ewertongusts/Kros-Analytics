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
    console.log('🔍 [useTags] fetchTags iniciado')
    try {
      const user = useSupabaseUser()
      console.log('👤 [useTags] User:', user.value?.id || 'não autenticado')
      
      let query = supabase
        .from('tag_definitions')
        .select('*')
      
      console.log('📋 [useTags] Query criada para tag_definitions')
      
      // Remover filtro por user_id pois a tabela tag_definitions não tem essa coluna
      // if (user.value) {
      //   query = query.eq('user_id', user.value.id)
      // }
      
      query = query.order('name', { ascending: true })
      console.log('📋 [useTags] Query ordenada por name')

      console.log('🚀 [useTags] Executando query...')
      const { data, error } = await query

      if (error) {
        console.error('❌ [useTags] Erro na query:', error)
        throw error
      }
      
      console.log('✅ [useTags] Tags carregadas:', data?.length || 0)
      console.log('📊 [useTags] Dados das tags:', data)
      tags.value = data || []
      console.log('✅ [useTags] tags.value atualizado:', tags.value.length, 'itens')
    } catch (e: any) {
      console.error('❌ [useTags] Erro ao buscar tags:', e.message)
      console.error('❌ [useTags] Erro completo:', e)
    } finally {
      loading.value = false
      console.log('✅ [useTags] fetchTags finalizado')
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
