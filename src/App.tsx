import { useState, useCallback, useEffect, type ReactNode } from 'react';
import {
  createBrowserRouter,
  RouterProvider,
  Outlet,
  Navigate,
  useLocation,
} from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

// Components
import Sidebar from '@/components/Sidebar';
import SearchModal from '@/components/SearchModal';
import LessonPage from '@/components/LessonPage';
import LandingPage from '@/components/LandingPage';
import NotFound from '@/components/NotFound';
import AdminGuard from '@/components/AdminGuard';

// Playground
import PlaygroundModal from '@/playground/PlaygroundModal';
import PlaygroundFloat from '@/playground/PlaygroundFloat';

// Admin Pages
import AdminLayout from '@/admin/AdminLayout';
import Dashboard from '@/admin/Dashboard';
import CourseManager from '@/admin/CourseManager';
import CourseEditor from '@/admin/CourseEditor';
import ZIPImporter from '@/admin/ZIPImporter';
import Users from '@/admin/Users';
import Settings from '@/admin/Settings';
import LoginPage from '@/admin/LoginPage';

// Utils
import { getCourseTree } from '@/utils/contentLoader';

/* ─── Layout ─── */

function Layout(): ReactNode {
  const [searchOpen, setSearchOpen] = useState<boolean>(false);
  const location = useLocation();
  const isLanding = location.pathname === '/';

  const openSearch = useCallback((): void => setSearchOpen(true), []);
  const closeSearch = useCallback((): void => setSearchOpen(false), []);

  // Global Cmd/Ctrl+K listener
  useEffect(() => {
    const handler = (e: KeyboardEvent): void => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return (
    <div className="app-layout">
      {!isLanding && <Sidebar onSearchOpen={openSearch} />}
      <main className={`app-main ${isLanding ? 'app-main-landing' : ''}`}>
        <AnimatePresence mode="wait">
          <Outlet />
        </AnimatePresence>
      </main>
      <SearchModal isOpen={searchOpen} onClose={closeSearch} />
      
      {/* Playground System */}
      <PlaygroundFloat />
      <PlaygroundModal />
    </div>
  );
}

/* ─── Home Redirect ─── */

function HomeRedirect(): ReactNode {
  const tree = getCourseTree();
  const firstLesson = tree.courses[0]?.modules[0]?.lessons[0];
  if (firstLesson) {
    return <Navigate to={firstLesson.path} replace />;
  }
  return (
    <div className="home-empty">
      <h2>No courses available</h2>
      <p>Add markdown files to src/content/ to get started.</p>
    </div>
  );
}

/* ─── Router ─── */

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    errorElement: <NotFound />,
    children: [
      {
        index: true,
        element: <LandingPage />,
      },
      {
        path: 'courses/:course/:module/:lesson',
        element: <LessonPage />,
      },
      {
        path: '*',
        element: <NotFound />,
      },
    ],
  },
  {
    path: '/admin/login',
    element: <LoginPage />,
  },
  {
    path: '/admin',
    element: (
      <AdminGuard>
        <AdminLayout />
      </AdminGuard>
    ),
    children: [
      {
        index: true,
        element: <Dashboard />,
      },
      {
        path: 'courses',
        element: <CourseManager />,
      },
      {
        path: 'courses/:courseId',
        element: <CourseEditor />,
      },
      {
        path: 'courses/new',
        element: <CourseEditor />,
      },
      {
        path: 'import',
        element: <ZIPImporter />,
      },
      {
        path: 'users',
        element: <Users />,
      },
      {
        path: 'settings',
        element: <Settings />,
      },
    ],
  },
]);

/* ─── App ─── */

export default function App(): ReactNode {
  return <RouterProvider router={router} />;
}

