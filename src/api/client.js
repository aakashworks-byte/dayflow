// Central place for ALL backend communication.
// When your friend's backend is ready, you only need to change:
//   1. VITE_API_BASE_URL in your .env file
//   2. the endpoint paths below, if their routes differ

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '/api'

async function request(path, options = {}) {
  const token = localStorage.getItem('auth_token')

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })

  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new Error(`API error ${res.status}: ${body || res.statusText}`)
  }

  // Handle empty responses (e.g. 204 No Content on DELETE)
  const contentType = res.headers.get('content-type')
  if (contentType && contentType.includes('application/json')) {
    return res.json()
  }
  return null
}

export const api = {
  get: (path) => request(path, { method: 'GET' }),
  post: (path, data) => request(path, { method: 'POST', body: JSON.stringify(data) }),
  put: (path, data) => request(path, { method: 'PUT', body: JSON.stringify(data) }),
  patch: (path, data) => request(path, { method: 'PATCH', body: JSON.stringify(data) }),
  delete: (path) => request(path, { method: 'DELETE' }),
}

// Example resource-specific functions — rename/adjust to match your friend's actual routes
export const itemsApi = {
  list: () => api.get('/items'),
  create: (item) => api.post('/items', item),
  remove: (id) => api.delete(`/items/${id}`),
}
