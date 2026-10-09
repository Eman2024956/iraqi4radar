'use client';
import { IRAQ_GOVERNORATES } from '../data/iraqData';

export default function Footer({ onSelectGov }) {
  return (
    <footer className="footer-wrap">
      <div className="footer-inner">
        <div className="footer-grid">
          {/* Col 1: Brand & About */}
          <div className="footer-col">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #064e3b, #022c22)',
                  border: '1.5px solid #34d399',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 0 16px rgba(16, 185, 129, 0.4)',
                }}
              >
                <span style={{ fontSize: '1.3rem' }}>📡</span>
              </div>
              <div>
                <h3 className="footer-brand-title">
                  رادار العراق للأعمال
                </h3>
                <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#34d399' }}>
                  Iraq Business Radar • المنصة الوطنية الذكية
                </span>
              </div>
            </div>

            <p className="footer-about-p">
              المنصة السحابية الوطنية المتقدمة لاستكشاف واستخراج بيانات الأنشطة التجارية والشركات في عموم محافظات العراق من أحدث قواعد البيانات والخرائط المعتمدة مع نظام إرسال رسائل واتساب احترافية مخصصة وتصدير فوري لقواعد البيانات.
            </p>

            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 14px',
                background: 'rgba(16, 185, 129, 0.2)',
                border: '1.5px solid #34d399',
                borderRadius: '999px',
                fontSize: '0.82rem',
                fontWeight: 900,
                color: 'var(--text-main)',
                boxShadow: '0 2px 10px rgba(16, 185, 129, 0.25)',
              }}
            >
              <span>🟢</span>
              <span>تغطية مباشرة ودقيقة لخرائط وأسواق العراق</span>
            </div>
          </div>

          {/* Col 2: Governorates Coverage */}
          <div className="footer-col">
            <h4>
              <span>📍</span>
              <span>تغطية المحافظات العراقية</span>
            </h4>
            <ul
              className="footer-links-list"
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '10px',
              }}
            >
              {IRAQ_GOVERNORATES.map((g) => (
                <li key={g.id}>
                  <button
                    type="button"
                    className="footer-gov-btn"
                    onClick={() => {
                      if (onSelectGov) onSelectGov(g.id);
                      window.scrollTo({ top: 200, behavior: 'smooth' });
                    }}
                    title={`استخراج أنشطة محافظة ${g.name}`}
                  >
                    <span style={{ fontSize: '1rem', lineHeight: 1 }}>{g.icon || '📍'}</span>
                    <span>{g.name}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Export & Integrations */}
          <div className="footer-col">
            <h4>
              <span>⚡</span>
              <span>التوافق وأنماط التصدير</span>
            </h4>
            <ul className="footer-links-list">
              <li className="footer-bullet-item">
                📊 <strong>Excel (CSV):</strong> <span className="desc">ترميز UTF-8 كامل للأحرف العربية</span>
              </li>
              <li className="footer-bullet-item">
                📁 <strong>JSON Database:</strong> <span className="desc">ملفات قياسية لقواعد البيانات وأنظمة الإدارة</span>
              </li>
              <li className="footer-bullet-item">
                📇 <strong>vCard (.vcf):</strong> <span className="desc">إضافة فورية لجهات اتصال الهاتف</span>
              </li>
              <li className="footer-bullet-item">
                💬 <strong>WhatsApp Web / App:</strong> <span className="desc">روابط مباشرة جاهزة للإرسال</span>
              </li>
              <li className="footer-bullet-item">
                📱 <strong>مشغلو الاتصالات:</strong> <span className="desc">كشف زين العراق، آسيا سيل، كورك</span>
              </li>
            </ul>
          </div>

          {/* Col 4: Ethics & Compliance Disclaimer */}
          <div className="footer-col">
            <h4>
              <span>🛡️</span>
              <span>سياسة الاستخدام المسؤول</span>
            </h4>
            <p className="footer-compliance-p">
              البيانات المستخرجة هي معلومات أعمال عامة منشورة ومتاحة على محركات البحث والخرائط العامة للأعمال. يرجى استخدام أرقام الاتصال وفق القوانين والأنظمة المعمول بها وسياسات مكافحة الرسائل المزعجة (Anti-Spam) في منصة واتساب.
            </p>
            <div className="footer-privacy-badge">
              🔒 لا يتم تخزين أية أرقام أو بيانات على خوادم خارجية؛ كافة العمليات والتصدير تتم في جلسة المتصفح الخاصة بك حصراً وبأعلى درجات الخصوصية والأمان.
            </div>
          </div>
        </div>

        {/* Bottom copyright & credits */}
        <div className="footer-bottom">
          <div style={{ fontWeight: 800 }}>
            © {new Date().getFullYear()} رادار العراق للأعمال (Iraq Business Radar) — جميع الحقوق محفوظة لرواد الأعمال في العراق.
          </div>
          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
            <span style={{ color: 'var(--primary)', fontWeight: 800 }}>⚡ سرعة استجابة فائقة</span>
            <span style={{ color: 'var(--text-main)', fontWeight: 800 }}>🇮🇶 مصمم خصيصاً للسوق العراقي</span>
            <span style={{ color: '#d97706', fontWeight: 800 }}>⭐ معايير هندسية متقدمة</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
