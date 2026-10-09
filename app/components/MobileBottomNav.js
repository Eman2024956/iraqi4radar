'use client';

export default function MobileBottomNav({
  totalRecords,
  onOpenMessenger,
  onOpenGuide,
}) {
  function scrollTo(id) {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  return (
    <nav className="mobile-bottom-nav" aria-label="شريط التنقل السريع للهاتف">
      <div className="mobile-bottom-nav-inner">
        {/* 1. Search & Cities */}
        <button
          type="button"
          className="mobile-nav-item"
          onClick={() => scrollTo('search-section')}
          title="الانتقال إلى إعدادات البحث والمحافظات"
        >
          <span className="mobile-nav-icon">🔍</span>
          <span className="mobile-nav-label">البحث</span>
        </button>

        {/* 2. Results & Table */}
        <button
          type="button"
          className="mobile-nav-item"
          onClick={() => scrollTo('results-section')}
          title="الانتقال إلى جدول وسجلات النتائج"
        >
          <div className="mobile-nav-icon-wrapper">
            <span className="mobile-nav-icon">📊</span>
            {totalRecords > 0 && (
              <span className="mobile-nav-badge">{totalRecords > 999 ? '999+' : totalRecords}</span>
            )}
          </div>
          <span className="mobile-nav-label">النتائج</span>
        </button>

        {/* 3. WhatsApp Quick Outreach - Center Highlighted Button */}
        <button
          type="button"
          className="mobile-nav-item mobile-nav-highlight"
          onClick={onOpenMessenger}
          title="فتح نافذة المراسلة التتابعية السريعة عبر واتساب"
        >
          <div className="mobile-nav-fab">
            <span className="mobile-fab-icon">💬</span>
          </div>
          <span className="mobile-nav-label highlight-label">واتساب</span>
        </button>

        {/* 4. Export & Save */}
        <button
          type="button"
          className="mobile-nav-item"
          onClick={() => scrollTo('export-section')}
          title="الانتقال إلى أدوات التصدير الذكي"
        >
          <span className="mobile-nav-icon">💾</span>
          <span className="mobile-nav-label">التصدير</span>
        </button>

        {/* 5. User Guide */}
        <button
          type="button"
          className="mobile-nav-item"
          onClick={onOpenGuide}
          title="فتح دليل استخدام منصة رادار العراق"
        >
          <span className="mobile-nav-icon">📖</span>
          <span className="mobile-nav-label">الدليل</span>
        </button>
      </div>
    </nav>
  );
}
