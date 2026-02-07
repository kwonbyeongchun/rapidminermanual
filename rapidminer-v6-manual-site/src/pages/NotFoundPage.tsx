import { Link } from 'react-router-dom'
import { useI18n } from '../i18n'

export default function NotFoundPage() {
  const { t } = useI18n()

  return (
    <div className="text-center py-20">
      <h1 className="text-6xl font-bold text-gray-200 mb-4">404</h1>
      <h2 className="text-xl font-semibold text-gray-900 mb-2">{t('pageNotFound')}</h2>
      <p className="text-gray-500 mb-6">
        {t('pageNotFoundDesc')}
      </p>
      <Link
        to="/"
        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        {t('backToHome')}
      </Link>
    </div>
  )
}
