import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getProblem } from '../../api/Problems'

const diffColor = (d) => {
  if (!d) return ''
  const normalized = d.charAt(0) + d.slice(1).toLowerCase()
  if (normalized === 'Easy')   return 'text-[#00b8a3]'
  if (normalized === 'Medium') return 'text-[#ffc01e]'
  if (normalized === 'Hard')   return 'text-[#ff375f]'
  return ''
}

const diffBg = (d) => {
  if (!d) return ''
  const normalized = d.charAt(0) + d.slice(1).toLowerCase()
  if (normalized === 'Easy')   return 'bg-[#00b8a3]/10 text-[#00b8a3] border border-[#00b8a3]/20'
  if (normalized === 'Medium') return 'bg-[#ffc01e]/10 text-[#ffc01e] border border-[#ffc01e]/20'
  if (normalized === 'Hard')   return 'bg-[#ff375f]/10 text-[#ff375f] border border-[#ff375f]/20'
  return ''
}

// ── Tab button ────────────────────────────────────────────────────────────────
const Tab = ({ label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`px-4 h-[42px] text-[13px] border-b-2 transition-colors ${
      active
        ? 'border-[#ffa116] text-white'
        : 'border-transparent text-[#6b6b6b] hover:text-[#e8e8e8]'
    }`}
  >
    {label}
  </button>
)

// ── Description panel ─────────────────────────────────────────────────────────
const DescriptionPanel = ({ problem }) => (
  <div className="flex flex-col gap-5 p-5 overflow-y-auto h-full">

    {/* Title + meta */}
    <div className="flex flex-col gap-2">
      <h1 className="text-[18px] font-semibold text-[#e8e8e8]">{problem.title}</h1>
      <div className="flex items-center gap-2 flex-wrap">
        <span className={`text-[12px] px-2.5 py-[3px] rounded-[4px] font-medium ${diffBg(problem.difficulty)}`}>
          {problem.difficulty?.charAt(0) + problem.difficulty?.slice(1).toLowerCase()}
        </span>
        {problem.tags?.map(tag => (
          <span key={tag} className="text-[11px] px-2 py-[2px] rounded-[4px] bg-[#2a2a2a] text-[#6b6b6b] border border-[#333]">
            {tag}
          </span>
        ))}
      </div>
    </div>

    {/* Description */}
    <p className="text-[14px] text-[#c8c8c8] leading-relaxed whitespace-pre-wrap">
      {problem.description}
    </p>

    {/* Examples */}
    {problem.examples?.map((ex, i) => (
      <div key={i} className="flex flex-col gap-2">
        <span className="text-[13px] font-medium text-[#e8e8e8]">Example {i + 1}</span>
        <div className="bg-[#1a1a1a] rounded-[8px] p-4 border border-[#2a2a2a] font-mono text-[13px]">
          <div className="flex gap-2 mb-1">
            <span className="text-[#6b6b6b]">Input:</span>
            <span className="text-[#e8e8e8]">{ex.input}</span>
          </div>
          <div className="flex gap-2 mb-1">
            <span className="text-[#6b6b6b]">Output:</span>
            <span className="text-[#e8e8e8]">{ex.output}</span>
          </div>
          {ex.explanation && (
            <div className="flex gap-2 mt-2 pt-2 border-t border-[#2a2a2a]">
              <span className="text-[#6b6b6b]">Explanation:</span>
              <span className="text-[#a8a8a8]">{ex.explanation}</span>
            </div>
          )}
        </div>
      </div>
    ))}

    {/* Constraints */}
    {problem.constraints && (
      <div className="flex flex-col gap-2">
        <span className="text-[13px] font-medium text-[#e8e8e8]">Constraints</span>
        <ul className="flex flex-col gap-1.5">
          {problem.constraints.split('\n').map((c, i) => (
            <li key={i} className="flex items-start gap-2 text-[13px] text-[#c8c8c8]">
              <span className="text-[#ffa116] mt-[2px] text-[10px]">▸</span>
              <code className="font-mono">{c}</code>
            </li>
          ))}
        </ul>
      </div>
    )}

    {/* Hints */}
    {problem.hints && (
      <details className="group">
        <summary className="cursor-pointer text-[13px] text-[#ffa116] hover:text-[#ffb84d] transition-colors list-none flex items-center gap-1.5">
          <svg className="w-3 h-3 transition-transform group-open:rotate-90" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5l8 7-8 7"/></svg>
          Show hint
        </summary>
        <div className="mt-2 p-3 rounded-[6px] bg-[#ffa116]/5 border border-[#ffa116]/20 text-[13px] text-[#c8c8c8]">
          {problem.hints}
        </div>
      </details>
    )}

  </div>
)

