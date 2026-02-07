import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useChapters } from '../hooks/useChapters'

interface SidebarProps {
  onNavigate: () => void
}

export default function Sidebar({ onNavigate }: SidebarProps) {
  const { chapterSlug } = useParams()
  const chapters = useChapters()
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
    </div>
  )
}
