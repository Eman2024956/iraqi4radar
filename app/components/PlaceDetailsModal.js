'use client';
import { useState, useEffect } from 'react';

export default function PlaceDetailsModal({
  isOpen,
  onClose,
  place,
}) {
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [deepDetails, setDeepDetails] = useState(null);
  const [fetchError, setFetchError] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen && place) {
      setDeepDetails(null);
      setFetchError('');
      // إذا كان المكان من OpenStreetMap ومعه osmId، نقوم تلقائياً بجلب التفاصيل العميقة
      if (place.engine === 'osm' && place.osmId) {
        fetchOsmDetails(place.osmId, place.osmType || 'N');
      }
    }
  }, [isOpen, place]);

  async function fetchOsmDetails(osmId, osmType) {
    setLoadingDetails(true);
    setFetchError('');
    try {
      const res = await fetch('/api/osm-details', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ osmId, osmType }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || 'تعذر جلب تفاصيل إضافية من OpenStreetMap');
      }
      setDeepDetails(data);
    } catch (err) {
      console.error('Error loading OSM details:', err);
      setFetchError(err.message);
    } finally {
      setLoadingDetails(false);
    }
  }

  if (!isOpen || !place) return null;

  const isOsm = place.engine === 'osm';
  const phone = deepDetails?.contacts?.phone || place.phone;
  const email = deepDetails?.contacts?.email;
  const website = deepDetails?.contacts?.website || place.website;
  const openingHours = deepDetails?.businessInfo?.openingHours;
  const brand = deepDetails?.businessInfo?.brand;
  const operatorName = deepDetails?.businessInfo?.operator || place.operator?.name;
  const nameAr = deepDetails?.names?.ar || place.name;
  const nameEn = deepDetails?.names?.en;
  const nameKu = deepDetails?.names?.ku;

  function copyAllDetails() {
    const text = [
      `الاسم: ${place.name}`,
      phone ? `الهاتف: ${phone}` : '',
      email ? `البريد: ${email}` : '',
      `التصنيف: ${place.category}`,
      `العنوان: ${place.address}`,
      place.location ? `الإحداثيات: ${place.location.latitude}, ${place.location.longitude}` : '',
      place.mapsUrl ? `رابط الخريطة المعتمدة: ${place.mapsUrl}` : '',
      place.osmUrl ? `رابط الخريطة المفتوحة: ${place.osmUrl}` : '',
    ]
      .filter(Boolean)
      .join('\n');

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-box"
        style={{ maxWidth: '780px', width: '95%', maxHeight: '90vh', overflowY: 'auto' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="modal-header"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid var(--border-subtle)',
            paddingBottom: '16px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '1.8rem' }}>{isOsm ? '🗺️' : '🌐'}</span>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--text-main)', margin: 0 }}>
                  {place.name}
                </h2>
                {isOsm ? (
                  <span className="engine-badge osm">سجل جغرافي موثق</span>
                ) : (
                  <span className="engine-badge google">سجل تجاري معتمد</span>
                )}
              </div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700 }}>
                {place.category} • {place.extractedArea || ''} {place.extractedGov || ''}
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

        {/* Loading Indicator */}
        {loadingDetails && (
          <div
            style={{
              padding: '12px 16px',
              margin: '16px 0',
              background: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid var(--primary)',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.85rem',
              fontWeight: 800,
              color: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            <span className="animate-spin">⏳</span>
            <span>جارٍ فحص واستخراج التفاصيل والبيانات التكميلية للسجل...</span>
          </div>
        )}

        {fetchError && (
          <div
            style={{
              padding: '10px 14px',
              margin: '14px 0',
              background: 'var(--danger-light)',
              border: '1px solid var(--danger)',
              borderRadius: 'var(--radius-md)',
              color: '#fca5a5',
              fontSize: '0.82rem',
              fontWeight: 800,
            }}
          >
            ⚠️ {fetchError}
          </div>
        )}

        {/* Names in Other Languages (OSM Feature) */}
        {(nameEn || nameKu) && (
          <div
            style={{
              margin: '16px 0',
              padding: '12px 16px',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              gap: '14px',
              flexWrap: 'wrap',
            }}
          >
            {nameEn && (
              <div>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 800 }}>الاسم بالإنجليزية: </span>
                <strong style={{ fontSize: '0.86rem', color: 'var(--text-main)', direction: 'ltr' }}>{nameEn}</strong>
              </div>
            )}
            {nameKu && (
              <div>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 800 }}>الاسم بالكردية: </span>
                <strong style={{ fontSize: '0.86rem', color: 'var(--text-main)' }}>{nameKu}</strong>
              </div>
            )}
          </div>
        )}

        {/* Details Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '14px',
            marginTop: '16px',
          }}
        >
          {/* Phone */}
          <div style={{ padding: '14px', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 800, display: 'block' }}>رقم الهاتف والاتصال</span>
            <strong style={{ fontSize: '1.05rem', color: phone ? 'var(--text-main)' : 'var(--text-dim)', fontWeight: 900, direction: 'ltr', display: 'block', marginTop: '4px' }}>
              {phone || 'غير مسجل'}
            </strong>
            {place.operator && (
              <span style={{ fontSize: '0.74rem', color: place.operator.color, fontWeight: 800 }}>
                {place.operator.name}
              </span>
            )}
          </div>

          {/* Email */}
          <div style={{ padding: '14px', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 800, display: 'block' }}>البريد الإلكتروني (Email)</span>
            <strong style={{ fontSize: '0.9rem', color: email ? 'var(--primary)' : 'var(--text-dim)', fontWeight: 800, direction: 'ltr', display: 'block', marginTop: '4px' }}>
              {email ? <a href={`mailto:${email}`} style={{ color: 'inherit' }}>{email}</a> : 'غير متوفر'}
            </strong>
          </div>

          {/* Working Hours */}
          <div style={{ padding: '14px', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 800, display: 'block' }}>ساعات العمل (Opening Hours)</span>
            <strong style={{ fontSize: '0.86rem', color: 'var(--text-main)', fontWeight: 800, display: 'block', marginTop: '4px', direction: 'ltr' }}>
              {openingHours || (place.isOpenNow ? 'مفتوح للزبائن' : 'غير محددة في السجل')}
            </strong>
          </div>

          {/* Website */}
          <div style={{ padding: '14px', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 800, display: 'block' }}>الموقع الإلكتروني</span>
            <span style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 800, display: 'block', marginTop: '4px' }}>
              {website ? (
                <a href={website} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)', textDecoration: 'underline' }}>
                  زيارة الموقع ↗
                </a>
              ) : (
                <span style={{ color: 'var(--text-dim)' }}>غير مدرج</span>
              )}
            </span>
          </div>
        </div>

        {/* Address and Location Section */}
        <div
          style={{
            marginTop: '16px',
            padding: '16px',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
          }}
        >
          <strong style={{ fontSize: '0.92rem', color: 'var(--text-main)', fontWeight: 900, display: 'block', marginBottom: '6px' }}>
            📍 العنوان والموقع الجغرافي:
          </strong>
          <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', fontWeight: 700, margin: '0 0 10px 0', lineHeight: 1.5 }}>
            {place.address}
          </p>
          {place.location && (
            <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', fontFamily: 'monospace', direction: 'ltr' }}>
              Coordinates: {place.location.latitude}, {place.location.longitude}
            </div>
          )}
        </div>

        {/* Raw OSM Tags Table (Deep Inspection) */}
        {isOsm && (deepDetails?.allTags || place.rawTags) && (
          <div style={{ marginTop: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <strong style={{ fontSize: '0.92rem', color: 'var(--text-main)', fontWeight: 900 }}>
                🏷️ البيانات والتصنيفات الجغرافية الموثقة:
              </strong>
              {place.osmId && (
                <button
                  type="button"
                  onClick={() => fetchOsmDetails(place.osmId, place.osmType || 'N')}
                  className="btn-secondary"
                  style={{ padding: '4px 10px', fontSize: '0.76rem', fontWeight: 800 }}
                  title="تحديث البيانات الجغرافية مباشرة"
                >
                  🔄 تحديث البيانات
                </button>
              )}
            </div>

            <div
              style={{
                maxHeight: '200px',
                overflowY: 'auto',
                background: 'var(--bg-card)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '8px 12px',
                fontSize: '0.78rem',
              }}
            >
              <table style={{ width: '100%', borderCollapse: 'collapse', direction: 'rtl', textAlign: 'right' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
                    <th style={{ padding: '6px 8px' }}>المعيار الجغرافي</th>
                    <th style={{ padding: '6px 8px' }}>القيمة والبيان</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries({ ...(place.rawTags || {}), ...(deepDetails?.allTags || {}) }).map(([k, v]) => (
                    <tr key={k} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                      <td style={{ padding: '5px 8px', color: '#38bdf8', fontFamily: 'monospace', direction: 'ltr', textAlign: 'left' }}>{k}</td>
                      <td style={{ padding: '5px 8px', color: 'var(--text-main)', wordBreak: 'break-all' }}>{String(v)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Action Buttons Row */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '10px',
            marginTop: '22px',
            paddingTop: '16px',
            borderTop: '1px solid var(--border-subtle)',
          }}
        >
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {place.waPhone && (
              <a
                href={`https://wa.me/${place.waPhone}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-whatsapp"
                style={{ padding: '8px 16px', fontSize: '0.86rem', fontWeight: 900, textDecoration: 'none' }}
              >
                💬 فتح واتساب
              </a>
            )}

            {place.mapsUrl && (
              <a
                href={place.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary"
                style={{ padding: '8px 14px', fontSize: '0.84rem', fontWeight: 800, textDecoration: 'none' }}
              >
                🗺️ الخريطة المعتمدة
              </a>
            )}

            {(deepDetails?.links?.osm || place.osmUrl) && (
              <a
                href={deepDetails?.links?.osm || place.osmUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary"
                style={{ padding: '8px 14px', fontSize: '0.84rem', fontWeight: 800, textDecoration: 'none' }}
              >
                🌐 الخريطة المفتوحة ↗
              </a>
            )}
          </div>

          <button
            type="button"
            onClick={copyAllDetails}
            className="btn-secondary"
            style={{ padding: '8px 14px', fontSize: '0.84rem', fontWeight: 900 }}
          >
            {copied ? '✓ تم النسخ بنجاح' : '📋 نسخ كامل التفاصيل'}
          </button>
        </div>
      </div>
    </div>
  );
}
