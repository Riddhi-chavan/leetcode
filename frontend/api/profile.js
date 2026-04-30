const BASE = 'http://localhost:3000/api/v1'

export const getProfile = async (userId) => {
  const response = await fetch(`${BASE}/profile/${userId}`, {
    credentials: 'include',
  })
  const data = await response.json()
  if (!response.ok) throw new Error(data.error || 'Failed to fetch profile')
  return data
}

export const updateProfile = async (form) => {
  const response = await fetch(`${BASE}/profile/update`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(form),
  })
  const data = await response.json()
  if (!response.ok) throw new Error(data.error || 'Failed to update profile')
  return data
}