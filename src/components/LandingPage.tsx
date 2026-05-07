import { type ReactNode, useMemo } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Rocket, Shield, Zap, ArrowRight, Github } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getCourseTree } from '@/utils/contentLoader';

export default function LandingPage(): ReactNode {
  const tree = useMemo(() => getCourseTree(), []);

  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="hero-badge">
              <Zap size={14} />
              <span>Scale your knowledge infinitely</span>
            </div>
            <h1 className="hero-title">
              Master the Future of <span className="text-gradient">Technology</span>
            </h1>
            <p className="hero-subtitle">
              A high-performance, developer-first learning platform. 
              Inject your courses directly from GitHub and start learning in seconds.
            </p>
            <div className="hero-actions">
              <Link to={tree.courses[0]?.modules[0]?.lessons[0]?.path ?? "/"} className="btn-primary">
                Get Started <ArrowRight size={18} />
              </Link>
              <a href="https://github.com" className="btn-secondary">
                <Github size={18} /> Documentation
              </a>
            </div>
          </motion.div>
        </div>
        
        {/* Floating Background Elements */}
        <div className="hero-visual">
          <div className="orb orb-1"></div>
          <div className="orb orb-2"></div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="section-header">
          <h2 className="section-title">Why Coursemap?</h2>
          <p className="section-subtitle">Built for speed, scalability, and developer experience.</p>
        </div>
        
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon"><Zap /></div>
            <h3>Lazy Loaded</h3>
            <p>Only download what you need. Blazing fast even with thousands of lessons.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon"><Shield /></div>
            <h3>Git Integrated</h3>
            <p>Your content stays in Git. Versioning and collaboration are built-in.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon"><Rocket /></div>
            <h3>Playground Ready</h3>
            <p>Interactive code execution right in your browser. No setup required.</p>
          </div>
        </div>
      </section>

      {/* Course Grid Section */}
      <section className="courses-section">
        <div className="section-header">
          <h2 className="section-title">Available Courses</h2>
          <p className="section-subtitle">Pick a path and start your journey today.</p>
        </div>

        <div className="courses-grid">
          {tree.courses.map((course) => (
            <Link key={course.slug} to={course.modules[0]?.lessons[0]?.path ?? "/"} className="course-card">
              <div className="course-card-content">
                <div className="course-card-icon">
                  <BookOpen />
                </div>
                <h3>{course.title}</h3>
                <p>{course.description}</p>
                <div className="course-card-footer">
                  <span className="course-tag">{course.language.toUpperCase()}</span>
                  <span className="course-modules-count">{course.modules.length} Modules</span>
                </div>
              </div>
            </Link>
          ))}
          
          {tree.courses.length === 0 && (
            <div className="empty-courses">
              <p>No courses found. Add content to the /content directory to see them here.</p>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-content">
          <div className="footer-brand">
            <BookOpen size={24} className="text-gradient" />
            <span>CourseMap</span>
          </div>
          <p>© 2026 ByteLab. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
