import React, { useState, useEffect, useCallback } from 'react'
import { getRoleRequests, reviewRoleRequest } from '../../../api/roleRequests'

function timeAgo(iso) {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

const statusStyle = {
  PENDING:  'bg-[#ffc01e]/10 text-[#ffc01e] border-[#ffc01e]/25',
  APPROVED: 'bg-[#00b8a3]/10 text-[#00b8a3] border-[#00b8a3]/25',
  REJECTED: 'bg-[#ff375f]/10 text-[#ff375f] border-[#ff375f]/25',
}

// ── Toast notification ────────────────────────────────────────────────────────
const Toast = ({ message, type, onDone }) => {
  useEffect(() => {
    const t = setTimeout(onDone, 3000)
    return () => clearTimeout(t)
  }, [onDone])

  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-[8px] border shadow-xl text-[13px] font-medium
      ${type === 'approve'
        ? 'bg-[#00b8a3]/10 border-[#00b8a3]/25 text-[#00b8a3]'
        : 'bg-[#ff375f]/10 border-[#ff375f]/25 text-[#ff375f]'
      }`}
    >
      {type === 'approve' ? (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
      ) : (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      )}
      {message}
    </div>
  )
}

// ── RequestsTab ───────────────────────────────────────────────────────────────
const RequestsTab = () => {
  const [requests, setRequests]   = useState([])
  const [loading, setLoading]     = useState(true)
  const [filter, setFilter]       = useState('PENDING')
  const [acting, setActing]       = useState(null)   // id currently being actioned
  const [counts, setCounts]       = useState({ PENDING: 0, APPROVED: 0, REJECTED: 0 })
  const [toast, setToast]         = useState(null)   // { message, type }

  // ── Fetch requests for current filter ──
  const fetchRequests = useCallback(async (status) => {
    setLoading(true)
    try {
      const data = await getRoleRequests(status)
      setRequests(data.requests)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [])

  // ── Fetch counts for all statuses (for badge numbers on tabs) ──
  const fetchCounts = useCallback(async () => {
    try {
      const [pending, approved, rejected] = await Promise.all([
        getRoleRequests('PENDING'),
        getRoleRequests('APPROVED'),
        getRoleRequests('REJECTED'),
      ])
      setCounts({
        PENDING:  pending.requests.length,
        APPROVED: approved.requests.length,
        REJECTED: rejected.requests.length,
      })
    } catch (err) {
      console.error(err)
    }
  }, [])

  useEffect(() => {
    fetchRequests(filter)
  }, [filter, fetchRequests])

  useEffect(() => {
    fetchCounts()
  }, [fetchCounts])

  const handleReview = async (id, action, userName) => {
    setActing(id)
    try {
      await reviewRoleRequest(id, action)

      // Optimistically remove from current list
      setRequests(r => r.filter(req => req.id !== id))

      // Update counts
      setCounts(c => ({
        ...c,
        PENDING:  Math.max(0, c.PENDING - 1),
        [action === 'approve' ? 'APPROVED' : 'REJECTED']:
          c[action === 'approve' ? 'APPROVED' : 'REJECTED'] + 1,
      }))

      // Show toast
      setToast({
        message: action === 'approve'
          ? `${userName} is now a problem setter`
          : `${userName}'s request rejected`,
        type: action,
      })
    } catch (err) {
      console.error(err)
    } finally {
      setActing(null)
    }
  }

  const TABS = [
    { id: 'PENDING',  label: 'Pending' },
    { id: 'APPROVED', label: 'Approved' },
    { id: 'REJECTED', label: 'Rejected' },
  ]

  return (
    <>
      <div className="flex flex-col gap-5">
        {/* Filter tabs with counts */}
        <div className="flex gap-1 bg-[#1a1a1a] border border-[#2a2a2a] rounded-[10px] p-1 w-fit">
          {TABS.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setFilter(id)}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-[7px] text-[12px] font-medium transition-all ${
                filter === id
                  ? 'bg-[#2a2a2a] text-[#e8e8e8]'
                  : 'text-[#6b6b6b] hover:text-[#e8e8e8]'
              }`}
            >
              {label}
              {counts[id] > 0 && (
                <span className={`text-[10px] px-[5px] py-[1px] rounded-full font-medium ${
                  id === 'PENDING'
                    ? 'bg-[#ffc01e]/20 text-[#ffc01e]'
                    : id === 'APPROVED'
                    ? 'bg-[#00b8a3]/20 text-[#00b8a3]'
                    : 'bg-[#ff375f]/20 text-[#ff375f]'
                }`}>
                  {counts[id]}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-[10px] overflow-hidden">
          <div className="px-5 py-4 border-b border-[#2a2a2a] flex items-center justify-between">
            <span className="text-[13px] font-medium text-[#e8e8e8]">
              {filter.charAt(0) + filter.slice(1).toLowerCase()} Requests
            </span>
            {/* Refresh button */}
            <button
              onClick={() => { fetchRequests(filter); fetchCounts() }}
              className="flex items-center gap-1.5 text-[11px] text-[#6b6b6b] hover:text-[#e8e8e8] transition-colors"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="23 4 23 10 17 10"/>
                <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
              </svg>
              Refresh
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16 gap-3">
              <div className="w-5 h-5 border-2 border-[#ffa116] border-t-transparent rounded-full animate-spin" />
              <span className="text-[12px] text-[#6b6b6b]">Loading requests...</span>
            </div>
          ) : requests.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-1">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#2a2a2a" strokeWidth="1.5">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
              <span className="text-[13px] text-[#6b6b6b] mt-2">
                No {filter.toLowerCase()} requests
              </span>
            </div>
          ) : (
            <div className="divide-y divide-[#1e1e1e]">
              {requests.map(req => (
                <div key={req.id} className="p-5 flex gap-4 items-start hover:bg-[#1e1e1e] transition-colors">

                  {/* Avatar */}
                  <div className="w-[36px] h-[36px] rounded-full flex-shrink-0 overflow-hidden border border-[#2a2a2a]">
                    {req.user.avatar ? (
                      <img src={req.user.avatar} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-[#2a2a2a] flex items-center justify-center text-[12px] font-bold text-[#6b6b6b]">
                        {(req.user.name ?? req.user.email ?? '?')[0].toUpperCase()}
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                      <span className="text-[13px] font-medium text-[#e8e8e8]">
                        {req.user.name ?? 'Anonymous'}
                      </span>
                      <span className="text-[11px] text-[#4b4b4b]">{req.user.email}</span>
                      <span className={`ml-auto text-[10px] px-[6px] py-[2px] rounded-[4px] border font-medium ${statusStyle[req.status]}`}>
                        {req.status.charAt(0) + req.status.slice(1).toLowerCase()}
                      </span>
                    </div>

                    {/* Reason */}
                    <p className="text-[12px] text-[#6b6b6b] leading-relaxed mt-1 line-clamp-3">
                      {req.reason}
                    </p>

                    {/* Footer */}
                    <div className="flex items-center gap-4 mt-3 flex-wrap">
                      <span className="text-[11px] text-[#4b4b4b]">
                        Applied {timeAgo(req.createdAt)}
                      </span>

                      {req.status === 'PENDING' && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleReview(req.id, 'approve', req.user.name ?? req.user.email)}
                            disabled={acting === req.id}
                            className="flex items-center gap-1.5 px-3 py-1 rounded-[5px] bg-[#00b8a3]/10 border border-[#00b8a3]/25 text-[#00b8a3] text-[11px] font-medium hover:bg-[#00b8a3]/20 transition-all disabled:opacity-50"
                          >
                            {acting === req.id ? (
                              <div className="w-3 h-3 border border-[#00b8a3]/40 border-t-[#00b8a3] rounded-full animate-spin" />
                            ) : (
                              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <polyline points="20 6 9 17 4 12"/>
                              </svg>
                            )}
                            Approve
                          </button>

                          <button
                            onClick={() => handleReview(req.id, 'reject', req.user.name ?? req.user.email)}
                            disabled={acting === req.id}
                            className="flex items-center gap-1.5 px-3 py-1 rounded-[5px] bg-[#ff375f]/10 border border-[#ff375f]/25 text-[#ff375f] text-[11px] font-medium hover:bg-[#ff375f]/20 transition-all disabled:opacity-50"
                          >
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <line x1="18" y1="6" x2="6" y2="18"/>
                              <line x1="6" y1="6" x2="18" y2="18"/>
                            </svg>
                            Reject
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onDone={() => setToast(null)}
        />
      )}
    </>
  )
}

export default RequestsTab