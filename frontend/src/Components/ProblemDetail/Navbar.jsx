import React from 'react'
import { useNavigate } from 'react-router-dom'

const Navbar = ({problem , prevProblem ,nextProblem }) => {
    const navigate = useNavigate()
  return (
     <nav className="h-[50px] bg-[#1a1a1a] border-b border-[#2a2a2a] flex items-center px-4 gap-4 flex-shrink-0 z-50">
            <span onClick={() => navigate('/problems')} className="text-[#ffa116] font-bold text-[16px] tracking-tight cursor-pointer">leet<span className="text-white">code</span></span>
            <div className="flex items-center gap-1 text-[#6b6b6b] text-[12px]">
              <button onClick={() => navigate('/problems')} className="hover:text-[#e8e8e8] transition-colors">Problems</button>
              <span>/</span>
              <span className="text-[#e8e8e8] truncate max-w-[200px]">{problem.title}</span>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <button onClick={() => prevProblem && navigate(`/problemset/${prevProblem.id}`)} disabled={!prevProblem} className={`w-[28px] h-[28px] flex items-center justify-center rounded-[4px] bg-[#2a2a2a] transition-colors ${prevProblem ? 'text-[#6b6b6b] hover:text-[#e8e8e8] hover:bg-[#333]' : 'text-[#3a3a3a] cursor-not-allowed'}`}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
              </button>
              <button onClick={() => nextProblem && navigate(`/problemset/${nextProblem.id}`)} disabled={!nextProblem} className={`w-[28px] h-[28px] flex items-center justify-center rounded-[4px] bg-[#2a2a2a] transition-colors ${nextProblem ? 'text-[#6b6b6b] hover:text-[#e8e8e8] hover:bg-[#333]' : 'text-[#3a3a3a] cursor-not-allowed'}`}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
              </button>
            </div>
          </nav>
  )
}

export default Navbar