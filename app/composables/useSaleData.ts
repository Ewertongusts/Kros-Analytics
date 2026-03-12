import { ref } from 'vue'
import type { SupabaseClient } from '@supabase/supabase-js'

export const useSaleData = (supabase: SupabaseClient, saleType: string) => {
  const catalogItems = ref<any[]>([])
  const categories = ref<any[]>([])

  const fetchCatalogItems = async () => {
    const type = saleType === 'produto' ? 'Produto' : 'Serviço Único'
    const { data } = await supabase
      .from('plans')
      .select('*')
      .eq('type', type)
      .order('name')
    
    catalogItems.value = data || []
  }

  const fetchCategories = async () => {
    const { data } = await supabase
      .from('plan_categories')
      .select('*')
      .order('name')
    
    categories.value = data || []
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

  return {
    catalogItems,
    categories,
    fetchCatalogItems,
    fetchCategories,
    onPlanSelect
  }
}
