'use client';
import { useState } from 'react';

export default function QuickMessengerModal({
  isOpen,
  onClose,
  records,
  messageTemplate,
  city,
  sentMap,
  onMarkSent,
}) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!isOpen || !records.length) return null;

  const validRecords = records.filter((r) => r.phone);
  const currentPlace = validRecords[currentIndex] || validRecords[0];

  function generateMessage(place) {
    let text = messageTemplate;
    text = text.replace(/{اسم_النشاط}/g, place.name || '');
    text = text.replace(/{المدينة}/g, city || 'العراق');
    text = text.replace(/{المنطقة}/g, place.querySource || '');
    text = text.replace(/{التصنيف}/g, place.category || '');
    text = text.replace(/{رقم_الهاتف}/g, place.phone || '');
    text = text.replace(/{التقييم}/g, place.rating ? `${place.rating} ⭐` : '');
    text = text.replace(/{العنوان}/g, place.address || '');
    return text;
  }

  const messageText = generateMessage(currentPlace);
  const waUrl = currentPlace.waPhone
    ? `https://wa.me/${currentPlace.waPhone}?text=${encodeURIComponent(messageText)}`
    : null;

  const isSent = Boolean(sentMap[currentPlace.id]);

  function handleSendAndNext() {
    if (waUrl) {
      window.open(waUrl, '_blank');
      onMarkSent(currentPlace.id);
    }
  }

  function handleNext() {
    if (currentIndex < validRecords.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  }

  function handlePrev() {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  }

  const sentCount = Object.keys(sentMap).length;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(8px)',
        zIndex: 999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
    >
      <div
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-card)',
          borderRadius: 'var(--radius-lg)',
          width: '100%',
          maxWidth: '680px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 20px 50px rgba(0,0,0,0.6)',
          overflow: 'hidden',
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 20px',
            borderBottom: '1px solid var(--border-subtle)',
            background: 'var(--bg-surface)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '1.4rem' }}>⚡</span>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
                مسار المراسلة السريعة عبر واتساب
              </h3>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                النشاط {currentIndex + 1} من أصل {validRecords.length} نشاط مؤهل
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span
              style={{
                fontSize: '0.78rem',
                padding: '4px 10px',
                borderRadius: 'var(--radius-full)',
                background: 'rgba(37, 211, 102, 0.15)',
                color: 'var(--whatsapp)',
                fontWeight: 700,
              }}
            >
              تمت مراسلة: {sentCount}
            </span>
            <button
              onClick={onClose}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                fontSize: '1.4rem',
                cursor: 'pointer',
              }}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '20px', overflowY: 'auto' }}>
          {/* Target Place Details Card */}
          <div
            style={{
              padding: '16px',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              marginBottom: '16px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
              <h4 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                {currentPlace.name}
              </h4>
              {isSent && (
                <span
                  style={{
                    padding: '3px 8px',
                    borderRadius: 'var(--radius-full)',
                    background: 'rgba(37, 211, 102, 0.2)',
                    color: 'var(--whatsapp)',
                    fontSize: '0.75rem',
                    fontWeight: 800,
                  }}
                >
                  ✓ تمت المراسلة
                </span>
              )}
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', margin: '10px 0' }}>
              <span className="card-category-badge">🏷️ {currentPlace.category}</span>
              <span
                style={{
                  padding: '2px 8px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  color: '#ffffff',
                  backgroundColor: currentPlace.operator?.color || '#64748b',
                }}
              >
                {currentPlace.operator?.name || 'غير محدد'}
              </span>
              {currentPlace.rating && (
                <span style={{ fontSize: '0.78rem', color: 'var(--accent-gold)' }}>
                  ⭐ {currentPlace.rating} ({currentPlace.userRatingCount || 0})
                </span>
              )}
            </div>

            <div style={{ fontSize: '0.88rem', color: 'var(--text-main)', direction: 'ltr', textAlign: 'right' }}>
              📱 <strong>{currentPlace.phone}</strong>
            </div>

            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              📍 {currentPlace.address}
            </div>
          </div>

          {/* Formatted Message Preview */}
          <div style={{ marginBottom: '16px' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
              نص الرسالة التي سيتم إرسالها إلى صاحب العمل:
            </span>
            <div
              style={{
                background: '#d9fdd3',
                color: '#111b21',
                border: '1px solid #bbf7d0',
                padding: '16px',
                borderRadius: '14px',
                fontSize: '0.88rem',
                fontWeight: 600,
                lineHeight: 1.7,
                whiteSpace: 'pre-wrap',
                maxHeight: '190px',
                overflowY: 'auto',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              }}
            >
              {messageText}
            </div>
          </div>
        </div>

        {/* Modal Controls Footer */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            padding: '16px 20px',
            borderTop: '1px solid var(--border-subtle)',
            background: 'var(--bg-surface)',
          }}
        >
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              className="btn-secondary"
              onClick={handlePrev}
              disabled={currentIndex === 0}
              style={{ padding: '8px 14px', fontSize: '0.84rem' }}
            >
              ⏮️ السابق
            </button>
            <button
              type="button"
              className="btn-secondary"
              onClick={handleNext}
              disabled={currentIndex === validRecords.length - 1}
              style={{ padding: '8px 14px', fontSize: '0.84rem' }}
            >
              تخطي ⏭️
            </button>
          </div>

          <button
            type="button"
            className="btn-whatsapp"
            onClick={handleSendAndNext}
            style={{ padding: '10px 22px', fontSize: '0.92rem' }}
          >
            <span>💬 فتح وإرسال عبر واتساب</span>
          </button>
        </div>
      </div>
    </div>
  );
}
