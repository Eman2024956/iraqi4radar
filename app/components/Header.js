'use client';

export default function Header({
  totalRecords,
  totalRequests = 0,
  estimatedCostUSD = 0,
  isRunning,
  theme,
  toggleTheme,
  onOpenGuide,
  onOpenMetrics,
}) {
  return (
    <header className="header-glass">
      <div className="header-inner">
        {/* Brand Logo & Title with Radar Aesthetic */}
        <div className="logo-wrapper">
          <div className="logo-icon-box">
            <svg viewBox="0 0 44 44" width="32" height="32" fill="none">
              <circle cx="22" cy="22" r="18" stroke="#34d399" strokeWidth="1.5" strokeDasharray="2 3" opacity="0.6" />
              <circle cx="22" cy="22" r="11" stroke="#fbbf24" strokeWidth="1" strokeDasharray="3 3" opacity="0.4" />
              {/* Radar sweep beam indicator */}
              <path
                d="M22 6 C14.5 6 9 11.5 9 19 C9 27.5 19.8 35.5 21.3 36.6 C21.7 37 22.3 37 22.7 36.6 C24.2 35.5 35 27.5 35 19 C35 11.5 29.5 6 22 6 Z"
                fill="url(#radarPinGrad)"
              />
              <circle cx="22" cy="18" r="5.5" fill="#041f17" />
              <circle cx="22" cy="18" r="3.5" fill="#fbbf24" />
              <circle cx="29" cy="11" r="3.5" fill="#25D366" stroke="#041f17" strokeWidth="1" />
              <defs>
                <linearGradient id="radarPinGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#34d399" />
                  <stop offset="100%" stopColor="#059669" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <div className="brand-text-col">
            <span className="brand-title">
              <span>رادار العراق</span>
              <span className="accent-text">للأعمال</span>
            </span>
            <span className="brand-subtitle">Iraq Business Radar • المنصة الوطنية الذكية</span>
          </div>
        </div>

        {/* Live Counters & Controls */}
        <div className="header-actions">
          {/* Live Requests & Cost Metrics Button */}
          <button
            type="button"
            onClick={onOpenMetrics}
            className="btn-secondary header-metrics-btn"
            title="متابعة استهلاك العمليات والتكلفة التقديرية وحد التوقف"
          >
            <span>📊</span>
            <span style={{ color: '#fbbf24', direction: 'ltr', display: 'inline-block' }}>
              {totalRequests} طلب
            </span>
            <span className="header-metrics-cost" style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
              (${estimatedCostUSD.toFixed(2)})
            </span>
          </button>

          {/* Live Data Badge */}
          <div className="status-pill" title={`إجمالي السجلات: ${totalRecords}`}>
            <span className="status-indicator-dot" style={{ backgroundColor: isRunning ? '#fbbf24' : '#10b981' }} />
            <span className="status-text-full">
              قاعدة البيانات:{' '}
              <strong style={{ color: 'var(--primary)', direction: 'ltr', display: 'inline-block', fontSize: '0.94rem', fontWeight: 900 }}>
                {totalRecords.toLocaleString()}
              </strong>{' '}
              سجل
            </span>
            <span className="status-text-compact">
              <strong>{totalRecords.toLocaleString()} سجل</strong>
            </span>
          </div>

          {/* User Guide Button (Desktop / Tablet) */}
          <button
            onClick={onOpenGuide}
            className="btn-secondary header-guide-btn"
            style={{ padding: '8px 14px', fontSize: '0.84rem', fontWeight: 800 }}
            title="دليل استخدام منصة رادار العراق"
          >
            <span>📖</span>
            <span>دليل المنصة</span>
          </button>

          {/* Theme Switcher Button */}
          <button
            onClick={toggleTheme}
            className="btn-secondary header-theme-btn"
            style={{ padding: '8px 12px', fontSize: '0.84rem', fontWeight: 800 }}
            title={theme === 'dark' ? 'التحويل إلى الوضع النهاري' : 'التحويل إلى الوضع الليلي'}
          >
            <span className="theme-btn-text">{theme === 'dark' ? '☀️ نهاري' : '🌙 ليلي'}</span>
            <span className="theme-btn-icon">{theme === 'dark' ? '☀️' : '🌙'}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
