'use client';
import { useState, useRef } from 'react';
import { WHATSAPP_TEMPLATES } from '../data/iraqData';

export default function WhatsAppStudio({
  messageTemplate,
  setMessageTemplate,
  samplePlace,
  onLaunchMessenger,
  totalRecords,
}) {
  const [selectedTemplateId, setSelectedTemplateId] = useState(WHATSAPP_TEMPLATES[0].id);
  const [mockupMode, setMockupMode] = useState('light'); // 'light' by default to remove black background
  const textareaRef = useRef(null);

  const AVAILABLE_TAGS = [
    { tag: '{اسم_النشاط}', label: 'اسم النشاط' },
    { tag: '{المدينة}', label: 'المدينة' },
    { tag: '{المنطقة}', label: 'المنطقة' },
    { tag: '{التصنيف}', label: 'التصنيف' },
    { tag: '{رقم_الهاتف}', label: 'رقم الهاتف' },
    { tag: '{التقييم}', label: 'التقييم' },
    { tag: '{العنوان}', label: 'العنوان' },
  ];

  function handleSelectPresetTemplate(template) {
    setSelectedTemplateId(template.id);
    setMessageTemplate(template.body);
  }

  function insertTag(tag) {
    if (!textareaRef.current) {
      setMessageTemplate((prev) => prev + ' ' + tag);
      return;
    }
    const start = textareaRef.current.selectionStart;
    const end = textareaRef.current.selectionEnd;
    const current = messageTemplate;
    const updated = current.substring(0, start) + tag + current.substring(end);
    setMessageTemplate(updated);
    setTimeout(() => {
      textareaRef.current.focus();
      textareaRef.current.setSelectionRange(start + tag.length, start + tag.length);
    }, 50);
  }

  // معاينة الرسالة بعد تعويض الحقول بنشاط تسوق نموذجي
  const previewPlace = samplePlace || {
    name: 'متجر وسوبرماركت النخبة',
    category: 'متجر تسوق وتجزئة',
    city: 'بغداد',
    area: 'المنصور',
    phone: '0770 123 4567',
    rating: 4.8,
    address: 'شارع 14 رمضان، المنصور، بغداد',
  };

  function renderPreviewText() {
    let text = messageTemplate;
    text = text.replace(/{اسم_النشاط}/g, previewPlace.name || 'النشاط');
    text = text.replace(/{المدينة}/g, previewPlace.city || 'العراق');
    text = text.replace(/{المنطقة}/g, previewPlace.area || 'المنطقة');
    text = text.replace(/{التصنيف}/g, previewPlace.category || 'متجر تسوق');
    text = text.replace(/{رقم_الهاتف}/g, previewPlace.phone || '07XXXXXXXX');
    text = text.replace(/{التقييم}/g, previewPlace.rating ? `${previewPlace.rating} ⭐` : 'ممتاز');
    text = text.replace(/{العنوان}/g, previewPlace.address || '');
    return text;
  }

  const previewText = renderPreviewText();

  return (
    <div className="whatsapp-studio-panel">
      {/* Panel Header */}
      <div className="panel-header" style={{ borderColor: 'rgba(37, 211, 102, 0.35)', paddingBottom: '16px' }}>
        <div className="panel-title-wrap">
          <div
            className="panel-icon-circle"
            style={{
              background: 'rgba(37, 211, 102, 0.25)',
              color: '#25D366',
              border: '1.5px solid #25D366',
              boxShadow: '0 0 15px rgba(37, 211, 102, 0.35)',
            }}
          >
            💬
          </div>
          <div>
            <h3 className="wa-studio-title">
              استوديو رسائل واتساب الذكي (عروض تطبيقات التسوق بالإيجار الشهري)
            </h3>
            <p className="wa-studio-subtitle">
              قوالب جاهزة ومخصصة لعرض تصميم تطبيقات التسوق الإلكتروني لكافة الأنشطة في العراق بنظام الإيجار الشهري
            </p>
          </div>
        </div>

        {totalRecords > 0 && (
          <button
            type="button"
            className="btn-whatsapp"
            onClick={onLaunchMessenger}
            style={{ padding: '10px 18px', fontSize: '0.92rem' }}
          >
            <span>⚡ بدء مسار المراسلة السريعة ({totalRecords})</span>
          </button>
        )}
      </div>

      <div className="wa-grid">
        {/* Left Column: Editor & Templates */}
        <div>
          {/* Preset templates selector */}
          <div className="wa-section-heading">
            <span>📋</span>
            <span>اختر قالب عرض تطبيق التسوق الشهري:</span>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
              gap: '10px',
              marginBottom: '18px',
            }}
          >
            {WHATSAPP_TEMPLATES.map((tmpl) => {
              const isSelected = tmpl.id === selectedTemplateId;
              return (
                <div
                  key={tmpl.id}
                  className={`wa-tmpl-pill ${isSelected ? 'active' : ''}`}
                  onClick={() => handleSelectPresetTemplate(tmpl)}
                >
                  <strong className="wa-tmpl-title">
                    {tmpl.title}
                  </strong>
                  <span className="wa-tmpl-desc">
                    {tmpl.description}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Dynamic Placeholder Tags Toolbar */}
          <div className="wa-section-heading">
            <span>🏷️</span>
            <span>انقر لإدراج الحقل الديناميكي في نص الرسالة:</span>
          </div>

          <div className="wa-tags-row">
            {AVAILABLE_TAGS.map((t) => (
              <span
                key={t.tag}
                className="wa-tag-pill"
                onClick={() => insertTag(t.tag)}
                title={`إدراج حقل ${t.label}`}
              >
                <span>+ {t.label}</span>
                <code className="wa-tag-code">{t.tag}</code>
              </span>
            ))}
          </div>

          {/* Template Textarea */}
          <div className="form-group" style={{ marginTop: '12px' }}>
            <textarea
              ref={textareaRef}
              className="custom-textarea"
              style={{
                minHeight: '200px',
                fontSize: '0.94rem',
                border: '2px solid rgba(37, 211, 102, 0.35)',
              }}
              value={messageTemplate}
              onChange={(e) => setMessageTemplate(e.target.value)}
              placeholder="اكتب صيغة رسالة واتساب هنا مع استخدام المتغيرات مثل {اسم_النشاط}..."
            />
          </div>
        </div>

        {/* Right Column: Live Mobile WhatsApp Chat Preview */}
        <div>
          <div className="wa-section-heading" style={{ justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>📱</span>
              <span>معاينة حية للرسالة كما ستظهر على واتساب:</span>
            </div>
            <span
              style={{
                fontSize: '0.76rem',
                fontWeight: 800,
                color: '#047857',
                background: '#d1fae5',
                padding: '2px 10px',
                borderRadius: '999px',
                border: '1px solid #86efac',
              }}
            >
              نشاط المعاينة: {previewPlace.name}
            </span>
          </div>

          {/* The authentic light-styled WhatsApp preview mockup (no black background) */}
          <div className={`wa-preview-mockup ${mockupMode === 'light' ? 'light-mockup' : ''}`}>
            <div className="wa-mockup-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div className="wa-avatar">
                  {previewPlace.name ? previewPlace.name.charAt(0) : 'م'}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span className="wa-contact-name">
                    {previewPlace.name}
                  </span>
                  <span className="wa-contact-status">
                    {previewPlace.phone || 'متصل الآن'} • {previewPlace.category}
                  </span>
                </div>
              </div>

              {/* Quick toggle for WhatsApp preview appearance */}
              <button
                type="button"
                onClick={() => setMockupMode(mockupMode === 'light' ? 'dark' : 'light')}
                style={{
                  padding: '4px 10px',
                  fontSize: '0.74rem',
                  fontWeight: 800,
                  background: mockupMode === 'light' ? '#ffffff' : 'rgba(255,255,255,0.12)',
                  border: mockupMode === 'light' ? '1.5px solid #cbd5e1' : '1px solid rgba(255,255,255,0.25)',
                  borderRadius: '8px',
                  color: mockupMode === 'light' ? '#0f172a' : '#ffffff',
                  cursor: 'pointer',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
                }}
                title="التبديل بين مظهر واتساب الفاتح والداكن للمعاينة"
              >
                {mockupMode === 'light' ? '☀️ واتساب فاتح' : '🌙 واتساب ليلي'}
              </button>
            </div>

            <div className="wa-bubble-sent">
              {previewText}
              <span className="wa-bubble-time">
                12:45 م ✓✓
              </span>
            </div>
          </div>

          {/* Tips note with bold high contrast */}
          <div className="wa-tip-box">
            💡 <strong>ميزة الإرسال الذكي:</strong> عند النقر على زر <strong>واتساب</strong> في أي بطاقة نشاط، سيتم فتح محادثة رسمية مع صاحب العمل وتعبئة هذا العرض فورياً باسم محله وموقعه لتقديم عرض تطبيق التسوق الشهري بنقرة واحدة!
          </div>
        </div>
      </div>
    </div>
  );
}
