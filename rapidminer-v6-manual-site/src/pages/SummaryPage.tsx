import { useParams, Link } from 'react-router-dom'
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { useI18n } from '../i18n'
import { summaryChapters } from '../content/summaryData'

export default function SummaryPage() {
  const { chapterSlug } = useParams<{ chapterSlug: string }>()
  const { lang, t } = useI18n()

  const idx = summaryChapters.findIndex(c => c.slug === chapterSlug)
  const chapter = summaryChapters[idx]

  if (!chapter) {
    return (
      <div className="text-center py-20">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{t('chapterNotFound')}</h1>
        <p className="text-gray-500 mb-6">{t('chapterNotFoundDesc')}</p>
        <Link to="/summary" className="text-primary-600 hover:underline">
          {t('backToSummary')}
        </Link>
      </div>
    )
  }

  const content = chapter.content[lang]
  const prev = idx > 0 ? summaryChapters[idx - 1] : null
  const next = idx < summaryChapters.length - 1 ? summaryChapters[idx + 1] : null

  return (
    <div>
      <div className="mb-6">
        <Link
          to="/summary"
          className="text-sm text-primary-600 hover:underline inline-flex items-center gap-1"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          {t('backToSummary')}
        </Link>
      </div>

      {content ? (
        <article className="prose prose-gray max-w-none prose-headings:scroll-mt-20 prose-table:text-sm prose-th:bg-gray-50 prose-th:p-2 prose-td:p-2 prose-table:border prose-th:border prose-td:border">
          <Markdown remarkPlugins={[remarkGfm]}>{content}</Markdown>
        </article>
      ) : (
        <div className="text-center py-16 bg-gray-50 rounded-lg">
          <p className="text-gray-500">{t('summaryNotAvailable')}</p>
        </div>
      )}

      <nav className="mt-12 pt-6 border-t border-gray-200 flex justify-between">
        {prev ? (
          <Link
            to={`/summary/${prev.slug}`}
            className="text-sm text-primary-600 hover:underline inline-flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            {t('previous')}: {prev.title[lang]}
          </Link>
        ) : <span />}
        {next ? (
          <Link
            to={`/summary/${next.slug}`}
            className="text-sm text-primary-600 hover:underline inline-flex items-center gap-1"
          >
            {t('next')}: {next.title[lang]}
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        ) : <span />}
      </nav>
    </div>
  )
}
