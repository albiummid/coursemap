import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Palette,
  Database,
  Code2,
  Globe,
  Trash2,
  Download,
  RotateCcw,
  CheckCircle2,
} from 'lucide-react';

interface ToggleProps {
  label: string;
  desc: string;
  value: boolean;
  onChange: (v: boolean) => void;
}

function SettingToggle({ label, desc, value, onChange }: ToggleProps) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '14px 0',
        borderBottom: '1px solid var(--border-secondary)',
      }}
    >
      <div>
        <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
          {label}
        </p>
        <p style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginTop: '2px' }}>
          {desc}
        </p>
      </div>
      <label className="admin-toggle" onClick={() => onChange(!value)}>
        <div className={`admin-toggle-track ${value ? 'admin-toggle-track-active' : ''}`}>
          <div className="admin-toggle-thumb" />
        </div>
      </label>
    </div>
  );
}

const accentColors = [
  { name: 'Amber', value: '#f59e0b' },
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Emerald', value: '#10b981' },
  { name: 'Purple', value: '#8b5cf6' },
  { name: 'Rose', value: '#f43f5e' },
  { name: 'Cyan', value: '#06b6d4' },
];

export default function Settings() {
  const [idbCaching, setIdbCaching] = useState(false);
  const [autoSave, setAutoSave] = useState(true);
  const [devMode, setDevMode] = useState(false);
  const [analyticsEnabled, setAnalyticsEnabled] = useState(false);
  const [selectedAccent, setSelectedAccent] = useState('#f59e0b');
  const [platformName, setPlatformName] = useState('CourseMap');
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const handleClearCache = () => {
    if (confirm('Clear all cached data from localStorage? This will log you out.')) {
      localStorage.clear();
      showToast('Cache cleared. Reloading...');
      setTimeout(() => window.location.reload(), 1000);
    }
  };

  const handleExportDB = () => {
    const data: Record<string, string | null> = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) data[key] = localStorage.getItem(key);
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `coursemap-export-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Data exported');
  };

  const handleResetSystem = () => {
    if (confirm('Reset the entire system? This will clear all data and reload the page.')) {
      localStorage.clear();
      sessionStorage.clear();
      showToast('System reset. Reloading...');
      setTimeout(() => window.location.reload(), 1000);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div className="admin-page-header">
        <h2 className="admin-page-title">Settings</h2>
        <p className="admin-page-desc">Configure your platform</p>
      </div>

      {/* Branding */}
      <div className="admin-card admin-card-padded" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
          <Palette size={18} style={{ color: 'var(--accent)' }} />
          <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)' }}>Branding</h3>
        </div>

        <div>
          <label className="admin-label">Platform Name</label>
          <input
            className="admin-input"
            value={platformName}
            onChange={(e) => setPlatformName(e.target.value)}
            style={{ maxWidth: '400px' }}
          />
        </div>

        <div>
          <label className="admin-label">Accent Color</label>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {accentColors.map((color) => (
              <button
                key={color.value}
                onClick={() => setSelectedAccent(color.value)}
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '8px',
                  background: color.value,
                  border: selectedAccent === color.value
                    ? '2px solid var(--text-primary)'
                    : '2px solid transparent',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  outline: selectedAccent === color.value
                    ? '2px solid var(--bg-primary)'
                    : 'none',
                }}
                title={color.name}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Persistence */}
      <div className="admin-card admin-card-padded" style={{ display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
          <Database size={18} style={{ color: '#3b82f6' }} />
          <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)' }}>Persistence</h3>
        </div>

        <SettingToggle
          label="IndexedDB Caching"
          desc="Store imported courses in the browser's IndexedDB"
          value={idbCaching}
          onChange={setIdbCaching}
        />
        <SettingToggle
          label="Auto-save"
          desc="Automatically save changes when editing courses"
          value={autoSave}
          onChange={setAutoSave}
        />
      </div>

      {/* Developer */}
      <div className="admin-card admin-card-padded" style={{ display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
          <Code2 size={18} style={{ color: '#8b5cf6' }} />
          <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)' }}>Developer</h3>
        </div>

        <SettingToggle
          label="Developer Mode"
          desc="Show debug panels and additional logging"
          value={devMode}
          onChange={setDevMode}
        />
        <SettingToggle
          label="Analytics"
          desc="Track usage metrics for the platform"
          value={analyticsEnabled}
          onChange={setAnalyticsEnabled}
        />
      </div>

      {/* GitHub */}
      <div className="admin-card admin-card-padded" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
          <Globe size={18} style={{ color: '#10b981' }} />
          <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)' }}>GitHub Integration</h3>
        </div>
        <p style={{ fontSize: '13px', color: 'var(--text-tertiary)' }}>
          Connect your GitHub repository to sync course content directly from your codebase.
        </p>
        <button className="admin-btn admin-btn-secondary" style={{ alignSelf: 'flex-start' }}>
          Connect Repository
        </button>
      </div>

      {/* Danger Zone */}
      <div className="admin-danger-zone">
        <h3 className="admin-danger-title">Danger Zone</h3>
        <p style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginBottom: '16px' }}>
          These actions are destructive and cannot be undone.
        </p>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <motion.button
            onClick={handleClearCache}
            className="admin-btn"
            style={{
              background: 'transparent',
              border: '1px solid #ef444460',
              color: '#ef4444',
            }}
            whileTap={{ scale: 0.97 }}
          >
            <Trash2 size={14} />
            Clear Cache
          </motion.button>
          <motion.button
            onClick={handleExportDB}
            className="admin-btn admin-btn-secondary"
            whileTap={{ scale: 0.97 }}
          >
            <Download size={14} />
            Export Data
          </motion.button>
          <motion.button
            onClick={handleResetSystem}
            className="admin-btn"
            style={{
              background: '#ef444415',
              border: '1px solid #ef444460',
              color: '#ef4444',
            }}
            whileTap={{ scale: 0.97 }}
          >
            <RotateCcw size={14} />
            Reset System
          </motion.button>
        </div>
      </div>

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
