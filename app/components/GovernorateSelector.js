'use client';
import { useState } from 'react';
import { IRAQ_GOVERNORATES } from '../data/iraqData';

export default function GovernorateSelector({
  selectedGov,
  setSelectedGov,
  selectedAreas,
  setSelectedAreas,
  customAreaInput,
  setCustomAreaInput,
  onAddCustomArea,
}) {
  const currentGovObj = IRAQ_GOVERNORATES.find((g) => g.id === selectedGov) || IRAQ_GOVERNORATES[0];

  function handleSelectGov(gov) {
    setSelectedGov(gov.id);
    setSelectedAreas(gov.popularAreas.slice(0, 4));
  }

  function toggleArea(area) {
    if (selectedAreas.includes(area)) {
      setSelectedAreas(selectedAreas.filter((a) => a !== area));
    } else {
      setSelectedAreas([...selectedAreas, area]);
    }
  }

  function selectAllAreas() {
    setSelectedAreas([...currentGovObj.popularAreas]);
  }

  function clearAreas() {
    setSelectedAreas([]);
  }

  return (
    <div className="section-panel">
      <div className="panel-header">
        <div className="panel-title-wrap">
          <div className="panel-icon-circle">🗺️</div>
          <div>
            <h3 className="panel-title">المحافظات والمناطق العراقية</h3>
            <p className="panel-subtitle">اختر المحافظة لتظهر مناطقها وأسواقها التجارية وتوجيه الرادار بدقة</p>
          </div>
        </div>
        <span className="badge-count" title="تغطية كافة المحافظات العراقية الـ 18">
          🇮🇶 18 محافظة
        </span>
      </div>

      {/* Governorates Dynamic Grid with Iraqi City Icons */}
      <div className="governorate-selector-grid">
        {IRAQ_GOVERNORATES.map((gov) => {
          const isActive = gov.id === selectedGov;
          return (
            <button
              key={gov.id}
              type="button"
              className={`gov-pill-btn ${isActive ? 'active' : ''}`}
              onClick={() => handleSelectGov(gov)}
              title={`محافظة ${gov.name}`}
            >
              <span style={{ fontSize: '1.25rem', lineHeight: 1 }} role="img" aria-label={gov.name}>
                {gov.icon || '📍'}
              </span>
              <span style={{ fontWeight: 800 }}>{gov.name}</span>
              {isActive && (
                <span
                  style={{
                    marginRight: 'auto',
                    fontSize: '0.78rem',
                    background: 'rgba(255, 255, 255, 0.3)',
                    padding: '1px 6px',
                    borderRadius: '999px',
                    fontWeight: 900,
                  }}
                >
                  ✓
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Areas & Neighborhoods Management */}
      <div style={{ marginTop: '18px' }}>
        <div className="form-label">
          <span style={{ color: 'var(--text-main)', fontWeight: 900 }}>
            المناطق والأحياء في <strong style={{ color: 'var(--primary)', fontSize: '1.05rem', fontWeight: 900 }}>{currentGovObj.icon} {currentGovObj.name}</strong> ({selectedAreas.length} محددة):
          </span>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              onClick={selectAllAreas}
              className="btn-secondary"
              style={{ padding: '4px 10px', fontSize: '0.78rem', fontWeight: 800 }}
            >
              تحديد كل المناطق
            </button>
            <button
              type="button"
              onClick={clearAreas}
              className="btn-secondary"
              style={{ padding: '4px 10px', fontSize: '0.78rem', fontWeight: 800 }}
            >
              مسح
            </button>
          </div>
        </div>

        {/* Selected / Available Area Chips */}
        <div className="areas-chips-container">
          {currentGovObj.popularAreas.map((area) => {
            const isSelected = selectedAreas.includes(area);
            return (
              <span
                key={area}
                onClick={() => toggleArea(area)}
                className={`area-chip ${isSelected ? 'selected' : ''}`}
              >
                <span style={{ fontSize: '0.85rem' }}>{isSelected ? '✓' : '📍'}</span>
                <span>{area}</span>
              </span>
            );
          })}
        </div>

        {/* Custom Area Quick Adder */}
        <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
          <input
            type="text"
            className="custom-input"
            style={{ padding: '8px 14px', fontSize: '0.86rem' }}
            placeholder={`إضافة حي أو شارع آخر في ${currentGovObj.name} (مثال: شارع 14 رمضان)...`}
            value={customAreaInput}
            onChange={(e) => setCustomAreaInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                onAddCustomArea();
              }
            }}
          />
          <button
            type="button"
            className="btn-secondary"
            style={{ padding: '8px 16px', fontSize: '0.84rem', whiteSpace: 'nowrap', fontWeight: 800 }}
            onClick={onAddCustomArea}
          >
            + إضافة
          </button>
        </div>
      </div>
    </div>
  );
}
