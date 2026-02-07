import { useEffect } from 'react'
import { useI18n } from '../i18n'
import Sidebar from './Sidebar'

interface MobileNavProps {
  open: boolean
  onClose: () => void
}

export default function MobileNav({ open, onClose }: MobileNavProps) {
  const { t } = useI18n()

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-40 lg:hidden">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/30" onClick={onClose} />

      {/* Panel */}
      <div className="fixed inset-y-0 left-0 w-72 bg-white shadow-xl overflow-y-auto sidebar-scroll">
        <div className="flex items-center justify-between h-14 px-4 border-b border-gray-200">
          <span className="font-semibold text-gray-900">{t('navigation')}</span>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-500 hover:text-gray-700"
            aria-label={t('closeNav')}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <nav className="p-4">
          <Sidebar onNavigate={onClose} />
        </nav>
      </div>
    </div>
  )
}
