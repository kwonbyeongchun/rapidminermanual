import { useEffect } from 'react'
import { useParams, useLocation, Link } from 'react-router-dom'
import { useI18n } from '../i18n'
import { useChapters } from '../hooks/useChapters'
import ContentRenderer from '../components/ContentRenderer'
import Breadcrumb from '../components/Breadcrumb'

export default function ChapterPage() {
  const { chapterSlug } = useParams()
  const location = useLocation()
  const { t } = useI18n()
  const allChapters = useChapters()

  const chapter = allChapters.find(c => c.slug === chapterSlug)
  const chapterIndex = allChapters.findIndex(c => c.slug === chapterSlug)
  const prevChapter = chapterIndex > 0 ? allChapters[chapterIndex - 1] : null
  const nextChapter = chapterIndex < allChapters.length - 1 ? allChapters[chapterIndex + 1] : null

  // Scroll to hash on navigation
  useEffect(() => {
    if (location.hash) {
      const id = location.hash.slice(1)
      setTimeout(() => {
        const el = document.getElementById(id)
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
      }, 100)
    } else {
      window.scrollTo(0, 0)
    }
  }, [location])

  if (!chapter) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('chapterNotFound')}</h2>
        <p className="text-gray-500">{t('chapterNotFoundDesc')}</p>
        <Link to="/" className="mt-4 inline-block text-primary-600 hover:text-primary-700">
          {t('backToHome')}
        </Link>
      </div>
    )
  }

  const title = chapter.title

  return (
    <article>
      <Breadcrumb
        items={[
          { label: `${t('chapter')} ${chapter.number}: ${title}` },
        ]}
      />

      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          {chapter.number}. {title}
        </h1>
      </header>

      {/* Chapter intro blocks */}
      {chapter.blocks.length > 0 && (
        <ContentRenderer blocks={chapter.blocks} />
      )}

      {/* Sections */}
      {chapter.sections.map(section => (
        <section key={section.id} id={section.id} className="mt-10 scroll-mt-20">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-100">
            {section.number} {section.title}
          </h2>

          <ContentRenderer blocks={section.blocks} />

          {/* Subsections */}
          {section.subsections.map(sub => (
            <div key={sub.id} id={sub.id} className="mt-8 scroll-mt-20">
              <h3 className="text-xl font-medium text-gray-800 mb-3">
                {sub.number} {sub.title}
              </h3>
              <ContentRenderer blocks={sub.blocks} />
            </div>
          ))}
        </section>
      ))}

      {/* Prev/Next navigation */}
      <nav className="mt-12 pt-6 border-t border-gray-200 flex justify-between gap-4">
        {prevChapter ? (
          <Link
            to={`/chapter/${prevChapter.slug}`}
            className="group flex flex-col items-start text-sm"
          >
            <span className="text-gray-400 text-xs mb-1 flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              {t('previous')}
            </span>
            <span className="text-primary-600 group-hover:text-primary-700 font-medium">
              {prevChapter.number}. {prevChapter.title}
            </span>
          </Link>
        ) : <div />}

        {nextChapter ? (
          <Link
            to={`/chapter/${nextChapter.slug}`}
            className="group flex flex-col items-end text-sm"
          >
            <span className="text-gray-400 text-xs mb-1 flex items-center gap-1">
              {t('next')}
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </span>
            <span className="text-primary-600 group-hover:text-primary-700 font-medium">
              {nextChapter.number}. {nextChapter.title}
            </span>
          </Link>
        ) : <div />}
      </nav>
    </article>
  )
}
