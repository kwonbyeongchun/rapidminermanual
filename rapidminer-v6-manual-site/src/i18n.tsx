import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'

export type Lang = 'en' | 'ko'

const translations = {
  en: {
    // Header
    siteTitle: 'RapidMiner v6 Manual',
    search: 'Search...',
    openNav: 'Open navigation',
    closeNav: 'Close navigation',

    // Home page
    heroTitle: 'RapidMiner Studio v6',
    heroSubtitle: 'User Manual',
    heroDescription:
      'This manual provides a comprehensive guide to using RapidMiner Studio v6, covering fundamental data mining concepts, the user interface, process design, data visualization, and repository management.',
    copyright: '\u00a92014 by RapidMiner. All rights reserved.',

    // Navigation
    home: 'Home',
    navigation: 'Navigation',
    previous: 'Previous',
    next: 'Next',
    chapter: 'Chapter',
    backToHome: 'Back to home',

    // Search
    searchPlaceholder: 'Search documentation...',
    noResults: 'No results found for',
    typeToSearch: 'Type to search the documentation',
    navigate: 'navigate',
    open: 'open',

    // 404
    pageNotFound: 'Page not found',
    pageNotFoundDesc: "The page you're looking for doesn't exist.",

    // Chapter page
    chapterNotFound: 'Chapter not found',
    chapterNotFoundDesc: 'The requested chapter does not exist.',

    // Summary
    summary: 'Summary',
    summaryTitle: 'Chapter Summaries',
    summaryDescription:
      'Concise summaries of each chapter for quick review of key concepts and important points.',
    viewSummary: 'View Summaries',
    summaryNotAvailable: 'Summary not available in this language',
    backToSummary: 'Back to summaries',

    // Chapter titles
    'ch.1': 'Fundamental Terms',
    'ch.2': 'First Steps',
    'ch.3': 'Design of Analysis Processes',
    'ch.4': 'Data and Result Visualization',
    'ch.5': 'Repository',
  },
  ko: {
    // Header
    siteTitle: 'RapidMiner v6 매뉴얼',
    search: '검색...',
    openNav: '내비게이션 열기',
    closeNav: '내비게이션 닫기',

    // Home page
    heroTitle: 'RapidMiner Studio v6',
    heroSubtitle: '사용자 매뉴얼',
    heroDescription:
      '이 매뉴얼은 RapidMiner Studio v6 사용에 대한 종합 가이드로, 데이터 마이닝의 기본 개념, 사용자 인터페이스, 프로세스 설계, 데이터 시각화 및 리포지토리 관리를 다룹니다.',
    copyright: '\u00a92014 RapidMiner. 모든 권리 보유.',

    // Navigation
    home: '홈',
    navigation: '내비게이션',
    previous: '이전',
    next: '다음',
    chapter: '챕터',
    backToHome: '홈으로 돌아가기',

    // Search
    searchPlaceholder: '문서 검색...',
    noResults: '검색 결과 없음:',
    typeToSearch: '검색어를 입력하세요',
    navigate: '이동',
    open: '열기',

    // 404
    pageNotFound: '페이지를 찾을 수 없습니다',
    pageNotFoundDesc: '요청하신 페이지가 존재하지 않습니다.',

    // Chapter page
    chapterNotFound: '챕터를 찾을 수 없습니다',
    chapterNotFoundDesc: '요청하신 챕터가 존재하지 않습니다.',

    // Summary
    summary: '요약',
    summaryTitle: '챕터 요약',
    summaryDescription:
      '각 챕터의 핵심 개념과 중요 사항을 빠르게 파악할 수 있는 간결한 요약입니다.',
    viewSummary: '요약 보기',
    summaryNotAvailable: '이 언어로는 요약이 제공되지 않습니다',
    backToSummary: '요약 목록으로 돌아가기',

    // Chapter titles
    'ch.1': '기본 용어',
    'ch.2': '시작하기',
    'ch.3': '분석 프로세스 설계',
    'ch.4': '데이터 및 결과 시각화',
    'ch.5': '리포지토리',
  },
} as const

export type TranslationKey = keyof (typeof translations)['en']

interface I18nContextType {
  lang: Lang
  t: (key: TranslationKey) => string
  toggleLang: () => void
}

const I18nContext = createContext<I18nContextType>(null!)

function getInitialLang(): Lang {
  try {
    const saved = localStorage.getItem('lang')
    if (saved === 'ko' || saved === 'en') return saved
  } catch { /* ignore */ }
  return 'en'
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>(getInitialLang)

  const t = useCallback(
    (key: TranslationKey): string => translations[lang][key] ?? key,
    [lang],
  )

  const toggleLang = useCallback(() => {
    setLang(prev => {
      const next = prev === 'en' ? 'ko' : 'en'
      try { localStorage.setItem('lang', next) } catch { /* ignore */ }
      document.documentElement.lang = next
      return next
    })
  }, [])

  return (
    <I18nContext.Provider value={{ lang, t, toggleLang }}>
      {children}
    </I18nContext.Provider>
  )
}

export function useI18n() {
  return useContext(I18nContext)
}
