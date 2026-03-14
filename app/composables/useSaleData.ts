import { ref, watch, isRef } from 'vue'
import type { SupabaseClient, Ref } from '@supabase/supabase-js'

export const useSaleData = (supabase: SupabaseClient, saleType: string | Ref<string>) => {
  const catalogItems = ref<any[]>([])
  const categories = ref<any[]>([])

  const fetchCatalogItems = async () => {
    try {
      const currentType = isRef(saleType) ? saleType.value : saleType
      const type = currentType === 'produto' ? 'Produto' : 'Serviço Único'
      
      console.log('Fetching catalog items for type:', type)
      
      // Simply fetch by type without user_id filter
      const { data, error } = await supabase
        .from('plans')
        .select('*')
        .eq('type', type)
        .order('name')
      
      if (error) {
        console.error('Error fetching catalog items:', error)
        catalogItems.value = []
        return
      }
      
      console.log('Catalog items fetched:', data?.length || 0)
      catalogItems.value = data || []
    } catch (err) {
      console.error('Error fetching catalog items:', err)
      catalogItems.value = []
    }
  }

  const fetchCategories = async () => {
    try {
      const { data } = await supabase
        .from('plan_categories')
        .select('*')
        .order('name')
      
      categories.value = data || []
    } catch (err) {
      console.error('Error fetching categories:', err)
      categories.value = []
    }
  }

  const onPlanSelect = (item: any, form: any) => {
    if (!item) {
      form.monthly_price = 0
      return
    }
    
    if (item.price) {
      form.monthly_price = item.price
    }
  }

  // Watch para recarregar itens quando o tipo mudar
  if (isRef(saleType)) {
    watch(saleType, async () => {
      await fetchCatalogItems()
    })
  }

  return {
    catalogItems,
    categories,
    fetchCatalogItems,
    fetchCategories,
    onPlanSelect
  }
}
