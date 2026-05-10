import React, { useState, useEffect } from 'react'
import { submitRoleRequest, getMyRoleRequestStatus } from '../../../api/roleRequests'

const STATUS_CONFIG = {
  PENDING: {
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ffc01e" strokeWidth="2">
        <circle cx="12" cy="12" r="10"/>
        <polyline points="12 6 12 12 16 14"/>
      </svg>
    ),
    color: 'text-[#ffc01e]',
    bg: 'bg-[#ffc01e]/5 border-[#ffc01e]/20',
    title: 'Request pending',
    desc: 'An admin will review your application shortly.',
  },
  APPROVED: {
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#00b8a3" strokeWidth="2.5">
        <polyline points="20 6 9 17 4 12"/>
      </svg>
    ),
    color: 'text-[#00b8a3]',
    bg: 'bg-[#00b8a3]/5 border-[#00b8a3]/20',
    title: 'Request approved!',
    desc: 'You are now a problem setter. Re-login to see the Create Problem button.',
  },
  REJECTED: {
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ff375f" strokeWidth="2">
        <circle cx="12" cy="12" r="10"/>
        <line x1="15" y1="9" x2="9" y2="15"/>
        <line x1="9" y1="9" x2="15" y2="15"/>
      </svg>
    ),
    color: 'text-[#ff375f]',
    bg: 'bg-[#ff375f]/5 border-[#ff375f]/20',
    title: 'Request rejected',
    desc: 'Your application was not approved. You may re-apply with a stronger reason.',
  },
}

const ProblemSetterRequest = ({ userId }) => {
  const [requestStatus, setRequestStatus] = useState(null) // null | 'PENDING' | 'APPROVED' | 'REJECTED'
  const [loading, setLoading]             = useState(true)
  const [open, setOpen]                   = useState(false)
  const [reason, setReason]               = useState('')
  const [submitting, setSubmitting]       = useState(false)
  const [submitError, setSubmitError]     = useState('')

  useEffect(() => {
    getMyRoleRequestStatus()
      .then(req => setRequestStatus(req?.status ?? null))
      .catch(() => setRequestStatus(null))
      .finally(() => setLoading(false))
  }, [userId])

  const handleSubmit = async () => {
    if (!reason.trim()) return
    setSubmitting(true)
    setSubmitError('')
    try {
      await submitRoleRequest(reason)
      setRequestStatus('PENDING')
      setOpen(false)
      setReason('')
    } catch (err) {
      setSubmitError(err.message ?? 'Failed to submit request')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="pt-3 border-t border-[#2a2a2a]">
        <div className="h-[32px] bg-[#1a1a1a] rounded-[6px] animate-pulse" />
      </div>
    )
  }

  const cfg = requestStatus ? STATUS_CONFIG[requestStatus] : null

  return (
    <>
      <div className="pt-3 border-t border-[#2a2a2a]">
        {/* No request yet */}
        {!requestStatus && (
          <button
            onClick={() => setOpen(true)}
            className="w-full flex items-center justify-center gap-1.5 py-2 rounded-[6px] border border-[#2a2a2a] text-[12px] text-[#6b6b6b] hover:border-[#ffa116]/40 hover:text-[#ffa116] transition-all"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Become a problem setter
          </button>
        )}

        {/* Status card */}
        {cfg && (
          <div className={`rounded-[8px] border px-3 py-2.5 flex flex-col gap-1.5 ${cfg.bg}`}>
            <div className={`flex items-center gap-1.5 text-[12px] font-medium ${cfg.color}`}>
              {cfg.icon}
              {cfg.title}
            </div>
            <p className="text-[11px] text-[#6b6b6b] leading-relaxed">{cfg.desc}</p>

            {/* Re-apply button on rejection */}
            {requestStatus === 'REJECTED' && (
              <button
                onClick={() => { setReason(''); setOpen(true) }}
                className="mt-1 self-start text-[11px] text-[#ffa116] hover:underline"
              >
                Re-apply →
              </button>
            )}
          </div>
        )}
      </div>

      {/* Modal */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
          onClick={e => e.target === e.currentTarget && setOpen(false)}
        >
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-[12px] w-full max-w-[400px] mx-4">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#2a2a2a]">
              <span className="text-[14px] font-medium text-[#e8e8e8]">
                {requestStatus === 'REJECTED' ? 'Re-apply as problem setter' : 'Apply to become a problem setter'}
              </span>
              <button onClick={() => setOpen(false)} className="text-[#6b6b6b] hover:text-[#e8e8e8] text-lg leading-none">×</button>
            </div>
            <div className="p-5 flex flex-col gap-3">
              {requestStatus === 'REJECTED' && (
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
                placeholder="I have 2 years of competitive programming experience and have designed problems for..."
                className="bg-[#111] border border-[#2a2a2a] rounded-[6px] px-3 py-2 text-[13px] text-[#e8e8e8] placeholder-[#4b4b4b] focus:outline-none focus:border-[#ffa116] transition-colors resize-none"
              />
              {submitError && (
                <p className="text-[11px] text-[#ff375f]">{submitError}</p>
              )}
            </div>
            <div className="px-5 pb-4 flex justify-end gap-2">
              <button
                onClick={() => setOpen(false)}
                className="px-4 py-1.5 text-[12px] text-[#6b6b6b] hover:text-[#e8e8e8] transition-colors"
              >
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
    </>
  )
}

export default ProblemSetterRequest