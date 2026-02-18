import { useState, useEffect, useMemo, type ReactNode } from 'react';
import type { TocHeading } from '@/types';

/* ─── Props ─── */

interface TableOfContentsProps {
  content: string;
}

/* ─── Parse headings from markdown ─── */

function parseHeadings(markdown: string): TocHeading[] {
  const headings: TocHeading[] = [];
  const lines = markdown.split('\n');

  for (const line of lines) {
    const match = /^(#{2,3})\s+(.+)$/.exec(line);
    if (match) {
      const level = match[1]!.length;
      const text = match[2]!.replace(/[`*_~]/g, '').trim();
      const id = text
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-');
      headings.push({ id, text, level });
    }
  }

  return headings;
}

/* ─── Component ─── */

export default function TableOfContents({ content }: TableOfContentsProps): ReactNode {
  const headings = useMemo(() => parseHeadings(content), [content]);
  const [activeId, setActiveId] = useState<string>('');

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        }
      },
      {
        rootMargin: '-80px 0px -60% 0px',
        threshold: 0.1,
      }
    );

    const elements = headings
      .map((h) => document.getElementById(h.id))
      .filter((el): el is HTMLElement => el !== null);

    for (const el of elements) {
      observer.observe(el);
    }

    return () => observer.disconnect();
  }, [headings]);

  if (headings.length === 0) return null;

  const handleClick = (id: string): void => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <nav className="toc" aria-label="Table of contents">
      <h4 className="toc-title">On this page</h4>
      <ul className="toc-list">
        {headings.map((heading) => (
          <li key={heading.id}>
            <button
              type="button"
              onClick={() => handleClick(heading.id)}
              className={`toc-link ${
                heading.level === 3 ? 'toc-link-nested' : ''
              } ${activeId === heading.id ? 'toc-link-active' : ''}`}
            >
              {heading.text}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}
