import React, { useState, useRef, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const Navbar = ({ setSearch, search }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const { currentUser } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)

  const isAdmin = currentUser?.role === 'ADMIN'

  const initials = currentUser
    ? (currentUser.name ?? currentUser.email ?? '?')
        .split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()
    : 'U'

  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <nav className="h-[50px] bg-[#1a1a1a] border-b border-[#2a2a2a] flex items-center px-6 gap-6 sticky top-0 z-50">
      <span
        onClick={() => navigate('/problemset')}
        className="text-[#ffa116] font-bold text-[18px] tracking-tight cursor-pointer"
      >
        leet<span className="text-white">code</span>
      </span>

      <div className="flex gap-1 ml-4">
        {['Explore', 'Problems', 'Discuss', 'Interview'].map((item) => (
          <button
            key={item}
            onClick={() => item === 'Problems' && navigate('/problemset')}
            className={`px-3 h-[50px] text-[13px] transition-colors ${
              item === 'Problems'
                ? 'text-white border-b-2 border-[#ffa116]'
                : 'text-[#6b6b6b] hover:text-[#e8e8e8]'
            }`}
          >
            {item}
          </button>
        ))}
      </div>

      <div className="ml-auto flex items-center gap-3">

        {/* Admin CTA — only visible to admins */}
        {isAdmin && (
          <button
            onClick={() => navigate('/admin/create-problem')}
            className="flex items-center gap-1.5 px-3 h-[30px] rounded-[6px] bg-[#ffa116]/10 border border-[#ffa116]/30 text-[#ffa116] text-[12px] font-medium hover:bg-[#ffa116]/20 hover:border-[#ffa116]/60 transition-all"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Create problem
          </button>
        )}

        {/* Search */}
        <div className="relative">
          <svg
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#6b6b6b]"
            width="14" height="14" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" strokeWidth="2"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <input
            className="w-[200px] h-[32px] bg-[#2a2a2a] rounded-[6px] pl-8 pr-3 text-[13px] outline-none border border-transparent focus:border-[#ffa116]/40 text-[#e8e8e8] placeholder:text-[#6b6b6b]"
            placeholder="Search problems..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Avatar with dropdown */}
        <div className="relative flex-shrink-0" ref={menuRef}>
          <button
            onClick={() => setMenuOpen(o => !o)}
            className="w-[32px] h-[32px] rounded-full overflow-hidden flex items-center justify-center text-black text-[13px] font-bold hover:ring-2 hover:ring-[#ffa116]/60 transition-all cursor-pointer"
          >
            {currentUser?.avatar ? (
              <img
                src={currentUser.avatar}
                alt={currentUser.name ?? 'avatar'}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-[#ffa116] flex items-center justify-center text-black text-[12px] font-bold">
                {initials}
              </div>
            )}
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-[40px] w-[180px] bg-[#1e1e1e] border border-[#2a2a2a] rounded-[8px] shadow-xl overflow-hidden z-50">

              {/* User info + role badge */}
              <div className="px-3 py-2.5 border-b border-[#2a2a2a]">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[12px] font-medium text-[#e8e8e8] truncate">
                    {currentUser?.name ?? 'Anonymous'}
                  </p>
                  {/* Role badge */}
                  {isAdmin ? (
                    <span className="flex-shrink-0 text-[10px] px-[6px] py-[2px] rounded-[4px] bg-[#ffa116]/15 text-[#ffa116] border border-[#ffa116]/25 font-medium">
                      Admin
                    </span>
                  ) : (
                    <span className="flex-shrink-0 text-[10px] px-[6px] py-[2px] rounded-[4px] bg-[#2a2a2a] text-[#6b6b6b] border border-[#333] font-medium">
                      User
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-[#6b6b6b] truncate mt-0.5">
                  {currentUser?.email}
                </p>
              </div>

              {/* View Profile */}
              <button
                onClick={() => { setMenuOpen(false); navigate(`/profile/${currentUser?.id}`) }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-[13px] text-[#c8c8c8] hover:bg-[#2a2a2a] hover:text-[#e8e8e8] transition-colors text-left"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
                View Profile
              </button>

              {/* Edit Profile */}
              <button
                onClick={() => { setMenuOpen(false); navigate(`/profile/${currentUser?.id}?edit=true`) }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-[13px] text-[#c8c8c8] hover:bg-[#2a2a2a] hover:text-[#e8e8e8] transition-colors text-left"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
                Edit Profile
              </button>

              {/* Admin dashboard — only for admins */}
              {isAdmin && (
                <button
                  onClick={() => { setMenuOpen(false); navigate('/admin/dashboard') }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-[13px] text-[#ffa116] hover:bg-[#2a2a2a] transition-colors text-left"
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
                    <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
                  </svg>
                  Admin dashboard
                </button>
              )}

              {/* Divider + logout */}
              <div className="border-t border-[#2a2a2a]">
                <button
                  onClick={() => { setMenuOpen(false); /* call your logout fn here */ }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-[13px] text-[#6b6b6b] hover:bg-[#2a2a2a] hover:text-[#ff375f] transition-colors text-left"
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                    <polyline points="16 17 21 12 16 7"/>
                    <line x1="21" y1="12" x2="9" y2="12"/>
                  </svg>
                  Sign out
                </button>
              </div>

            </div>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navbar