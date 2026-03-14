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
      
      // Buscar informações do plano para cada venda
      if (data && data.length > 0) {
        const salesWithDetails = data.map((sale) => {
          let planDetails = { category: null, description: null }
          
          // Buscar detalhes do plano se plan_name existir
          if (sale.plan_name) {
            // Buscar de forma síncrona do cache local se possível
            planDetails = {
              category: null,
              description: null
            }
          }
          
          return {
            ...sale,
            last_receipt_sent_at: null,
            ...planDetails
          }
        })
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
      const { normalizeWhatsApp } = useWhatsAppConfig()
      
      // Normalizar WhatsApp antes de salvar
      const normalizedData = {
        ...saleData,
        whatsapp: saleData.whatsapp ? normalizeWhatsApp(saleData.whatsapp) : saleData.whatsapp
      }
      
      if (editingSale) {
        // UPDATE existing sale
        const updateData = {
          ...normalizedData,
          sale_type: selectedSaleType,
          updated_at: new Date().toISOString()
        }
        
        // Remover campos que não existem na tabela
        delete updateData.last_receipt_sent_at
        delete updateData.description
        
        const { data, error: updateError } = await (supabase.from('sales') as any)
          .update(updateData)
          .eq('id', editingSale.id)
          .select()
        
        if (updateError) throw updateError
        
        // Registrar no histórico
        await addHistoryEntry(
          editingSale.id,
          'updated',
          `Venda atualizada: ${normalizedData.representative_name || normalizedData.name}`,
          { changes: updateData }
        )
        
        success('Venda atualizada', 'Alterações salvas com sucesso')
      } else {
        // INSERT new sale
        const clientName = normalizedData.name || normalizedData.representative_name
        
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
          ...normalizedData,
          sale_type: selectedSaleType,
          company_id: companyId,
          user_id: user?.id
        }
        
        // Remover campos que não existem na tabela
        delete insertData.last_receipt_sent_at
        delete insertData.description
        
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
            `Venda criada: ${normalizedData.representative_name || normalizedData.name}`,
            { sale_type: selectedSaleType, value: normalizedData.monthly_price }
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
    if (!sales || sales.length === 0) {
      return {
        monthTotal: 0,
        monthCount: 0,
        maxValue: 0,
        totalValue: 0,
        totalCount: 0,
        produtos: { count: 0, total: 0 },
        servicos: { count: 0, total: 0 },
        personalizados: { count: 0, total: 0 },
        total: { count: 0, total: 0 }
      }
    }

    const produtos = sales.filter((s) => s.sale_type === 'produto')
    const servicos = sales.filter((s) => s.sale_type === 'servico')
    const personalizados = sales.filter((s) => s.sale_type === 'personalizado')

    const totalValue = sales.reduce((sum, s) => sum + (s.final_value || s.monthly_price || 0), 0)
    const maxValue = Math.max(...sales.map(s => s.final_value || s.monthly_price || 0), 0)

    return {
      monthTotal: totalValue,
      monthCount: sales.length,
      maxValue: maxValue,
      totalValue: totalValue,
      totalCount: sales.length,
      produtos: {
        count: produtos.length,
        total: produtos.reduce((sum, s) => sum + (s.final_value || s.monthly_price || 0), 0)
      },
      servicos: {
        count: servicos.length,
        total: servicos.reduce((sum, s) => sum + (s.final_value || s.monthly_price || 0), 0)
      },
      personalizados: {
        count: personalizados.length,
        total: personalizados.reduce((sum, s) => sum + (s.final_value || s.monthly_price || 0), 0)
      },
      total: {
        count: sales.length,
        total: totalValue
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
