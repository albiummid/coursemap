import { useState, useMemo, useCallback, type ReactNode } from 'react';
import { NavLink, useLocation, useParams, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ChevronDown,
  CheckCircle2,
  BookOpen,
  Menu,
  X,
  Search,
  ChevronsUpDown,
  Book,
} from 'lucide-react';
import { getCourseTree } from '@/utils/contentLoader';
import { useProgressStore } from '@/stores/useProgressStore';
import DarkModeToggle from '@/components/DarkModeToggle';
import type { Module, Course } from '@/types';

/* ─── Props ─── */

interface SidebarProps {
  onSearchOpen: () => void;
}

/* ─── Module Accordion ─── */

interface ModuleAccordionProps {
  module: Module;
  isExpanded: boolean;
  onToggle: () => void;
}

function ModuleAccordion({
  module,
  isExpanded,
  onToggle,
}: ModuleAccordionProps): ReactNode {
  const { isComplete, getModuleProgress } = useProgressStore();
  const lessonIds = module.lessons.map((l) => l.path);
  const progress = getModuleProgress(lessonIds);
  const completedCount = lessonIds.filter((id) => isComplete(id)).length;

  return (
    <div className="module-accordion">
      <button
        type="button"
        className="module-header"
        onClick={onToggle}
        aria-expanded={isExpanded}
      >
        <div className="module-header-left">
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown size={16} />
          </motion.div>
          <span className="module-title">{module.title}</span>
        </div>
        <span className="module-count">
          {completedCount}/{module.lessons.length}
        </span>
      </button>

      {/* Module Progress Bar */}
      <div className="module-progress-track">
        <motion.div
          className="module-progress-fill"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        />
      </div>

      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.ul
            className="module-lessons"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
          >
            {module.lessons.map((lesson) => {
              const completed = isComplete(lesson.path);
              return (
                <li key={lesson.slug}>
                  <NavLink
                    to={lesson.path}
                    className={({ isActive }) =>
                      `lesson-link ${isActive ? 'lesson-link-active' : ''} ${
                        completed ? 'lesson-link-completed' : ''
                      }`
                    }
                  >
                    {completed ? (
                      <CheckCircle2 size={14} className="lesson-check" />
                    ) : (
                      <div className="lesson-dot" />
                    )}
                    <span className="lesson-link-title">
                      {lesson.frontmatter.title}
                    </span>
                    <span className="lesson-duration">
                      {lesson.frontmatter.duration}
                    </span>
                  </NavLink>
                </li>
              );
            })}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Course Section ─── */

interface CourseSectionProps {
  course: Course;
}

function CourseSection({ course }: CourseSectionProps): ReactNode {
  const location = useLocation();
  const { getCourseProgress, isComplete } = useProgressStore();

  const allLessonIds = useMemo(
    () =>
      course.modules.flatMap((m) =>
        m.lessons.map((l) => `${course.slug}/${m.slug}/${l.slug}`)
      ),
    [course]
  );
  const courseProgress = getCourseProgress(allLessonIds);
  const completedCount = allLessonIds.filter((id) => isComplete(id)).length;

  // Auto-expand if current path is within this module
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    for (const mod of course.modules) {
      const isActiveModule = mod.lessons.some(
        (l) => l.path === location.pathname
      );
      initial[mod.slug] = isActiveModule || mod === course.modules[0];
    }
    return initial;
  });

  const toggleModule = useCallback((slug: string): void => {
    setExpandedModules((prev) => ({ ...prev, [slug]: !prev[slug] }));
  }, []);

  return (
    <div className="course-section">
      <div className="course-header">
        <BookOpen size={18} className="course-icon" />
        <div className="course-info">
          <h3 className="course-title">{course.title}</h3>
          <div className="course-progress-info">
            <span className="course-progress-text">
              {completedCount}/{allLessonIds.length} lessons · {courseProgress}%
            </span>
          </div>
        </div>
      </div>

      {/* Overall Course Progress */}
      <div className="course-progress-track">
        <motion.div
          className="course-progress-fill"
          initial={{ width: 0 }}
          animate={{ width: `${courseProgress}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>

      <div className="course-modules">
        {course.modules.map((mod) => (
          <ModuleAccordion
            key={mod.slug}
            module={mod}
            isExpanded={expandedModules[mod.slug] ?? false}
            onToggle={() => toggleModule(mod.slug)}
          />
        ))}
      </div>
    </div>
  );
}

/* ─── Main Sidebar ─── */

export default function Sidebar({ onSearchOpen }: SidebarProps): ReactNode {
  const [mobileOpen, setMobileOpen] = useState<boolean>(false);
  const [courseDropdownOpen, setCourseDropdownOpen] = useState<boolean>(false);
  const navigate = useNavigate();
  const tree = useMemo(() => getCourseTree(), []);

  const closeMobile = useCallback((): void => {
    setMobileOpen(false);
  }, []);

  // Determine active course from URL
  const { course: courseSlug } = useParams<{ course: string }>();
  const activeCourse = useMemo(() => {
    return tree.courses.find((c) => c.slug === courseSlug);
  }, [tree.courses, courseSlug]);

  const handleCourseSwitch = (slug: string) => {
    const course = tree.courses.find(c => c.slug === slug);
    if (course && course.modules[0]?.lessons[0]) {
      navigate(course.modules[0].lessons[0].path);
      setCourseDropdownOpen(false);
    }
  };

  // Close sidebar on navigation (mobile)
  const location = useLocation();
  useMemo(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  return (
    <>
      {/* Mobile hamburger */}
      <button
        type="button"
        className="sidebar-mobile-toggle"
        onClick={() => setMobileOpen(true)}
        aria-label="Open navigation"
      >
        <Menu size={22} />
      </button>

      {/* Backdrop */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="sidebar-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeMobile}
          />
        )}
      </AnimatePresence>

      {/* Sidebar panel */}
      <aside
        className={`sidebar ${mobileOpen ? 'sidebar-open' : ''}`}
        role="navigation"
        aria-label="Course navigation"
      >
        {/* Header */}
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <BookOpen size={22} className="sidebar-brand-icon" />
            <span className="sidebar-brand-text">CourseMap</span>
          </div>
          <div className="sidebar-header-actions">
            <DarkModeToggle />
            <button
              type="button"
              className="sidebar-close-btn"
              onClick={closeMobile}
              aria-label="Close navigation"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Search trigger */}
        <button
          type="button"
          className="sidebar-search"
          onClick={() => {
            onSearchOpen();
            closeMobile();
          }}
        >
          <Search size={16} />
          <span>Search lessons...</span>
          <kbd className="sidebar-kbd">⌘K</kbd>
        </button>

        {/* Course Selector Dropdown */}
        <div className="course-selector-container">
          <button
            type="button"
            className={`course-selector-trigger ${courseDropdownOpen ? 'active' : ''}`}
            onClick={() => setCourseDropdownOpen(!courseDropdownOpen)}
          >
            <Book size={16} className="text-amber-500" />
            <span className="course-selector-label">
              {activeCourse?.title || 'Select Course'}
            </span>
            <ChevronsUpDown size={14} className="ml-auto text-muted" />
          </button>

          <AnimatePresence>
            {courseDropdownOpen && (
              <motion.div
                className="course-selector-dropdown"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {tree.courses.map((c) => (
                  <button
                    key={c.slug}
                    type="button"
                    className={`course-selector-item ${c.slug === courseSlug ? 'active' : ''}`}
                    onClick={() => handleCourseSwitch(c.slug)}
                  >
                    <div className="flex flex-col items-start">
                      <span className="course-item-title">{c.title}</span>
                      <span className="course-item-meta">{c.language} · {c.totalModules} modules</span>
                    </div>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Course tree */}
        <div className="sidebar-content">
          {activeCourse ? (
            <CourseSection course={activeCourse} />
          ) : (
            <div className="sidebar-empty">
              <p>Select a course to see content</p>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
