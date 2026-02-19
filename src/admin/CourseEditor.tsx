import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Save,
  Settings,
  BookOpen,
  Users,
  ChevronRight,
  FileText,
  Plus,
  Trash2,
  Layers,
  Lock,
  Unlock,
} from 'lucide-react';
import { getCourseTree } from '@/utils/contentLoader';

type TabKey = 'metadata' | 'content' | 'access';

interface FormState {
  title: string;
  description: string;
  author: string;
  estimatedHours: string;
  version: string;
  isPublished: boolean;
  inviteOnly: boolean;
}

export default function CourseEditor() {
  const { courseSlug } = useParams<{ courseSlug: string }>();
  const navigate = useNavigate();
  const tree = getCourseTree();
  const course = tree.courses.find((c) => c.slug === courseSlug);
  const [activeTab, setActiveTab] = useState<TabKey>('metadata');
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({});
  const [selectedLesson, setSelectedLesson] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const [form, setForm] = useState<FormState>({
    title: course?.title || '',
    description: course?.description || '',
    author: course?.author || '',
    estimatedHours: String(course?.estimatedHours || ''),
    version: course?.version || '1.0.0',
    isPublished: true,
    inviteOnly: false,
  });

  const updateField = (field: keyof FormState, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setIsDirty(true);
  };

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const handleSave = () => {
    setIsDirty(false);
    showToast('Changes saved successfully');
  };

  const toggleModuleExpand = (slug: string) => {
    setExpandedModules((prev) => ({ ...prev, [slug]: !prev[slug] }));
  };

  const tabs: { key: TabKey; label: string; icon: typeof Settings }[] = [
    { key: 'metadata', label: 'Metadata', icon: Settings },
    { key: 'content', label: 'Content', icon: BookOpen },
    { key: 'access', label: 'Access', icon: Users },
  ];

  // Get selected lesson data
  const lessonData = useMemo(() => {
    if (!selectedLesson || !course) return null;
    for (const mod of course.modules) {
      const lesson = mod.lessons.find((l) => l.slug === selectedLesson);
      if (lesson) return lesson;
    }
    return null;
  }, [selectedLesson, course]);

  if (!course) {
    return (
      <div className="admin-card">
        <div className="admin-empty">
          <div className="admin-empty-icon">
            <BookOpen size={24} />
          </div>
          <p className="admin-empty-title">Course Not Found</p>
          <p className="admin-empty-desc">The course "{courseSlug}" doesn't exist.</p>
          <button
            onClick={() => navigate('/admin/courses')}
            className="admin-btn admin-btn-primary"
            style={{ marginTop: '16px' }}
          >
            Back to Courses
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <button
            onClick={() => navigate('/admin/courses')}
            className="admin-btn admin-btn-ghost admin-btn-icon"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h2 className="admin-page-title" style={{ marginBottom: 0 }}>
              {course.title}
            </h2>
            <p style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', marginTop: '2px' }}>
              {course.slug}
            </p>
          </div>
        </div>
        <button
          onClick={handleSave}
          className="admin-btn admin-btn-primary"
          style={{ position: 'relative' }}
        >
          <Save size={16} />
          Save
          {isDirty && (
            <span style={{
              position: 'absolute', top: '-3px', right: '-3px',
              width: '8px', height: '8px', borderRadius: '50%',
              background: '#ef4444',
            }} />
          )}
        </button>
      </div>

      {/* Tabs */}
      <div className="admin-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`admin-tab ${activeTab === tab.key ? 'admin-tab-active' : ''}`}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <tab.icon size={14} />
              {tab.label}
            </span>
          </button>
        ))}
      </div>

      {/* Metadata Tab */}
      {activeTab === 'metadata' && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div className="admin-card admin-card-padded" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <label className="admin-label">Course Title</label>
                <input
                  className="admin-input"
                  value={form.title}
                  onChange={(e) => updateField('title', e.target.value)}
                />
              </div>
              <div>
                <label className="admin-label">Author</label>
                <input
                  className="admin-input"
                  value={form.author}
                  onChange={(e) => updateField('author', e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="admin-label">Description</label>
              <textarea
                className="admin-textarea"
                value={form.description}
                onChange={(e) => updateField('description', e.target.value)}
                rows={3}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <label className="admin-label">Estimated Hours</label>
                <input
                  className="admin-input"
                  type="number"
                  value={form.estimatedHours}
                  onChange={(e) => updateField('estimatedHours', e.target.value)}
                />
              </div>
              <div>
                <label className="admin-label">Version</label>
                <input
                  className="admin-input"
                  value={form.version}
                  onChange={(e) => updateField('version', e.target.value)}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '28px', paddingTop: '8px' }}>
              <label className="admin-toggle" onClick={() => updateField('isPublished', !form.isPublished)}>
                <div className={`admin-toggle-track ${form.isPublished ? 'admin-toggle-track-active' : ''}`}>
                  <div className="admin-toggle-thumb" />
                </div>
                <span className="admin-toggle-label">Published</span>
              </label>

              <label className="admin-toggle" onClick={() => updateField('inviteOnly', !form.inviteOnly)}>
                <div className={`admin-toggle-track ${form.inviteOnly ? 'admin-toggle-track-active' : ''}`}>
                  <div className="admin-toggle-thumb" />
                </div>
                <span className="admin-toggle-label">Invite Only</span>
              </label>
            </div>
          </div>
        </motion.div>
      )}

      {/* Content Tab */}
      {activeTab === 'content' && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '20px', minHeight: '500px' }}
        >
          {/* Module Tree */}
          <div className="admin-card" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-muted)' }}>
                Content Tree
              </span>
              <button
                onClick={() => showToast('Add Module: Coming soon')}
                className="admin-btn admin-btn-ghost admin-btn-icon"
                title="Add Module"
              >
                <Plus size={14} />
              </button>
            </div>

            <div style={{ flex: 1, overflow: 'auto', padding: '8px' }}>
              {course.modules.map((mod) => {
                const isExpanded = expandedModules[mod.slug] ?? true;
                return (
                  <div key={mod.slug} style={{ marginBottom: '4px' }}>
                    <button
                      onClick={() => toggleModuleExpand(mod.slug)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        width: '100%',
                        padding: '8px 10px',
                        borderRadius: '6px',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: 'var(--text-primary)',
                        fontSize: '13px',
                        fontWeight: 600,
                        textAlign: 'left',
                        transition: 'background 0.1s ease',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-hover)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
                    >
                      <motion.div
                        animate={{ rotate: isExpanded ? 90 : 0 }}
                        transition={{ duration: 0.15 }}
                      >
                        <ChevronRight size={14} />
                      </motion.div>
                      <Layers size={14} style={{ color: 'var(--accent)' }} />
                      <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {mod.title}
                      </span>
                      {mod.isLocked ? (
                        <Lock size={12} style={{ color: 'var(--text-muted)' }} />
                      ) : (
                        <Unlock size={12} style={{ color: 'var(--success)' }} />
                      )}
                    </button>

                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          style={{ overflow: 'hidden' }}
                        >
                          <div style={{ paddingLeft: '20px' }}>
                            {mod.lessons.map((lesson) => (
                              <button
                                key={lesson.slug}
                                onClick={() => setSelectedLesson(lesson.slug)}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '8px',
                                  width: '100%',
                                  padding: '6px 10px',
                                  borderRadius: '6px',
                                  background: selectedLesson === lesson.slug ? 'var(--accent-muted)' : 'none',
                                  border: 'none',
                                  cursor: 'pointer',
                                  color: selectedLesson === lesson.slug ? 'var(--accent)' : 'var(--text-secondary)',
                                  fontSize: '12px',
                                  fontWeight: selectedLesson === lesson.slug ? 600 : 400,
                                  textAlign: 'left',
                                  transition: 'all 0.1s ease',
                                }}
                                onMouseEnter={(e) => {
                                  if (selectedLesson !== lesson.slug)
                                    e.currentTarget.style.background = 'var(--bg-hover)';
                                }}
                                onMouseLeave={(e) => {
                                  if (selectedLesson !== lesson.slug)
                                    e.currentTarget.style.background = 'none';
                                }}
                              >
                                <FileText size={12} />
                                <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                  {lesson.frontmatter.title}
                                </span>
                              </button>
                            ))}
                            <button
                              onClick={() => showToast('Add Lesson: Coming soon')}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                width: '100%',
                                padding: '6px 10px',
                                borderRadius: '6px',
                                background: 'none',
                                border: '1px dashed var(--border-secondary)',
                                cursor: 'pointer',
                                color: 'var(--text-muted)',
                                fontSize: '11px',
                                marginTop: '4px',
                              }}
                            >
                              <Plus size={10} />
                              Add Lesson
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Lesson Editor Panel */}
          <div className="admin-card" style={{ display: 'flex', flexDirection: 'column' }}>
            {lessonData ? (
              <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                <div style={{
                  padding: '14px 20px',
                  borderBottom: '1px solid var(--border-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}>
                  <div>
                    <h4 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {lessonData.frontmatter.title}
                    </h4>
                    <p style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', marginTop: '2px' }}>
                      {lessonData.slug}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      if (confirm(`Delete lesson "${lessonData.frontmatter.title}"?`)) {
                        showToast('Lesson deleted');
                        setSelectedLesson(null);
                      }
                    }}
                    className="admin-btn admin-btn-danger admin-btn-icon"
                    title="Delete Lesson"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                {/* Lesson Metadata */}
                <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                      <label className="admin-label">Duration</label>
                      <input className="admin-input" defaultValue={lessonData.frontmatter.duration} />
                    </div>
                    <div>
                      <label className="admin-label">Order</label>
                      <input className="admin-input" type="number" defaultValue={lessonData.frontmatter.order} />
                    </div>
                  </div>
                  <div>
                    <label className="admin-label">Description</label>
                    <textarea className="admin-textarea" defaultValue={lessonData.frontmatter.description || ''} rows={2} />
                  </div>
                  <div>
                    <label className="admin-label">Tags</label>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {lessonData.frontmatter.tags.map((tag) => (
                        <span key={tag} className="admin-badge admin-badge-info">{tag}</span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="admin-label">Content Preview</label>
                    <div
                      style={{
                        background: 'var(--bg-tertiary)',
                        border: '1px solid var(--border-secondary)',
                        borderRadius: '8px',
                        padding: '12px',
                        maxHeight: '200px',
                        overflow: 'auto',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '12px',
                        color: 'var(--text-secondary)',
                        whiteSpace: 'pre-wrap',
                        lineHeight: 1.6,
                      }}
                    >
                      {lessonData.content.slice(0, 500)}
                      {lessonData.content.length > 500 && '...'}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="admin-empty" style={{ flex: 1, justifyContent: 'center' }}>
                <div className="admin-empty-icon">
                  <FileText size={24} />
                </div>
                <p className="admin-empty-title">Select a Lesson</p>
                <p className="admin-empty-desc">
                  Click a lesson in the content tree to view and edit it.
                </p>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Access Tab */}
      {activeTab === 'access' && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}
        >
          <div className="admin-card admin-card-padded" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)' }}>
              Access Settings
            </h3>
            <div style={{ display: 'flex', gap: '28px' }}>
              <label className="admin-toggle" onClick={() => updateField('isPublished', !form.isPublished)}>
                <div className={`admin-toggle-track ${form.isPublished ? 'admin-toggle-track-active' : ''}`}>
                  <div className="admin-toggle-thumb" />
                </div>
                <span className="admin-toggle-label">Public Access</span>
              </label>
              <label className="admin-toggle" onClick={() => updateField('inviteOnly', !form.inviteOnly)}>
                <div className={`admin-toggle-track ${form.inviteOnly ? 'admin-toggle-track-active' : ''}`}>
                  <div className="admin-toggle-thumb" />
                </div>
                <span className="admin-toggle-label">Invite Only</span>
              </label>
            </div>
          </div>

          {/* Mock Enrolled Users */}
          <div className="admin-card" style={{ overflow: 'hidden' }}>
            <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
                Enrolled Users
              </h3>
              <span className="admin-badge admin-badge-info">0 users</span>
            </div>
            <div className="admin-empty" style={{ padding: '32px' }}>
              <div className="admin-empty-icon">
                <Users size={24} />
              </div>
              <p className="admin-empty-title">No Enrollments</p>
              <p className="admin-empty-desc">
                No users are enrolled in this course yet.
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            className="admin-toast"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
          >
            ✓ {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
