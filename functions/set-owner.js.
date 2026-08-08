// functions/set-owner.js
exports.handler = async (event, context) => {
  const { token } = event.queryStringParameters || {};
  const OWNER_TOKEN = process.env.OWNER_TOKEN;
  if (!OWNER_TOKEN) {
    return { statusCode: 500, body: 'owner token not configured' };
  }
  if (!token || token !== OWNER_TOKEN) {
    return { statusCode: 403, body: 'invalid token' };
  }

  const maxAge = 60 * 60 * 24 * 7; // 7 días
  const cookie = `owner=1; Path=/; Max-Age=${maxAge}; HttpOnly; Secure; SameSite=Strict`;

  return {
    statusCode: 302,
    headers: {
      'Set-Cookie': cookie,
      'Location': '/' // redirige a home
    },
    body: ''
  };
};
