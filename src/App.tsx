import { useState, useCallback, useEffect, type ReactNode } from 'react';
import {
  createBrowserRouter,
  RouterProvider,
  Outlet,
  Navigate,
} from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Sidebar from '@/components/Sidebar';
import SearchModal from '@/components/SearchModal';
import LessonPage from '@/components/LessonPage';
import NotFound from '@/components/NotFound';
import { getCourseTree } from '@/utils/contentLoader';

/* ─── Layout ─── */

function Layout(): ReactNode {
  const [searchOpen, setSearchOpen] = useState<boolean>(false);

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
      <Sidebar onSearchOpen={openSearch} />
      <main className="app-main">
        <AnimatePresence mode="wait">
          <Outlet />
        </AnimatePresence>
      </main>
      <SearchModal isOpen={searchOpen} onClose={closeSearch} />
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
        element: <HomeRedirect />,
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
]);

/* ─── App ─── */

export default function App(): ReactNode {
  return <RouterProvider router={router} />;
}
