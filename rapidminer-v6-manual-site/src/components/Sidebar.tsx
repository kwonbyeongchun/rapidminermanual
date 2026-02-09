import { useState } from 'react'
import { Link, useParams, useLocation } from 'react-router-dom'
import { useI18n } from '../i18n'
import { useChapters } from '../hooks/useChapters'
import { summaryChapters } from '../content/summaryData'

interface SidebarProps {
  onNavigate: () => void
}

export default function Sidebar({ onNavigate }: SidebarProps) {
  const { chapterSlug } = useParams()
  const location = useLocation()
  const { lang, t } = useI18n()
  const chapters = useChapters()
  const isSummarySection = location.pathname.startsWith('/summary')
  const [expanded, setExpanded] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {}
    if (chapterSlug) {
      const ch = chapters.find(c => c.slug === chapterSlug)
      if (ch) initial[ch.id] = true
    }
    return initial
  })

  const toggle = (id: string) => {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }))
  }

  return (
    <div className="space-y-1">
      {chapters.map(chapter => {
        const isActive = chapter.slug === chapterSlug
        const isExpanded = expanded[chapter.id] || isActive

        return (
          <div key={chapter.id}>
            <button
              onClick={() => toggle(chapter.id)}
              className={`w-full flex items-center gap-1.5 px-2 py-1.5 text-sm rounded-md transition-colors text-left ${
                isActive
                  ? 'bg-primary-50 text-primary-700 font-medium'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <svg
                className={`w-3.5 h-3.5 flex-shrink-0 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              <span className="truncate">
                {chapter.number}. {chapter.title}
              </span>
            </button>

            {isExpanded && (
              <div className="ml-3 pl-2 border-l border-gray-200 space-y-0.5 mt-0.5">
                {chapter.sections.map(section => (
                  <div key={section.id}>
                    <Link
                      to={`/chapter/${chapter.slug}#${section.id}`}
                      onClick={onNavigate}
                      className="block px-2 py-1 text-sm text-gray-600 hover:text-primary-700 hover:bg-gray-50 rounded transition-colors truncate"
                    >
                      {section.number} {section.title}
                    </Link>
                    {section.subsections.length > 0 && (
                      <div className="ml-3 space-y-0.5">
                        {section.subsections.map(sub => (
                          <Link
                            key={sub.id}
                            to={`/chapter/${chapter.slug}#${sub.id}`}
                            onClick={onNavigate}
                            className="block px-2 py-0.5 text-xs text-gray-500 hover:text-primary-700 hover:bg-gray-50 rounded transition-colors truncate"
                          >
                            {sub.number} {sub.title}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )
      })}

      {/* Summary section */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <Link
          to="/summary"
          onClick={onNavigate}
          className={`block px-2 py-1.5 text-sm font-medium rounded-md transition-colors ${
            isSummarySection
              ? 'bg-primary-50 text-primary-700'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          {t('summary')}
        </Link>
        <div className="ml-3 pl-2 border-l border-gray-200 space-y-0.5 mt-1">
          {summaryChapters.map(sc => (
            <Link
              key={sc.id}
              to={`/summary/${sc.slug}`}
              onClick={onNavigate}
              className={`block px-2 py-1 text-sm rounded transition-colors truncate ${
                isSummarySection && chapterSlug === sc.slug
                  ? 'text-primary-700 bg-primary-50 font-medium'
                  : 'text-gray-600 hover:text-primary-700 hover:bg-gray-50'
              }`}
            >
              {sc.number}. {sc.title[lang]}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
