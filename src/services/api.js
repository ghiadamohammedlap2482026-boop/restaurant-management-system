const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost/restaurant-management-react/backend/api')
  .replace(/\/+$/, '')

async function request(path, options = {}) {
  let response
  try {
    response = await fetch(`${API_BASE_URL}/${path}`, {
      ...options,
      headers: {
        Accept: 'application/json',
        ...(options.body ? { 'Content-Type': 'application/json' } : {}),
        ...options.headers,
      },
    })
  } catch {
    throw new Error('Could not connect to the reservation service. Check that Apache and MySQL are running.')
  }

  let payload
  try {
    payload = await response.json()
  } catch {
    throw new Error('The reservation service returned an unreadable response.')
  }
  if (!response.ok) throw new Error(payload.message || 'The request could not be completed.')
  return payload
}

export async function getReservations() {
  const payload = await request('reservations.php')
  return payload.data
}

export async function createReservation(data) {
  const payload = await request('reservations.php', { method: 'POST', body: JSON.stringify(data) })
  return payload
}

export async function updateReservation(id, data) {
  const payload = await request(`reservations.php?id=${encodeURIComponent(id)}`, { method: 'PATCH', body: JSON.stringify(data) })
  return payload.data
}

export async function deleteReservation(id) {
  return request(`reservations.php?id=${encodeURIComponent(id)}`, { method: 'DELETE' })
}
