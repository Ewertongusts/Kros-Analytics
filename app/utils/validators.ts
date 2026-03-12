/**
 * Valida se um número de WhatsApp é válido
 * @param whatsapp - Número de WhatsApp (pode conter formatação)
 * @returns true se o número for válido (10+ dígitos)
 */
export const isValidWhatsApp = (whatsapp?: string | null): boolean => {
  if (!whatsapp) return false
  const rawNum = whatsapp.replace(/\D/g, '')
  return rawNum.length >= 10
}

/**
 * Formata um número de WhatsApp para o padrão brasileiro
 * @param whatsapp - Número de WhatsApp
 * @returns Número formatado (XX) XXXXX-XXXX
 */
export const formatWhatsApp = (whatsapp?: string | null): string => {
  if (!whatsapp) return ''
  const rawNum = whatsapp.replace(/\D/g, '')
  
  if (rawNum.length === 11) {
    return `(${rawNum.slice(0, 2)}) ${rawNum.slice(2, 7)}-${rawNum.slice(7)}`
  }
  
  if (rawNum.length === 10) {
    return `(${rawNum.slice(0, 2)}) ${rawNum.slice(2, 6)}-${rawNum.slice(6)}`
  }
  
  return whatsapp
}

/**
 * Formata um valor monetário para o padrão brasileiro
 * @param value - Valor numérico
 * @returns Valor formatado R$ X.XXX,XX
 */
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', { 
    style: 'currency', 
    currency: 'BRL' 
  }).format(value)
}

/**
 * Formata uma data para o padrão brasileiro
 * @param date - Data em formato ISO ou Date
 * @returns Data formatada DD/MM/YYYY
 */
export const formatDate = (date: string | Date): string => {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('pt-BR')
}

/**
 * Calcula a diferença em dias entre duas datas
 * @param date1 - Data inicial
 * @param date2 - Data final (padrão: hoje)
 * @returns Número de dias de diferença
 */
export const daysDiff = (date1: string | Date, date2: Date = new Date()): number => {
  const d1 = typeof date1 === 'string' ? new Date(date1) : date1
  const diffTime = date2.getTime() - d1.getTime()
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}
