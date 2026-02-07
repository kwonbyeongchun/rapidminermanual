import { useState, useEffect, useRef, useMemo } from 'react'
import { useI18n } from '../i18n'
import searchDataEn from '../content/search-index.json'
import searchDataKo from '../content/search-index-ko.json'

interface SearchEntry {
  id: string
  title: string
  chapterSlug: string
  sectionId: string
  text: string
  number: string
}

interface SearchResult {
  id: string
  title: string
  chapterSlug: string
  sectionId: string
  snippet: string
}

export function useSearch(query: string): SearchResult[] {
  const [results, setResults] = useState<SearchResult[]>([])
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null)
  const { lang } = useI18n()

  const searchData = useMemo(
    () => (lang === 'ko' ? searchDataKo : searchDataEn) as SearchEntry[],
    [lang],
  )

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)

    if (!query || query.length < 2) {
      setResults([])
      return
    }

    debounceRef.current = setTimeout(() => {
      const q = query.toLowerCase()
      const entries = searchData

      const matched = entries
        .map(entry => {
          const titleMatch = entry.title.toLowerCase().includes(q)
          const textMatch = entry.text.toLowerCase().includes(q)

          if (!titleMatch && !textMatch) return null

          let snippet = ''
          if (textMatch) {
            const idx = entry.text.toLowerCase().indexOf(q)
            const start = Math.max(0, idx - 50)
            const end = Math.min(entry.text.length, idx + query.length + 50)
            const raw = entry.text.substring(start, end)
            // Highlight match
            const highlighted = raw.replace(
              new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'),
              match => `<mark class="search-highlight">${match}</mark>`
            )
            snippet = (start > 0 ? '...' : '') + highlighted + (end < entry.text.length ? '...' : '')
          }

          return {
            id: entry.id,
            title: entry.title,
            chapterSlug: entry.chapterSlug,
            sectionId: entry.sectionId,
            snippet,
            score: titleMatch ? 2 : 1,
          }
        })
        .filter((r): r is NonNullable<typeof r> => r !== null)
        .sort((a, b) => b.score - a.score)
        .slice(0, 10)

      setResults(matched)
    }, 150)

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [query, searchData])

  return results
}
