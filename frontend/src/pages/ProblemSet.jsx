import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAllProblems } from '../../api/Problems'
import Navbar from '../Components/ProblemSet/Navbar'
import YourProgress from '../Components/ProblemSet/YourProgress'
import FiltersAndStatus from '../Components/ProblemSet/FiltersAndStatus'

const DIFFICULTIES = ['All', 'EASY', 'MEDIUM', 'HARD']
const STATUSES = ['All', 'Todo', 'Solved', 'Attempted']
const TAGS = [
    'All Topics', 'Array', 'String', 'Hash Table', 'Dynamic Programming',
    'Math', 'Sorting', 'Greedy', 'Tree', 'Graph',
]

const diffColor = (d) => {
    if (d === 'EASY') return 'text-[#00b8a3]'
    if (d === 'MEDIUM') return 'text-[#ffc01e]'
    if (d === 'HARD') return 'text-[#ff375f]'
    return ''
}

const diffBg = (d) => {
    if (d === 'EASY') return 'bg-[#00b8a3]/10 text-[#00b8a3]'
    if (d === 'MEDIUM') return 'bg-[#ffc01e]/10 text-[#ffc01e]'
    if (d === 'HARD') return 'bg-[#ff375f]/10 text-[#ff375f]'
    return ''
}



const ProblemSet = () => {
    const navigate = useNavigate()

    const [problems, setProblems] = useState([])   // ← start empty, no mock data
    const [loading, setLoading] = useState(true)  // ← start as true so we show loader immediately
    const [error, setError] = useState(null)
    const [search, setSearch] = useState('')
    const [difficulty, setDifficulty] = useState('All')
    const [status, setStatus] = useState('All')
    const [activeTag, setActiveTag] = useState('All Topics')
    const [hoveredRow, setHoveredRow] = useState(null)

    useEffect(() => {
        const fetchProblems = async () => {
            setLoading(true)
            setError(null)
            try {
                const data = await getAllProblems()
                setProblems(data)
            } catch (err) {
                console.error(err)
                setError(err.message)
            } finally {
                setLoading(false)
            }
        }
        fetchProblems()
    }, [])

    const filtered = problems.filter((p) => {
        const matchSearch = p.title.toLowerCase().includes(search.toLowerCase())
        const matchDifficulty = difficulty === 'All' || p.difficulty === difficulty
        const matchStatus = status === 'All' || p.status === status
        const matchTag = activeTag === 'All Topics' || p.tags.includes(activeTag)
        return matchSearch && matchDifficulty && matchStatus && matchTag
    })

    const solved = problems.filter(p => p.status === 'Solved').length
    const attempted = problems.filter(p => p.status === 'Attempted').length
    const total = problems.length
    const toTitleCase = (str) => str.charAt(0) + str.slice(1).toLowerCase()

    // ── what to show in the table body ──
    const renderTableBody = () => {
        if (loading) {
            return (
                <div className="flex flex-col items-center justify-center py-20 gap-3">
                    <div className="w-6 h-6 border-2 border-[#ffa116] border-t-transparent rounded-full animate-spin" />
                    <span className="text-[13px] text-[#6b6b6b]">Loading problems...</span>
                </div>
            )
        }

        if (error) {
            return (
                <div className="flex flex-col items-center justify-center py-20 gap-3">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#ff375f" strokeWidth="1.5"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                    <span className="text-[14px] text-[#ff375f]">Failed to load problems</span>
                    <span className="text-[12px] text-[#6b6b6b]">{error}</span>
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-1 px-4 py-1.5 rounded-[6px] bg-[#2a2a2a] text-[12px] text-[#e8e8e8] hover:bg-[#333] transition-colors"
                    >
                        Try again
                    </button>
                </div>
            )
        }

        if (problems.length === 0) {
            return (
                <div className="flex flex-col items-center justify-center py-20 gap-3">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#2a2a2a" strokeWidth="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="12" y1="18" x2="12" y2="12" /><line x1="9" y1="15" x2="15" y2="15" /></svg>
                    <span className="text-[15px] text-[#e8e8e8] font-medium">No problems yet</span>
                    <span className="text-[13px] text-[#6b6b6b] text-center max-w-[240px]">
                        Problems will appear here once an admin adds them to the database.
                    </span>
                </div>
            )
        }

        if (filtered.length === 0) {
            return (
                <div className="flex flex-col items-center justify-center py-20 gap-3">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#6b6b6b" strokeWidth="1.5"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>
                    <span className="text-[14px] text-[#e8e8e8]">No problems match your filters</span>
                    <button
                        onClick={() => { setSearch(''); setDifficulty('All'); setStatus('All'); setActiveTag('All Topics') }}
                        className="px-4 py-1.5 rounded-[6px] bg-[#2a2a2a] text-[12px] text-[#6b6b6b] hover:text-[#e8e8e8] hover:bg-[#333] transition-colors"
                    >
                        Clear filters
                    </button>
                </div>
            )
        }

        return filtered.map((problem, idx) => (
            <div
                key={problem.id}
                onClick={() => navigate(`/problemset/${problem.id}`)}
                onMouseEnter={() => setHoveredRow(problem.id)}
                onMouseLeave={() => setHoveredRow(null)}
                className={`grid grid-cols-[32px_1fr_100px_90px_70px] gap-0 px-4 py-3 cursor-pointer transition-colors border-b border-[#2a2a2a] last:border-b-0 ${idx % 2 === 0 ? 'bg-[#141414]' : 'bg-[#111111]'
                    } ${hoveredRow === problem.id ? '!bg-[#222]' : ''}`}
            >
                <div className="flex items-center">
                    {problem.status === 'Solved' ? (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#00b8a3" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
                    ) : problem.status === 'Attempted' ? (
                        <div className="w-[10px] h-[10px] rounded-full border-2 border-[#ffc01e]" />
                    ) : (
                        <span className="text-[12px] text-[#6b6b6b]">{idx + 1}</span>
                    )}
                </div>

                <div className="flex flex-col gap-1 min-w-0">
                    <span className={`text-[13px] truncate transition-colors ${hoveredRow === problem.id ? 'text-[#ffa116]' : 'text-[#e8e8e8]'}`}>
                        {problem.title}
                    </span>
                    <div className="flex gap-1 flex-wrap">
                        {problem.tags.slice(0, 2).map(tag => (
                            <span key={tag} className="text-[10px] px-[6px] py-[1px] rounded-[4px] bg-[#2a2a2a] text-[#6b6b6b]">
                                {tag}
                            </span>
                        ))}
                    </div>
                </div>

                <div className="flex items-center justify-center">
                    <span className="text-[13px] text-[#6b6b6b]">{problem.acceptance ?? '—'}%</span>
                </div>

                <div className="flex items-center justify-center">
                    <span className={`text-[12px] px-2 py-[2px] rounded-[4px] ${diffBg(problem.difficulty)}`}>
                        {toTitleCase(problem.difficulty)}
                    </span>
                </div>

                <div className="flex items-center justify-center">
                    {problem.status && problem.status !== 'Todo' && (
                        <span className={`text-[11px] ${problem.status === 'Solved' ? 'text-[#00b8a3]' : 'text-[#ffc01e]'}`}>
                            {problem.status}
                        </span>
                    )}
                </div>
            </div>
        ))
    }

    return (
        <div className="min-h-screen bg-[#111111] text-[#e8e8e8] flex flex-col">

            {/* Navbar */}
            <Navbar setSearch={setSearch} search={search} />

            <div className="flex flex-1 max-w-[1200px] mx-auto w-full px-4 py-6 gap-6">

                {/* Left column */}
                <FiltersAndStatus
                    TAGS={TAGS}
                    DIFFICULTIES={DIFFICULTIES}
                    toTitleCase={toTitleCase}
                    setActiveTag={setActiveTag}
                    activeTag={activeTag}
                    setDifficulty={setDifficulty}
                    difficulty={difficulty}
                    STATUSES={STATUSES}
                    setStatus={setStatus}
                    loading={loading}
                    error={error}
                    filtered={filtered}
                    total={total}
                    renderTableBody={renderTableBody}
                    status={status} diffColor={diffColor} />

                {/* Right sidebar */}
                <YourProgress
                    problems={problems}
                    solved={solved}
                    total={total}
                    diffColor={diffColor} 
                    attempted={attempted}
                    />
            </div>
        </div>
    )
}

export default ProblemSet