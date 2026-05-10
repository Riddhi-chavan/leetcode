import { useState } from 'react'
import { submitRoleRequest } from '../../../api/roleRequests' // we'll create this

const ProblemSetterRequest = ({ userId }) => {
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState('')
  const [status, setStatus] = useState(null) // null | 'pending' | 'success' | 'error'
  const [msg, setMsg] = useState('')

  const handleSubmit = async () => {
    if (!reason.trim()) return
    setStatus('pending')
    try {
      await submitRoleRequest(reason)
      setStatus('success')
      setMsg('Request submitted! An admin will review it shortly.')
      setOpen(false)
      setReason('')
    } catch (err) {
      setStatus('error')
      setMsg(err.message ?? 'Failed to submit request')
    }
  }

  return (
    <>
      <div className="pt-3 border-t border-[#2a2a2a]">
        {status === 'success' ? (
          <div className="flex items-center gap-2 text-[11px] text-[#00b8a3]">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            Request submitted
          </div>
        ) : (
          <button
            onClick={() => setOpen(true)}
            className="w-full flex items-center justify-center gap-1.5 py-2 rounded-[6px] border border-[#2a2a2a] text-[12px] text-[#6b6b6b] hover:border-[#ffa116]/40 hover:text-[#ffa116] transition-all"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Become a problem setter
          </button>
        )}
        {status === 'error' && (
          <p className="text-[11px] text-[#ff375f] mt-1 text-center">{msg}</p>
        )}
      </div>

      {/* Modal */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
          onClick={(e) => e.target === e.currentTarget && setOpen(false)}
        >
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-[12px] w-full max-w-[400px] mx-4">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#2a2a2a]">
              <span className="text-[14px] font-medium text-[#e8e8e8]">Apply to become a problem setter</span>
              <button onClick={() => setOpen(false)} className="text-[#6b6b6b] hover:text-[#e8e8e8] text-lg leading-none">×</button>
            </div>
            <div className="p-5 flex flex-col gap-3">
              <p className="text-[12px] text-[#6b6b6b] leading-relaxed">
                Tell us why you'd like to create problems. Share your experience with DSA, any problems you've already designed, or what you'd like to contribute.
              </p>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={5}
                placeholder="I have 2 years of competitive programming experience and have designed problems for..."
                className="bg-[#111] border border-[#2a2a2a] rounded-[6px] px-3 py-2 text-[13px] text-[#e8e8e8] placeholder-[#4b4b4b] focus:outline-none focus:border-[#ffa116] transition-colors resize-none"
              />
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
                disabled={!reason.trim() || status === 'pending'}
                className="px-4 py-1.5 bg-[#ffa116] text-black text-[12px] font-medium rounded-[6px] hover:bg-[#ffb84d] transition-colors disabled:opacity-50"
              >
                {status === 'pending' ? 'Submitting...' : 'Submit request'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default  ProblemSetterRequest