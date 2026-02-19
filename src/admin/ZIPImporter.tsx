import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload,
  FileArchive,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Layers,
  FileText,
  Loader2,
  X,
} from 'lucide-react';
import JSZip from 'jszip';
import { CourseSchema } from '@/schemas/course.schema';
import { useImportStore } from '@/stores/useImportStore';

type Step = 'upload' | 'validate' | 'import';

interface ValidationResult {
  valid: boolean;
  courseName: string;
  modules: { name: string; lessons: string[] }[];
  errors: string[];
  warnings: string[];
}

export default function ZIPImporter() {
  const [step, setStep] = useState<Step>('upload');
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [validating, setValidating] = useState(false);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<ValidationResult | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const { addHistory } = useImportStore();

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleFile = useCallback(async (f: File) => {
    setFile(f);
    setStep('validate');
    setValidating(true);

    try {
      const zip = await JSZip.loadAsync(f);
      const errors: string[] = [];
      const warnings: string[] = [];
      let courseName = f.name.replace('.zip', '');
      const modules: { name: string; lessons: string[] }[] = [];

      // Find course.json
      const courseJsonFile = Object.keys(zip.files).find((p) =>
        p.endsWith('course.json')
      );

      if (courseJsonFile) {
        try {
          const courseJsonEntry = zip.files[courseJsonFile];
          if (courseJsonEntry) {
            const raw = await courseJsonEntry.async('string');
            const parsed = JSON.parse(raw);
            const validation = CourseSchema.safeParse(parsed);
          if (validation.success) {
            courseName = validation.data.title;
          } else {
            errors.push(
              `course.json validation: ${validation.error.issues
                .map((issue: { message: string }) => issue.message)
                .join(', ')}`
            );
          }
          }
          }
        } catch {
          errors.push('course.json could not be parsed as JSON');
        }
      } else {
        errors.push('Missing course.json in root');
      }

      // Discover modules and lessons
      const dirs = Object.keys(zip.files).filter((p) => zip.files[p].dir);
      const moduleDirs = dirs.filter((d) => {
        const parts = d.split('/').filter(Boolean);
        return parts.length === 2;
      });

      for (const modDir of moduleDirs) {
        const modName = modDir.split('/').filter(Boolean)[1] || modDir;
        const lessonFiles = Object.keys(zip.files).filter(
          (p) => p.startsWith(modDir) && p.endsWith('.md')
        );
        const lessonNames = lessonFiles.map(
          (p) => p.split('/').pop()?.replace('.md', '') || 'untitled'
        );

        // Check for module.json
        const hasModuleJson = Object.keys(zip.files).some(
          (p) => p === `${modDir}module.json`
        );
        if (!hasModuleJson) {
          warnings.push(`Module "${modName}" is missing module.json`);
        }

        modules.push({ name: modName, lessons: lessonNames });
      }

      if (modules.length === 0) {
        warnings.push('No module directories found');
      }

      setResult({
        valid: errors.length === 0,
        courseName,
        modules,
        errors,
        warnings,
      });
    } catch {
      setResult({
        valid: false,
        courseName: f.name,
        modules: [],
        errors: ['Failed to read ZIP file'],
        warnings: [],
      });
    } finally {
      setValidating(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragActive(false);
      const f = e.dataTransfer.files[0];
      if (f && f.name.endsWith('.zip')) {
        handleFile(f);
      }
    },
    [handleFile]
  );

  const handleInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const f = e.target.files?.[0];
      if (f) handleFile(f);
    },
    [handleFile]
  );

  const handleImport = () => {
    if (!result) return;
    setStep('import');
    setImporting(true);

    setTimeout(() => {
      addHistory({
        id: Date.now().toString(),
        courseTitle: result.courseName,
        timestamp: new Date().toISOString(),
        status: result.valid ? 'success' : 'warning',
        message: `Imported ${result.modules.length} modules, ${result.modules.reduce((a, m) => a + m.lessons.length, 0)} lessons`,
      });
      setImporting(false);
      showToast(`"${result.courseName}" imported successfully!`);
    }, 1500);
  };

  const resetImporter = () => {
    setStep('upload');
    setFile(null);
    setResult(null);
  };

  const steps: { key: Step; label: string }[] = [
    { key: 'upload', label: 'Upload' },
    { key: 'validate', label: 'Validate' },
    { key: 'import', label: 'Import' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div className="admin-page-header">
        <h2 className="admin-page-title">Import Course</h2>
        <p className="admin-page-desc">Upload a ZIP file to import course content</p>
      </div>

      {/* Step Progress */}
      <div className="admin-steps">
        {steps.map((s, i) => {
          const isActive = s.key === step;
          const isDone =
            (s.key === 'upload' && step !== 'upload') ||
            (s.key === 'validate' && step === 'import');
          return (
            <div key={s.key} style={{ display: 'flex', alignItems: 'center' }}>
              <div className={`admin-step ${isActive ? 'admin-step-active' : ''} ${isDone ? 'admin-step-done' : ''}`}>
                <span className="admin-step-number">
                  {isDone ? '✓' : i + 1}
                </span>
                <span>{s.label}</span>
              </div>
              {i < steps.length - 1 && (
                <div className={`admin-step-line ${isDone ? 'admin-step-line-done' : ''}`} />
              )}
            </div>
          );
        })}
      </div>

      {/* Upload Step */}
      {step === 'upload' && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div
            className={`admin-dropzone ${dragActive ? 'admin-dropzone-active' : ''}`}
            onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
            onDragLeave={() => setDragActive(false)}
            onDrop={handleDrop}
            onClick={() => document.getElementById('zip-input')?.click()}
          >
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }}>
              <div className="admin-empty-icon" style={{ background: dragActive ? 'var(--accent-muted)' : undefined }}>
                <Upload size={24} style={{ color: dragActive ? 'var(--accent)' : undefined }} />
              </div>
              <div>
                <p style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
                  Drop your ZIP file here
                </p>
                <p style={{ fontSize: '13px', color: 'var(--text-tertiary)' }}>
                  or click to browse · .zip files only
                </p>
              </div>
            </div>
          </div>
          <input
            id="zip-input"
            type="file"
            accept=".zip"
            onChange={handleInput}
            style={{ display: 'none' }}
          />
        </motion.div>
      )}

      {/* Validate Step */}
      {step === 'validate' && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
        >
          {/* File Info */}
          <div className="admin-card admin-card-padded" style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <FileArchive size={20} style={{ color: 'var(--accent)' }} />
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
                {file?.name}
              </p>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                {file ? `${(file.size / 1024).toFixed(1)} KB` : ''}
              </p>
            </div>
            <button onClick={resetImporter} className="admin-btn admin-btn-ghost admin-btn-icon">
              <X size={16} />
            </button>
          </div>

          {validating ? (
            <div className="admin-card admin-card-padded" style={{ textAlign: 'center', padding: '40px' }}>
              <Loader2 size={24} style={{ color: 'var(--accent)', animation: 'spin 1s linear infinite', margin: '0 auto 8px' }} />
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Validating ZIP structure...</p>
            </div>
          ) : result && (
            <>
              {/* Validation Status */}
              <div className="admin-card admin-card-padded">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                  {result.valid ? (
                    <CheckCircle2 size={20} style={{ color: 'var(--success)' }} />
                  ) : (
                    <XCircle size={20} style={{ color: '#ef4444' }} />
                  )}
                  <span style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {result.valid ? 'Validation Passed' : 'Validation Failed'}
                  </span>
                </div>

                {result.errors.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '12px' }}>
                    {result.errors.map((err, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '13px', color: '#ef4444' }}>
                        <XCircle size={14} style={{ marginTop: '2px', flexShrink: 0 }} />
                        {err}
                      </div>
                    ))}
                  </div>
                )}

                {result.warnings.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {result.warnings.map((w, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '13px', color: '#f59e0b' }}>
                        <AlertTriangle size={14} style={{ marginTop: '2px', flexShrink: 0 }} />
                        {w}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Content Tree Preview */}
              {result.modules.length > 0 && (
                <div className="admin-card" style={{ overflow: 'hidden' }}>
                  <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border-secondary)' }}>
                    <span style={{ fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-muted)' }}>
                      Content Preview
                    </span>
                  </div>
                  <div style={{ padding: '12px 16px' }}>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '12px' }}>
                      {result.courseName}
                    </div>
                    {result.modules.map((mod) => (
                      <div key={mod.name} style={{ marginBottom: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                          <Layers size={14} style={{ color: 'var(--accent)' }} />
                          {mod.name}
                        </div>
                        {mod.lessons.map((lesson) => (
                          <div key={lesson} style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingLeft: '22px', fontSize: '12px', color: 'var(--text-tertiary)', padding: '2px 0 2px 22px' }}>
                            <FileText size={12} />
                            {lesson}
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button onClick={resetImporter} className="admin-btn admin-btn-secondary">
                  Cancel
                </button>
                <button
                  onClick={handleImport}
                  className="admin-btn admin-btn-primary"
                  disabled={!result.valid}
                  style={{ opacity: result.valid ? 1 : 0.5 }}
                >
                  Import Course
                </button>
              </div>
            </>
          )}
        </motion.div>
      )}

      {/* Import Step */}
      {step === 'import' && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="admin-card"
          style={{ textAlign: 'center', padding: '48px' }}
        >
          {importing ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
              <Loader2 size={32} style={{ color: 'var(--accent)', animation: 'spin 1s linear infinite' }} />
              <p style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)' }}>
                Importing course...
              </p>
              <p style={{ fontSize: '13px', color: 'var(--text-tertiary)' }}>
                This may take a moment
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
              <CheckCircle2 size={40} style={{ color: 'var(--success)' }} />
              <p style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' }}>
                Import Complete!
              </p>
              <p style={{ fontSize: '13px', color: 'var(--text-tertiary)' }}>
                "{result?.courseName}" has been imported successfully.
              </p>
              <button onClick={resetImporter} className="admin-btn admin-btn-primary" style={{ marginTop: '8px' }}>
                Import Another
              </button>
            </div>
          )}
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
            <CheckCircle2 size={16} style={{ color: 'var(--success)' }} />
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
