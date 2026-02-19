import { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  BookOpen,
  Layers,
  FileText,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Plus,
  Activity,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getCourseTree } from '@/utils/contentLoader';
import { useImportStore } from '@/stores/useImportStore';
import { useAuthStore } from '@/stores/useAuthStore';

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

export default function Dashboard() {
  const tree = getCourseTree();
  const { importHistory } = useImportStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const totalCourses = tree.courses.length;
  const totalModules = tree.courses.reduce((acc, c) => acc + c.modules.length, 0);
  const totalLessons = tree.courses.reduce(
    (acc, c) => acc + c.modules.reduce((mAcc, m) => mAcc + m.lessons.length, 0),
    0
  );

  // Check for broken files (missing required frontmatter)
  const brokenFiles = useMemo(() => {
    const broken: string[] = [];
    for (const course of tree.courses) {
      for (const mod of course.modules) {
        for (const lesson of mod.lessons) {
          if (!lesson.frontmatter.title || !lesson.frontmatter.slug) {
            broken.push(`${course.slug}/${mod.slug}/${lesson.slug}`);
          }
        }
      }
    }
    return broken;
  }, [tree]);

  const stats = [
    {
      label: 'Courses',
      value: totalCourses,
      icon: BookOpen,
      bg: 'var(--accent-muted)',
      color: 'var(--accent)',
    },
    {
      label: 'Modules',
      value: totalModules,
      icon: Layers,
      bg: '#3b82f615',
      color: '#3b82f6',
    },
    {
      label: 'Lessons',
      value: totalLessons,
      icon: FileText,
      bg: '#8b5cf615',
      color: '#8b5cf6',
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Header */}
      <div className="admin-page-header">
        <h2 className="admin-page-title">
          {getGreeting()}, {user?.email?.split('@')[0] || 'Admin'}
        </h2>
        <p className="admin-page-desc">
          Here's an overview of your course platform.
        </p>
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            className="admin-stat-card"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08, duration: 0.3 }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div
                className="admin-stat-icon"
                style={{ background: stat.bg, color: stat.color }}
              >
                <stat.icon size={20} />
              </div>
              <span className="admin-stat-value">{stat.value}</span>
            </div>
            <p className="admin-stat-label">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Content Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {/* Quick Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 className="admin-page-title" style={{ fontSize: '16px', marginBottom: 0 }}>
            Quick Actions
          </h3>

          <motion.button
            onClick={() => navigate('/admin/import')}
            className="admin-card admin-card-padded"
            style={{ display: 'flex', alignItems: 'center', gap: '14px', cursor: 'pointer', textAlign: 'left', border: '1px solid var(--border-secondary)' }}
            whileHover={{ y: -2 }}
            transition={{ duration: 0.15 }}
          >
            <div
              className="admin-stat-icon"
              style={{ background: 'var(--accent-muted)', color: 'var(--accent)' }}
            >
              <Plus size={20} />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontWeight: 600, fontSize: '14px', color: 'var(--text-primary)' }}>Import Course</p>
              <p style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>Upload a ZIP file with content</p>
            </div>
            <ArrowRight size={16} style={{ color: 'var(--text-muted)' }} />
          </motion.button>

          <motion.button
            onClick={() => navigate('/admin/courses/new')}
            className="admin-card admin-card-padded"
            style={{ display: 'flex', alignItems: 'center', gap: '14px', cursor: 'pointer', textAlign: 'left', border: '1px solid var(--border-secondary)' }}
            whileHover={{ y: -2 }}
            transition={{ duration: 0.15 }}
          >
            <div
              className="admin-stat-icon"
              style={{ background: '#3b82f615', color: '#3b82f6' }}
            >
              <BookOpen size={20} />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontWeight: 600, fontSize: '14px', color: 'var(--text-primary)' }}>Create Course</p>
              <p style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>Build a new course from scratch</p>
            </div>
            <ArrowRight size={16} style={{ color: 'var(--text-muted)' }} />
          </motion.button>

          {/* System Health */}
          <div style={{ marginTop: '4px' }}>
            <h3 className="admin-page-title" style={{ fontSize: '16px', marginBottom: '12px' }}>
              System Health
            </h3>
            <div className="admin-card admin-card-padded">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Activity size={14} style={{ color: 'var(--success)' }} />
                    <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Content Tree</span>
                  </div>
                  <span className="admin-badge admin-badge-success">Loaded</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FileText size={14} style={{ color: brokenFiles.length > 0 ? '#f59e0b' : 'var(--success)' }} />
                    <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Broken Files</span>
                  </div>
                  <span className={`admin-badge ${brokenFiles.length > 0 ? 'admin-badge-warning' : 'admin-badge-success'}`}>
                    {brokenFiles.length}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Imports */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h3 className="admin-page-title" style={{ fontSize: '16px', marginBottom: 0 }}>
              Recent Imports
            </h3>
            <button
              onClick={() => navigate('/admin/import')}
              className="admin-btn admin-btn-ghost"
              style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}
            >
              View All
            </button>
          </div>

          <div className="admin-card" style={{ overflow: 'hidden' }}>
            {importHistory.length === 0 ? (
              <div className="admin-empty">
                <div className="admin-empty-icon">
                  <Clock size={24} />
                </div>
                <p className="admin-empty-title">No Imports Yet</p>
                <p className="admin-empty-desc">
                  Import your first course ZIP to see activity here.
                </p>
              </div>
            ) : (
              <div>
                {importHistory.slice(0, 5).map((item) => (
                  <div
                    key={item.id}
                    style={{
                      padding: '12px 16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      borderBottom: '1px solid var(--border-secondary)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      {item.status === 'success' ? (
                        <CheckCircle2 size={16} style={{ color: 'var(--success)' }} />
                      ) : (
                        <AlertTriangle size={16} style={{ color: '#f59e0b' }} />
                      )}
                      <div>
                        <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                          {item.courseTitle}
                        </p>
                        <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                          {new Date(item.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`admin-badge ${
                        item.status === 'success' ? 'admin-badge-success' : 'admin-badge-warning'
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
