import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  BookOpen,
  Search,
  Plus,
  Eye,
  Edit3,
  Trash2,
  Copy,
  LayoutGrid,
  List,
  Layers,
  FileText,
  ChevronDown,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getCourseTree } from '@/utils/contentLoader';
import type { Course } from '@/types';

type ViewMode = 'grid' | 'list';
type StatusFilter = 'all' | 'published' | 'draft' | 'invite-only';

export default function CourseManager() {
  const tree = getCourseTree();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [filterOpen, setFilterOpen] = useState(false);

  const filteredCourses = useMemo(() => {
    let courses = tree.courses;

    // Search filter
    if (search.trim()) {
      const q = search.toLowerCase();
      courses = courses.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          c.slug.toLowerCase().includes(q)
      );
    }

    //  Status filter
    if (statusFilter !== 'all') {
      courses = courses.filter((c) => {
        if (statusFilter === 'published') return c.isPublished && !c.inviteOnly;
        if (statusFilter === 'draft') return !c.isPublished;
        if (statusFilter === 'invite-only') return c.inviteOnly;
        return true;
      });
    }

    return courses;
  }, [tree.courses, search, statusFilter]);

  const getModuleCount = (course: Course) => course.modules.length;
  const getLessonCount = (course: Course) =>
    course.modules.reduce((a, m) => a + m.lessons.length, 0);

  const handleDelete = (course: Course) => {
    if (window.confirm(`Are you sure you want to delete "${course.title}"? This cannot be undone.`)) {
      // In a real app this would delete from a store/API
      console.log('Deleting course:', course.slug);
    }
  };

  const handleDuplicate = (course: Course) => {
    if (window.confirm(`Create a copy of "${course.title}"?`)) {
      console.log('Duplicating course:', course.slug);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div className="admin-page-header" style={{ marginBottom: 0 }}>
          <h2 className="admin-page-title">Courses</h2>
          <p className="admin-page-desc">Manage your course catalog</p>
        </div>
        <button
          onClick={() => navigate('/admin/courses/new')}
          className="admin-btn admin-btn-primary"
        >
          <Plus size={16} />
          New Course
        </button>
      </div>

      {/* Toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div className="admin-input-icon" style={{ flex: 1 }}>
          <Search size={16} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="admin-input"
            placeholder="Search courses by title or slug..."
          />
        </div>

        {/* Status Filter */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setFilterOpen(!filterOpen)}
            className="admin-btn admin-btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            {statusFilter === 'all' ? 'All Status' : statusFilter}
            <ChevronDown size={14} />
          </button>
          {filterOpen && (
            <div
              style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                marginTop: '4px',
                minWidth: '160px',
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border-primary)',
                borderRadius: '10px',
                padding: '6px',
                zIndex: 50,
                boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
              }}
            >
              {(['all', 'published', 'draft', 'invite-only'] as StatusFilter[]).map(
                (option) => (
                  <button
                    key={option}
                    onClick={() => {
                      setStatusFilter(option);
                      setFilterOpen(false);
                    }}
                    className="admin-nav-item"
                    style={{
                      fontSize: '13px',
                      textTransform: 'capitalize',
                      fontWeight: statusFilter === option ? 600 : 400,
                      color:
                        statusFilter === option
                          ? 'var(--accent)'
                          : 'var(--text-secondary)',
                    }}
                  >
                    {option === 'all' ? 'All Status' : option}
                  </button>
                )
              )}
            </div>
          )}
        </div>

        {/* View Toggle */}
        <div style={{ display: 'flex', gap: '2px', padding: '3px', background: 'var(--bg-tertiary)', borderRadius: '8px', border: '1px solid var(--border-secondary)' }}>
          <button
            onClick={() => setViewMode('list')}
            className={`admin-btn admin-btn-icon ${viewMode === 'list' ? '' : 'admin-btn-ghost'}`}
            style={{
              background: viewMode === 'list' ? 'var(--bg-secondary)' : 'transparent',
              borderColor: 'transparent',
            }}
          >
            <List size={16} />
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={`admin-btn admin-btn-icon ${viewMode === 'grid' ? '' : 'admin-btn-ghost'}`}
            style={{
              background: viewMode === 'grid' ? 'var(--bg-secondary)' : 'transparent',
              borderColor: 'transparent',
            }}
          >
            <LayoutGrid size={16} />
          </button>
        </div>
      </div>

      {/* No Results */}
      {filteredCourses.length === 0 && (
        <div className="admin-card">
          <div className="admin-empty">
            <div className="admin-empty-icon">
              <BookOpen size={24} />
            </div>
            <p className="admin-empty-title">
              {search.trim() ? 'No Matching Courses' : 'No Courses Yet'}
            </p>
            <p className="admin-empty-desc">
              {search.trim()
                ? `No courses match "${search}"`
                : 'Import a ZIP or create a new course to get started.'}
            </p>
          </div>
        </div>
      )}

      {/* List View */}
      {filteredCourses.length > 0 && viewMode === 'list' && (
        <div className="admin-card" style={{ overflow: 'hidden' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Course</th>
                <th style={{ width: '100px' }}>Modules</th>
                <th style={{ width: '100px' }}>Lessons</th>
                <th style={{ width: '100px' }}>Status</th>
                <th style={{ width: '160px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCourses.map((course, i) => (
                <motion.tr
                  key={course.slug}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                >
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '8px',
                          background: 'var(--accent-muted)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'var(--accent)',
                          flexShrink: 0
                        }}
                      >
                        <BookOpen size={16} />
                      </div>
                      <div>
                        <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                          {course.title}
                        </p>
                        <p style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                          {course.slug}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Layers size={12} />
                      {getModuleCount(course)}
                    </span>
                  </td>
                  <td>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <FileText size={12} />
                      {getLessonCount(course)}
                    </span>
                  </td>
                  <td>
                    <span className="admin-badge admin-badge-success">Published</span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '4px', justifyContent: 'flex-end' }}>
                      <button
                        onClick={() =>
                          window.open(
                            `/courses/${course.slug}/${course.modules[0]?.slug}/${course.modules[0]?.lessons[0]?.slug}`,
                            '_blank'
                          )
                        }
                        className="admin-btn admin-btn-ghost admin-btn-icon"
                        title="Preview"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => navigate(`/admin/courses/${course.slug}`)}
                        className="admin-btn admin-btn-ghost admin-btn-icon"
                        title="Edit"
                      >
                        <Edit3 size={16} />
                      </button>
                      <button
                        onClick={() => handleDuplicate(course)}
                        className="admin-btn admin-btn-ghost admin-btn-icon"
                        title="Duplicate"
                      >
                        <Copy size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(course)}
                        className="admin-btn admin-btn-danger admin-btn-icon"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Grid View */}
      {filteredCourses.length > 0 && viewMode === 'grid' && (
        <div className="admin-course-grid">
          {filteredCourses.map((course, i) => (
            <motion.div
              key={course.slug}
              className="admin-course-card"
              onClick={() => navigate(`/admin/courses/${course.slug}`)}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06, duration: 0.25 }}
            >
              <div className="admin-course-card-cover">
                <BookOpen size={36} />
              </div>
              <div className="admin-course-card-body">
                <p className="admin-course-card-title">{course.title}</p>
                <p className="admin-course-card-slug">{course.slug}</p>
                <div className="admin-course-card-stats">
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Layers size={12} />
                    {getModuleCount(course)} modules
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <FileText size={12} />
                    {getLessonCount(course)} lessons
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
