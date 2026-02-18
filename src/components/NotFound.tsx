import { type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, BookOpen } from 'lucide-react';

/* ─── Component ─── */

export default function NotFound(): ReactNode {
  const navigate = useNavigate();

  return (
    <div className="not-found">
      <div className="not-found-content">
        <div className="not-found-code">404</div>
        <h1 className="not-found-title">Page not found</h1>
        <p className="not-found-text">
          The lesson you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="not-found-actions">
          <button
            type="button"
            onClick={() => void navigate(-1)}
            className="btn btn-secondary"
          >
            <ArrowLeft size={16} />
            Go Back
          </button>
          <button
            type="button"
            onClick={() => void navigate('/')}
            className="btn btn-primary"
          >
            <BookOpen size={16} />
            Browse Courses
          </button>
        </div>
      </div>
    </div>
  );
}
