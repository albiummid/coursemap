# CourseMap

A premium, production-ready course learning platform built with React 19, TypeScript, and modern web technologies. Featuring dark-first editorial design, rich markdown rendering, progress tracking, and full-text search.

## Features

- 📚 **Dynamic Content Loading** — Markdown lessons automatically discovered from the filesystem
- 🎨 **Dark-First Editorial Design** — Deep slate backgrounds, warm amber accents, premium typography
- 📊 **Progress Tracking** — Per-lesson, per-module, and per-course completion tracking with localStorage persistence
- 🔍 **Full-Text Search** — Fuse.js-powered search across titles, descriptions, and tags (Cmd/Ctrl+K)
- 📱 **Responsive Design** — Slide-in drawer sidebar on mobile, fixed sidebar on desktop
- 🗂️ **Auto-Generated Navigation** — Sidebar and table of contents built automatically from content
- ✨ **Animated Transitions** — Framer Motion page transitions and Sidebar accordion animations
- ⌨️ **Keyboard Accessible** — Arrow keys for lesson navigation, Cmd/Ctrl+K for search, ESC to close
- 🌙 **Dark/Light Toggle** — Theme persisted to localStorage
- 📋 **Copy-to-Clipboard** — One-click code block copying
- 🎬 **YouTube Embeds** — Optional video embed support via frontmatter

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Build | Vite 6 + React 19 + TypeScript (strict) |
| Styling | TailwindCSS v4 + @tailwindcss/typography |
| State | Zustand with persist middleware |
| Routing | React Router v7 (data router) |
| Markdown | react-markdown + remark-gfm + rehype-highlight + gray-matter |
| Search | Fuse.js |
| Animation | Framer Motion + CSS transitions |
| Icons | lucide-react |
| Fonts | Geist (headings) + JetBrains Mono (code) |

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Project Structure

```
src/
├── content/                    # Markdown course content
│   └── react/
│       ├── module-1/
│       │   ├── lesson-1.md     # Introduction to React Hooks
│       │   └── lesson-2.md     # Managing State with useState
│       └── module-2/
│           ├── lesson-1.md     # Side Effects with useEffect
│           └── lesson-2.md     # Building Custom Hooks
├── components/
│   ├── Sidebar.tsx             # Collapsible, animated, progress-aware
│   ├── LessonPage.tsx          # Full lesson view with metadata
│   ├── MarkdownRenderer.tsx    # Styled, feature-rich renderer
│   ├── TableOfContents.tsx     # Auto-generated from h2/h3 headings
│   ├── SearchModal.tsx         # Fuse.js-powered full-text search
│   ├── ProgressBar.tsx         # Scroll progress indicator
│   ├── DarkModeToggle.tsx      # Dark/light theme toggle
│   └── NotFound.tsx            # 404 page
├── stores/
│   ├── useProgressStore.ts     # Lesson completion + progress
│   └── useThemeStore.ts        # Dark/light mode
├── utils/
│   └── contentLoader.ts        # import.meta.glob + tree builder
├── types/
│   └── index.ts                # All shared TypeScript types
├── App.tsx                     # Router + layout shell
├── main.tsx                    # Entry point
└── index.css                   # Complete design system
```

## UI Layout

```
┌──────────────────────────────────────────────────────────┐
│ ▓▓▓▓▓░░░░░░░░░░░░░░░░░░░░░ Scroll Progress Bar         │
├────────────┬─────────────────────────────┬───────────────┤
│            │                             │               │
│  SIDEBAR   │      LESSON CONTENT         │     TOC       │
│            │                             │               │
│ ┌────────┐ │  ┌─────────────────────┐    │  On this page │
│ │CourseMap│ │  │ Lesson Title        │    │  ─ Heading 1  │
│ │  🔍    │ │  │ tags · 12 min       │    │  ─ Heading 2  │
│ └────────┘ │  └─────────────────────┘    │  ─ Heading 3  │
│            │                             │    ─ Sub      │
│ ▸ Module 1 │  ┌─────────────────────┐    │               │
│   ○ Lesson │  │   YouTube Embed     │    │               │
│   ● Active │  │                     │    │               │
│   ✓ Done   │  └─────────────────────┘    │               │
│            │                             │               │
│ ▸ Module 2 │  ## Markdown Content        │               │
│   ○ Lesson │                             │               │
│   ○ Lesson │  ```code blocks```          │               │
│            │                             │               │
│ ━━━ 60% ━━│  [Mark as Complete ✓]       │               │
│            │                             │               │
│            │  ← Previous    Next →       │               │
│            │  ⌨ ← → ⌘K                  │               │
├────────────┴─────────────────────────────┴───────────────┤
│  300px         flexible                    220px         │
└──────────────────────────────────────────────────────────┘
```

## Adding Content

1. Create a new `.md` file in `src/content/<course>/<module>/`
2. Add frontmatter:

```yaml
---
title: "Your Lesson Title"
duration: "10 min"
order: 1
tags: ["topic", "level"]
description: "Brief description"
videoUrl: "https://youtube.com/embed/..."  # optional
---
```

3. Write your lesson in Markdown
4. The lesson automatically appears in the sidebar and search

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Cmd/Ctrl + K` | Open search |
| `←` | Previous lesson |
| `→` | Next lesson |
| `ESC` | Close modal/drawer |

## License

MIT
