import React from 'react'
import { useAuth } from '../../context/AuthContext'

const RoleChangeBanner = () => {
  const { roleChange, dismissRoleChange } = useAuth()

  if (!roleChange) return null

  const { from, to, type } = roleChange
  const wasAdmin   = from === 'ADMIN'
  const isNowAdmin = to === 'ADMIN'
  console.log("roleChange" ,roleChange)

  // ── Session expired / user deleted ────────────────────────────────────────
  if (type === 'session_expired') {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70">
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-[12px] w-full max-w-[380px] mx-4 p-6 flex flex-col gap-4 text-center">
          <div className="w-12 h-12 rounded-full bg-[#ff375f]/10 flex items-center justify-center mx-auto">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ff375f" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
          </div>
          <div>
            <p className="text-[15px] font-semibold text-[#e8e8e8]">Session ended</p>
            <p className="text-[12px] text-[#6b6b6b] mt-1 leading-relaxed">
              Your session is no longer valid. Please sign in again.
            </p>
          </div>
          <button
            onClick={() => { dismissRoleChange(); window.location.href = '/login' }}
            className="w-full py-2 bg-[#ffa116] text-black text-[13px] font-medium rounded-[6px] hover:bg-[#ffb84d] transition-colors"
          >
            Sign in
          </button>
        </div>
      </div>
    )
  }

  // ── Demoted: ADMIN → USER ─────────────────────────────────────────────────
  if (wasAdmin && !isNowAdmin) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70">
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-[12px] w-full max-w-[400px] mx-4 p-6 flex flex-col gap-4">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-[#ff375f]/10 flex items-center justify-center flex-shrink-0">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ff375f" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
            </div>
            <div>
              <p className="text-[14px] font-semibold text-[#e8e8e8]">Admin access removed</p>
              <p className="text-[12px] text-[#6b6b6b] mt-1 leading-relaxed">
                Your admin privileges have been revoked. You no longer have access to problem creation or the admin dashboard.
              </p>
            </div>
          </div>

          {/* Role transition visual */}
          <div className="flex items-center gap-2 p-3 rounded-[8px] bg-[#111] border border-[#2a2a2a]">
            <span className="text-[11px] px-[6px] py-[2px] rounded-[4px] bg-[#ffa116]/15 text-[#ffa116] border border-[#ffa116]/25 font-medium line-through opacity-40">
              Admin
            </span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4b4b4b" strokeWidth="2">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
            <span className="text-[11px] px-[6px] py-[2px] rounded-[4px] bg-[#2a2a2a] text-[#6b6b6b] border border-[#333] font-medium">
              User
            </span>
          </div>

          <button
            onClick={() => {
              dismissRoleChange()
              if (window.location.pathname.startsWith('/admin')) {
                window.location.href = '/problemset'
              }
            }}
            className="w-full py-2 bg-[#2a2a2a] text-[#e8e8e8] text-[13px] font-medium rounded-[6px] hover:bg-[#333] transition-colors"
          >
            Got it
          </button>
        </div>
      </div>
    )
  }

  // ── Promoted: USER → ADMIN ────────────────────────────────────────────────
  if (!wasAdmin && isNowAdmin) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70">
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-[12px] w-full max-w-[400px] mx-4 p-6 flex flex-col gap-4">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-[#ffa116]/10 flex items-center justify-center flex-shrink-0">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ffa116" strokeWidth="2">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
              </svg>
            </div>
            <div>
              <p className="text-[14px] font-semibold text-[#e8e8e8]">You're now a problem setter!</p>
              <p className="text-[12px] text-[#6b6b6b] mt-1 leading-relaxed">
                An admin approved your request. You can now create and manage problems on the platform.
              </p>
            </div>
          </div>

          {/* Role transition visual */}
          <div className="flex items-center gap-2 p-3 rounded-[8px] bg-[#111] border border-[#2a2a2a]">
            <span className="text-[11px] px-[6px] py-[2px] rounded-[4px] bg-[#2a2a2a] text-[#6b6b6b] border border-[#333] font-medium line-through opacity-40">
              User
            </span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4b4b4b" strokeWidth="2">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
            <span className="text-[11px] px-[6px] py-[2px] rounded-[4px] bg-[#ffa116]/15 text-[#ffa116] border border-[#ffa116]/25 font-medium">
              Admin
            </span>
          </div>

          <div className="flex gap-2">
            <button
              onClick={dismissRoleChange}
              className="flex-1 py-2 bg-[#2a2a2a] text-[#6b6b6b] text-[13px] rounded-[6px] hover:bg-[#333] hover:text-[#e8e8e8] transition-colors"
            >
              Dismiss
            </button>
            <button
              onClick={() => { dismissRoleChange(); window.location.href = '/admin/create-problem' }}
              className="flex-1 py-2 bg-[#ffa116] text-black text-[13px] font-medium rounded-[6px] hover:bg-[#ffb84d] transition-colors"
            >
              Create a problem →
            </button>
          </div>
        </div>
      </div>
    )
  }

  return null
}

export default RoleChangeBanner