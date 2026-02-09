import { Link } from 'react-router-dom'
import { useI18n } from '../i18n'
import { summaryChapters } from '../content/summaryData'

export default function SummaryHomePage() {
  const { lang, t } = useI18n()

  return (
    <div>
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-3">{t('summaryTitle')}</h1>
        <p className="text-gray-500 leading-relaxed max-w-2xl">
          {t('summaryDescription')}
        </p>
      </div>

      <div className="space-y-4">
        {summaryChapters.map(chapter => {
          const hasContent = !!chapter.content[lang]
          return (
            <div
              key={chapter.id}
              className="border border-gray-200 rounded-lg p-5 hover:border-primary-300 hover:shadow-sm transition-all"
            >
              <div className="flex items-center justify-between">
                <Link
                  to={`/summary/${chapter.slug}`}
                  className="text-lg font-semibold text-gray-900 hover:text-primary-600 transition-colors"
                >
                  {t('chapter')} {chapter.number}. {chapter.title[lang]}
                </Link>
                {!hasContent && (
                  <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded">
                    {t('summaryNotAvailable')}
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-8">
        <Link
          to="/"
          className="text-sm text-primary-600 hover:underline inline-flex items-center gap-1"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          {t('backToHome')}
        </Link>
      </div>
    </div>
  )
}