// ── Solutions panel ───────────────────────────────────────────────────────────
const SolutionsPanel = ({ problem }) => (
  <div className="p-5 overflow-y-auto h-full">
    <h3 className="text-[14px] font-medium text-[#e8e8e8] mb-4">Editorial</h3>
    {problem.editorial ? (
      <p className="text-[13px] text-[#c8c8c8] leading-relaxed">{problem.editorial}</p>
    ) : (
      <div className="flex flex-col items-center justify-center py-16 gap-2 text-[#6b6b6b]">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
        <span className="text-[13px]">No editorial yet</span>
      </div>
    )}
  </div>
)

// ── Submissions panel ─────────────────────────────────────────────────────────
const SubmissionsPanel = () => (
  <div className="flex flex-col items-center justify-center h-full gap-2 text-[#6b6b6b]">
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
    <span className="text-[13px]">No submissions yet</span>
    <span className="text-[11px]">Submit your solution to see results here</span>
  </div>
)

// ── Code editor placeholder ───────────────────────────────────────────────────
const CodeEditor = ({ problem, language, setLanguage }) => {
  const LANGUAGES = ['javascript', 'python', 'java']
  const snippet = problem?.codeSnippets?.[language] || '// select a language'

  return (
    <div className="flex flex-col h-full">

      {/* Editor toolbar */}
      <div className="h-[42px] bg-[#1a1a1a] border-b border-[#2a2a2a] flex items-center px-4 gap-3">
        <select
          value={language}
          onChange={e => setLanguage(e.target.value)}
          className="bg-[#2a2a2a] text-[#e8e8e8] text-[12px] px-2 py-1 rounded-[4px] border border-[#333] outline-none cursor-pointer"
        >
          {LANGUAGES.map(l => (
            <option key={l} value={l}>{l.charAt(0).toUpperCase() + l.slice(1)}</option>
          ))}
        </select>
        <div className="ml-auto flex items-center gap-2">
          <button className="text-[#6b6b6b] hover:text-[#e8e8e8] transition-colors p-1" title="Reset code">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-4.5"/></svg>
          </button>
          <button className="text-[#6b6b6b] hover:text-[#e8e8e8] transition-colors p-1" title="Full screen">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg>
          </button>
        </div>
      </div>

      {/* Code area — replace this textarea with Monaco Editor later */}
      <div className="flex-1 relative overflow-hidden">
        <textarea
          defaultValue={snippet}
          key={language}  // re-mount when language changes
          className="absolute inset-0 w-full h-full bg-[#111111] text-[#e8e8e8] font-mono text-[13px] p-4 resize-none outline-none leading-relaxed"
          spellCheck={false}
        />
      </div>

      {/* Bottom action bar */}
      <div className="h-[52px] bg-[#1a1a1a] border-t border-[#2a2a2a] flex items-center px-4 gap-3">
        <button className="px-4 h-[32px] rounded-[4px] bg-[#2a2a2a] text-[#e8e8e8] text-[13px] hover:bg-[#333] transition-colors border border-[#333]">
          Run
        </button>
        <button className="ml-auto px-4 h-[32px] rounded-[4px] bg-[#ffa116] text-black text-[13px] font-medium hover:bg-[#ffb84d] transition-colors">
          Submit
        </button>
      </div>
    </div>
  )
}

