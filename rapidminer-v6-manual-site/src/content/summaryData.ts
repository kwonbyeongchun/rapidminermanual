import ch1 from './summary/01-기본용어.md?raw'
import ch2 from './summary/02-첫번째단계.md?raw'
import ch3 from './summary/03-분석프로세스설계.md?raw'
import ch4 from './summary/04-데이터및결과시각화.md?raw'
import ch5 from './summary/05-리포지토리.md?raw'

export interface SummaryChapter {
  id: string
  number: number
  title: { en: string; ko: string }
  slug: string
  content: { en: string; ko: string }
}

export const summaryChapters: SummaryChapter[] = [
  {
    id: 'summary-ch1',
    number: 1,
    title: { en: 'Fundamental Terms', ko: '기본 용어' },
    slug: 'fundamental-terms',
    content: { en: '', ko: ch1 },
  },
  {
    id: 'summary-ch2',
    number: 2,
    title: { en: 'First Steps', ko: '첫 번째 단계' },
    slug: 'first-steps',
    content: { en: '', ko: ch2 },
  },
  {
    id: 'summary-ch3',
    number: 3,
    title: { en: 'Design of Analysis Processes', ko: '분석 프로세스 설계' },
    slug: 'analysis-process-design',
    content: { en: '', ko: ch3 },
  },
  {
    id: 'summary-ch4',
    number: 4,
    title: { en: 'Data and Result Visualization', ko: '데이터 및 결과 시각화' },
    slug: 'data-visualization',
    content: { en: '', ko: ch4 },
  },
  {
    id: 'summary-ch5',
    number: 5,
    title: { en: 'Repository', ko: '리포지토리' },
    slug: 'repository',
    content: { en: '', ko: ch5 },
  },
]
