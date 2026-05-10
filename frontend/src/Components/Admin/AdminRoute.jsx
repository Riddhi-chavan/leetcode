import React, { useState, useEffect } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { getMyRoleRequestStatus, submitRoleRequest } from '../../../api/roleRequests'

// ── Access denied page ────────────────────────────────────────────────────────
const AccessDenied = () => {
  const navigate = useNavigate()
  const { currentUser } = useAuth()

  const [requestStatus, setRequestStatus] = useState(null) // null | 'PENDING' | 'APPROVED' | 'REJECTED'
  const [loadingStatus, setLoadingStatus] = useState(true)
  const [open, setOpen]                   = useState(false)
  const [reason, setReason]               = useState('')
  const [submitting, setSubmitting]       = useState(false)
  const [submitError, setSubmitError]     = useState('')
  const [submitted, setSubmitted]         = useState(false)

  useEffect(() => {
    getMyRoleRequestStatus()
      .then(req => setRequestStatus(req?.status ?? null))
      .catch(() => setRequestStatus(null))
      .finally(() => setLoadingStatus(false))
  }, [])

  const handleSubmit = async () => {
    if (!reason.trim()) return
    setSubmitting(true)
    setSubmitError('')
    try {
      await submitRoleRequest(reason)
      setRequestStatus('PENDING')
      setSubmitted(true)
      setOpen(false)
      setReason('')
    } catch (err) {
      setSubmitError(err.message ?? 'Failed to submit')
    } finally {
      setSubmitting(false)
    }
  }

  const alreadyPending  = requestStatus === 'PENDING'
  const wasRejected     = requestStatus === 'REJECTED'

  return (
    <div className="min-h-screen bg-[#111111] text-[#e8e8e8] flex flex-col">
      {/* Minimal topbar */}
      <div className="h-[50px] bg-[#1a1a1a] border-b border-[#2a2a2a] flex items-center px-6">
        <button
          onClick={() => navigate('/problemset')}
          className="text-[#ffa116] font-bold text-[18px] tracking-tight"
        >
          leet<span className="text-white">code</span>
        </button>
      </div>

      {/* Centered content */}
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="flex flex-col items-center text-center max-w-[420px] gap-6">

          {/* Icon */}
          <div className="w-[72px] h-[72px] rounded-full bg-[#1a1a1a] border border-[#2a2a2a] flex items-center justify-center">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#6b6b6b" strokeWidth="1.5">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
          </div>

          {/* Text */}
          <div className="flex flex-col gap-2">
            <h1 className="text-[20px] font-semibold text-[#e8e8e8]">Access restricted</h1>
            <p className="text-[13px] text-[#6b6b6b] leading-relaxed">
              This page is only available to problem setters. You can apply to become one — an admin will review your request.
            </p>
          </div>

          {/* Status-aware CTA */}
          {loadingStatus ? (
            <div className="w-5 h-5 border-2 border-[#ffa116] border-t-transparent rounded-full animate-spin" />
          ) : (

            // ── Already approved (shouldn't happen but safe) ──
            requestStatus === 'APPROVED' ? (
              <div className="flex items-center gap-2 text-[13px] text-[#00b8a3]">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                You're approved — try logging out and back in.
              </div>

            // ── Pending ──
            ) : alreadyPending || submitted ? (
              <div className="w-full flex flex-col items-center gap-3">
                <div className="w-full flex items-center gap-3 p-4 rounded-[10px] bg-[#ffc01e]/5 border border-[#ffc01e]/20">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ffc01e" strokeWidth="2" className="flex-shrink-0">
                    <circle cx="12" cy="12" r="10"/>
                    <polyline points="12 6 12 12 16 14"/>
                  </svg>
                  <div className="flex flex-col gap-0.5 text-left">
                    <span className="text-[12px] font-medium text-[#ffc01e]">Request pending review</span>
                    <span className="text-[11px] text-[#6b6b6b]">An admin will approve or reject your application.</span>
                  </div>
                </div>
                <button
                  onClick={() => navigate('/problemset')}
                  className="text-[12px] text-[#6b6b6b] hover:text-[#e8e8e8] transition-colors"
                >
                  ← Back to problems
                </button>
              </div>

            // ── Rejected ──
            ) : wasRejected ? (
              <div className="w-full flex flex-col items-center gap-3">
                <div className="w-full flex items-center gap-3 p-4 rounded-[10px] bg-[#ff375f]/5 border border-[#ff375f]/20">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ff375f" strokeWidth="2" className="flex-shrink-0">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="15" y1="9" x2="9" y2="15"/>
                    <line x1="9" y1="9" x2="15" y2="15"/>
                  </svg>
                  <div className="flex flex-col gap-0.5 text-left">
                    <span className="text-[12px] font-medium text-[#ff375f]">Previous request rejected</span>
                    <span className="text-[11px] text-[#6b6b6b]">You can re-apply with a stronger reason.</span>
                  </div>
                </div>
                <button
                  onClick={() => { setReason(''); setOpen(true) }}
                  className="px-5 py-2 bg-[#ffa116] text-black text-[13px] font-medium rounded-[6px] hover:bg-[#ffb84d] transition-colors"
                >
                  Re-apply
                </button>
                <button
                  onClick={() => navigate('/problemset')}
                  className="text-[12px] text-[#6b6b6b] hover:text-[#e8e8e8] transition-colors"
                >
                  ← Back to problems
                </button>
              </div>

            // ── No request yet ──
            ) : (
              <div className="flex flex-col items-center gap-3 w-full">
                <button
                  onClick={() => setOpen(true)}
                  className="w-full px-5 py-2.5 bg-[#ffa116] text-black text-[13px] font-medium rounded-[6px] hover:bg-[#ffb84d] transition-colors"
                >
                  Apply to become a problem setter
                </button>
                <button
                  onClick={() => navigate('/problemset')}
                  className="text-[12px] text-[#6b6b6b] hover:text-[#e8e8e8] transition-colors"
                >
                  ← Back to problems
                </button>
              </div>
            )
          )}
        </div>
      </div>

      {/* Apply modal */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
          onClick={e => e.target === e.currentTarget && setOpen(false)}
        >
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-[12px] w-full max-w-[400px] mx-4">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#2a2a2a]">
              <span className="text-[14px] font-medium text-[#e8e8e8]">
                {wasRejected ? 'Re-apply as problem setter' : 'Apply to become a problem setter'}
              </span>
              <button onClick={() => setOpen(false)} className="text-[#6b6b6b] hover:text-[#e8e8e8] text-lg">×</button>
            </div>

            <div className="p-5 flex flex-col gap-3">
              {wasRejected && (
                <div className="flex items-start gap-2 p-3 rounded-[6px] bg-[#ff375f]/5 border border-[#ff375f]/15">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#ff375f" strokeWidth="2" className="mt-0.5 flex-shrink-0">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="8" x2="12" y2="12"/>
                    <line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                  <p className="text-[11px] text-[#ff375f]/80">
                    Your previous request was rejected. Strengthen your reason to improve your chances.
                  </p>
                </div>
              )}
              <p className="text-[12px] text-[#6b6b6b] leading-relaxed">
                Tell us why you'd like to create problems — your DSA experience, problems you've designed, or what you'd like to contribute.
              </p>
              <textarea
                value={reason}
                onChange={e => setReason(e.target.value)}
                rows={5}
                placeholder="I have 2 years of competitive programming experience..."
                className="bg-[#111] border border-[#2a2a2a] rounded-[6px] px-3 py-2 text-[13px] text-[#e8e8e8] placeholder-[#4b4b4b] focus:outline-none focus:border-[#ffa116] transition-colors resize-none"
              />
              {submitError && <p className="text-[11px] text-[#ff375f]">{submitError}</p>}
            </div>

            <div className="px-5 pb-4 flex justify-end gap-2">
              <button onClick={() => setOpen(false)} className="px-4 py-1.5 text-[12px] text-[#6b6b6b] hover:text-[#e8e8e8] transition-colors">
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={!reason.trim() || submitting}
                className="px-4 py-1.5 bg-[#ffa116] text-black text-[12px] font-medium rounded-[6px] hover:bg-[#ffb84d] transition-colors disabled:opacity-50"
              >
                {submitting ? 'Submitting...' : 'Submit request'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── AdminRoute ────────────────────────────────────────────────────────────────
const AdminRoute = ({ children }) => {
  const { currentUser, authLoading } = useAuth()

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#111111] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-[#ffa116] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!currentUser) return <Navigate to="/login" replace />

  // Not admin → show access denied page instead of redirecting
  if (currentUser.role !== 'ADMIN') return <AccessDenied />

  return children
}

export default AdminRoute