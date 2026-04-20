export async function api(path, { method = 'GET', token, body, headers = {} } = {}) {
  const h = { ...headers };
  if (body !== undefined && !h['Content-Type']) {
    h['Content-Type'] = 'application/json';
  }
  if (token) {
    h.Authorization = `Bearer ${token}`;
  }
  const res = await fetch(path, {
    method,
    headers: h,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = { message: text || 'Invalid response' };
  }
  if (!res.ok) {
    const err = new Error(data?.message || res.statusText || 'Request failed');
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}
