import { useState, useCallback, useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { useI18n } from '../i18n'
import Sidebar from './Sidebar'
import SearchDialog from './SearchDialog'
import MobileNav from './MobileNav'

export default function Layout() {
  const [searchOpen, setSearchOpen] = useState(false)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const { t, lang, toggleLang } = useI18n()

  const openSearch = useCallback(() => setSearchOpen(true), [])
  const closeSearch = useCallback(() => setSearchOpen(false), [])

  // Ctrl+K to open search
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        setSearchOpen(prev => !prev)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-gray-200">
        <div className="flex items-center h-14 px-4 gap-3">
          <button
            onClick={() => setMobileNavOpen(true)}
            className="lg:hidden p-1.5 -ml-1.5 text-gray-500 hover:text-gray-700"
            aria-label={t('openNav')}
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <a href="/" className="font-semibold text-gray-900 whitespace-nowrap">
            {t('siteTitle')}
          </a>

          <div className="flex-1" />

          {/* Language toggle */}
          <button
            onClick={toggleLang}
            className="px-2 py-1 text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
            title={lang === 'en' ? '한국어로 전환' : 'Switch to English'}
          >
            {lang === 'en' ? '한국어' : 'EN'}
          </button>

          <button
            onClick={openSearch}
            className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-500 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <span className="hidden sm:inline">{t('search')}</span>
            <kbd className="hidden sm:inline-flex items-center px-1.5 font-mono text-xs bg-white border border-gray-300 rounded">
              Ctrl+K
            </kbd>
          </button>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar (desktop) */}
        <aside className="hidden lg:block w-72 flex-shrink-0 border-r border-gray-200 bg-sidebar">
          <nav className="sticky top-14 h-[calc(100vh-3.5rem)] overflow-y-auto sidebar-scroll p-4">
            <Sidebar onNavigate={() => {}} />
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 min-w-0">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Mobile nav */}
      <MobileNav open={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />

      {/* Search dialog */}
      <SearchDialog open={searchOpen} onClose={closeSearch} />
    </div>
  )
}
