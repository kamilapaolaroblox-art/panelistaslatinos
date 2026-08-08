// functions/check-geo.js
exports.handler = async (event, context) => {
  try {
    const xf = event.headers['x-forwarded-for'] || event.headers['x-nf-client-connection-ip'] || event.headers['client-ip'] || '';
    const ip = xf.split(',')[0].trim() || '';

    const cookies = event.headers.cookie || '';
    if (cookies.includes('owner=1')) {
      return { statusCode: 200, body: JSON.stringify({ allowed: true, reason: 'owner_bypass' }) };
    }

    if (!ip) return { statusCode: 200, body: JSON.stringify({ allowed: false, reason: 'no_ip' }) };

    const IPQS_KEY = process.env.IPQS_KEY;
    if (!IPQS_KEY) return { statusCode: 500, body: JSON.stringify({ allowed: false, reason: 'no_api_key' }) };

    const url = `https://ipqualityscore.com/api/json/ip/${IPQS_KEY}/${ip}?strictness=1`;
    const r = await fetch(url, { method: 'GET', timeout: 7000 });
    const data = await r.json();

    const country = (data.country_code || '').toUpperCase();
    const isProxy = !!data.proxy;
    const isVpn = !!data.vpn;
    const isTor = !!data.tor;

    if (country !== 'US') return { statusCode: 200, body: JSON.stringify({ allowed: false, reason: 'country_not_us', country }) };
    if (isProxy || isVpn || isTor) return { statusCode: 200, body: JSON.stringify({ allowed: false, reason: 'proxy_or_vpn_or_tor', proxy:isProxy, vpn:isVpn, tor:isTor }) };

    return { statusCode: 200, body: JSON.stringify({ allowed: true, reason: 'ok', country }) };

  } catch (err) {
    console.error('check-geo error', err);
    return { statusCode: 200, body: JSON.stringify({ allowed: false, reason: 'error_internal' }) };
  }
};
