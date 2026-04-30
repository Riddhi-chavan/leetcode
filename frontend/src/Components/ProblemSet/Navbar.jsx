import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const Navbar = ({ setSearch, search }) => {
  const navigate = useNavigate()
  const { currentUser } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)

  const initials = currentUser
    ? (currentUser.name ?? currentUser.email ?? '?')
        .split(' ')
        .map((w) => w[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : 'U'

  // Close menu when clicking outside
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
      <span className="text-[#ffa116] font-bold text-[18px] tracking-tight">
        leet<span className="text-white">code</span>
      </span>

      <div className="flex gap-1 ml-4">
        {['Explore', 'Problems', 'Discuss', 'Interview'].map((item) => (
          <button
            key={item}
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
            className="w-[32px] h-[32px] rounded-full overflow-hidden flex items-center justify-center text-black text-[13px] font-bold
                       hover:ring-2 hover:ring-[#ffa116]/60 transition-all cursor-pointer"
          >
            {currentUser?.avatar ? (
              <img
                src={currentUser.avatar}
                alt={currentUser.name ?? 'avatar'}
                className="w-full h-full object-cover"
              />
            ) : (
              initials
            )}
          </button>

          {/* Dropdown */}
          {menuOpen && (
            <div className="absolute right-0 top-[40px] w-[160px] bg-[#1e1e1e] border border-[#2a2a2a] rounded-[8px] shadow-xl overflow-hidden z-50">
              {/* User info header */}
              <div className="px-3 py-2.5 border-b border-[#2a2a2a]">
                <p className="text-[12px] font-medium text-[#e8e8e8] truncate">
                  {currentUser?.name ?? 'Anonymous'}
                </p>
                <p className="text-[11px] text-[#6b6b6b] truncate">
                  {currentUser?.email}
                </p>
              </div>

              {/* Options */}
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
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navbar