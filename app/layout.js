import './globals.css';

export const metadata = {
  metadataBase: new URL('https://iraqi4radar.vercel.app'),
  title: 'رادار العراق للأعمال | Iraq Business Radar - استخراج بيانات الأنشطة والشركات والتواصل عبر واتساب',
  description: 'المنصة الوطنية الذكية «رادار العراق للأعمال» لاستخراج أرقام وهواتف الأنشطة التجارية والشركات في كافة المحافظات العراقية من أحدث قواعد البيانات والخرائط المعتمدة مع نظام إرسال رسائل واتساب احترافية مخصصة وتصدير فوري إلى Excel و JSON و vCard.',
  keywords: [
    'رادار العراق للأعمال',
    'Iraq Business Radar',
    'استخراج أرقام العراق',
    'أرقام هواتف شركات بغداد',
    'داتا أنشطة تجارية العراق',
    'تطبيقات تسوق إلكتروني العراق',
    'رسائل واتساب تسويقية العراق',
    'ارقام شركات البصرة وأربيل',
    'تصدير جهات اتصال vCard',
    'تطبيقات تسوق العراق',
    'Iraq Business Leads'
  ].join(', '),
  icons: {
    icon: '/icon.svg',
    shortcut: '/icon.svg',
    apple: '/icon.svg',
  },
  alternates: {
    canonical: 'https://iraqi4radar.vercel.app',
  },
  openGraph: {
    title: 'رادار العراق للأعمال | Iraq Business Radar',
    description: 'استخرج أرقام وتفاصيل الأنشطة التجارية في العراق وتواصل معهم فوراً عبر واتساب بضغطة زر واحدة.',
    url: 'https://iraqi4radar.vercel.app',
    siteName: 'Iraq Business Radar',
    locale: 'ar_IQ',
    type: 'website',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'رادار العراق للأعمال | Iraq Business Radar - منصة استخراج وتواصل الشركات',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'رادار العراق للأعمال | Iraq Business Radar',
    description: 'استخرج أرقام وتفاصيل الأنشطة التجارية في العراق وتواصل معهم فوراً عبر واتساب بضغطة زر واحدة.',
    images: ['/og-image.png'],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
        <meta name="theme-color" content="#064e3b" />
      </head>
      <body>{children}</body>
    </html>
  );
}
