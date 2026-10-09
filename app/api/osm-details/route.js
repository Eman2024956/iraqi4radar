import { NextResponse } from 'next/server';

export async function POST(req) {
  let bodyData;
  try {
    bodyData = await req.json();
  } catch (err) {
    return NextResponse.json({ error: 'طلب غير صالح، يرجى إرسال بيانات JSON صحيحة' }, { status: 400 });
  }

  const { osmId, osmType = 'N' } = bodyData;

  if (!osmId) {
    return NextResponse.json({ error: 'حقل osmId مطلوب لجلب تفاصيل المكان من OpenStreetMap' }, { status: 400 });
  }

  // تنظيف نوع العنصر في OSM (N = Node, W = Way, R = Relation)
  const cleanType = String(osmType).toUpperCase().charAt(0) || 'N';

  try {
    const detailsUrl = `https://nominatim.openstreetmap.org/details?osmtype=${cleanType}&osmid=${encodeURIComponent(
      osmId
    )}&format=json&addressdetails=1&extratags=1&namedetails=1`;

    const res = await fetch(detailsUrl, {
      headers: {
        'User-Agent': 'IraqBusinessRadar/2.0 (https://iraqi4radar.vercel.app)',
        'Accept-Language': 'ar, en',
      },
    });

    if (!res.ok) {
      throw new Error(`استجابة خادم OpenStreetMap: كود ${res.status}`);
    }

    const data = await res.json();
    const tags = data.extratags || {};
    const names = data.names || {};
    const coords = data.centroid?.coordinates || [];

    const lat = coords[1] || null;
    const lon = coords[0] || null;

    const typePath = cleanType === 'W' ? 'way' : cleanType === 'R' ? 'relation' : 'node';

    return NextResponse.json({
      success: true,
      osmId: data.osm_id,
      osmType: cleanType,
      placeId: data.place_id,
      category: data.category,
      type: data.type,
      localname: data.localname,
      names: {
        ar: names['name:ar'] || names.name || data.localname || '',
        en: names['name:en'] || '',
        ku: names['name:ku'] || '',
        raw: names,
      },
      contacts: {
        phone: tags.phone || tags['contact:phone'] || tags['contact:mobile'] || tags['contact:whatsapp'] || '',
        email: tags.email || tags['contact:email'] || '',
        website: tags.website || tags['contact:website'] || '',
        facebook: tags['contact:facebook'] || '',
        instagram: tags['contact:instagram'] || '',
      },
      businessInfo: {
        openingHours: tags.opening_hours || '',
        brand: tags.brand || tags['brand:ar'] || '',
        operator: tags.operator || tags['operator:ar'] || '',
        cuisine: tags.cuisine || '',
        wheelchair: tags.wheelchair || '',
        delivery: tags.delivery || '',
        takeaway: tags.takeaway || '',
      },
      address: {
        street: data.addresstags?.street || '',
        postcode: data.calculated_postcode || '',
        countryCode: data.country_code || 'iq',
        raw: data.addresstags || {},
      },
      location: {
        lat,
        lon,
      },
      links: {
        osm: `https://www.openstreetmap.org/${typePath}/${data.osm_id}`,
        googleMaps: lat && lon ? `https://www.google.com/maps/search/?api=1&query=${lat},${lon}` : null,
      },
      allTags: tags,
    });
  } catch (error) {
    console.error('OSM Details error:', error);
    return NextResponse.json(
      { error: `تعذر جلب تفاصيل المكان من OpenStreetMap: ${error.message}` },
      { status: 500 }
    );
  }
}
