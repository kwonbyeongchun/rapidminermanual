import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface ContentBlock {
  type: string;
  text?: string;
  items?: string[];
  caption?: string;
}

interface Section {
  id: string;
  number: string;
  title: string;
  blocks: ContentBlock[];
  subsections: Section[];
}

interface Chapter {
  id: string;
  number: string;
  title: string;
  slug: string;
  blocks: ContentBlock[];
  sections: Section[];
}

interface SearchEntry {
  id: string;
  title: string;
  chapterSlug: string;
  sectionId: string;
  text: string;
  number: string;
}

const chaptersPath = path.resolve(__dirname, '../src/content/chapters.json');
const chaptersKoPath = path.resolve(__dirname, '../src/content/chapters-ko.json');
const outPath = path.resolve(__dirname, '../src/content/search-index.json');
const outKoPath = path.resolve(__dirname, '../src/content/search-index-ko.json');

const chapters: Chapter[] = JSON.parse(fs.readFileSync(chaptersPath, 'utf8'));
const entries: SearchEntry[] = [];

function extractText(blocks: ContentBlock[]): string {
  return blocks
    .map(b => {
      if (b.text) return b.text;
      if (b.items) return b.items.join(' ');
      if (b.caption) return b.caption;
      return '';
    })
    .filter(Boolean)
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();
}

for (const chapter of chapters) {
  // Chapter intro
  if (chapter.blocks.length > 0) {
    entries.push({
      id: chapter.id,
      title: `${chapter.number}. ${chapter.title}`,
      chapterSlug: chapter.slug,
      sectionId: '',
      text: extractText(chapter.blocks),
      number: chapter.number,
    });
  }

  for (const section of chapter.sections) {
    // Section content
    const sectionText = extractText(section.blocks);
    if (sectionText || section.title) {
      entries.push({
        id: section.id,
        title: `${section.number} ${section.title}`,
        chapterSlug: chapter.slug,
        sectionId: section.id,
        text: sectionText,
        number: section.number,
      });
    }

    for (const sub of section.subsections) {
      const subText = extractText(sub.blocks);
      if (subText || sub.title) {
        entries.push({
          id: sub.id,
          title: `${sub.number} ${sub.title}`,
          chapterSlug: chapter.slug,
          sectionId: sub.id,
          text: subText,
          number: sub.number,
        });
      }
    }
  }
}

fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, JSON.stringify(entries, null, 2), 'utf8');

console.log(`Built search index with ${entries.length} entries`);
console.log(`Output written to: ${outPath}`);

// Build Korean search index if chapters-ko.json exists
if (fs.existsSync(chaptersKoPath)) {
  const chaptersKo: Chapter[] = JSON.parse(fs.readFileSync(chaptersKoPath, 'utf8'));
  const entriesKo: SearchEntry[] = [];

  for (const chapter of chaptersKo) {
    if (chapter.blocks.length > 0) {
      entriesKo.push({
        id: chapter.id,
        title: `${chapter.number}. ${chapter.title}`,
        chapterSlug: chapter.slug,
        sectionId: '',
        text: extractText(chapter.blocks),
        number: chapter.number,
      });
    }

    for (const section of chapter.sections) {
      const sectionText = extractText(section.blocks);
      if (sectionText || section.title) {
        entriesKo.push({
          id: section.id,
          title: `${section.number} ${section.title}`,
          chapterSlug: chapter.slug,
          sectionId: section.id,
          text: sectionText,
          number: section.number,
        });
      }

      for (const sub of section.subsections) {
        const subText = extractText(sub.blocks);
        if (subText || sub.title) {
          entriesKo.push({
            id: sub.id,
            title: `${sub.number} ${sub.title}`,
            chapterSlug: chapter.slug,
            sectionId: sub.id,
            text: subText,
            number: sub.number,
          });
        }
      }
    }
  }

  fs.writeFileSync(outKoPath, JSON.stringify(entriesKo, null, 2), 'utf8');
  console.log(`Built Korean search index with ${entriesKo.length} entries`);
  console.log(`Output written to: ${outKoPath}`);
}
