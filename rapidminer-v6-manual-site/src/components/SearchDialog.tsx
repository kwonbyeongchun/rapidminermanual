import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useI18n } from '../i18n'
import { useSearch } from '../hooks/useSearch'

interface SearchDialogProps {
  open: boolean
  onClose: () => void
}

export default function SearchDialog({ open, onClose }: SearchDialogProps) {
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()
  const results = useSearch(query)
  const { t } = useI18n()

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setQuery('')
      setSelectedIndex(0)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [open])

  // Reset selection when results change
  useEffect(() => {
    setSelectedIndex(0)
  }, [results])

  const handleSelect = useCallback((result: typeof results[0]) => {
    const hash = result.sectionId ? `#${result.sectionId}` : ''
    navigate(`/chapter/${result.chapterSlug}${hash}`)
    onClose()
  }, [navigate, onClose])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex(prev => Math.min(prev + 1, results.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex(prev => Math.max(prev - 1, 0))
    } else if (e.key === 'Enter' && results[selectedIndex]) {
      handleSelect(results[selectedIndex])
    } else if (e.key === 'Escape') {
      onClose()
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/30" onClick={onClose} />

      {/* Dialog */}
      <div className="relative w-full max-w-lg mx-4 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden">
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 border-b border-gray-200">
          <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t('searchPlaceholder')}
            className="flex-1 py-3 text-sm bg-transparent outline-none placeholder-gray-400"
          />
          <kbd className="px-1.5 py-0.5 text-xs font-mono bg-gray-100 border border-gray-200 rounded text-gray-500">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div className="max-h-80 overflow-y-auto">
          {query.length > 0 && results.length === 0 && (
            <div className="px-4 py-8 text-center text-sm text-gray-500">
              {t('noResults')} &ldquo;{query}&rdquo;
            </div>
          )}

          {results.map((result, i) => (
            <button
              key={result.id}
              onClick={() => handleSelect(result)}
              className={`w-full text-left px-4 py-3 border-b border-gray-100 last:border-0 transition-colors ${
                i === selectedIndex ? 'bg-primary-50' : 'hover:bg-gray-50'
              }`}
            >
              <div className="text-sm font-medium text-gray-900">
                {result.title}
              </div>
              {result.snippet && (
                <div
                  className="text-xs text-gray-500 mt-0.5 line-clamp-2"
                  dangerouslySetInnerHTML={{ __html: result.snippet }}
                />
              )}
            </button>
          ))}

          {query.length === 0 && (
            <div className="px-4 py-6 text-center text-sm text-gray-400">
              {t('typeToSearch')}
            </div>
          )}
        </div>

        {/* Footer */}
        {results.length > 0 && (
          <div className="flex items-center gap-4 px-4 py-2 border-t border-gray-200 text-xs text-gray-400">
            <span className="flex items-center gap-1">
              <kbd className="px-1 py-0.5 bg-gray-100 border border-gray-200 rounded font-mono">&uarr;</kbd>
              <kbd className="px-1 py-0.5 bg-gray-100 border border-gray-200 rounded font-mono">&darr;</kbd>
              {t('navigate')}
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1 py-0.5 bg-gray-100 border border-gray-200 rounded font-mono">&crarr;</kbd>
              {t('open')}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
