'use client';

export default function GuideModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(10px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
    >
      <div
        className="guide-modal-card"
        style={{
          borderRadius: 'var(--radius-xl)',
          width: '100%',
          maxWidth: '780px',
          maxHeight: '88vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div
          className="guide-modal-header"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '18px 26px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '1.6rem' }}>📖</span>
            <div>
              <h3 className="guide-modal-title" style={{ margin: 0 }}>
                دليل الاستخدام وأفضل الممارسات | رادار العراق للأعمال
              </h3>
              <span style={{ fontSize: '0.8rem', color: '#059669', fontWeight: 800 }}>
                Iraq Business Radar User Guide
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-main)',
              fontSize: '1.5rem',
              fontWeight: 900,
              cursor: 'pointer',
              padding: '4px 8px',
            }}
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div
          style={{
            padding: '26px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '18px',
            fontSize: '0.94rem',
            lineHeight: 1.8,
          }}
        >
          {/* Step 1 */}
          <div className="guide-step-card">
            <h4 className="guide-step-title color-emerald">
              1. استهداف المحافظات والمناطق العراقية بدقة
            </h4>
            <p className="guide-step-desc">
              اختر المحافظة من القائمة التفاعلية، وستظهر لك أهم الأحياء والأسواق التجارية تلقائياً. كلما حددت مناطق أكثر دقة (مثل: الكرادة، المنصور، العشار، عينكاوة) كلما استطاع محرك البحث جلب نتائج دقيقة وغير مكررة.
            </p>
          </div>

          {/* Step 2 */}
          <div className="guide-step-card">
            <h4 className="guide-step-title color-emerald">
              2. اختيار الكلمات المفتاحية والأنشطة التجارية
            </h4>
            <p className="guide-step-desc">
              استعن بمكتبة الكلمات المفتاحية المصنفة حسب القطاعات (عيادات، مطاعم، صيدليات، متاجر، سيارات، مقاولات). يمكنك إضافة كلمات مفتاحية مخصصة بكل سهولة سطر بسطر.
            </p>
          </div>

          {/* Step 3 */}
          <div className="guide-step-card">
            <h4 className="guide-step-title color-whatsapp">
              3. صياغة وتخصيص رسائل واتساب الذكية
            </h4>
            <p className="guide-step-desc">
              استخدم المتغيرات مثل <code>{'{اسم_النشاط}'}</code> و <code>{'{المنطقة}'}</code> و <code>{'{التصنيف}'}</code>. عند النقر على زر واتساب، يقوم النظام بتعويض بيانات كل محل تلقائياً وفتح نافذة المراسلة مباشرة بعرض تطبيق التسوق الشهري.
            </p>
          </div>

          {/* Step 4 */}
          <div className="guide-step-card">
            <h4 className="guide-step-title color-gold">
              4. تصدير جهات الاتصال إلى الهاتف بنقرة واحدة (vCard)
            </h4>
            <p className="guide-step-desc">
              قم بتنزيل ملف <strong>vCard (.vcf)</strong> وافتحه على هاتفك (آيفون أو أندرويد). سيقوم الهاتف بإضافة كافة الشركات كجهات اتصال دفعة واحدة، مما يتيح لك رؤيتها مباشرة في واتساب وإنشاء قوائم رسائل موجهة بسهولة.
            </p>
          </div>

          {/* Golden Rules */}
          <div className="guide-alert-card">
            <h4 className="guide-alert-title">
              ⚠️ نصائح هامة للمراسلة الآمنة عبر واتساب:
            </h4>
            <ul style={{ paddingRight: '22px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <li className="guide-alert-item">تجنب إرسال مئات الرسائل العشوائية دفعة واحدة لتفادي الإبلاغ وحظر الرقم.</li>
              <li className="guide-alert-item">اجعل رسالتك مهنية وشخصية ومفيدة لصاحب العمل.</li>
              <li className="guide-alert-item">استخدم "مسار المراسلة السريع" للمراسلة المتتابعة الفردية بمعدل فاصل 20-30 ثانية بين كل محادثة.</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div
          className="guide-modal-header"
          style={{
            padding: '16px 26px',
            textAlign: 'left',
          }}
        >
          <button type="button" className="btn-primary" onClick={onClose} style={{ padding: '10px 26px', fontSize: '0.94rem' }}>
            فهمت، حسناً
          </button>
        </div>
      </div>
    </div>
  );
}