// ── Test cases panel ──────────────────────────────────────────────────────────
const TestCasesPanel = ({ problem }) => {
  const [activeCase, setActiveCase] = useState(0)
  const cases = problem?.testCases || []

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-1 px-4 pt-3 pb-0 border-b border-[#2a2a2a]">
        {cases.slice(0, 3).map((_, i) => (
          <button
            key={i}
            onClick={() => setActiveCase(i)}
            className={`px-3 py-2 text-[12px] rounded-t-[4px] transition-colors ${
              activeCase === i
                ? 'bg-[#2a2a2a] text-[#e8e8e8]'
                : 'text-[#6b6b6b] hover:text-[#e8e8e8]'
            }`}
          >
            Case {i + 1}
          </button>
        ))}
      </div>
      <div className="flex-1 p-4 overflow-y-auto">
        {cases[activeCase] && (
          <div className="flex flex-col gap-3">
            {Object.entries(cases[activeCase].input).map(([key, val]) => (
              <div key={key} className="flex flex-col gap-1">
                <span className="text-[11px] text-[#6b6b6b]">{key} =</span>
                <div className="bg-[#1a1a1a] rounded-[6px] px-3 py-2 font-mono text-[13px] text-[#e8e8e8] border border-[#2a2a2a]">
                  {JSON.stringify(val)}
                </div>
              </div>
            ))}
            <div className="flex flex-col gap-1">
              <span className="text-[11px] text-[#6b6b6b]">expected output =</span>
              <div className="bg-[#1a1a1a] rounded-[6px] px-3 py-2 font-mono text-[13px] text-[#e8e8e8] border border-[#2a2a2a]">
                {JSON.stringify(cases[activeCase].output)}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────
const ProblemDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()

  const [problem, setProblem]   = useState(null)
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState(null)
  const [leftTab, setLeftTab]   = useState('description')  // description | solutions | submissions
  const [language, setLanguage] = useState('javascript')

  useEffect(() => {
    const fetch = async () => {
      setLoading(true)
      setError(null)
      try {
        const data = await getProblem(id)
        // handle both { problem: {...} } and plain object responses
        setProblem(data.problem || data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#111111] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-6 h-6 border-2 border-[#ffa116] border-t-transparent rounded-full animate-spin" />
          <span className="text-[13px] text-[#6b6b6b]">Loading problem...</span>
        </div>
      </div>
    )
  }

  if (error || !problem) {
    return (
      <div className="min-h-screen bg-[#111111] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <span className="text-[14px] text-[#ff375f]">Failed to load problem</span>
          <button onClick={() => navigate('/problems')} className="text-[12px] text-[#6b6b6b] hover:text-[#e8e8e8]">
            ← Back to problems
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen bg-[#111111] text-[#e8e8e8] flex flex-col overflow-hidden">

      {/* ── Top navbar ── */}
      <nav className="h-[50px] bg-[#1a1a1a] border-b border-[#2a2a2a] flex items-center px-4 gap-4 flex-shrink-0 z-50">
        <span
          onClick={() => navigate('/problems')}
          className="text-[#ffa116] font-bold text-[16px] tracking-tight cursor-pointer"
        >
          leet<span className="text-white">code</span>
        </span>

        <div className="flex items-center gap-1 text-[#6b6b6b] text-[12px]">
          <button onClick={() => navigate('/problems')} className="hover:text-[#e8e8e8] transition-colors">
            Problems
          </button>
          <span>/</span>
          <span className="text-[#e8e8e8] truncate max-w-[200px]">{problem.title}</span>
        </div>

        {/* Prev / Next navigation */}
        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={() => navigate(`/problems/${parseInt(id) - 1}`)}
            className="w-[28px] h-[28px] flex items-center justify-center rounded-[4px] bg-[#2a2a2a] text-[#6b6b6b] hover:text-[#e8e8e8] hover:bg-[#333] transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <button
            onClick={() => navigate(`/problems/${parseInt(id) + 1}`)}
            className="w-[28px] h-[28px] flex items-center justify-center rounded-[4px] bg-[#2a2a2a] text-[#6b6b6b] hover:text-[#e8e8e8] hover:bg-[#333] transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
        </div>
      </nav>

      {/* ── Main split layout ── */}
      <div className="flex flex-1 overflow-hidden">

        {/* ── Left panel: description / solutions / submissions ── */}
        <div className="w-[420px] flex-shrink-0 flex flex-col border-r border-[#2a2a2a] overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-[#2a2a2a] bg-[#1a1a1a] flex-shrink-0">
            <Tab label="Description" active={leftTab === 'description'} onClick={() => setLeftTab('description')} />
            <Tab label="Solutions"   active={leftTab === 'solutions'}   onClick={() => setLeftTab('solutions')}   />
            <Tab label="Submissions" active={leftTab === 'submissions'} onClick={() => setLeftTab('submissions')} />
          </div>

          {/* Tab content */}
          <div className="flex-1 overflow-hidden">
            {leftTab === 'description'  && <DescriptionPanel problem={problem} />}
            {leftTab === 'solutions'    && <SolutionsPanel   problem={problem} />}
            {leftTab === 'submissions'  && <SubmissionsPanel />}
          </div>
        </div>

        {/* ── Right panel: editor + test cases ── */}
        <div className="flex-1 flex flex-col overflow-hidden">

          {/* Code editor — takes ~65% height */}
          <div className="flex-1 overflow-hidden border-b border-[#2a2a2a]">
            <CodeEditor problem={problem} language={language} setLanguage={setLanguage} />
          </div>

          {/* Test cases — takes ~35% height */}
          <div className="h-[320px] flex-shrink-0 bg-[#111111]">
            <div className="h-[38px] bg-[#1a1a1a] border-b border-[#2a2a2a] flex items-center px-4">
              <span className="text-[12px] font-medium text-[#e8e8e8]">Test Cases</span>
            </div>
            <TestCasesPanel problem={problem} />
          </div>

        </div>
      </div>
    </div>
  )
}

export default ProblemDetail