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
  last_test_status?: 'success' | 'error' | null
  last_test_at?: string | null
  last_test_response?: string | null
}

export type MessageTemplate = {
  id?: string
  name: string
  body: string
  is_default?: boolean
}

export type ApiTestLog = {
  id: string
  created_at: string
  whatsapp: string
  status: string
  message_body: string
  log_type: 'test' | 'test_image' | 'test_file' | 'billing'
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
    break_delay_max: 600,
    last_test_status: null,
    last_test_at: null,
    last_test_response: null
  })
  const templates = ref<MessageTemplate[]>([])
  const testLogs = ref<ApiTestLog[]>([])
  
  const loading = ref(false)
  const testing = ref(false)
  const error = ref<string | null>(null)

  const fetchCrmData = async () => {
    loading.value = true
    error.value = null
    try {
      const user = useSupabaseUser()
      
      // Fetch Configurações - pegar a mais recente (última atualizada)
      let configQuery = supabase
        .from('crm_settings')
        .select('*')
        .order('updated_at', { ascending: false })
      
      const { data: configData, error: configErr } = await configQuery.limit(1).single()
      
      console.log('⚙️ [useCrm] Configurações carregadas:', configData)
      console.log('📊 [useCrm] last_test_status:', configData?.last_test_status)
      
      if (configData) {
        settings.value = configData
      }

      // Fetch Templates
      let tmplQuery = supabase
        .from('message_templates')
        .select('*')
      
      const { data: tmplData, error: tmplErr } = await tmplQuery.order('created_at', { ascending: false })
      
      if (tmplErr) throw tmplErr
      templates.value = tmplData || []

      // Fetch Test Logs
      let logsQuery = supabase
        .from('message_logs')
        .select('*')
        .in('log_type', ['test', 'test_image', 'test_file'])
      
      // Remover filtro por user_id temporariamente para debug
      // if (user.value) {
      //   logsQuery = logsQuery.eq('user_id', user.value.id)
      // }
      
      const { data: logsData, error: logsError } = await logsQuery.order('created_at', { ascending: false }).limit(20)
      
      console.log('📊 [useCrm] Logs carregados:', logsData?.length || 0)
      console.log('📋 [useCrm] Dados dos logs:', logsData)
      console.log('❌ [useCrm] Erro ao carregar logs:', logsError)
      
      testLogs.value = (logsData || []) as ApiTestLog[]

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
      if (settings.value.id) {
        const { data, error: err } = await supabase
          .from('crm_settings')
          // @ts-ignore
          .update(updates)
          .eq('id', settings.value.id)
          .select()
          .single()
        if (err) throw err
        settings.value = data
      } else {
        const { data, error: err } = await supabase
          .from('crm_settings')
          // @ts-ignore
          .insert([updates])
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

  const testApi = async (phoneNumber: string) => {
    testing.value = true
    try {
      const response = await $fetch('/api/crm/test', {
        method: 'POST',
        body: { phoneNumber }
      }) as any

      // Aguardar um pouco para garantir que o banco foi atualizado
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Recarregar dados para atualizar o histórico
      await fetchCrmData()

      if (response.success) {
        return { success: true, message: response.message }
      } else {
        return { success: false, message: response.message }
      }
    } catch (err: any) {
      const errorMsg = err.data?.message || err.message || 'Erro ao processar teste no servidor'
      
      // Aguardar e recarregar mesmo em caso de erro
      await new Promise(resolve => setTimeout(resolve, 500))
      await fetchCrmData()
      
      return { success: false, message: errorMsg }
    } finally {
      testing.value = false
    }
  }

  const createTemplate = async (tmpl: MessageTemplate) => {
    loading.value = true
    try {
      if (tmpl.is_default) {
         await (supabase as any).from('message_templates').update({ is_default: false }).neq('id', '00000000-0000-0000-0000-000000000000')
      }

      const { data, error: err } = await supabase
        .from('message_templates')
        // @ts-ignore
        .insert([{ name: tmpl.name, body: tmpl.body, is_default: tmpl.is_default || false }])
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
         await (supabase as any).from('message_templates').update({ is_default: false }).neq('id', id)
         templates.value.forEach(t => t.is_default = false)
      }

      const { data, error: err } = await supabase
        .from('message_templates')
        // @ts-ignore
        .update(tmpl)
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
    testLogs,
    loading,
    testing,
    error,
    fetchCrmData,
    saveSettings,
    testApi,
    createTemplate,
    updateTemplate,
    deleteTemplate
  }
}

