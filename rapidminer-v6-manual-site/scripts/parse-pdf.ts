import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const { PDFParse } = require('pdf-parse');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

// Patterns for page headers that repeat on every page
const pageHeaderPatterns = [
  /^\d+\.\s+(Fundamental Terms|First steps|Design of Analysis Processes|Data and Result Visualization|Repository)$/,
  /^\d+\.\d+\.\s+\w/,  // "4.1. Result Visualization", "5.2. Using the Repository"
];

function isPageHeader(line: string): boolean {
  // Page separators
  if (/^-- \d+ of \d+ --$/.test(line)) return true;
  // Standalone page numbers
  if (/^\d{1,3}$/.test(line)) return true;
  // Repeating chapter headers at top of pages
  for (const pat of pageHeaderPatterns) {
    if (pat.test(line)) return true;
  }
  return false;
}

function isTocEntry(line: string): boolean {
  return line.includes('. . . . .') || /^\d+\.\d+.*\d+$/.test(line) && line.includes('.');
}

async function main() {
  const pdfPath = path.resolve(__dirname, '../../RapidMiner-v6-user-manual.pdf');
  const chaptersPath = path.resolve(__dirname, '../src/content/chapters.json');

  // Load existing chapters from HTML parsing
  const chapters: Chapter[] = JSON.parse(fs.readFileSync(chaptersPath, 'utf8'));

  // Read PDF
  const pdfBuffer = fs.readFileSync(pdfPath);
  const u8 = new Uint8Array(pdfBuffer);
  const parser = new PDFParse(u8);
  const result = await parser.getText();
  const text: string = result.text;

  const lines = text.split('\n');

  // We need to extract content starting from after 4.1.1 (page ~80)
  // The HTML covers up to section 4.1.1 "Sources for Displaying Results"
  // We need to add the actual content of 4.1.1 and everything after

  let currentChapter: Chapter | null = null;
  let currentSection: Section | null = null;
  let currentSubsection: Section | null = null;
  let collecting = false;
  let pendingLines: string[] = [];
  let listItems: string[] = [];
  let inList = false;

  // Find the start of content we need - after "4.1.1 Sources for Displaying Results" text
  // The HTML already has the heading and first paragraph, so we start collecting
  // from the continued content of 4.1.1

  // Point to existing chapter 4
  const ch4 = chapters.find(c => c.number === '4');
  if (!ch4) {
    console.error('Chapter 4 not found in existing chapters');
    process.exit(1);
  }

  function addParagraph() {
    if (pendingLines.length === 0) return;
    const text = pendingLines.join(' ').replace(/\s+/g, ' ').trim();
    pendingLines = [];
    if (text.length < 3) return;
    // Skip known header patterns
    if (isPageHeader(text)) return;

    const block: ContentBlock = {
      type: 'paragraph',
      text,
      html: text,
    };
    addBlock(block);
  }

  function addListItems() {
    if (listItems.length === 0) return;
    const block: ContentBlock = {
      type: 'list',
      items: [...listItems],
    };
    addBlock(block);
    listItems = [];
    inList = false;
  }

  function addBlock(block: ContentBlock) {
    if (currentSubsection) {
      currentSubsection.blocks.push(block);
    } else if (currentSection) {
      currentSection.blocks.push(block);
    } else if (currentChapter) {
      currentChapter.blocks.push(block);
    }
  }

  function ensureSection(num: string, title: string) {
    const chNum = num.split('.')[0];

    // Ensure right chapter
    if (chNum === '5') {
      let ch5 = chapters.find(c => c.number === '5');
      if (!ch5) {
        ch5 = {
          id: 'chapter-5',
          number: '5',
          title: 'Repository',
          slug: 'chapter-5-repository',
          blocks: [],
          sections: [],
        };
        chapters.push(ch5);
      }
      currentChapter = ch5;
    } else if (chNum === '4') {
      currentChapter = ch4;
    }
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Skip empty lines
    if (!line) {
      // Empty line might indicate paragraph break
      if (pendingLines.length > 0) {
        addParagraph();
      }
      continue;
    }

    // Skip page separators
    if (/^-- \d+ of \d+ --$/.test(line)) continue;

    // Skip standalone page numbers
    if (/^\d{1,3}$/.test(line) && line.length <= 3) continue;

    // Skip TOC entries
    if (line.includes('. . . .')) continue;

    // Skip repeating page headers (e.g., "4.1. Result Visualization", "5. Repository")
    if (/^\d+\.\d+\.\s+\w/.test(line) && line.length < 60) continue;
    if (/^\d+\.\s+(Fundamental Terms|First steps|Design of Analysis Processes|Data and Result Visualization|Repository)$/.test(line)) continue;

    // Detect when we should start collecting
    // We want to start after "4.1.1 Sources for Displaying Results" heading
    // which is around the point where the HTML content ends
    if (!collecting && line === '4.1.1 Sources for Displaying Results') {
      collecting = true;
      // Point to existing 4.1.1 subsection
      currentChapter = ch4;
      const sec41 = ch4.sections.find(s => s.number === '4.1');
      if (sec41) {
        currentSection = sec41;
        currentSubsection = sec41.subsections.find(s => s.number === '4.1.1') || null;
      }
      continue;
    }

    if (!collecting) continue;

    // Skip figure references (we don't have the actual images from PDF)
    if (/^Figure \d+\.\d+:/.test(line)) {
      addParagraph();
      addBlock({
        type: 'image',
        caption: line,
        src: '',
      });
      continue;
    }

    // Detect section headings: "4.2 About Data Copies and Views"
    const sectionMatch = line.match(/^(\d+\.\d+)\s+(.+)/);
    if (sectionMatch && !line.match(/^\d+\.\d+\.\d+/) && sectionMatch[2].length > 3
        && sectionMatch[2][0] === sectionMatch[2][0].toUpperCase()) {
      addParagraph();
      addListItems();
      const num = sectionMatch[1];
      const title = sectionMatch[2];
      ensureSection(num, title);

      if (currentChapter) {
        // Don't duplicate
        const existing = currentChapter.sections.find(s => s.number === num);
        if (!existing) {
          currentSection = {
            id: slugify(`${num}-${title}`),
            number: num,
            title,
            blocks: [],
            subsections: [],
          };
          currentChapter.sections.push(currentSection);
        } else {
          currentSection = existing;
        }
        currentSubsection = null;
      }
      continue;
    }

    // Detect subsection headings: "4.3.1 Description"
    const subsectionMatch = line.match(/^(\d+\.\d+\.\d+)\s+(.+)/);
    if (subsectionMatch && subsectionMatch[2].length > 3
        && subsectionMatch[2][0] === subsectionMatch[2][0].toUpperCase()) {
      addParagraph();
      addListItems();
      const num = subsectionMatch[1];
      const title = subsectionMatch[2];
      const parentNum = num.split('.').slice(0, 2).join('.');
      ensureSection(num, title);

      if (currentChapter) {
        // Ensure parent section
        let parent = currentChapter.sections.find(s => s.number === parentNum);
        if (!parent) {
          parent = {
            id: slugify(`section-${parentNum}`),
            number: parentNum,
            title: '',
            blocks: [],
            subsections: [],
          };
          currentChapter.sections.push(parent);
        }
        currentSection = parent;

        // Don't duplicate
        const existing = parent.subsections.find(s => s.number === num);
        if (!existing) {
          currentSubsection = {
            id: slugify(`${num}-${title}`),
            number: num,
            title,
            blocks: [],
            subsections: [],
          };
          parent.subsections.push(currentSubsection);
        } else {
          currentSubsection = existing;
        }
      }
      continue;
    }

    // Detect chapter headings: "5 Repository" or multi-line like "4 Data and\nResult Visualization"
    if (/^[45]\s+\w/.test(line) && !line.match(/^\d+\.\d+/)) {
      // Check for chapter 5
      const chMatch = line.match(/^(\d+)\s+(.+)/);
      if (chMatch) {
        addParagraph();
        addListItems();
        // Skip intro text for chapter that is part of the chapter heading
        // (like "4 Data and" which continues on next line)
        // We just set the current chapter
        const chNum = chMatch[1];
        ensureSection(chNum + '.0', '');
        currentSection = null;
        currentSubsection = null;
        continue;
      }
    }

    // Skip "Result Visualization" or "Data: The Repository" chapter continuation titles
    if (line === 'Result Visualization' || line === 'Data: The Repository') continue;

    // Detect numbered list items
    if (/^\d+\.\s+[A-Z]/.test(line) && line.length > 5) {
      // Could be a numbered heading within a section (like "1. Automatic Opening")
      if (pendingLines.length > 0) addParagraph();
      // Treat as paragraph with the number
      pendingLines.push(line);
      continue;
    }

    // Detect bullet list items
    if (line.startsWith('•') || line.startsWith('-') || line.startsWith('–')) {
      if (pendingLines.length > 0) addParagraph();
      if (!inList) inList = true;
      listItems.push(line.replace(/^[•\-–]\s*/, ''));
      continue;
    }

    // If we were in a list but this isn't a list item, flush
    if (inList && !line.startsWith('•') && !line.startsWith('-') && !line.startsWith('–')) {
      addListItems();
    }

    // Regular text - accumulate
    pendingLines.push(line);
  }

  // Flush remaining
  addParagraph();
  addListItems();

  // Write combined output
  fs.writeFileSync(chaptersPath, JSON.stringify(chapters, null, 2), 'utf8');

  console.log(`\nFinal chapter structure after PDF merge:`);
  chapters.forEach(ch => {
    console.log(`  Chapter ${ch.number}: ${ch.title} (${ch.sections.length} sections, ${ch.blocks.length} intro blocks)`);
    ch.sections.forEach(sec => {
      console.log(`    ${sec.number} ${sec.title} (${sec.blocks.length} blocks, ${sec.subsections.length} subsections)`);
      sec.subsections.forEach(sub => {
        console.log(`      ${sub.number} ${sub.title} (${sub.blocks.length} blocks)`);
      });
    });
  });
}

main().catch(console.error);
