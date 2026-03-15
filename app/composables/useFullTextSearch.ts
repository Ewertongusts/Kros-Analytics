import { computed, ref } from 'vue'
import type { Task } from './useTasks'

export interface SearchResult {
  task: Task
  score: number
  highlights: string[]
}

export const useFullTextSearch = () => {
  // Tokenizar e normalizar texto
  const tokenize = (text: string): string[] => {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(token => token.length > 0)
  }

  // Calcular similaridade entre dois strings (Levenshtein distance)
  const levenshteinDistance = (a: string, b: string): number => {
    const matrix: number[][] = []

    for (let i = 0; i <= b.length; i++) {
      matrix[i] = [i]
    }

    for (let j = 0; j <= a.length; j++) {
      matrix[0][j] = j
    }

    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        if (b.charAt(i - 1) === a.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1]
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          )
        }
      }
    }

    return matrix[b.length][a.length]
  }

  // Calcular score de similaridade (0-1)
  const similarityScore = (a: string, b: string): number => {
    const maxLen = Math.max(a.length, b.length)
    if (maxLen === 0) return 1
    const distance = levenshteinDistance(a, b)
    return 1 - distance / maxLen
  }

  // Buscar token em texto com fuzzy matching
  const fuzzyMatch = (query: string, text: string, threshold = 0.7): boolean => {
    const queryTokens = tokenize(query)
    const textTokens = tokenize(text)

    return queryTokens.some(queryToken => {
      return textTokens.some(textToken => {
        const score = similarityScore(queryToken, textToken)
        return score >= threshold
      })
    })
  }

  // Extrair highlights do texto
  const extractHighlights = (query: string, text: string, contextLength = 50): string[] => {
    const queryTokens = tokenize(query)
    const lowerText = text.toLowerCase()
    const highlights: string[] = []

    queryTokens.forEach(token => {
      let index = 0
      while ((index = lowerText.indexOf(token, index)) !== -1) {
        const start = Math.max(0, index - contextLength)
        const end = Math.min(text.length, index + token.length + contextLength)
        const highlight = text.substring(start, end)
        highlights.push(`...${highlight}...`)
        index += token.length
      }
    })

    return [...new Set(highlights)].slice(0, 3)
  }

  // Calcular score de relevância para uma tarefa
  const calculateRelevanceScore = (query: string, task: Task): number => {
    let score = 0
    const queryTokens = tokenize(query)

    // Título (peso 3x)
    if (task.title) {
      const titleTokens = tokenize(task.title)
      const titleMatches = queryTokens.filter(qt =>
        titleTokens.some(tt => similarityScore(qt, tt) > 0.8)
      ).length
      score += titleMatches * 3
    }

    // Descrição (peso 2x)
    if (task.description) {
      const descTokens = tokenize(task.description)
      const descMatches = queryTokens.filter(qt =>
        descTokens.some(dt => similarityScore(qt, dt) > 0.8)
      ).length
      score += descMatches * 2
    }

    // Empresa (peso 1.5x)
    if ((task as any).company_name) {
      const companyTokens = tokenize((task as any).company_name)
      const companyMatches = queryTokens.filter(qt =>
        companyTokens.some(ct => similarityScore(qt, ct) > 0.8)
      ).length
      score += companyMatches * 1.5
    }

    // Tags (peso 1x)
    if (task.tags && Array.isArray(task.tags)) {
      const tagMatches = queryTokens.filter(qt =>
        task.tags!.some(tag => similarityScore(qt, tag.toLowerCase()) > 0.8)
      ).length
      score += tagMatches
    }

    // Responsável (peso 0.5x)
    if (task.assigned_to) {
      const assignedTokens = tokenize(task.assigned_to)
      const assignedMatches = queryTokens.filter(qt =>
        assignedTokens.some(at => similarityScore(qt, at) > 0.8)
      ).length
      score += assignedMatches * 0.5
    }

    return score
  }

  // Busca full-text com ranking
  const search = (query: string, tasks: Task[]): SearchResult[] => {
    if (!query.trim()) return []

    const results = tasks
      .map(task => ({
        task,
        score: calculateRelevanceScore(query, task),
        highlights: extractHighlights(query, `${task.title} ${task.description}`)
      }))
      .filter(result => result.score > 0)
      .sort((a, b) => b.score - a.score)

    return results
  }

  // Busca com sugestões (autocomplete)
  const getSearchSuggestions = (query: string, tasks: Task[], limit = 5): string[] => {
    if (!query.trim()) return []

    const queryTokens = tokenize(query)
    const suggestions = new Set<string>()

    tasks.forEach(task => {
      // Sugestões do título
      if (task.title) {
        const titleTokens = tokenize(task.title)
        titleTokens.forEach(token => {
          queryTokens.forEach(qt => {
            if (similarityScore(qt, token) > 0.7) {
              suggestions.add(token)
            }
          })
        })
      }

      // Sugestões da descrição
      if (task.description) {
        const descTokens = tokenize(task.description)
        descTokens.forEach(token => {
          queryTokens.forEach(qt => {
            if (similarityScore(qt, token) > 0.7 && token.length > 3) {
              suggestions.add(token)
            }
          })
        })
      }

      // Sugestões de tags
      if (task.tags && Array.isArray(task.tags)) {
        task.tags.forEach(tag => {
          queryTokens.forEach(qt => {
            if (similarityScore(qt, tag.toLowerCase()) > 0.7) {
              suggestions.add(tag)
            }
          })
        })
      }
    })

    return Array.from(suggestions).slice(0, limit)
  }

  // Busca com filtros combinados
  const advancedSearch = (
    query: string,
    tasks: Task[],
    filters?: {
      status?: string[]
      priority?: string[]
      assigned_to?: string[]
      company_id?: string[]
    }
  ): SearchResult[] => {
    let filtered = tasks

    // Aplicar filtros
    if (filters) {
      if (filters.status?.length) {
        filtered = filtered.filter(t => filters.status!.includes(t.status || ''))
      }
      if (filters.priority?.length) {
        filtered = filtered.filter(t => filters.priority!.includes(t.priority || ''))
      }
      if (filters.assigned_to?.length) {
        filtered = filtered.filter(t => filters.assigned_to!.includes(t.assigned_to || ''))
      }
      if (filters.company_id?.length) {
        filtered = filtered.filter(t => filters.company_id!.includes((t as any).company_id || ''))
      }
    }

    // Aplicar busca
    return search(query, filtered)
  }

  return {
    tokenize,
    levenshteinDistance,
    similarityScore,
    fuzzyMatch,
    extractHighlights,
    calculateRelevanceScore,
    search,
    getSearchSuggestions,
    advancedSearch
  }
}
