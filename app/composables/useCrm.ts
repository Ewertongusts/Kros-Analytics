import { ref, onMounted } from 'vue'

export type CrmSettings = {
  id?: string
  api_url: string
  api_token: string
  delay_min: number
  delay_max: number
  break_after: number
  break_delay_min: number
  break_delay_max: number
}

export type MessageTemplate = {
  id?: string
  name: string
  body: string
  is_default?: boolean
}

export const useCrm = () => {
  const supabase = useSupabaseClient()
  
  const settings = ref<CrmSettings>({ 
    api_url: 'https://api.legendaryhub.com.br/api/messages/send', 
    api_token: '',
    delay_min: 15,
    delay_max: 30,
    break_after: 10,
    break_delay_min: 300,
    break_delay_max: 600
  })
  const templates = ref<MessageTemplate[]>([])
  
  const loading = ref(false)
  const error = ref<string | null>(null)

  const fetchCrmData = async () => {
    loading.value = true
    error.value = null
    try {
      // Fetch Configurações
      const { data: configData, error: configErr } = await supabase
        .from('crm_settings')
        .select('*')
        .limit(1)
        .single()
      
      // Se não achar, não tem problema, usa o default 
      // (na real, o SQL inicializa um registro).
      if (configData) {
        settings.value = configData
      }

      // Fetch Templates
      const { data: tmplData, error: tmplErr } = await supabase
        .from('message_templates')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (tmplErr) throw tmplErr
      templates.value = tmplData || []

    } catch (err: any) {
      console.error('Erro ao buscar dados do CRM:', err)
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  const saveSettings = async (updates: Partial<CrmSettings>) => {
    loading.value = true
    try {
      // Verifica se existe id, se sim: update; se não: insert
      if (settings.value.id) {
        const { data, error: err } = await supabase
          .from('crm_settings')
          // @ts-ignore
          .update(updates as any)
          .eq('id', settings.value.id)
          .select()
          .single()
        if (err) throw err
        settings.value = data
      } else {
        const { data, error: err } = await supabase
          .from('crm_settings')
          // @ts-ignore
          .insert([updates as any])
          .select()
          .single()
        if (err) throw err
        settings.value = data
      }
    } catch (err: any) {
      console.error('Erro ao salvar configurações do CRM:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const createTemplate = async (tmpl: MessageTemplate) => {
    loading.value = true
    try {
      // Se for default, desmarcar outros localmente antes (opcional, o DB deve lidar via triggers ou fazemos aqui)
      if (tmpl.is_default) {
         await (supabase as any).from('message_templates').update({ is_default: false }).neq('id', '00000000-0000-0000-0000-000000000000')
      }

      const { data, error: err } = await supabase
        .from('message_templates')
        // @ts-ignore
        .insert([{ name: tmpl.name, body: tmpl.body, is_default: tmpl.is_default || false } as any])
        .select()
        .single()
      
      if (err) throw err
      if (tmpl.is_default) {
         templates.value.forEach(t => t.is_default = false)
      }
      templates.value.unshift(data)
      return data
    } catch (err: any) {
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateTemplate = async (id: string, tmpl: Partial<MessageTemplate>) => {
    loading.value = true
    try {
      if (tmpl.is_default) {
         // Desmarca todos
         await (supabase as any).from('message_templates').update({ is_default: false }).neq('id', id)
         templates.value.forEach(t => t.is_default = false)
      }

      const { data, error: err } = await supabase
        .from('message_templates')
        // @ts-ignore
        .update(tmpl as any)
        .eq('id', id)
        .select()
        .single()
      
      if (err) throw err
      const index = templates.value.findIndex(t => t.id === id)
      if (index !== -1) templates.value[index] = data
      return data
    } catch (err: any) {
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteTemplate = async (id: string) => {
    loading.value = true
    try {
      const { error: err } = await supabase
        .from('message_templates')
        .delete()
        .eq('id', id)
      
      if (err) throw err
      templates.value = templates.value.filter(t => t.id !== id)
    } catch (err: any) {
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    settings,
    templates,
    loading,
    error,
    fetchCrmData,
    saveSettings,
    createTemplate,
    updateTemplate,
    deleteTemplate
  }
}
