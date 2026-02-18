import { useState, useEffect, useCallback, useRef, useMemo, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Search, X, ArrowRight, FileText } from 'lucide-react';
import Fuse from 'fuse.js';
import { getCourseTree, buildSearchItems } from '@/utils/contentLoader';
import type { SearchItem } from '@/types';

/* ─── Props ─── */

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/* ─── Component ─── */

export default function SearchModal({ isOpen, onClose }: SearchModalProps): ReactNode {
  const [query, setQuery] = useState<string>('');
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const tree = useMemo(() => getCourseTree(), []);
  const searchItems = useMemo(() => buildSearchItems(tree), [tree]);

  const fuse = useMemo(
    () =>
      new Fuse(searchItems, {
        keys: [
          { name: 'title', weight: 0.4 },
          { name: 'description', weight: 0.3 },
          { name: 'tags', weight: 0.2 },
          { name: 'moduleTitle', weight: 0.1 },
        ],
        threshold: 0.4,
        includeScore: true,
      }),
    [searchItems]
  );

  const results = useMemo((): SearchItem[] => {
    if (!query.trim()) return searchItems;
    return fuse.search(query).map((r) => r.item);
  }, [query, fuse, searchItems]);

  // Group results by module
  const groupedResults = useMemo(() => {
    const groups = new Map<string, SearchItem[]>();
    for (const item of results) {
      const key = item.moduleTitle;
      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key)!.push(item);
    }
    return groups;
  }, [results]);

  // Flatten for keyboard navigation
  const flatResults = useMemo(() => results, [results]);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Global keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent): void => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const navigateToResult = useCallback(
    (item: SearchItem): void => {
      navigate(item.path);
      onClose();
    },
    [navigate, onClose]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent): void => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev < flatResults.length - 1 ? prev + 1 : 0
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev > 0 ? prev - 1 : flatResults.length - 1
          );
          break;
        case 'Enter': {
          e.preventDefault();
          const selected = flatResults[selectedIndex];
          if (selected) {
            navigateToResult(selected);
          }
          break;
        }
        case 'Escape':
          onClose();
          break;
      }
    },
    [flatResults, selectedIndex, navigateToResult, onClose]
  );

  // Reset selection when query changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="search-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            className="search-modal"
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.15 }}
          >
            {/* Search Input */}
            <div className="search-input-wrapper">
              <Search size={18} className="search-input-icon" />
              <input
                ref={inputRef}
                type="text"
                className="search-input"
                placeholder="Search lessons, topics, tags..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                aria-label="Search lessons"
              />
              {query && (
                <button
                  type="button"
                  className="search-clear"
                  onClick={() => setQuery('')}
                >
                  <X size={16} />
                </button>
              )}
              <kbd className="search-esc-hint">ESC</kbd>
            </div>

            {/* Results */}
            <div className="search-results">
              {flatResults.length === 0 ? (
                <div className="search-empty">
                  <p>No results found for &ldquo;{query}&rdquo;</p>
                </div>
              ) : (
                Array.from(groupedResults.entries()).map(
                  ([moduleTitle, items]) => (
                    <div key={moduleTitle} className="search-group">
                      <div className="search-group-title">{moduleTitle}</div>
                      {items.map((item) => {
                        const globalIdx = flatResults.indexOf(item);
                        return (
                          <button
                            key={item.path}
                            type="button"
                            className={`search-result ${
                              globalIdx === selectedIndex
                                ? 'search-result-active'
                                : ''
                            }`}
                            onClick={() => navigateToResult(item)}
                            onMouseEnter={() => setSelectedIndex(globalIdx)}
                          >
                            <FileText size={16} className="search-result-icon" />
                            <div className="search-result-content">
                              <span className="search-result-title">
                                {item.title}
                              </span>
                              <span className="search-result-desc">
                                {item.description}
                              </span>
                            </div>
                            <ArrowRight
                              size={14}
                              className="search-result-arrow"
                            />
                          </button>
                        );
                      })}
                    </div>
                  )
                )
              )}
            </div>

            {/* Footer */}
            <div className="search-footer">
              <span>
                <kbd>↑↓</kbd> Navigate
              </span>
              <span>
                <kbd>↵</kbd> Open
              </span>
              <span>
                <kbd>ESC</kbd> Close
              </span>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
