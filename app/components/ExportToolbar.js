'use client';
import { useState } from 'react';

export default function ExportToolbar({ records, selectedIds, currentGovName }) {
  const [copiedNumbers, setCopiedNumbers] = useState(false);
  const [customPrefix, setCustomPrefix] = useState('iraq_radar');

  // السجلات المستهدفة بالتصدير
  const targetRecords = selectedIds.length > 0
    ? records.filter((r) => selectedIds.includes(r.id))
    : records;

  // توليد طابع زمني دقيق بصيغة YYYY-MM-DD_HH-mm-ss
  function getFormattedTimestamp() {
    const now = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    const year = now.getFullYear();
    const month = pad(now.getMonth() + 1);
    const day = pad(now.getDate());
    const hours = pad(now.getHours());
    const minutes = pad(now.getMinutes());
    const seconds = pad(now.getSeconds());
    return `${year}-${month}-${day}_${hours}-${minutes}-${seconds}`;
  }

  // بناء اسم الملف بناءً على البادئة المخصصة ونوع الملف والطابع الزمني
  function buildExportFileName(type, extension) {
    const cleanPrefix = (customPrefix.trim() || 'iraq_radar').replace(/[^a-zA-Z0-9_\u0600-\u06FF-]/g, '_');
    const timestamp = getFormattedTimestamp();
    return `${cleanPrefix}_${type}_${timestamp}.${extension}`;
  }

  // 1. تصدير Excel CSV متوافق 100% مع اللغة العربية بفضل UTF-8 BOM
  function exportCSV() {
    if (!targetRecords.length) return;

    const headers = [
      'اسم النشاط',
      'التصنيف',
      'رقم الهاتف',
      'رقم واتساب الدولي',
      'الشبكة المرجحة',
      'التقييم',
      'عدد التقييمات',
      'العنوان الكامل',
      'رابط خرائط جوجل',
      'الموقع الإلكتروني',
    ];

    const escapeCsv = (str) => {
      if (!str) return '""';
      const clean = String(str).replace(/"/g, '""');
      return `"${clean}"`;
    };

    const rows = targetRecords.map((r) => [
      escapeCsv(r.name),
      escapeCsv(r.category),
      escapeCsv(r.phone),
      escapeCsv(r.waPhone ? `+${r.waPhone}` : ''),
      escapeCsv(r.operator?.name || ''),
      escapeCsv(r.rating || ''),
      escapeCsv(r.userRatingCount || 0),
      escapeCsv(r.address),
      escapeCsv(r.mapsUrl),
      escapeCsv(r.website || ''),
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((row) => row.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = buildExportFileName('places', 'csv');
    link.click();
    URL.revokeObjectURL(url);
  }

  // 2. تصدير JSON
  function exportJSON() {
    if (!targetRecords.length) return;
    const jsonContent = JSON.stringify(targetRecords, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = buildExportFileName('database', 'json');
    link.click();
    URL.revokeObjectURL(url);
  }

  // 3. تصدير vCard (.vcf)
  function exportVCard() {
    if (!targetRecords.length) return;

    let vcf = '';
    targetRecords.forEach((r) => {
      if (!r.phone) return;
      const cleanPhone = r.phone.replace(/[^0-9+]/g, '');
      vcf += 'BEGIN:VCARD\r\n';
      vcf += 'VERSION:3.0\r\n';
      vcf += `FN;CHARSET=UTF-8:${r.name}\r\n`;
      vcf += `ORG;CHARSET=UTF-8:${r.category || 'نشاط تجاري'}\r\n`;
      vcf += `TEL;TYPE=CELL,VOICE:${cleanPhone}\r\n`;
      if (r.address) vcf += `ADR;TYPE=WORK;CHARSET=UTF-8:;;${r.address};;;;\r\n`;
      if (r.website) vcf += `URL:${r.website}\r\n`;
      vcf += `NOTE;CHARSET=UTF-8:مستخرج عبر رادار العراق للأعمال - تقييم ${r.rating || '-'}\r\n`;
      vcf += 'END:VCARD\r\n';
    });

    const blob = new Blob([vcf], { type: 'text/vcard;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = buildExportFileName('contacts', 'vcf');
    link.click();
    URL.revokeObjectURL(url);
  }

  // 4. تصدير ملف نصي للأرقام (.txt)
  function exportTXT() {
    if (!targetRecords.length) return;
    const numbers = targetRecords
      .map((r) => r.phone)
      .filter(Boolean)
      .join('\r\n');
    const blob = new Blob([numbers], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = buildExportFileName('phones', 'txt');
    link.click();
    URL.revokeObjectURL(url);
  }

  // 5. نسخ الأرقام فقط
  function copyNumbersList() {
    if (!targetRecords.length) return;
    const numbers = targetRecords
      .map((r) => r.phone)
      .filter(Boolean)
      .join('\n');
    navigator.clipboard.writeText(numbers);
    setCopiedNumbers(true);
    setTimeout(() => setCopiedNumbers(false), 2000);
  }

  const exportCount = targetRecords.length;

  return (
    <div
      className="export-toolbar-box"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
        padding: '20px 24px',
        borderRadius: 'var(--radius-lg)',
        margin: '22px 0',
      }}
    >
      {/* Top Header Row */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '1.5rem' }}>💾</span>
          <div>
            <strong style={{ fontSize: '1.05rem', color: 'var(--text-main)', fontWeight: 900, display: 'block' }}>
              أدوات التصدير والحفظ الذكي ({exportCount} سجل جاهز)
            </strong>
            {selectedIds.length > 0 ? (
              <span style={{ fontSize: '0.82rem', color: 'var(--primary)', fontWeight: 800 }}>
                (تم تحديد {selectedIds.length} سجلاً مخصصاً للتصدير)
              </span>
            ) : (
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700 }}>
                تصدير فوري مع بادئة مخصصة وطابع زمني دقيق لكافة الصيغ
              </span>
            )}
          </div>
        </div>

        {/* Dynamic Prefix Settings Input */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <label style={{ fontSize: '0.82rem', fontWeight: 900, color: 'var(--text-main)' }}>
            🏷️ بادئة الملف (Prefix):
          </label>
          <input
            type="text"
            className="custom-input"
            value={customPrefix}
            onChange={(e) => setCustomPrefix(e.target.value)}
            placeholder="iraq_radar"
            style={{ width: '160px', padding: '6px 12px', fontSize: '0.84rem', fontWeight: 800 }}
            title="حدد بادئة اسم الملف المُصدر"
          />
        </div>
      </div>

      {/* Buttons and Live Filename Preview Row */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '12px', paddingTop: '10px', borderTop: '1px solid var(--border-subtle)' }}>
        {/* Export Buttons */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
          {/* Excel CSV */}
          <button
            type="button"
            onClick={exportCSV}
            disabled={!exportCount}
            className="btn-secondary"
            style={{ fontSize: '0.86rem', padding: '9px 16px', fontWeight: 900 }}
            title="تصدير ملف Excel مع دعم تام للأحرف العربية"
          >
            <span>📊 تصدير Excel (CSV)</span>
          </button>

          {/* JSON */}
          <button
            type="button"
            onClick={exportJSON}
            disabled={!exportCount}
            className="btn-secondary"
            style={{ fontSize: '0.86rem', padding: '9px 16px', fontWeight: 900 }}
            title="تصدير قاعدة بيانات JSON كاملة"
          >
            <span>📁 تصدير JSON</span>
          </button>

          {/* vCard */}
          <button
            type="button"
            onClick={exportVCard}
            disabled={!exportCount}
            className="btn-secondary"
            style={{ fontSize: '0.86rem', padding: '9px 16px', fontWeight: 900 }}
            title="تصدير جهات اتصال هاتفية vCard لإضافتها إلى الهاتف بنقرة واحدة"
          >
            <span>📇 جهات اتصال هاتف (.vcf)</span>
          </button>

          {/* TXT Phones */}
          <button
            type="button"
            onClick={exportTXT}
            disabled={!exportCount}
            className="btn-secondary"
            style={{ fontSize: '0.86rem', padding: '9px 16px', fontWeight: 900 }}
            title="تصدير أرقام الهواتف فقط كملف نصي .txt"
          >
            <span>📄 قائمة هواتف (.txt)</span>
          </button>

          {/* Copy Phone Numbers */}
          <button
            type="button"
            onClick={copyNumbersList}
            disabled={!exportCount}
            className="btn-secondary"
            style={{ fontSize: '0.86rem', padding: '9px 16px', fontWeight: 900 }}
            title="نسخ جميع أرقام الهواتف كقائمة إلى الحافظة"
          >
            <span>{copiedNumbers ? '✓ تم نسخ الأرقام' : '📋 نسخ الأرقام'}</span>
          </button>
        </div>

        {/* Live File Name Pattern Indicator */}
        <span
          style={{
            fontSize: '0.76rem',
            fontWeight: 800,
            color: 'var(--text-muted)',
            direction: 'ltr',
            fontFamily: 'monospace',
            background: 'var(--bg-surface)',
            padding: '5px 10px',
            borderRadius: '6px',
            border: '1px solid var(--border-subtle)',
          }}
          title="صيغة اسم الملف التلقائية التي تشمل البادئة والوقت والتاريخ بالثواني"
        >
          {customPrefix || 'iraq_radar'}_[type]_YYYY-MM-DD_HH-mm-ss.*
        </span>
      </div>
    </div>
  );
}
