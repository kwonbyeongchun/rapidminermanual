import { Link } from 'react-router-dom'
import { useI18n } from '../i18n'
import { useChapters } from '../hooks/useChapters'

export default function HomePage() {
  const { t } = useI18n()
  const chapters = useChapters()

  return (
    <div>
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-3">
          {t('heroTitle')}
        </h1>
        <h2 className="text-xl text-gray-600 mb-4">{t('heroSubtitle')}</h2>
        <p className="text-gray-500 leading-relaxed max-w-2xl">
          {t('heroDescription')}
        </p>
      </div>

      <div className="space-y-6">
        {chapters.map(chapter => (
          <div
            key={chapter.id}
            className="border border-gray-200 rounded-lg p-5 hover:border-primary-300 hover:shadow-sm transition-all"
          >
            <Link
              to={`/chapter/${chapter.slug}`}
              className="text-lg font-semibold text-gray-900 hover:text-primary-600 transition-colors"
            >
              {chapter.number}. {chapter.title}
            </Link>

            {chapter.sections.length > 0 && (
              <div className="mt-3 grid gap-1">
                {chapter.sections.map(section => (
                  <div key={section.id}>
                    <Link
                      to={`/chapter/${chapter.slug}#${section.id}`}
                      className="text-sm text-gray-600 hover:text-primary-600 transition-colors"
                    >
                      {section.number} {section.title}
                    </Link>
                    {section.subsections.length > 0 && (
                      <div className="ml-4 space-y-0.5 mt-0.5">
                        {section.subsections.map(sub => (
                          <Link
                            key={sub.id}
                            to={`/chapter/${chapter.slug}#${sub.id}`}
                            className="block text-xs text-gray-400 hover:text-primary-600 transition-colors"
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
        ))}
      </div>

      <footer className="mt-12 pt-6 border-t border-gray-200 text-sm text-gray-400">
        {t('copyright')}
      </footer>
    </div>
  )
}
