import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import * as cheerio from 'cheerio';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Types for our content model
interface ContentBlock {
  type: 'paragraph' | 'heading' | 'image' | 'table' | 'list' | 'tip';
  text?: string;
  html?: string;
  src?: string;
  caption?: string;
  items?: string[];
  rows?: string[][];
  level?: number;
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

const htmlPath = path.resolve(__dirname, '../../RapidMiner-v6-user-manual/RapidMinerv6usermanual.html');
const outPath = path.resolve(__dirname, '../src/content/chapters.json');

const html = fs.readFileSync(htmlPath, 'utf8');
const $ = cheerio.load(html);

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function isPageHeader(p: cheerio.Element): boolean {
  const $p = $(p);
  // Page headers are paragraphs with class c80 containing span.c15 (chapter header repeats)
  // or class c67 containing span.c15 (section header repeats)
  // or class c5 containing span.c15 (another chapter header repeat pattern)
  const pClasses = ($p.attr('class') || '').split(' ');
  if (pClasses.includes('c80') || pClasses.includes('c67') || pClasses.includes('c5')) {
    if ($p.find('span.c15').length > 0) {
      return true;
    }
  }
  return false;
}

function isPageNumber(p: cheerio.Element): boolean {
  const $p = $(p);
  const text = $p.text().trim();
  return /^\d+$/.test(text) && text.length <= 3;
}

function isTocEntry(p: cheerio.Element): boolean {
  const $p = $(p);
  const text = $p.text().trim();
  // TOC entries have dotted leaders ". . . . . ." and page numbers
  return text.includes('. . . . .') || (text.includes('Contents') && $p.find('span.c15').length > 0);
}

function isSectionHeading(p: cheerio.Element): { level: number; number: string; title: string } | null {
  const $p = $(p);

  // Check for span.c44 (section heading like "1.1 Coincidence or not?")
  const c44 = $p.find('span.c44');
  if (c44.length > 0) {
    const text = c44.text().trim();
    const match = text.match(/^(\d+\.\d+)\s+(.+)/);
    if (match) {
      return { level: 2, number: match[1], title: match[2] };
    }
  }

  // Check for span.c9 (subsection heading like "1.2.1 Attributes and Target Attributes")
  const c9 = $p.find('span.c9');
  if (c9.length > 0) {
    const text = c9.text().trim();
    const match = text.match(/^(\d+\.\d+\.\d+)\s+(.+)/);
    if (match) {
      return { level: 3, number: match[1], title: match[2] };
    }
  }

  return null;
}

function extractBlocks(p: cheerio.Element): ContentBlock | null {
  const $p = $(p);

  // Check for image
  const img = $p.find('img[src]');
  if (img.length > 0) {
    const src = img.attr('src') || '';
    // Get caption text - usually the text after the image in the same paragraph
    const textParts: string[] = [];
    $p.contents().each((_, el) => {
      if (el.type === 'text') {
        const t = $(el).text().trim();
        if (t) textParts.push(t);
      } else if (el.type === 'tag' && (el as cheerio.TagElement).tagName !== 'img') {
        const t = $(el).text().trim();
        if (t) textParts.push(t);
      }
    });
    const caption = textParts.join(' ').trim();

    if (src) {
      return {
        type: 'image',
        src: src.replace('images/', '/images/'),
        caption: caption || undefined,
      };
    }
  }

  // Regular paragraph text
  const text = $p.text().trim()
    .replace(/\s+/g, ' ');

  if (!text || text.length < 2) return null;

  // Build HTML with basic formatting preserved
  let html = '';
  $p.find('span').each((_, span) => {
    const $span = $(span);
    const spanText = $span.text();
    const style = $span.attr('style') || '';
    const cls = $span.attr('class') || '';

    if (style.includes('font-weight:700') || style.includes('font-weight:bold')) {
      html += `<strong>${spanText}</strong>`;
    } else if (style.includes('font-style:italic')) {
      html += `<em>${spanText}</em>`;
    } else if (cls.includes('c84')) {
      // c84 is underline class
      html += `<u>${spanText}</u>`;
    } else {
      html += spanText;
    }
  });

  if (!html) html = text;

  return {
    type: 'paragraph',
    text,
    html,
  };
}

function extractTable(table: cheerio.Element): ContentBlock | null {
  const $table = $(table);
  const rows: string[][] = [];

  $table.find('tr').each((_, tr) => {
    const row: string[] = [];
    $(tr).find('td, th').each((_, cell) => {
      row.push($(cell).text().trim());
    });
    rows.push(row);
  });

  if (rows.length === 0) return null;

  return {
    type: 'table',
    rows,
  };
}

// Process all paragraphs and tables in order
const chapters: Chapter[] = [];
let currentChapter: Chapter | null = null;
let currentSection: Section | null = null;
let currentSubsection: Section | null = null;
let inToc = false;

// Chapter titles we know from the TOC
const chapterTitles: Record<string, string> = {
  '1': 'Fundamental Terms',
  '2': 'First Steps',
  '3': 'Design of Analysis Processes',
  '4': 'Data and Result Visualization',
  '5': 'Repository',
};

$('body').children().each((_, el) => {
  const tagName = (el as cheerio.TagElement).tagName;

  // Handle tables
  if (tagName === 'table') {
    const block = extractTable(el);
    if (block) {
      if (currentSubsection) {
        currentSubsection.blocks.push(block);
      } else if (currentSection) {
        currentSection.blocks.push(block);
      } else if (currentChapter) {
        currentChapter.blocks.push(block);
      }
    }
    return;
  }

  if (tagName !== 'p') return;

  // Skip page headers
  if (isPageHeader(el)) return;

  // Skip page numbers
  if (isPageNumber(el)) return;

  // Skip TOC entries
  if (isTocEntry(el)) {
    inToc = true;
    return;
  }

  // Detect chapter start: look for "1 Motivation and" pattern or span.c44 with chapter-level content
  const $el = $(el);
  const fullText = $el.text().trim();

  // Chapter headings from TOC have patterns like "1 Fundamental Terms 1 1.1..."
  // Actual chapter content starts after the TOC
  // The real chapter starts are when we see the chapter text for the first time after TOC

  // Check for c44 section headings
  const heading = isSectionHeading(el);
  if (heading) {
    const chapterNum = heading.number.split('.')[0];

    // Ensure chapter exists
    if (!currentChapter || currentChapter.number !== chapterNum) {
      currentChapter = {
        id: `chapter-${chapterNum}`,
        number: chapterNum,
        title: chapterTitles[chapterNum] || `Chapter ${chapterNum}`,
        slug: `chapter-${chapterNum}-${slugify(chapterTitles[chapterNum] || '')}`,
        blocks: [],
        sections: [],
      };
      chapters.push(currentChapter);
      currentSection = null;
      currentSubsection = null;
    }

    if (heading.level === 2) {
      // Section (e.g., 1.1, 2.3)
      currentSection = {
        id: slugify(`${heading.number}-${heading.title}`),
        number: heading.number,
        title: heading.title,
        blocks: [],
        subsections: [],
      };
      currentChapter.sections.push(currentSection);
      currentSubsection = null;
    } else if (heading.level === 3) {
      // Subsection (e.g., 1.2.1, 2.3.4)
      if (!currentSection) {
        // Create parent section if needed
        const parentNum = heading.number.split('.').slice(0, 2).join('.');
        currentSection = {
          id: slugify(`section-${parentNum}`),
          number: parentNum,
          title: '',
          blocks: [],
          subsections: [],
        };
        currentChapter.sections.push(currentSection);
      }
      currentSubsection = {
        id: slugify(`${heading.number}-${heading.title}`),
        number: heading.number,
        title: heading.title,
        blocks: [],
        subsections: [],
      };
      currentSection.subsections.push(currentSubsection);
    }
    return;
  }

  // Skip everything before first real section heading if no chapter
  if (!currentChapter) {
    // Check if this looks like chapter intro text (after "1 Motivation and Fundamental Terms")
    if (fullText.match(/^In this chapter we would like/)) {
      // Start of chapter 1
      currentChapter = {
        id: 'chapter-1',
        number: '1',
        title: chapterTitles['1'],
        slug: `chapter-1-${slugify(chapterTitles['1'])}`,
        blocks: [],
        sections: [],
      };
      chapters.push(currentChapter);
    } else {
      return;
    }
  }

  // Regular content block
  const block = extractBlocks(el);
  if (block) {
    if (currentSubsection) {
      currentSubsection.blocks.push(block);
    } else if (currentSection) {
      currentSection.blocks.push(block);
    } else if (currentChapter) {
      currentChapter.blocks.push(block);
    }
  }
});

// Make sure output directory exists
fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, JSON.stringify(chapters, null, 2), 'utf8');

console.log(`Parsed ${chapters.length} chapters from HTML:`);
chapters.forEach(ch => {
  console.log(`  Chapter ${ch.number}: ${ch.title} (${ch.sections.length} sections, ${ch.blocks.length} intro blocks)`);
  ch.sections.forEach(sec => {
    console.log(`    ${sec.number} ${sec.title} (${sec.blocks.length} blocks, ${sec.subsections.length} subsections)`);
    sec.subsections.forEach(sub => {
      console.log(`      ${sub.number} ${sub.title} (${sub.blocks.length} blocks)`);
    });
  });
});

console.log(`\nOutput written to: ${outPath}`);
