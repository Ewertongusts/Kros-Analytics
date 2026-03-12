export const useSaleCrud = () => {
  const supabase = useSupabaseClient()
  const { success, error, confirm } = useToast()
  const loading = ref(false)
  const salesData = ref<any[]>([])

  const fetchSales = async () => {
    loading.value = true
    try {
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .in('sale_type', ['produto', 'servico', 'personalizado'])
        .order('created_at', { ascending: false })
      
      if (error) throw error
      salesData.value = data || []
    } catch (err) {
      console.error('Erro ao buscar vendas:', err)
    } finally {
      loading.value = false
    }
  }

  const saveSale = async (saleData: any, selectedSaleType: string, editingSale: any) => {
    try {
      if (editingSale) {
        // UPDATE
        const updateData = {
          ...saleData,
          sale_type: selectedSaleType,
          updated_at: new Date().toISOString()
        }
        
        const { data, error: updateError } = await (supabase.from('companies') as any)
          .update(updateData)
          .eq('id', editingSale.id)
          .select()
        
        if (updateError) throw updateError
        
        success('Venda atualizada', 'Alterações salvas com sucesso')
      } else {
        // INSERT
        const insertData = {
          ...saleData,
          sale_type: selectedSaleType,
          is_active: true
        }
        
        const { data, error: insertError } = await supabase
          .from('companies')
          .insert(insertData as any)
          .select()
        
        if (insertError) throw insertError
        
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
      const { error: deleteError } = await supabase
        .from('companies')
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
