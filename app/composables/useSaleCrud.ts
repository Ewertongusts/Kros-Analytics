export const useSaleCrud = () => {
  const supabase = useSupabaseClient()
  const { success, error, confirm } = useToast()
  const { addHistoryEntry } = useSaleHistory()
  const loading = ref(false)
  const salesData = ref<any[]>([])

  const fetchSales = async () => {
    loading.value = true
    try {
      const { data, error } = await supabase
        .from('sales')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      
      console.log('Vendas carregadas:', data?.length)
      
      // Buscar informações do plano e última data de envio de comprovante para cada venda
      if (data && data.length > 0) {
        const salesWithDetails = await Promise.all(
          data.map(async (sale) => {
            const clientName = sale.representative_name || sale.name
            const phone = sale.whatsapp?.replace(/\D/g, '')
            
            let planDetails = { category: null, description: null }
            
            // Buscar detalhes do plano se plan_name existir
            if (sale.plan_name) {
              const { data: planData, error: planError } = await supabase
                .from('plans')
                .select('category, description')
                .eq('name', sale.plan_name)
                .limit(1)
              
              if (!planError && planData && planData.length > 0) {
                planDetails = {
                  category: planData[0].category,
                  description: planData[0].description
                }
              }
            }
            
            if (!clientName || !phone) {
              return { ...sale, last_receipt_sent_at: null, ...planDetails }
            }
            
            // Busca por company_name e whatsapp
            const { data: logs, error: logError } = await supabase
              .from('message_logs')
              .select('created_at')
              .eq('company_name', clientName)
              .eq('whatsapp', phone)
              .eq('log_type', 'sale_receipt')
              .like('status', '%Sucesso%')
              .order('created_at', { ascending: false })
              .limit(1)
            
            if (logError) {
              console.error(`Erro ao buscar logs da venda ${sale.id}:`, logError)
            }
            
            const lastSent = logs && logs.length > 0 ? logs[0].created_at : null
            console.log(`Venda ${sale.id} (${clientName}) - Último envio:`, lastSent, '- Logs encontrados:', logs?.length || 0)
            
            return {
              ...sale,
              last_receipt_sent_at: lastSent,
              ...planDetails
            }
          })
        )
        salesData.value = salesWithDetails
      } else {
        salesData.value = data || []
      }
    } catch (err) {
      console.error('Erro ao buscar vendas:', err)
    } finally {
      loading.value = false
    }
  }

  const saveSale = async (saleData: any, selectedSaleType: string, editingSale: any) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (editingSale) {
        // UPDATE existing sale
        const updateData = {
          ...saleData,
          sale_type: selectedSaleType,
          updated_at: new Date().toISOString()
        }
        
        // Remover campos que não existem na tabela
        delete updateData.last_receipt_sent_at
        
        const { data, error: updateError } = await (supabase.from('sales') as any)
          .update(updateData)
          .eq('id', editingSale.id)
          .select()
        
        if (updateError) throw updateError
        
        // Registrar no histórico
        await addHistoryEntry(
          editingSale.id,
          'updated',
          `Venda atualizada: ${saleData.representative_name || saleData.name}`,
          { changes: updateData }
        )
        
        success('Venda atualizada', 'Alterações salvas com sucesso')
      } else {
        // INSERT new sale
        const clientName = saleData.name || saleData.representative_name
        
        let companyId = null
        
        // Buscar ou criar empresa/cliente
        if (clientName) {
          const { data: existingCompanies, error: searchError } = await supabase
            .from('companies')
            .select('id')
            .eq('name', clientName)
            .limit(1)
          
          if (!searchError && existingCompanies && existingCompanies.length > 0) {
            companyId = existingCompanies[0].id
            console.log('Empresa existente encontrada:', companyId)
          } else {
            // Criar nova empresa
            const { data: newCompany, error: createError } = await supabase
              .from('companies')
              .insert({
                name: clientName,
                status: 'active',
                user_id: user?.id
              })
              .select()
            
            if (createError) throw createError
            if (newCompany && newCompany[0]) {
              companyId = newCompany[0].id
              console.log('Nova empresa criada:', companyId)
            }
          }
        }
        
        const insertData = {
          ...saleData,
          sale_type: selectedSaleType,
          company_id: companyId,
          user_id: user?.id
        }
        
        // Remover campos que não existem na tabela
        delete insertData.last_receipt_sent_at
        
        const { data, error: insertError } = await supabase
          .from('sales')
          .insert(insertData as any)
          .select()
        
        if (insertError) throw insertError
        
        // Registrar no histórico
        if (data && data[0]) {
          await addHistoryEntry(
            data[0].id,
            'created',
            `Venda criada: ${saleData.representative_name || saleData.name}`,
            { sale_type: selectedSaleType, value: saleData.monthly_price }
          )
        }
        
        success('Venda criada', 'Nova venda registrada com sucesso')
      }
      
      await fetchSales()
      return true
    } catch (err: any) {
      console.error('Erro ao salvar venda:', err)
      error('Erro ao salvar', err.message || 'Não foi possível salvar a venda')
      return false
    }
  }

  const deleteSale = async (sale: any) => {
    const confirmed = await confirm(
      `Tem certeza que deseja deletar a venda de ${sale.representative_name || sale.name}?`, 
      'Deletar venda'
    )
    
    if (!confirmed) return false
    
    try {
      // Registrar no histórico antes de deletar
      await addHistoryEntry(
        sale.id,
        'deleted',
        `Venda deletada: ${sale.representative_name || sale.name}`,
        { sale_type: sale.sale_type, value: sale.monthly_price }
      )
      
      const { error: deleteError } = await supabase
        .from('sales')
        .delete()
        .eq('id', sale.id)
      
      if (deleteError) throw deleteError
      
      await fetchSales()
      success('Venda deletada', 'Operação concluída com sucesso')
      return true
    } catch (err) {
      console.error('Erro ao deletar venda:', err)
      error('Erro ao deletar', 'Não foi possível deletar a venda')
      return false
    }
  }

  const computeSummary = (sales: any[]) => {
    const produtos = sales.filter((s) => s.sale_type === 'produto')
    const servicos = sales.filter((s) => s.sale_type === 'servico')
    const personalizados = sales.filter((s) => s.sale_type === 'personalizado')

    return {
      produtos: {
        count: produtos.length,
        total: produtos.reduce((sum, s) => sum + (s.monthly_price || 0), 0)
      },
      servicos: {
        count: servicos.length,
        total: servicos.reduce((sum, s) => sum + (s.monthly_price || 0), 0)
      },
      personalizados: {
        count: personalizados.length,
        total: personalizados.reduce((sum, s) => sum + (s.monthly_price || 0), 0)
      },
      total: {
        count: sales.length,
        total: sales.reduce((sum, s) => sum + (s.monthly_price || 0), 0)
      }
    }
  }

  return {
    loading,
    salesData,
    fetchSales,
    saveSale,
    deleteSale,
    computeSummary
  }
}
