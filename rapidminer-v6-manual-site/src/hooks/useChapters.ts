import { useMemo } from 'react'
import { useI18n } from '../i18n'
import chaptersEn from '../content/chapters.json'
import chaptersKo from '../content/chapters-ko.json'

interface ContentBlock {
  type: 'paragraph' | 'heading' | 'image' | 'table' | 'list' | 'tip'
  text?: string
  html?: string
  src?: string
  caption?: string
  items?: string[]
  rows?: string[][]
}

interface Section {
  id: string
  number: string
  title: string
  blocks: ContentBlock[]
  subsections: Section[]
}

export interface Chapter {
  id: string
  number: string
  title: string
  slug: string
  blocks: ContentBlock[]
  sections: Section[]
}

export function useChapters(): Chapter[] {
  const { lang } = useI18n()
  return useMemo(
    () => (lang === 'ko' ? chaptersKo : chaptersEn) as Chapter[],
    [lang],
  )
}
