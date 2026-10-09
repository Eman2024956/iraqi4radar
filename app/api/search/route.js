import { NextResponse } from 'next/server';

const ENDPOINT = 'https://places.googleapis.com/v1/places:searchText';

const FIELDS = [
  'places.id',
  'places.displayName',
  'places.primaryTypeDisplayName',
  'places.formattedAddress',
  'places.nationalPhoneNumber',
  'places.internationalPhoneNumber',
  'places.rating',
  'places.userRatingCount',
  'places.googleMapsUri',
  'places.websiteUri',
  'places.location',
  'places.businessStatus',
  'places.currentOpeningHours.openNow',
  'nextPageToken',
].join(',');

// كشف شبكة الاتصال العراقية (زين، آسيا سيل، كورك)
function detectIraqiOperator(phone) {
  if (!phone) return { name: 'غير معروف', code: 'unknown', color: '#64748b' };
  const digits = phone.replace(/[^0-9]/g, '');

  // أرقام العراق: 96478X أو 078X زين العراق
  if (/^(?:964|0)?78\d{7,8}$/.test(digits) || /^(?:964|0)?78/.test(digits)) {
    return { name: 'زين العراق', code: 'zain', color: '#0284c7', badge: 'Zain' };
  }
  // أرقام آسيا سيل: 96477X أو 077X
  if (/^(?:964|0)?77\d{7,8}$/.test(digits) || /^(?:964|0)?77/.test(digits)) {
    return { name: 'آسيا سيل', code: 'asiacell', color: '#e11d48', badge: 'Asiacell' };
  }
  // أرقام كورك: 96475X أو 075X
  if (/^(?:964|0)?75\d{7,8}$/.test(digits) || /^(?:964|0)?75/.test(digits)) {
    return { name: 'كورك تيليكوم', code: 'korek', color: '#f59e0b', badge: 'Korek' };
  }
  // خطوط أرضية ومؤسسات
  return { name: 'خط أرضي / دولي', code: 'other', color: '#64748b', badge: 'Landline' };
}

// تنظيف الرقم ليتوافق مع رابط واتساب الدولي wa.me
function formatForWhatsApp(phone) {
  if (!phone) return '';
  let clean = phone.replace(/[^0-9]/g, '');
  if (clean.startsWith('00964')) {
    clean = '964' + clean.slice(5);
  } else if (clean.startsWith('0')) {
    clean = '964' + clean.slice(1);
  } else if (!clean.startsWith('964') && clean.startsWith('7')) {
    clean = '964' + clean;
  }
  return clean;
}

export async function POST(req) {
  const key = process.env.GOOGLE_MAPS_API_KEY;
  if (!key) {
    return NextResponse.json(
      { error: 'مفتاح GOOGLE_MAPS_API_KEY غير موجود في ملف .env.local' },
      { status: 500 }
    );
  }

  let bodyData;
  try {
    bodyData = await req.json();
  } catch (err) {
    return NextResponse.json({ error: 'طلب غير صالح، تأكد من صحة البيانات المرسلة' }, { status: 400 });
  }

  const { query, requirePhone = true, maxPages = 3 } = bodyData;
  if (!query || !query.trim()) {
    return NextResponse.json({ error: 'حقل نص البحث (الاستعلام) مطلوب' }, { status: 400 });
  }

  const results = [];
  let pageToken = undefined;

  try {
    for (let page = 0; page < Math.min(maxPages, 3); page++) {
      const payload = {
        textQuery: query.trim(),
        pageSize: 20,
        languageCode: 'ar',
      };
      if (pageToken) {
        payload.pageToken = pageToken;
      }

      const res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': key,
          'X-Goog-FieldMask': FIELDS,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        return NextResponse.json(
          { error: data?.error?.message || 'تعذر جلب بيانات الأنشطة من محرك البحث' },
          { status: res.status }
        );
      }

      const places = data.places || [];
      for (const p of places) {
        const phone = p.internationalPhoneNumber || p.nationalPhoneNumber || '';
        if (requirePhone && !phone) continue;

        const waPhone = formatForWhatsApp(phone);
        const op = detectIraqiOperator(phone);

        results.push({
          id: p.id,
          name: p.displayName?.text || 'نشاط تجاري بدون اسم',
          category: p.primaryTypeDisplayName?.text || 'نشاط عام',
          phone: p.nationalPhoneNumber || phone,
          internationalPhone: p.internationalPhoneNumber || phone,
          waPhone,
          operator: op,
          address: p.formattedAddress || 'العنوان غير مدرج',
          rating: typeof p.rating === 'number' ? p.rating : null,
          userRatingCount: p.userRatingCount || 0,
          mapsUrl: p.googleMapsUri || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(p.displayName?.text + ' ' + (p.formattedAddress || ''))}`,
          website: p.websiteUri || null,
          location: p.location || null,
          isOpenNow: p.currentOpeningHours?.openNow ?? null,
          status: p.businessStatus || 'OPERATIONAL',
          querySource: query,
        });
      }

      pageToken = data.nextPageToken;
      if (!pageToken) break;

      // انتظار زمني طفيف لتفعيل الـ nextPageToken من Google
      if (page < 2) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    return NextResponse.json({
      success: true,
      query,
      count: results.length,
      results,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error?.message || 'حدث خطأ تقني أثناء معالجة الاستعلام' },
      { status: 500 }
    );
  }
}
