import React from 'react'

const Navbar = ({setSearch , search }) => {
  return (
    <nav className="h-[50px] bg-[#1a1a1a] border-b border-[#2a2a2a] flex items-center px-6 gap-6 sticky top-0 z-50">
        <span className="text-[#ffa116] font-bold text-[18px] tracking-tight">leet<span className="text-white">code</span></span>
        <div className="flex gap-1 ml-4">
          {['Explore', 'Problems', 'Discuss', 'Interview'].map(item => (
            <button
              key={item}
              className={`px-3 h-[50px] text-[13px] transition-colors ${item === 'Problems' ? 'text-white border-b-2 border-[#ffa116]' : 'text-[#6b6b6b] hover:text-[#e8e8e8]'}`}
            >
              {item}
            </button>
          ))}
        </div>
        <div className="ml-auto flex items-center gap-3">
          <div className="relative">
            <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#6b6b6b]" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            <input
              className="w-[200px] h-[32px] bg-[#2a2a2a] rounded-[6px] pl-8 pr-3 text-[13px] outline-none border border-transparent focus:border-[#ffa116]/40 text-[#e8e8e8] placeholder:text-[#6b6b6b]"
              placeholder="Search problems..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="w-[32px] h-[32px] rounded-full bg-[#ffa116] flex items-center justify-center text-black text-[13px] font-bold cursor-pointer">
            U
          </div>
        </div>
      </nav>
  )
}

export default Navbar