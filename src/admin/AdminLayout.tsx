import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  BookOpen,
  Upload,
  Users,
  Settings,
  LogOut,
  ExternalLink,
  ShieldCheck,
  Code2,
} from 'lucide-react';
import { useAuthStore } from '@/stores/useAuthStore';
import DarkModeToggle from '@/components/DarkModeToggle';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/admin' },
  { icon: BookOpen, label: 'Courses', path: '/admin/courses' },
  { icon: Upload, label: 'Import ZIP', path: '/admin/import' },
  { icon: Users, label: 'Users', path: '/admin/users' },
  { icon: Settings, label: 'Settings', path: '/admin/settings' },
];

const navVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } },
};

const navItemVariants = {
  hidden: { opacity: 0, x: -12 },
  show: { opacity: 1, x: 0, transition: { duration: 0.2 } },
};

export default function AdminLayout() {
  const { logout, user } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar-header">
          <div className="admin-sidebar-icon">
            <ShieldCheck size={20} />
          </div>
          <div>
            <div className="admin-sidebar-brand">Admin</div>
            <div className="admin-sidebar-label">LMS Control</div>
          </div>
          <div style={{ marginLeft: 'auto' }}>
            <DarkModeToggle />
          </div>
        </div>

        <motion.nav
          className="admin-nav"
          variants={navVariants}
          initial="hidden"
          animate="show"
        >
          <div className="admin-nav-section">Navigation</div>
          {navItems.map((item) => (
            <motion.div key={item.path} variants={navItemVariants}>
              <NavLink
                to={item.path}
                end={item.path === '/admin'}
                className={({ isActive }) =>
                  `admin-nav-item ${isActive ? 'admin-nav-item-active' : ''}`
                }
              >
                <item.icon size={18} />
                {item.label}
              </NavLink>
            </motion.div>
          ))}
        </motion.nav>

        <div className="admin-sidebar-footer">
          <div className="admin-user-card">
            <div className="admin-user-avatar">
              {user?.email?.[0]?.toUpperCase() || 'A'}
            </div>
            <div className="admin-user-info">
              <div className="admin-user-name">{user?.email || 'admin'}</div>
              <div className="admin-user-role">Super Admin</div>
            </div>
          </div>

          <button
            onClick={() => window.open('/', '_blank')}
            className="admin-nav-item"
          >
            <ExternalLink size={16} />
            View Site
          </button>
          <button
            onClick={() => navigate('/admin')}
            className="admin-nav-item"
          >
            <Code2 size={16} />
            Playground
          </button>
          <button
            onClick={handleLogout}
            className="admin-nav-item"
            style={{ color: '#ef4444' }}
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        <div className="admin-main-inner">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
