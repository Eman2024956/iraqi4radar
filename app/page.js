'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import Header from './components/Header';
import GovernorateSelector from './components/GovernorateSelector';
import KeywordsStudio from './components/KeywordsStudio';
import WhatsAppStudio from './components/WhatsAppStudio';
import BusinessCard from './components/BusinessCard';
import ExportToolbar from './components/ExportToolbar';
import QuickMessengerModal from './components/QuickMessengerModal';
import GuideModal from './components/GuideModal';
import MetricsModal from './components/MetricsModal';
import MobileBottomNav from './components/MobileBottomNav';
import Footer from './components/Footer';
import { IRAQ_GOVERNORATES, BUSINESS_CATEGORIES, WHATSAPP_TEMPLATES } from './data/iraqData';

const DEFAULT_INITIAL_KEYWORDS = [
  'صيدلية',
  'عيادة طبيب',
  'مطعم مشويات',
  'كافيه',
  'سوبرماركت',
  'محل ملابس',
  'معرض سيارات',
  'صالون نسائي',
  'شركة سياحة وسفر',
  'محل موبايلات',
].join('\n');

export default function Home() {
  // 1. الإعدادات والخيارات الجغرافية
  const [selectedGov, setSelectedGov] = useState('baghdad');
  const [selectedAreas, setSelectedAreas] = useState([
    'الكرادة',
    'المنصور',
    'الجادرية',
    'الحارثية',
    'زيونة',
    'شارع فلسطين',
  ]);
  const [customAreaInput, setCustomAreaInput] = useState('');

  // 2. الكلمات المفتاحية
  const [keywordsText, setKeywordsText] = useState(DEFAULT_INITIAL_KEYWORDS);

  // 3. معاملات المحرك والاستخراج
  const [targetCount, setTargetCount] = useState(500);
  const [requirePhone, setRequirePhone] = useState(true);
  const [records, setRecords] = useState([]);
  const [running, setRunning] = useState(false);
  const [paused, setPaused] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [currentQueryText, setCurrentQueryText] = useState('');
  const [duplicateCount, setDuplicateCount] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // 3.1 محرك الخدمة (Google Maps vs OpenStreetMap)
  const [selectedEngine, setSelectedEngine] = useState('google'); // 'google' | 'osm'

  // 3.2 عدادات الطلبات والتكلفة التقديرية وسقف التوقف التلقائي
  const [totalRequests, setTotalRequests] = useState(0);
  const [googleRequests, setGoogleRequests] = useState(0);
  const [osmRequests, setOsmRequests] = useState(0);
  const [estimatedCostUSD, setEstimatedCostUSD] = useState(0);
  const [maxRequestsLimit, setMaxRequestsLimit] = useState(50);
  const [enableAutoStop, setEnableAutoStop] = useState(true);
  const [isMetricsOpen, setIsMetricsOpen] = useState(false);

  // 4. المراسلة عبر واتساب
  const [messageTemplate, setMessageTemplate] = useState(WHATSAPP_TEMPLATES[0].body);
  const [sentMap, setSentMap] = useState({});
  const [isMessengerOpen, setIsMessengerOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  // 5. التحديد والفرز والعرض
  const [selectedIds, setSelectedIds] = useState([]);
  const [searchFilter, setSearchFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [operatorFilter, setOperatorFilter] = useState('ALL');
  const [ratingFilter, setRatingFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('rating_desc');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'

  // استخراج معيار الترتيب والاتجاه لدعم الترتيب الديناميكي التفاعلي في الجدول
  const [sortKey, sortDirection] = useMemo(() => {
    const parts = sortBy.split('_');
    const dir = parts.pop() || 'desc';
    const key = parts.join('_') || 'rating';
    return [key, dir];
  }, [sortBy]);

  // تبديل اتجاه وترتيب الأعمدة عند النقر على رأس الجدول
  function handleSort(key) {
    if (sortKey === key) {
      const nextDir = sortDirection === 'asc' ? 'desc' : 'asc';
      setSortBy(`${key}_${nextDir}`);
    } else {
      const defaultDir = (key === 'rating' || key === 'reviews') ? 'desc' : 'asc';
      setSortBy(`${key}_${defaultDir}`);
    }
  }

  function getSortIndicator(key) {
    if (sortKey !== key) return '↕';
    return sortDirection === 'asc' ? '▲' : '▼';
  }

  // 6. المظهر والسمة
  const [theme, setTheme] = useState('dark');

  // مراجع التحكم في حلقة البحث
  const stopRef = useRef(false);
  const pauseRef = useRef(false);
  const timerRef = useRef(null);

  // تفعيل السمة في الصفحة وحفظها
  useEffect(() => {
    const saved = localStorage.getItem('iraq_places_theme') || 'dark';
    setTheme(saved);
    document.documentElement.setAttribute('data-theme', saved);
  }, []);

  function toggleTheme() {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    localStorage.setItem('iraq_places_theme', next);
    document.documentElement.setAttribute('data-theme', next);
  }

  // عداد الوقت المنقضي أثناء التشغيل
  useEffect(() => {
    if (running && !paused) {
      timerRef.current = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [running, paused]);

  // إضافة حي مخصص للمحافظة المحددة
  function handleAddCustomArea() {
    const clean = customAreaInput.trim();
    if (clean && !selectedAreas.includes(clean)) {
      setSelectedAreas([...selectedAreas, clean]);
      setCustomAreaInput('');
    }
  }

  function handleResetDefaultKeywords() {
    setKeywordsText(DEFAULT_INITIAL_KEYWORDS);
  }

  // المحافظة الحالية المختارة ككائن
  const currentGovObj = IRAQ_GOVERNORATES.find((g) => g.id === selectedGov) || IRAQ_GOVERNORATES[0];

  // دالة بدء عملية استخراج بيانات الأنشطة والشركات من محركات البحث والخرائط المعتمدة
  async function startExtraction() {
    setErrorMessage('');
    const kwLines = keywordsText
      .split('\n')
      .map((k) => k.trim())
      .filter(Boolean);

    if (!kwLines.length) {
      return setErrorMessage('يرجى تحديد كلمة مفتاحية واحدة على الأقل في قائمة البحث.');
    }

    // توليد مصفوفة الاستعلامات الذكية
    const areasList = selectedAreas.length > 0 ? selectedAreas : [currentGovObj.name];
    const generatedQueries = [];

    for (const area of areasList) {
      for (const kw of kwLines) {
        generatedQueries.push(`${kw} في ${area} ${currentGovObj.name}`);
      }
    }

    stopRef.current = false;
    pauseRef.current = false;
    setRunning(true);
    setPaused(false);
    setElapsedSeconds(0);
    setDuplicateCount(0);
    setStatusMessage(`جارٍ إطلاق رادار الاستخراج لـ ${generatedQueries.length} استعلام...`);

    // خريطة لتجنب تكرار المعرفات والأرقام
    const seenMap = new Map();
    // الاحتفاظ بالسجلات السابقة
    records.forEach((r) => seenMap.set(r.id, r));

    let localDuplicates = 0;
    let sessionReqs = totalRequests;
    let sessionGoogleReqs = googleRequests;
    let sessionOsmReqs = osmRequests;
    let sessionCost = estimatedCostUSD;

    for (let i = 0; i < generatedQueries.length; i++) {
      if (stopRef.current || seenMap.size >= targetCount) break;

      // فحص حد الأمان والتوقف التلقائي للطلبات
      if (enableAutoStop && sessionReqs >= maxRequestsLimit) {
        setStatusMessage(
          `🛑 تم التوقف التلقائي الذكي: تم بلوغ سقف الأمان المحدد للطلبات (${maxRequestsLimit} طلب • ~$${sessionCost.toFixed(3)}). تم إيقاف الرادار لحماية الرصيد.`
        );
        break;
      }

      // فحص الإيقاف المؤقت
      while (pauseRef.current && !stopRef.current) {
        await new Promise((r) => setTimeout(r, 500));
      }
      if (stopRef.current) break;

      const q = generatedQueries[i];
      setCurrentQueryText(q);
      setStatusMessage(`معالجة الاستعلام ${i + 1} من ${generatedQueries.length}: ${q}`);

      try {
        const res = await fetch('/api/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: q,
            engine: selectedEngine,
            requirePhone,
            maxPages: 2,
          }),
        });

        // زيادة عدادات الاستهلاك والتكلفة
        sessionReqs++;
        setTotalRequests(sessionReqs);
        if (selectedEngine === 'google') {
          sessionGoogleReqs++;
          setGoogleRequests(sessionGoogleReqs);
          sessionCost += 0.025;
          setEstimatedCostUSD(sessionCost);
        } else {
          sessionOsmReqs++;
          setOsmRequests(sessionOsmReqs);
        }

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data?.error || 'حدث خطأ في استجابة الخادم');
        }

        const newItems = data.results || [];
        for (const item of newItems) {
          if (seenMap.size >= targetCount) break;

          // فحص التكرار: معرف المكان ورقم الهاتف المنظف
          const isIdDup = seenMap.has(item.id);
          const isPhoneDup = item.waPhone
            ? [...seenMap.values()].some((x) => x.waPhone && x.waPhone === item.waPhone)
            : false;

          if (isIdDup || isPhoneDup) {
            localDuplicates++;
            setDuplicateCount(localDuplicates);
          } else {
            item.extractedArea = areasList[Math.floor(i / kwLines.length)] || currentGovObj.name;
            item.extractedGov = currentGovObj.name;
            seenMap.set(item.id, item);
          }
        }

        setRecords([...seenMap.values()]);

        // تأخير طفيف بين الاستعلامات
        await new Promise((r) => setTimeout(r, selectedEngine === 'osm' ? 800 : 600));
      } catch (err) {
        console.error('Extraction query error:', err);
        setStatusMessage(`تنبيه: تم تجاوز استعلام بسبب: ${err.message}`);
      }
    }

    setRunning(false);
    setPaused(false);
    setCurrentQueryText('');
    setStatusMessage(
      seenMap.size >= targetCount
        ? `اكتمل بنجاح: تم الوصول إلى هدف الرادار المحدد (${seenMap.size} سجل)! 🎉`
        : `انتهت كافة الاستعلامات (${seenMap.size} سجل نشاط مستخرج).`
    );
  }

  function handlePauseResume() {
    if (paused) {
      pauseRef.current = false;
      setPaused(false);
      setStatusMessage('تم استئناف الرادار…');
    } else {
      pauseRef.current = true;
      setPaused(true);
      setStatusMessage('تم إيقاف الرادار مؤقتاً.');
    }
  }

  function handleStop() {
    stopRef.current = true;
    pauseRef.current = false;
    setRunning(false);
    setPaused(false);
    setStatusMessage('تم إيقاف عملية الاستخراج.');
  }

  function handleClearAllRecords() {
    if (records.length === 0) return;
    if (window.confirm('هل أنت متأكد من رغبتك في تفريغ كافة السجلات المستخرجة؟')) {
      setRecords([]);
      setSelectedIds([]);
      setSentMap({});
      setStatusMessage('تم تفريغ السجلات.');
    }
  }

  function handleMarkSent(id) {
    setSentMap((prev) => ({ ...prev, [id]: true }));
  }

  function toggleSelect(id) {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  }

  function selectAllFiltered() {
    setSelectedIds(filteredRecords.map((r) => r.id));
  }

  function deselectAll() {
    setSelectedIds([]);
  }

  // تصفية وفرز السجلات
  const filteredRecords = useMemo(() => {
    let list = [...records];

    if (searchFilter.trim()) {
      const q = searchFilter.toLowerCase().trim();
      list = list.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          (r.phone && r.phone.includes(q)) ||
          r.category.toLowerCase().includes(q) ||
          r.address.toLowerCase().includes(q)
      );
    }

    if (categoryFilter !== 'ALL') {
      list = list.filter((r) => r.category.includes(categoryFilter));
    }

    if (operatorFilter !== 'ALL') {
      list = list.filter((r) => r.operator?.code === operatorFilter);
    }

    if (ratingFilter === '4+') {
      list = list.filter((r) => r.rating && r.rating >= 4.0);
    } else if (ratingFilter === '3+') {
      list = list.filter((r) => r.rating && r.rating >= 3.0);
    }

    // الترتيب الديناميكي التفاعلي لكافة الحقول
    list.sort((a, b) => {
      if (sortKey === 'name') {
        const cmp = a.name.localeCompare(b.name, 'ar');
        return sortDirection === 'asc' ? cmp : -cmp;
      }
      if (sortKey === 'category') {
        const cmp = (a.category || '').localeCompare(b.category || '', 'ar');
        return sortDirection === 'asc' ? cmp : -cmp;
      }
      if (sortKey === 'phone') {
        const aHas = a.phone ? 1 : 0;
        const bHas = b.phone ? 1 : 0;
        if (aHas !== bHas) return sortDirection === 'desc' ? bHas - aHas : aHas - bHas;
        const cmp = (a.phone || '').localeCompare(b.phone || '');
        return sortDirection === 'asc' ? cmp : -cmp;
      }
      if (sortKey === 'operator') {
        const aOp = a.operator?.name || '';
        const bOp = b.operator?.name || '';
        const cmp = aOp.localeCompare(bOp, 'ar');
        return sortDirection === 'asc' ? cmp : -cmp;
      }
      if (sortKey === 'rating') {
        const aR = a.rating || 0;
        const bR = b.rating || 0;
        if (aR !== bR) return sortDirection === 'asc' ? aR - bR : bR - aR;
        return (b.userRatingCount || 0) - (a.userRatingCount || 0);
      }
      if (sortKey === 'reviews') {
        const aC = a.userRatingCount || 0;
        const bC = b.userRatingCount || 0;
        return sortDirection === 'asc' ? aC - bC : bC - aC;
      }
      if (sortKey === 'address') {
        const cmp = (a.address || '').localeCompare(b.address || '', 'ar');
        return sortDirection === 'asc' ? cmp : -cmp;
      }
      return 0;
    });

    return list;
  }, [records, searchFilter, categoryFilter, operatorFilter, ratingFilter, sortKey, sortDirection]);

  const availableCategories = useMemo(() => {
    const set = new Set();
    records.forEach((r) => {
      if (r.category) set.add(r.category);
    });
    return Array.from(set);
  }, [records]);

  const stats = useMemo(() => {
    const total = records.length;
    const withPhone = records.filter((r) => r.phone).length;
    const sumRatings = records.reduce((acc, r) => acc + (r.rating || 0), 0);
    const countRatings = records.filter((r) => r.rating).length;
    const avgRating = countRatings > 0 ? (sumRatings / countRatings).toFixed(1) : '-';

    const zainCount = records.filter((r) => r.operator?.code === 'zain').length;
    const asiacellCount = records.filter((r) => r.operator?.code === 'asiacell').length;
    const korekCount = records.filter((r) => r.operator?.code === 'korek').length;

    return { total, withPhone, avgRating, zainCount, asiacellCount, korekCount };
  }, [records]);

  const progressPercent = Math.min(100, Math.round((records.length / Math.max(1, targetCount)) * 100));

  function formatTime(sec) {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  }

  return (
    <div className="app-container">
      {/* Background Radial Glow */}
      <div className="bg-glow-radial" />
      <div className="bg-glow-bottom" />

      {/* Header */}
      <Header
        totalRecords={records.length}
        totalRequests={totalRequests}
        estimatedCostUSD={estimatedCostUSD}
        isRunning={running}
        theme={theme}
        toggleTheme={toggleTheme}
        onOpenGuide={() => setIsGuideOpen(true)}
        onOpenMetrics={() => setIsMetricsOpen(true)}
      />

      {/* Main Content */}
      <main className="content-wrapper">
        {/* Welcome Hero Banner with Radar Animation */}
        <section className="hero-banner">
          <div className="hero-radar-decor" />

          <div className="hero-content">
            <div className="hero-tag">
              <span>📡</span>
              <span>رادار العراق للأعمال V2.0 • تغطية رادارية شاملة لـ 18 محافظة</span>
            </div>

            <h1 className="hero-h1">
              منصة <span className="highlight">رادار العراق للأعمال</span> الذكية لاستخراج بيانات الأنشطة والشركات والتواصل عبر واتساب
            </h1>

            <p className="hero-desc">
              محرك مسح واستخراج متطور لبيانات الأنشطة والشركات في كافة المحافظات العراقية من أحدث قواعد البيانات والخرائط المعتمدة بدقة متناهية، مع كشف ذكي لشبكات الاتصال المحلية (زين، آسيا سيل، كورك) ونظام صياغة رسائل واتساب مخصصة لعروض تطبيقات التسوق بنظام الإيجار الشهري وتصدير فوري إلى Excel و vCard و JSON.
            </p>

            {/* Live Counter Badges */}
            <div className="hero-stats-row">
              <div className="hero-stat-box">
                <span className="hero-stat-val" style={{ color: '#34d399' }}>
                  {stats.total.toLocaleString('ar-IQ')}
                </span>
                <span className="hero-stat-lbl">إجمالي الأنشطة المستخرجة</span>
              </div>
              <div className="hero-stat-box">
                <span className="hero-stat-val" style={{ color: '#4ade80' }}>
                  {stats.withPhone.toLocaleString('ar-IQ')}
                </span>
                <span className="hero-stat-lbl">أرقام هواتف جاهزة للواتساب</span>
              </div>
              <div className="hero-stat-box">
                <span className="hero-stat-val" style={{ color: '#fbbf24' }}>
                  {stats.avgRating} ⭐
                </span>
                <span className="hero-stat-lbl">متوسط التقييم العام</span>
              </div>
              <div className="hero-stat-box">
                <span className="hero-stat-val" style={{ color: '#38bdf8' }}>
                  {stats.zainCount}
                </span>
                <span className="hero-stat-lbl">زين العراق (Zain)</span>
              </div>
              <div className="hero-stat-box">
                <span className="hero-stat-val" style={{ color: '#fb7185' }}>
                  {stats.asiacellCount}
                </span>
                <span className="hero-stat-lbl">آسيا سيل (Asiacell)</span>
              </div>
              <div className="hero-stat-box">
                <span className="hero-stat-val" style={{ color: '#fcd34d' }}>
                  {stats.korekCount}
                </span>
                <span className="hero-stat-lbl">كورك (Korek)</span>
              </div>
            </div>
          </div>
        </section>

        {/* Control Studio Grid: Iraqi Governorates & Keywords Library */}
        <section className="control-grid" id="search-section">
          {/* 1. Iraqi Cities & Areas Picker */}
          <GovernorateSelector
            selectedGov={selectedGov}
            setSelectedGov={setSelectedGov}
            selectedAreas={selectedAreas}
            setSelectedAreas={setSelectedAreas}
            customAreaInput={customAreaInput}
            setCustomAreaInput={setCustomAreaInput}
            onAddCustomArea={handleAddCustomArea}
          />

          {/* 2. Business Categories & Keywords Library */}
          <KeywordsStudio
            keywordsText={keywordsText}
            setKeywordsText={setKeywordsText}
            onResetDefaultKeywords={handleResetDefaultKeywords}
          />
        </section>

        {/* Engine Parameters & Controls Box */}
        <section className="section-panel" style={{ marginBottom: '26px' }}>
          <div className="panel-header">
            <div className="panel-title-wrap">
              <div className="panel-icon-circle">⚙️</div>
              <div>
                <h3 className="panel-title">إعدادات محرك الاستخراج والخدمات المتاحة</h3>
                <p className="panel-subtitle">اختر محرك البحث (Google أو OpenStreetMap) وحدد سقف النتائج ومتابعة الاستهلاك</p>
              </div>
            </div>
          </div>

          {/* Engine Service Tabs: Google Maps Platform vs OpenStreetMap */}
          <div className="engine-tabs-container">
            <div className="engine-tabs-bar">
              <button
                type="button"
                className={`engine-tab-btn ${selectedEngine === 'google' ? 'active' : ''}`}
                onClick={() => setSelectedEngine('google')}
                disabled={running}
              >
                <span className="engine-tab-icon">🌐</span>
                <div className="engine-tab-text">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <strong>محرك Google Maps Platform</strong>
                    {selectedEngine === 'google' && <span className="tab-pill-active">نشط حالياً</span>}
                  </div>
                  <span className="engine-tab-desc">
                    دقة تجارية عالية جداً • تقييمات رسمية • ~$0.025 / استعلام (رصيد شهري مجاني 200$)
                  </span>
                </div>
              </button>

              <button
                type="button"
                className={`engine-tab-btn ${selectedEngine === 'osm' ? 'active' : ''}`}
                onClick={() => setSelectedEngine('osm')}
                disabled={running}
              >
                <span className="engine-tab-icon">🗺️</span>
                <div className="engine-tab-text">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <strong>محرك OpenStreetMap (OSM)</strong>
                    {selectedEngine === 'osm' && <span className="tab-pill-free">مجاني 100% 🟢</span>}
                  </div>
                  <span className="engine-tab-desc">
                    مفتوح المصدر • مجاني تماماً • بدون مفتاح API • تكلفة $0.00
                  </span>
                </div>
              </button>
            </div>
          </div>

          <div className="params-row">
            <div>
              <label className="form-label">الهدف المطلوب (عدد السجلات):</label>
              <select
                className="custom-input"
                value={targetCount}
                onChange={(e) => setTargetCount(Number(e.target.value))}
                disabled={running}
              >
                <option value={50}>50 سجل (تجربة سريعة)</option>
                <option value={100}>100 سجل</option>
                <option value={250}>250 سجل</option>
                <option value={500}>500 سجل (موصى به)</option>
                <option value={1000}>1,000 سجل (حملة متوسطة)</option>
                <option value={2000}>2,000 سجل (قاعدة بيانات كبرى)</option>
              </select>
            </div>

            <div>
              <label className="form-label">تصفية أرقام الهواتف:</label>
              <select
                className="custom-input"
                value={requirePhone ? 'true' : 'false'}
                onChange={(e) => setRequirePhone(e.target.value === 'true')}
                disabled={running}
              >
                <option value="true">الهواتف فقط (جاهزة للواتساب 🟢)</option>
                <option value="false">كافة الأنشطة (مع أو بدون هاتف)</option>
              </select>
            </div>

            <div>
              <label className="form-label">المحافظة النشطة حالياً:</label>
              <div
                style={{
                  padding: '11px 16px',
                  background: 'var(--bg-surface)',
                  border: '1.5px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.92rem',
                  fontWeight: 900,
                  color: '#34d399',
                }}
              >
                📍 {currentGovObj.name} ({selectedAreas.length} منطقة محددة)
              </div>
            </div>
          </div>

          {/* Action Buttons Row */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginTop: '22px', alignItems: 'center' }}>
            <button
              type="button"
              className="btn-primary"
              onClick={startExtraction}
              disabled={running}
              style={{ minWidth: '200px' }}
            >
              {running ? (
                <>
                  <span className="animate-spin">⏳</span>
                  <span>جارٍ تشغيل الرادار والجمع…</span>
                </>
              ) : (
                <>
                  <span>🚀</span>
                  <span>بدء استخراج البيانات ({selectedEngine === 'osm' ? 'OSM المجاني' : 'Google Maps'})</span>
                </>
              )}
            </button>

            {/* Live Metrics & Quota Button */}
            <button
              type="button"
              className="btn-secondary"
              onClick={() => setIsMetricsOpen(true)}
              style={{
                padding: '9px 16px',
                fontSize: '0.86rem',
                fontWeight: 900,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                borderColor: 'rgba(245, 158, 11, 0.4)',
                background: 'rgba(245, 158, 11, 0.08)',
              }}
              title="متابعة عداد الطلبات، التكلفة، وحد التوقف التلقائي"
            >
              <span>📊</span>
              <span>
                الطلبات: <strong style={{ color: '#fbbf24' }}>{totalRequests}</strong>
                {enableAutoStop ? ` / ${maxRequestsLimit}` : ''}
              </span>
              <span style={{ color: selectedEngine === 'osm' ? '#10b981' : '#fbbf24', fontSize: '0.8rem' }}>
                {selectedEngine === 'osm' ? '(مجاني 100%)' : `(~$${estimatedCostUSD.toFixed(3)})`}
              </span>
              <span style={{ fontSize: '0.74rem', color: 'var(--primary)', textDecoration: 'underline' }}>
                إعدادات السقف ↗
              </span>
            </button>

            {running && (
              <button
                type="button"
                className="btn-secondary"
                onClick={handlePauseResume}
              >
                {paused ? '▶️ استئناف' : '⏸️ إيقاف مؤقت'}
              </button>
            )}

            <button
              type="button"
              className="btn-danger"
              onClick={handleStop}
              disabled={!running}
            >
              ⏹️ إيقاف تام
            </button>

            {records.length > 0 && !running && (
              <button
                type="button"
                className="btn-secondary"
                onClick={handleClearAllRecords}
                style={{ marginRight: 'auto' }}
              >
                🗑️ تفريغ النتائج
              </button>
            )}
          </div>

          {errorMessage && (
            <div
              style={{
                marginTop: '16px',
                padding: '14px 18px',
                background: 'var(--danger-light)',
                border: '1.5px solid var(--danger)',
                borderRadius: 'var(--radius-md)',
                color: '#fca5a5',
                fontSize: '0.92rem',
                fontWeight: 800,
              }}
            >
              ⚠️ {errorMessage}
            </div>
          )}
        </section>

        {/* Realtime Extraction Progress Bar & Live Status */}
        {(running || statusMessage) && (
          <section className="progress-card">
            <div className="progress-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span className="status-indicator-dot" />
                <strong style={{ fontSize: '0.96rem', color: 'var(--text-main)', fontWeight: 900 }}>
                  {statusMessage || 'محرك الرادار جاهز للعمل'}
                </strong>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '0.88rem', color: 'var(--text-muted)', fontWeight: 800 }}>
                {running && <span>⏱️ الوقت: {formatTime(elapsedSeconds)}</span>}
                {duplicateCount > 0 && (
                  <span style={{ color: '#d97706', fontWeight: 900 }}>
                    🚫 تم تخطي {duplicateCount} مكرر
                  </span>
                )}
                <span>
                  <strong>{records.length}</strong> من أصل <strong>{targetCount}</strong> ({progressPercent}%)
                </span>
              </div>
            </div>

            <div className="progress-bar-track">
              <div className="progress-bar-fill" style={{ width: `${progressPercent}%` }} />
            </div>

            {currentQueryText && (
              <div className="query-chip-active">
                <span>🔍 الاستعلام النشط:</span>
                <strong style={{ color: 'var(--text-main)', fontWeight: 900 }}>{currentQueryText}</strong>
              </div>
            )}
          </section>
        )}

        {/* WhatsApp Smart Sender Studio */}
        <WhatsAppStudio
          messageTemplate={messageTemplate}
          setMessageTemplate={setMessageTemplate}
          samplePlace={records.find((r) => r.phone) || records[0]}
          onLaunchMessenger={() => setIsMessengerOpen(true)}
          totalRecords={records.filter((r) => r.phone).length}
        />

        {/* Export Tools Bar */}
        {records.length > 0 && (
          <div id="export-section">
            <ExportToolbar records={records} selectedIds={selectedIds} currentGovName={currentGovObj.name} />
          </div>
        )}

        {/* Results Explorer (Filters, View Mode, Cards Grid & Table) */}
        {records.length > 0 && (
          <section id="results-section" style={{ marginTop: '26px' }}>
            {/* Filter and View Controls Bar */}
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '14px',
                padding: '18px 22px',
                background: 'var(--bg-card)',
                border: '1.5px solid var(--border-card)',
                borderRadius: 'var(--radius-lg)',
                marginBottom: '18px',
              }}
            >
              {/* Search in Results */}
              <div style={{ flex: '1 1 240px' }}>
                <input
                  type="text"
                  className="custom-input"
                  style={{ padding: '9px 14px', fontSize: '0.86rem' }}
                  placeholder="🔍 بحث في النتائج المستخرجة (الاسم، الهاتف، العنوان)..."
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                />
              </div>

              {/* Operator Filter */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 900, color: 'var(--text-main)' }}>الشبكة:</span>
                <select
                  className="custom-input"
                  style={{ padding: '7px 12px', fontSize: '0.84rem', width: 'auto' }}
                  value={operatorFilter}
                  onChange={(e) => setOperatorFilter(e.target.value)}
                >
                  <option value="ALL">كافة الشبكات ({records.length})</option>
                  <option value="zain">زين العراق ({stats.zainCount})</option>
                  <option value="asiacell">آسيا سيل ({stats.asiacellCount})</option>
                  <option value="korek">كورك ({stats.korekCount})</option>
                </select>
              </div>

              {/* Category Filter */}
              {availableCategories.length > 1 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '0.82rem', fontWeight: 900, color: 'var(--text-main)' }}>القسم:</span>
                  <select
                    className="custom-input"
                    style={{ padding: '7px 12px', fontSize: '0.84rem', width: 'auto', maxWidth: '170px' }}
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                  >
                    <option value="ALL">كافة الأقسام</option>
                    {availableCategories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Rating Filter */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 900, color: 'var(--text-main)' }}>التقييم:</span>
                <select
                  className="custom-input"
                  style={{ padding: '7px 12px', fontSize: '0.84rem', width: 'auto' }}
                  value={ratingFilter}
                  onChange={(e) => setRatingFilter(e.target.value)}
                >
                  <option value="ALL">الكل</option>
                  <option value="4+">4.0+ ⭐ ممتاز</option>
                  <option value="3+">3.0+ ⭐ جيد</option>
                </select>
              </div>

              {/* Sorting */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 900, color: 'var(--text-main)' }}>ترتيب:</span>
                <select
                  className="custom-input"
                  style={{ padding: '7px 12px', fontSize: '0.84rem', width: 'auto' }}
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="rating_desc">التقييم: الأعلى أولاً ⭐</option>
                  <option value="rating_asc">التقييم: الأقل أولاً ⭐</option>
                  <option value="reviews_desc">المراجعات: الأكثر أولاً 👥</option>
                  <option value="reviews_asc">المراجعات: الأقل أولاً 👥</option>
                  <option value="name_asc">الاسم: أ - ي (تصاعدي)</option>
                  <option value="name_desc">الاسم: ي - أ (تنازلي)</option>
                  <option value="phone_desc">الهاتف: الأرقام المتوفرة أولاً 📱</option>
                  <option value="phone_asc">الهاتف: تصاعدي 📱</option>
                  <option value="category_asc">التصنيف: أ - ي 🏷️</option>
                  <option value="category_desc">التصنيف: ي - أ 🏷️</option>
                  <option value="operator_asc">الشبكة: أ - ي 📶</option>
                  <option value="operator_desc">الشبكة: ي - أ 📶</option>
                  <option value="address_asc">العنوان: أ - ي 📍</option>
                  <option value="address_desc">العنوان: ي - أ 📍</option>
                </select>
              </div>

              {/* View Mode Toggle (Grid vs Table) */}
              <div style={{ display: 'flex', gap: '5px' }}>
                <button
                  type="button"
                  className={`btn-secondary ${viewMode === 'grid' ? 'active' : ''}`}
                  onClick={() => setViewMode('grid')}
                  style={{
                    padding: '7px 12px',
                    fontSize: '0.84rem',
                    background: viewMode === 'grid' ? 'rgba(16, 185, 129, 0.25)' : undefined,
                    borderColor: viewMode === 'grid' ? 'var(--primary)' : undefined,
                    color: viewMode === 'grid' ? 'var(--primary)' : undefined,
                    fontWeight: 900,
                  }}
                  title="عرض بطاقات تفاعلية"
                >
                  🗂️ بطاقات
                </button>
                <button
                  type="button"
                  className={`btn-secondary ${viewMode === 'table' ? 'active' : ''}`}
                  onClick={() => setViewMode('table')}
                  style={{
                    padding: '7px 12px',
                    fontSize: '0.84rem',
                    background: viewMode === 'table' ? 'rgba(16, 185, 129, 0.25)' : undefined,
                    borderColor: viewMode === 'table' ? 'var(--primary)' : undefined,
                    color: viewMode === 'table' ? 'var(--primary)' : undefined,
                    fontWeight: 900,
                  }}
                  title="عرض جدول البيانات"
                >
                  📑 جدول
                </button>
              </div>
            </div>

            {/* Selection Toolbar */}
            <div className="selection-bar">
              <span className="selection-stats-text">
                عرض <strong>{filteredRecords.length}</strong> من أصل <strong>{records.length}</strong> نشاط مستخرج
                {selectedIds.length > 0 && <span className="selected-tag"> • تم تحديد {selectedIds.length} سجل</span>}
              </span>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  className="btn-secondary"
                  style={{ padding: '5px 12px', fontSize: '0.8rem' }}
                  onClick={selectAllFiltered}
                >
                  تحديد الكل في العرض
                </button>
                {selectedIds.length > 0 && (
                  <button
                    type="button"
                    className="btn-secondary"
                    style={{ padding: '5px 12px', fontSize: '0.8rem' }}
                    onClick={deselectAll}
                  >
                    إلغاء التحديد
                  </button>
                )}
              </div>
            </div>

            {/* View Render: Cards Grid or Table */}
            {viewMode === 'grid' ? (
              <div className="cards-grid">
                {filteredRecords.map((place) => (
                  <BusinessCard
                    key={place.id}
                    place={place}
                    messageTemplate={messageTemplate}
                    city={currentGovObj.name}
                    area={place.extractedArea || currentGovObj.name}
                    isSelected={selectedIds.includes(place.id)}
                    onToggleSelect={toggleSelect}
                    isSent={Boolean(sentMap[place.id])}
                    onMarkSent={handleMarkSent}
                  />
                ))}
              </div>
            ) : (
              <div className="table-wrapper">
                <table className="places-table">
                  <thead>
                    <tr>
                      <th style={{ width: '40px' }}>
                        <input
                          type="checkbox"
                          checked={selectedIds.length === filteredRecords.length && filteredRecords.length > 0}
                          onChange={(e) => (e.target.checked ? selectAllFiltered() : deselectAll())}
                        />
                      </th>
                      <th
                        onClick={() => handleSort('name')}
                        className={`th-sortable ${sortKey === 'name' ? 'th-sorted' : ''}`}
                        title="انقر للترتيب التفاعلي حسب اسم النشاط (تصاعدي/تنازلي)"
                      >
                        <div className="th-content">
                          <span>اسم النشاط</span>
                          <span className={`sort-icon ${sortKey === 'name' ? 'active' : ''}`}>{getSortIndicator('name')}</span>
                        </div>
                      </th>
                      <th
                        onClick={() => handleSort('category')}
                        className={`th-sortable ${sortKey === 'category' ? 'th-sorted' : ''}`}
                        title="انقر للترتيب التفاعلي حسب التصنيف"
                      >
                        <div className="th-content">
                          <span>التصنيف</span>
                          <span className={`sort-icon ${sortKey === 'category' ? 'active' : ''}`}>{getSortIndicator('category')}</span>
                        </div>
                      </th>
                      <th
                        onClick={() => handleSort('phone')}
                        className={`th-sortable ${sortKey === 'phone' ? 'th-sorted' : ''}`}
                        title="انقر للترتيب التفاعلي حسب رقم الهاتف وتوفره"
                      >
                        <div className="th-content">
                          <span>رقم الهاتف</span>
                          <span className={`sort-icon ${sortKey === 'phone' ? 'active' : ''}`}>{getSortIndicator('phone')}</span>
                        </div>
                      </th>
                      <th
                        onClick={() => handleSort('operator')}
                        className={`th-sortable ${sortKey === 'operator' ? 'th-sorted' : ''}`}
                        title="انقر للترتيب التفاعلي حسب شبكة الاتصال"
                      >
                        <div className="th-content">
                          <span>الشبكة المرجحة</span>
                          <span className={`sort-icon ${sortKey === 'operator' ? 'active' : ''}`}>{getSortIndicator('operator')}</span>
                        </div>
                      </th>
                      <th
                        onClick={() => handleSort('rating')}
                        className={`th-sortable ${sortKey === 'rating' ? 'th-sorted' : ''}`}
                        title="انقر للترتيب التفاعلي حسب تقييم الزبائن"
                      >
                        <div className="th-content">
                          <span>التقييم</span>
                          <span className={`sort-icon ${sortKey === 'rating' ? 'active' : ''}`}>{getSortIndicator('rating')}</span>
                        </div>
                      </th>
                      <th
                        onClick={() => handleSort('address')}
                        className={`th-sortable ${sortKey === 'address' ? 'th-sorted' : ''}`}
                        title="انقر للترتيب التفاعلي حسب العنوان والموقع"
                      >
                        <div className="th-content">
                          <span>العنوان</span>
                          <span className={`sort-icon ${sortKey === 'address' ? 'active' : ''}`}>{getSortIndicator('address')}</span>
                        </div>
                      </th>
                      <th>إجراءات سريعة</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRecords.map((place) => {
                      const waUrl = place.waPhone
                        ? `https://wa.me/${place.waPhone}?text=${encodeURIComponent(
                            messageTemplate
                              .replace(/{اسم_النشاط}/g, place.name || '')
                              .replace(/{المدينة}/g, currentGovObj.name)
                              .replace(/{المنطقة}/g, place.extractedArea || '')
                              .replace(/{التصنيف}/g, place.category || '')
                              .replace(/{رقم_الهاتف}/g, place.phone || '')
                              .replace(/{التقييم}/g, place.rating ? `${place.rating} ⭐` : '')
                              .replace(/{العنوان}/g, place.address || '')
                          )}`
                        : null;

                      return (
                        <tr key={place.id} className="place-table-row">
                          <td className="td-select">
                            <input
                              type="checkbox"
                              checked={selectedIds.includes(place.id)}
                              onChange={() => toggleSelect(place.id)}
                            />
                          </td>
                          <td className="td-name">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                              <strong className="place-title-text">{place.name}</strong>
                              {place.engine === 'osm' ? (
                                <span className="engine-badge osm" title="مصدر السجل: OpenStreetMap (مجاني)">🗺️ OSM</span>
                              ) : (
                                <span className="engine-badge google" title="مصدر السجل: Google Maps Places API">🌐 Google</span>
                              )}
                            </div>
                            {sentMap[place.id] && (
                              <span className="sent-pill">
                                ✓ تمت المراسلة
                              </span>
                            )}
                          </td>
                          <td className="td-category">
                            <span className="card-category-badge">{place.category}</span>
                          </td>
                          <td className="td-phone">
                            {place.phone || '-'}
                          </td>
                          <td className="td-operator">
                            {place.operator && (
                              <span
                                className="operator-badge"
                                style={{ backgroundColor: place.operator.color }}
                              >
                                {place.operator.name}
                              </span>
                            )}
                          </td>
                          <td className="td-rating">
                            {place.rating ? (
                              <span className="rating-pill">
                                ⭐ {place.rating} ({place.userRatingCount})
                              </span>
                            ) : (
                              '-'
                            )}
                          </td>
                          <td className="td-address">
                            {place.address}
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: '6px' }}>
                              {waUrl && (
                                <a
                                  href={waUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={() => handleMarkSent(place.id)}
                                  className="btn-whatsapp"
                                  style={{ padding: '5px 10px', fontSize: '0.78rem' }}
                                >
                                  واتساب
                                </a>
                              )}
                              {place.mapsUrl && (
                                <a
                                  href={place.mapsUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="btn-secondary"
                                  style={{ padding: '5px 10px', fontSize: '0.78rem' }}
                                >
                                  الخريطة
                                </a>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}
      </main>

      {/* Sequential WhatsApp Quick Messenger Modal */}
      <QuickMessengerModal
        isOpen={isMessengerOpen}
        onClose={() => setIsMessengerOpen(false)}
        records={records}
        messageTemplate={messageTemplate}
        city={currentGovObj.name}
        sentMap={sentMap}
        onMarkSent={handleMarkSent}
      />

      {/* User Guide Modal */}
      <GuideModal isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} />

      {/* API Metrics, Request Counter, Cost & Auto-Stop Modal */}
      <MetricsModal
        isOpen={isMetricsOpen}
        onClose={() => setIsMetricsOpen(false)}
        totalRequests={totalRequests}
        googleRequests={googleRequests}
        osmRequests={osmRequests}
        estimatedCostUSD={estimatedCostUSD}
        maxRequestsLimit={maxRequestsLimit}
        setMaxRequestsLimit={setMaxRequestsLimit}
        enableAutoStop={enableAutoStop}
        setEnableAutoStop={setEnableAutoStop}
      />

      {/* Footer */}
      <Footer onSelectGov={(govId) => setSelectedGov(govId)} />

      {/* Mobile Sticky Bottom Navigation Bar */}
      <MobileBottomNav
        totalRecords={records.length}
        totalRequests={totalRequests}
        onOpenMessenger={() => setIsMessengerOpen(true)}
        onOpenGuide={() => setIsGuideOpen(true)}
        onOpenMetrics={() => setIsMetricsOpen(true)}
      />
    </div>
  );
}
