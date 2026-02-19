import { useMemo, useCallback, useEffect, type ReactNode } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Clock,
  Tag,
  CheckCircle2,
  Circle,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  ArrowRight,
} from 'lucide-react';
import { getCourseTree, getLessonNavigation, getLessonByParams } from '@/utils/contentLoader';
import { useProgressStore } from '@/stores/useProgressStore';
import MarkdownRenderer from '@/components/MarkdownRenderer';
import TableOfContents from '@/components/TableOfContents';
import ProgressBar from '@/components/ProgressBar';
import type { LessonFrontmatter } from '@/types';


/* ─── Component ─── */

export default function LessonPage(): ReactNode {
  const { course, module: mod, lesson: lessonSlug } = useParams<{
    course: string;
    module: string;
    lesson: string;
  }>();
  const navigate = useNavigate();
  const { isComplete, toggleComplete } = useProgressStore();
  const tree = useMemo(() => getCourseTree(), []);

  const currentPath = `/courses/${course}/${mod}/${lessonSlug}`;

  // Find lesson in tree using parameters
  const lessonData = useMemo(() => {
    return getLessonByParams(tree, course, mod, lessonSlug);
  }, [tree, course, mod, lessonSlug]);

  // Use already-parsed frontmatter from content loader
  const { frontmatter, content } = useMemo(() => {
    if (!lessonData) {
      return {
        frontmatter: {
          title: 'Not Found',
          slug: 'not-found',
          order: 0,
          duration: '',
          tags: [],
          description: '',
          isPublished: false,
        } satisfies LessonFrontmatter,
        content: '',
      };
    }
    return {
      frontmatter: lessonData.frontmatter,
      content: lessonData.content,
    };
  }, [lessonData]);


  // Navigation
  const { prev, next } = useMemo(
    () => getLessonNavigation(tree, currentPath),
    [tree, currentPath]
  );

  const completed = isComplete(currentPath);

  const handleToggleComplete = useCallback((): void => {
    toggleComplete(currentPath);
  }, [toggleComplete, currentPath]);

  // Set last visited & auto-open playground if configured
  useEffect(() => {
    useProgressStore.setState({ lastVisited: currentPath });
    
    if (frontmatter.playgroundLang) {
      import('@/stores/usePlaygroundStore').then(m => {
        m.usePlaygroundStore.getState().open({
          lang: frontmatter.playgroundLang,
          code: frontmatter.playgroundCode
        });
      });
    }
  }, [currentPath, frontmatter.playgroundLang, frontmatter.playgroundCode]);

  // Keyboard shortcuts for prev/next
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent): void => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === 'ArrowLeft' && prev) {
        navigate(prev.path);
      } else if (e.key === 'ArrowRight' && next) {
        navigate(next.path);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [prev, next, navigate]);

  // Scroll to top on lesson change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPath]);

  if (!lessonData) {
    return (
      <div className="lesson-not-found">
        <h2>Lesson not found</h2>
        <p>The lesson at this path does not exist.</p>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => void navigate('/')}
        >
          Go Home
        </button>
      </div>
    );
  }

  return (
    <>
      <ProgressBar />
      <motion.article
        className="lesson-page"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -12 }}
        transition={{ duration: 0.25 }}
      >
        <div className="lesson-content-area">
          {/* Main content */}
          <div className="lesson-main">
            {/* Header */}
            <header className="lesson-header">
              <h1 className="lesson-title">{frontmatter.title}</h1>
              <p className="lesson-description">{frontmatter.description}</p>
              <div className="lesson-meta">
                <span className="lesson-duration-badge">
                  <Clock size={14} />
                  {frontmatter.duration}
                </span>
                <div className="lesson-tags">
                  {frontmatter.tags.map((tag) => (
                    <span key={tag} className="lesson-tag">
                      <Tag size={12} />
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </header>

            {/* Video embed */}
            {frontmatter.videoUrl && (
              <div className="lesson-video">
                <iframe
                  src={frontmatter.videoUrl}
                  title={frontmatter.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            )}

            {/* Markdown body */}
            <MarkdownRenderer content={content} />

            {/* Mark complete button */}
            <div className="lesson-complete-section">
              <motion.button
                type="button"
                className={`btn-mark-complete ${completed ? 'btn-completed' : ''}`}
                onClick={handleToggleComplete}
                whileTap={{ scale: 0.96 }}
              >
                {completed ? (
                  <>
                    <CheckCircle2 size={18} />
                    Completed
                  </>
                ) : (
                  <>
                    <Circle size={18} />
                    Mark as Complete
                  </>
                )}
              </motion.button>
            </div>

            {/* Prev / Next Navigation */}
            <nav className="lesson-nav" aria-label="Lesson navigation">
              {prev ? (
                <button
                  type="button"
                  className="lesson-nav-btn lesson-nav-prev"
                  onClick={() => void navigate(prev.path)}
                >
                  <ChevronLeft size={16} />
                  <div className="lesson-nav-text">
                    <span className="lesson-nav-label">
                      <ArrowLeft size={12} /> Previous
                    </span>
                    <span className="lesson-nav-title">
                      {prev.frontmatter.title}
                    </span>
                  </div>
                </button>
              ) : (
                <div />
              )}
              {next ? (
                <button
                  type="button"
                  className="lesson-nav-btn lesson-nav-next"
                  onClick={() => void navigate(next.path)}
                >
                  <div className="lesson-nav-text">
                    <span className="lesson-nav-label">
                      Next <ArrowRight size={12} />
                    </span>
                    <span className="lesson-nav-title">
                      {next.frontmatter.title}
                    </span>
                  </div>
                  <ChevronRight size={16} />
                </button>
              ) : (
                <div />
              )}
            </nav>

            {/* Keyboard shortcut hints */}
            <div className="keyboard-hints">
              <span><kbd>←</kbd> Previous lesson</span>
              <span><kbd>→</kbd> Next lesson</span>
              <span><kbd>⌘K</kbd> Search</span>
            </div>
          </div>

          {/* Table of Contents (desktop sidebar) */}
          <aside className="lesson-toc-sidebar">
            <TableOfContents content={content} />
          </aside>
        </div>
      </motion.article>
    </>
  );
}
