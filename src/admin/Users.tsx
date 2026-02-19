import { motion } from 'framer-motion';
import {
  Users as UsersIcon,
  Shield,
  Mail,
  UserPlus,
  BarChart3,
  Clock,
} from 'lucide-react';

const upcomingFeatures = [
  {
    icon: UserPlus,
    title: 'User Registration',
    desc: 'Allow learners to sign up and create accounts',
  },
  {
    icon: Shield,
    title: 'Role Management',
    desc: 'Assign admin, instructor, and student roles',
  },
  {
    icon: Mail,
    title: 'Bulk Invitations',
    desc: 'Send invite links to cohorts via email',
  },
  {
    icon: BarChart3,
    title: 'Progress Analytics',
    desc: 'Track completion rates and engagement',
  },
];

export default function Users() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div className="admin-page-header">
        <h2 className="admin-page-title">Users</h2>
        <p className="admin-page-desc">Manage learners and enrollment</p>
      </div>

      {/* Empty State */}
      <div className="admin-card">
        <div className="admin-empty" style={{ padding: '48px 24px' }}>
          <div className="admin-empty-icon">
            <UsersIcon size={24} />
          </div>
          <p className="admin-empty-title">No Users Yet</p>
          <p className="admin-empty-desc">
            User management is not available in the current version. Features below are planned.
          </p>
        </div>
      </div>

      {/* Upcoming Features */}
      <div>
        <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Clock size={14} style={{ color: 'var(--text-muted)' }} />
          Planned Features
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
          {upcomingFeatures.map((feature, i) => (
            <motion.div
              key={feature.title}
              className="admin-card admin-card-padded"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}
            >
              <div
                className="admin-stat-icon"
                style={{ background: 'var(--bg-tertiary)', color: 'var(--text-muted)', flexShrink: 0 }}
              >
                <feature.icon size={18} />
              </div>
              <div>
                <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '2px' }}>
                  {feature.title}
                </p>
                <p style={{ fontSize: '12px', color: 'var(--text-tertiary)', lineHeight: 1.4 }}>
                  {feature.desc}
                </p>
                <span className="admin-badge admin-badge-draft" style={{ marginTop: '8px' }}>
                  Coming Soon
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
