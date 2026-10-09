'use client';
import { useState } from 'react';
import { BUSINESS_CATEGORIES } from '../data/iraqData';

export default function KeywordsStudio({
  keywordsText,
  setKeywordsText,
  onResetDefaultKeywords,
}) {
  const [activeTab, setActiveTab] = useState(BUSINESS_CATEGORIES[0].id);

  const activeCategory = BUSINESS_CATEGORIES.find((c) => c.id === activeTab) || BUSINESS_CATEGORIES[0];

  const currentLines = keywordsText
    .split('\n')
    .map((k) => k.trim())
    .filter(Boolean);

  function addKeyword(kw) {
    if (!currentLines.includes(kw)) {
      const updated = [...currentLines, kw].join('\n');
      setKeywordsText(updated);
    }
  }

  function addAllFromCurrentCategory() {
    const set = new Set([...currentLines, ...activeCategory.keywords]);
    setKeywordsText([...set].join('\n'));
  }

  function clearAllKeywords() {
    setKeywordsText('');
  }

  return (
    <div className="section-panel">
      <div className="panel-header">
        <div className="panel-title-wrap">
          <div className="panel-icon-circle">🏷️</div>
          <div>
            <h3 className="panel-title">مكتبة الكلمات المفتاحية والأنشطة</h3>
            <p className="panel-subtitle">اختر القطاع لإضافة الكلمات الأكثر بحثاً وتأثيراً في السوق</p>
          </div>
        </div>
        <span className="badge-count" title="عدد الكلمات المحددة حالياً">
          {currentLines.length} كلمة
        </span>
      </div>

      {/* Sector Category Tabs */}
      <div className="categories-tabs">
        {BUSINESS_CATEGORIES.map((cat) => {
          const isActive = cat.id === activeTab;
          return (
            <button
              key={cat.id}
              type="button"
              className={`cat-tab-btn ${isActive ? 'active' : ''}`}
              onClick={() => setActiveTab(cat.id)}
            >
              <span>{cat.icon}</span>
              <span>{cat.name}</span>
            </button>
          );
        })}
      </div>

      {/* Keywords Cloud for Selected Category */}
      <div style={{ marginBottom: '14px' }}>
        <div className="form-label">
          <span style={{ color: 'var(--text-main)', fontWeight: 800 }}>
            مقترحات قطاع <strong style={{ color: 'var(--primary)', fontSize: '1rem' }}>{activeCategory.name}</strong>:
          </span>
          <button
            type="button"
            onClick={addAllFromCurrentCategory}
            className="btn-secondary"
            style={{ padding: '4px 10px', fontSize: '0.78rem', fontWeight: 800 }}
          >
            + إضافة كافة كلمات القسم
          </button>
        </div>

        <div className="keywords-cloud">
          {activeCategory.keywords.map((kw) => {
            const isAdded = currentLines.includes(kw);
            return (
              <span
                key={kw}
                onClick={() => addKeyword(kw)}
                className={`kw-badge ${isAdded ? 'active' : ''}`}
                title={isAdded ? 'مضافة بالفعل' : 'انقر للإضافة إلى قائمة البحث'}
              >
                <span>{isAdded ? '✓' : '+'}</span>
                <span>{kw}</span>
              </span>
            );
          })}
        </div>
      </div>

      {/* Keywords Textarea Box */}
      <div className="form-group" style={{ marginBottom: 0 }}>
        <div className="form-label">
          <span style={{ color: 'var(--text-main)', fontWeight: 800 }}>الكلمات المفتاحية المعتمدة للبحث (سطر لكل كلمة):</span>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              onClick={onResetDefaultKeywords}
              className="btn-secondary"
              style={{ padding: '4px 10px', fontSize: '0.78rem', fontWeight: 800 }}
            >
              الافتراضي
            </button>
            <button
              type="button"
              onClick={clearAllKeywords}
              className="btn-secondary"
              style={{ padding: '4px 10px', fontSize: '0.78rem', fontWeight: 800 }}
            >
              تفريغ
            </button>
          </div>
        </div>
        <textarea
          className="custom-textarea"
          style={{ minHeight: '95px' }}
          value={keywordsText}
          onChange={(e) => setKeywordsText(e.target.value)}
          placeholder="اكتب كلمة البحث هنا (سطر لكل نشاط)..."
        />
      </div>
    </div>
  );
}
