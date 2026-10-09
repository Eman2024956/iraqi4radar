'use client';
import { useState } from 'react';

export default function BusinessCard({
  place,
  messageTemplate,
  city,
  area,
  isSelected,
  onToggleSelect,
  isSent,
  onMarkSent,
}) {
  const [copied, setCopied] = useState(false);

  // توليد نص الرسالة المخصص لهذا النشاط
  function generateMessageText() {
    let text = messageTemplate;
    text = text.replace(/{اسم_النشاط}/g, place.name || '');
    text = text.replace(/{المدينة}/g, city || 'العراق');
    text = text.replace(/{المنطقة}/g, area || '');
    text = text.replace(/{التصنيف}/g, place.category || '');
    text = text.replace(/{رقم_الهاتف}/g, place.phone || '');
    text = text.replace(/{التقييم}/g, place.rating ? `${place.rating} ⭐` : '');
    text = text.replace(/{العنوان}/g, place.address || '');
    return text;
  }

  // رابط واتساب wa.me المباشر
  const waUrl = place.waPhone
    ? `https://wa.me/${place.waPhone}?text=${encodeURIComponent(generateMessageText())}`
    : null;

  function handleCopyDetails() {
    const textToCopy = `${place.name}\nالهاتف: ${place.phone}\nالتصنيف: ${place.category}\nالعنوان: ${place.address}\nخرائط: ${place.mapsUrl}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleOpenWhatsApp() {
    if (onMarkSent) onMarkSent(place.id);
  }

  return (
    <div
      className="business-card"
      style={{
        borderTop: isSent ? '3px solid var(--whatsapp)' : undefined,
      }}
    >
      {/* Top Header */}
      <div>
        <div className="card-top">
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => onToggleSelect(place.id)}
              style={{ width: '18px', height: '18px', marginTop: '3px', cursor: 'pointer', accentColor: 'var(--primary)' }}
              title="تحديد هذا النشاط"
            />
            <div>
              <h4 className="card-title">{place.name}</h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '4px' }}>
                <span className="card-category-badge">🏷️ {place.category}</span>
                {place.engine === 'osm' ? (
                  <span className="engine-badge osm" title="مصدر البيانات: OpenStreetMap (مجاني)">🗺️ OSM</span>
                ) : (
                  <span className="engine-badge google" title="مصدر البيانات: Google Maps Places API">🌐 Google</span>
                )}
                {place.isOpenNow !== null && (
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '2px 8px',
                      borderRadius: 'var(--radius-full)',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      background: place.isOpenNow ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                      color: place.isOpenNow ? '#10b981' : '#f87171',
                    }}
                  >
                    {place.isOpenNow ? '🟢 مفتوح الآن' : '🔴 مغلق حالياً'}
                  </span>
                )}
                {isSent && (
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '2px 8px',
                      borderRadius: 'var(--radius-full)',
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      background: 'rgba(37, 211, 102, 0.2)',
                      color: '#25D366',
                    }}
                  >
                    ✓ تمت المراسلة
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Rating Badge */}
          {place.rating !== null && (
            <div className="card-rating-badge" title={`تقييم ${place.rating} من 5 بناء على ${place.userRatingCount} مراجعة`}>
              <span>⭐</span>
              <span>{place.rating.toFixed(1)}</span>
              {place.userRatingCount > 0 && (
                <span style={{ fontSize: '0.7rem', opacity: 0.85 }}>({place.userRatingCount})</span>
              )}
            </div>
          )}
        </div>

        {/* Phone Section with Operator Badge */}
        <div style={{ margin: '10px 0' }}>
          <div className="phone-badge-wrapper">
            <span style={{ fontSize: '1.1rem' }}>📱</span>
            <span className="phone-digits">{place.phone}</span>
            {place.operator && (
              <span
                className="operator-badge"
                style={{ backgroundColor: place.operator.color }}
                title={`الشبكة المرجحة: ${place.operator.name}`}
              >
                {place.operator.name}
              </span>
            )}
          </div>
        </div>

        {/* Address */}
        <div className="card-info-list">
          <div className="card-info-item">
            <span className="icon">📍</span>
            <span style={{ fontSize: '0.82rem', lineHeight: 1.5 }}>{place.address}</span>
          </div>

          {place.website && (
            <div className="card-info-item">
              <span className="icon">🌐</span>
              <a
                href={place.website}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  fontSize: '0.8rem',
                  color: 'var(--primary)',
                  textDecoration: 'none',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  maxWidth: '240px',
                }}
              >
                {place.website.replace(/^https?:\/\//, '')}
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Card Actions Footer */}
      <div className="card-actions-row">
        {/* Direct WhatsApp Button */}
        {waUrl ? (
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleOpenWhatsApp}
            className="btn-whatsapp"
            style={{ flex: '1 1 auto' }}
          >
            <span>💬 واتساب</span>
          </a>
        ) : (
          <span
            style={{
              fontSize: '0.75rem',
              color: 'var(--text-dim)',
              padding: '6px 10px',
              background: 'var(--bg-surface)',
              borderRadius: 'var(--radius-md)',
            }}
          >
            لا يوجد هاتف متاح
          </span>
        )}

        {/* Maps Location Link */}
        {place.mapsUrl && (
          <a
            href={place.mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary"
            style={{ padding: '7px 12px', fontSize: '0.8rem' }}
            title="عرض موقع النشاط على الخريطة"
          >
            🗺️ الخريطة
          </a>
        )}

        {/* Direct Phone Call */}
        {place.phone && (
          <a
            href={`tel:${place.phone.replace(/[^0-9+]/g, '')}`}
            className="btn-secondary"
            style={{ padding: '7px 10px', fontSize: '0.8rem' }}
            title="اتصال هاتفي"
          >
            📞
          </a>
        )}

        {/* Copy Details */}
        <button
          type="button"
          onClick={handleCopyDetails}
          className="btn-secondary"
          style={{ padding: '7px 10px', fontSize: '0.8rem' }}
          title="نسخ تفاصيل النشاط"
        >
          {copied ? '✓' : '📋'}
        </button>
      </div>
    </div>
  );
}
