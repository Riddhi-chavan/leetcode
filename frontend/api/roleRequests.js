const BASE = 'http://localhost:3000/api/v1'
export const submitRoleRequest = async (reason) => {
  const res = await fetch(`${BASE}/role-requests`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ reason })
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error ?? 'Failed to submit')
  return data
}

export const getRoleRequests = async (status = 'PENDING') => {
  const res = await fetch(`${BASE}/role-requests?status=${status}`, {
    credentials: 'include'
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error ?? 'Failed to fetch')
  return data
}

export const reviewRoleRequest = async (id, action) => {
  const res = await fetch(`${BASE}/role-requests/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ action })
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error ?? 'Failed to review')
  return data
}

export const getMyRoleRequestStatus = async () => {
  const res = await fetch(`${BASE}/role-requests/my-status`, { credentials: 'include' })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error ?? 'Failed to fetch')
  return data.request // null | { status, createdAt, updatedAt }
}