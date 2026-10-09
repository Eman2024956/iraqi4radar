'use client';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#060c0a',
        color: '#ffffff',
        fontFamily: "'Cairo', sans-serif",
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        position: 'relative',
        overflow: 'hidden',
        direction: 'rtl',
      }}
    >
      {/* Background Radar Rings */}
      <div
        style={{
          position: 'absolute',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          border: '1.5px dashed rgba(52, 211, 153, 0.25)',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          width: '320px',
          height: '320px',
          borderRadius: '50%',
          border: '1px solid rgba(251, 191, 36, 0.2)',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          pointerEvents: 'none',
        }}
      />

      <div
        style={{
          maxWidth: '560px',
          textAlign: 'center',
          position: 'relative',
          zIndex: 10,
          background: 'rgba(15, 32, 28, 0.95)',
          border: '2px solid rgba(52, 211, 153, 0.4)',
          borderRadius: '24px',
          padding: '44px 32px',
          boxShadow: '0 20px 50px rgba(0,0,0,0.7), 0 0 30px rgba(16, 185, 129, 0.25)',
        }}
      >
        {/* Radar Icon */}
        <div
          style={{
            width: '74px',
            height: '74px',
            borderRadius: '20px',
            background: 'linear-gradient(135deg, #064e3b, #022c22)',
            border: '2px solid #34d399',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '2.4rem',
            marginBottom: '20px',
            boxShadow: '0 0 25px rgba(16, 185, 129, 0.45)',
          }}
        >
          📡
        </div>

        {/* 404 Number */}
        <h1
          style={{
            fontSize: '4.5rem',
            fontWeight: 900,
            lineHeight: 1,
            margin: '0 0 10px',
            background: 'linear-gradient(90deg, #34d399, #fbbf24)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: '2px',
          }}
        >
          404
        </h1>

        <h2
          style={{
            fontSize: '1.4rem',
            fontWeight: 900,
            color: '#ffffff',
            margin: '0 0 14px',
          }}
        >
          لم يتم العثور على هذا المسار (الصفحة غير موجودة)
        </h2>

        <p
          style={{
            fontSize: '0.96rem',
            color: '#cbd5e1',
            lineHeight: 1.8,
            marginBottom: '28px',
          }}
        >
          يبدو أن الرابط الذي تحاول الوصول إليه غير مدرج في فهرس رادار العراق للأعمال أو تم نقله. لا تقلق، يمكنك العودة فوراً إلى المنصة واستخراج بيانات الأنشطة التجارية عبر الرابط أدناه.
        </p>

        {/* Action Button */}
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link
            href="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              padding: '13px 28px',
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: '#ffffff',
              borderRadius: '12px',
              textDecoration: 'none',
              fontWeight: 900,
              fontSize: '1rem',
              boxShadow: '0 6px 20px rgba(16, 185, 129, 0.45)',
              border: '1px solid #34d399',
            }}
          >
            <span>🚀</span>
            <span>العودة إلى منصة رادار العراق الرئيسية</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
