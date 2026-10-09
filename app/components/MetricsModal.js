'use client';

export default function MetricsModal({
  isOpen,
  onClose,
  totalRequests,
  googleRequests,
  osmRequests,
  estimatedCostUSD,
  maxRequestsLimit,
  setMaxRequestsLimit,
  enableAutoStop,
  setEnableAutoStop,
  costPerGoogleRequest = 0.025,
}) {
  if (!isOpen) return null;

  const costIQD = Math.round(estimatedCostUSD * 1320);
  const percentUsed = maxRequestsLimit > 0 ? Math.min(100, Math.round((totalRequests / maxRequestsLimit) * 100)) : 0;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-box"
        style={{ maxWidth: '820px', width: '95%', maxHeight: '90vh', overflowY: 'auto' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="modal-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '1.8rem' }}>📊</span>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--text-main)', margin: 0 }}>
                متابعة الاستهلاك والتحكم في الميزانية (Usage & Budget Control)
              </h2>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 700 }}>
                مراقبة فورية لعدد العمليات، التكلفة التقديرية، والتحكم في سقف التوقف التلقائي
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="btn-secondary"
            style={{ padding: '6px 12px', fontSize: '0.9rem', fontWeight: 900 }}
          >
            ✕ إغلاق
          </button>
        </div>

        {/* Live Gauges Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '14px', marginTop: '20px' }}>
          {/* Total Requests */}
          <div style={{ padding: '16px', background: 'var(--bg-surface)', border: '1.5px solid var(--border-subtle)', borderRadius: 'var(--radius-md)' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 800, display: 'block' }}>إجمالي العمليات</span>
            <strong style={{ fontSize: '1.7rem', color: 'var(--primary)', fontWeight: 900, display: 'block', marginTop: '4px' }}>
              {totalRequests}
            </strong>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', fontWeight: 700 }}>خلال الجلسة الحالية</span>
          </div>

          {/* Google Maps Requests */}
          <div style={{ padding: '16px', background: 'var(--bg-surface)', border: '1.5px solid rgba(59, 130, 246, 0.3)', borderRadius: 'var(--radius-md)' }}>
            <span style={{ fontSize: '0.78rem', color: '#60a5fa', fontWeight: 800, display: 'block' }}>🌐 المحرك السحابي المعتمد</span>
            <strong style={{ fontSize: '1.7rem', color: '#93c5fd', fontWeight: 900, display: 'block', marginTop: '4px' }}>
              {googleRequests}
            </strong>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', fontWeight: 700 }}>~${costPerGoogleRequest} لكل عملية</span>
          </div>

          {/* OpenStreetMap Requests */}
          <div style={{ padding: '16px', background: 'var(--bg-surface)', border: '1.5px solid rgba(16, 185, 129, 0.3)', borderRadius: 'var(--radius-md)' }}>
            <span style={{ fontSize: '0.78rem', color: '#34d399', fontWeight: 800, display: 'block' }}>🗺️ المحرك الجغرافي الشامل</span>
            <strong style={{ fontSize: '1.7rem', color: '#34d399', fontWeight: 900, display: 'block', marginTop: '4px' }}>
              {osmRequests}
            </strong>
            <span style={{ fontSize: '0.72rem', color: '#10b981', fontWeight: 800 }}>وصول شامل ومباشر ($0.00)</span>
          </div>

          {/* Estimated Cost */}
          <div style={{ padding: '16px', background: 'var(--bg-surface)', border: '1.5px solid rgba(245, 158, 11, 0.3)', borderRadius: 'var(--radius-md)' }}>
            <span style={{ fontSize: '0.78rem', color: '#fbbf24', fontWeight: 800, display: 'block' }}>💵 التكلفة التقديرية</span>
            <strong style={{ fontSize: '1.7rem', color: '#fbbf24', fontWeight: 900, display: 'block', marginTop: '4px', direction: 'ltr', textAlign: 'right' }}>
              ${estimatedCostUSD.toFixed(3)}
            </strong>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700 }}>
              ~{costIQD.toLocaleString()} دينار عراقي
            </span>
          </div>
        </div>

        {/* Auto-Stop Controller Section */}
        <div
          style={{
            marginTop: '22px',
            padding: '18px 20px',
            background: 'var(--bg-card)',
            border: '1.5px solid var(--border-card)',
            borderRadius: 'var(--radius-lg)',
          }}
        >
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '12px', marginBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '1.3rem' }}>🛡️</span>
              <div>
                <strong style={{ fontSize: '1rem', color: 'var(--text-main)', fontWeight: 900, display: 'block' }}>
                  سقف الأمان والتوقف التلقائي (Auto-Stop Control)
                </strong>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 700 }}>
                  يتوقف المحرك تلقائياً فور بلوغ الحد المحدد لحماية ميزانيتك ورصيدك
                </span>
              </div>
            </div>

            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 800, fontSize: '0.86rem', color: 'var(--text-main)' }}>
              <input
                type="checkbox"
                checked={enableAutoStop}
                onChange={(e) => setEnableAutoStop(e.target.checked)}
                style={{ width: '18px', height: '18px', accentColor: 'var(--primary)' }}
              />
              <span>تفعيل التوقف التلقائي</span>
            </label>
          </div>

          {/* Progress Bar towards Limit */}
          <div style={{ margin: '14px 0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', fontWeight: 800, marginBottom: '6px' }}>
              <span style={{ color: 'var(--text-main)' }}>
                الاستهلاك: <strong>{totalRequests}</strong> من <strong>{maxRequestsLimit}</strong> طلب
              </span>
              <span style={{ color: percentUsed >= 90 ? 'var(--danger)' : 'var(--primary)' }}>
                {percentUsed}% مستهلك
              </span>
            </div>
            <div style={{ width: '100%', height: '10px', background: 'var(--bg-surface)', borderRadius: '999px', overflow: 'hidden', border: '1px solid var(--border-subtle)' }}>
              <div
                style={{
                  width: `${percentUsed}%`,
                  height: '100%',
                  background: percentUsed >= 90 ? 'linear-gradient(90deg, #f59e0b, #ef4444)' : 'linear-gradient(90deg, #10b981, #059669)',
                  transition: 'width 0.3s ease',
                }}
              />
            </div>
          </div>

          {/* Quick Select Buttons for Limits */}
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px', marginTop: '14px' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 900, color: 'var(--text-main)' }}>تحديد سقف الطلبات:</span>
            {[10, 25, 50, 100, 200, 500].map((limitVal) => (
              <button
                key={limitVal}
                type="button"
                onClick={() => setMaxRequestsLimit(limitVal)}
                className={`btn-secondary ${maxRequestsLimit === limitVal ? 'active' : ''}`}
                style={{
                  padding: '5px 12px',
                  fontSize: '0.82rem',
                  fontWeight: 900,
                  background: maxRequestsLimit === limitVal ? 'rgba(16, 185, 129, 0.2)' : undefined,
                  borderColor: maxRequestsLimit === limitVal ? 'var(--primary)' : undefined,
                  color: maxRequestsLimit === limitVal ? 'var(--primary)' : undefined,
                }}
              >
                {limitVal} طلب (~${(limitVal * costPerGoogleRequest).toFixed(2)})
              </button>
            ))}

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginRight: 'auto' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 800 }}>مخصص:</span>
              <input
                type="number"
                min="1"
                max="5000"
                value={maxRequestsLimit}
                onChange={(e) => setMaxRequestsLimit(Math.max(1, parseInt(e.target.value) || 1))}
                className="custom-input"
                style={{ width: '80px', padding: '5px 8px', fontSize: '0.84rem', textAlign: 'center', fontWeight: 900 }}
              />
            </div>
          </div>
        </div>

        {/* Cloud Platform Metrics & Billing Integration Guides */}
        <div style={{ marginTop: '24px' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 900, color: 'var(--text-main)', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>📈</span>
            <span>إرشادات ولوحات التحكم السحابية المعتمدة</span>
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
            {/* 1. Metrics Page */}
            <div style={{ padding: '16px', background: 'var(--bg-surface)', border: '1.5px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <strong style={{ fontSize: '0.94rem', color: 'var(--text-main)', fontWeight: 900, display: 'block', marginBottom: '6px' }}>
                  📊 صفحة المقاييس ومعدل العمليات
                </strong>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5, margin: 0 }}>
                  تعرض التقارير التفصيلية لحجم العمليات المنفذة، الرسوم البيانية لمعدل النشاط، ومؤشرات استقرار وسرعة الخدمة ومعدل الإنجاز.
                </p>
              </div>
              <a
                href="https://console.cloud.google.com/google/maps-apis/metrics"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary"
                style={{ marginTop: '14px', fontSize: '0.82rem', padding: '8px 12px', textAlign: 'center', textDecoration: 'none' }}
              >
                فتح صفحة المقاييس ↗
              </a>
            </div>

            {/* 2. Billing & Budgets */}
            <div style={{ padding: '16px', background: 'var(--bg-surface)', border: '1.5px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <strong style={{ fontSize: '0.94rem', color: 'var(--text-main)', fontWeight: 900, display: 'block', marginBottom: '6px' }}>
                  💰 إدارة الميزانية والتنبيهات
                </strong>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5, margin: 0 }}>
                  حدد ميزانية شهرية (مثلاً 20$) واضبط إشعارات فورية عبر البريد الإلكتروني عند وصول الصرف إلى 50% أو 90% أو 100% لتجنب أية رسوم غير متوقعة.
                </p>
              </div>
              <a
                href="https://console.cloud.google.com/billing"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary"
                style={{ marginTop: '14px', fontSize: '0.82rem', padding: '8px 12px', textAlign: 'center', textDecoration: 'none', fontWeight: 800 }}
              >
                فتح إعدادات الميزانية ↗
              </a>
            </div>

            {/* 3. Daily Quotas */}
            <div style={{ padding: '16px', background: 'var(--bg-surface)', border: '1.5px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <strong style={{ fontSize: '0.94rem', color: 'var(--text-main)', fontWeight: 900, display: 'block', marginBottom: '6px' }}>
                  🔒 إدارة الحصص التشغيلية
                </strong>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5, margin: 0 }}>
                  تتيح لك المنصة تعيين سقف يومي محدد لعدد العمليات لتنظيم الاستخدام وفق خطتك التشغيلية بدقة.
                </p>
              </div>
              <a
                href="https://console.cloud.google.com/google/maps-apis/quotas"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary"
                style={{ marginTop: '14px', fontSize: '0.82rem', padding: '8px 12px', textAlign: 'center', textDecoration: 'none', fontWeight: 800 }}
              >
                تحديد الحصص التشغيلية ↗
              </a>
            </div>
          </div>
        </div>

        {/* Quota & Balance Notice Card */}
        <div
          style={{
            marginTop: '20px',
            padding: '14px 18px',
            background: 'rgba(16, 185, 129, 0.1)',
            border: '1.5px solid var(--primary)',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <span style={{ fontSize: '1.5rem' }}>🎁</span>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-main)', lineHeight: 1.5 }}>
            <strong style={{ color: 'var(--primary)', fontWeight: 900 }}>معلومة توفيرية هامة:</strong> تمنح المنصة السحابية كل حساب رصيداً مدعوماً متجدداً بقيمة <strong>200 دولار شهرياً</strong> (يعادل تغطية حوالي 6,000 إلى 8,000 عملية شهرياً)! كما يوفر المحرك الشامل إمكانية البحث المرن غير المحدود على مدار الساعة.
          </div>
        </div>
      </div>
    </div>
  );
}
