import React, { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getAllProblems, getProblem, runCode, submitCode } from '../../api/Problems'

const diffBg = (d) => {
  if (!d) return ''
  const n = d.charAt(0) + d.slice(1).toLowerCase()
  if (n === 'Easy')   return 'bg-[#00b8a3]/10 text-[#00b8a3] border border-[#00b8a3]/20'
  if (n === 'Medium') return 'bg-[#ffc01e]/10 text-[#ffc01e] border border-[#ffc01e]/20'
  if (n === 'Hard')   return 'bg-[#ff375f]/10 text-[#ff375f] border border-[#ff375f]/20'
  return ''
}

const Tab = ({ label, active, onClick }) => (
  <button onClick={onClick} className={`px-4 h-[42px] text-[13px] border-b-2 transition-colors ${active ? 'border-[#ffa116] text-white' : 'border-transparent text-[#6b6b6b] hover:text-[#e8e8e8]'}`}>
    {label}
  </button>
)

const DescriptionPanel = ({ problem }) => (
  <div className="flex flex-col gap-5 p-5 overflow-y-auto h-full">
    <div className="flex flex-col gap-2">
      <h1 className="text-[18px] font-semibold text-[#e8e8e8]">{problem.title}</h1>
      <div className="flex items-center gap-2 flex-wrap">
        <span className={`text-[12px] px-2.5 py-[3px] rounded-[4px] font-medium ${diffBg(problem.difficulty)}`}>
          {problem.difficulty?.charAt(0) + problem.difficulty?.slice(1).toLowerCase()}
        </span>
        {problem.tags?.map(tag => (
          <span key={tag} className="text-[11px] px-2 py-[2px] rounded-[4px] bg-[#2a2a2a] text-[#6b6b6b] border border-[#333]">{tag}</span>
        ))}
      </div>
    </div>
    <p className="text-[14px] text-[#c8c8c8] leading-relaxed whitespace-pre-wrap">{problem.description}</p>
    {problem.examples?.map((ex, i) => (
      <div key={i} className="flex flex-col gap-2">
        <span className="text-[13px] font-medium text-[#e8e8e8]">Example {i + 1}</span>
        <div className="bg-[#1a1a1a] rounded-[8px] p-4 border border-[#2a2a2a] font-mono text-[13px]">
          <div className="flex gap-2 mb-1"><span className="text-[#6b6b6b]">Input:</span><span className="text-[#e8e8e8]">{ex.input}</span></div>
          <div className="flex gap-2 mb-1"><span className="text-[#6b6b6b]">Output:</span><span className="text-[#e8e8e8]">{ex.output}</span></div>
          {ex.explanation && <div className="flex gap-2 mt-2 pt-2 border-t border-[#2a2a2a]"><span className="text-[#6b6b6b]">Explanation:</span><span className="text-[#a8a8a8]">{ex.explanation}</span></div>}
        </div>
      </div>
    ))}
    {problem.constraints && (
      <div className="flex flex-col gap-2">
        <span className="text-[13px] font-medium text-[#e8e8e8]">Constraints</span>
        <ul className="flex flex-col gap-1.5">
          {problem.constraints.split('\n').map((c, i) => (
            <li key={i} className="flex items-start gap-2 text-[13px] text-[#c8c8c8]">
              <span className="text-[#ffa116] mt-[2px] text-[10px]">&#9656;</span>
              <code className="font-mono">{c}</code>
            </li>
          ))}
        </ul>
      </div>
    )}
    {problem.hints && (
      <details className="group">
        <summary className="cursor-pointer text-[13px] text-[#ffa116] hover:text-[#ffb84d] transition-colors list-none flex items-center gap-1.5">
          <svg className="w-3 h-3 transition-transform group-open:rotate-90" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5l8 7-8 7"/></svg>
          Show hint
        </summary>
        <div className="mt-2 p-3 rounded-[6px] bg-[#ffa116]/5 border border-[#ffa116]/20 text-[13px] text-[#c8c8c8]">{problem.hints}</div>
      </details>
    )}
  </div>
)

const SolutionsPanel = ({ problem }) => (
  <div className="p-5 overflow-y-auto h-full">
    <h3 className="text-[14px] font-medium text-[#e8e8e8] mb-4">Editorial</h3>
    {problem.editorial
      ? <p className="text-[13px] text-[#c8c8c8] leading-relaxed">{problem.editorial}</p>
      : <div className="flex flex-col items-center justify-center py-16 gap-2 text-[#6b6b6b]"><span className="text-[13px]">No editorial yet</span></div>
    }
  </div>
)

const SubmissionsPanel = () => (
  <div className="flex flex-col items-center justify-center h-full gap-2 text-[#6b6b6b]">
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
    <span className="text-[13px]">No submissions yet</span>
    <span className="text-[11px]">Submit your solution to see results here</span>
  </div>
)

const CodeEditor = ({ problem, language, setLanguage, onRun, onSubmit, running, submitting }) => {
  const LANGUAGES = ['javascript', 'python', 'java']
  const snippet = problem?.codeSnippets?.[language] || '// select a language'
  const codeRef = useRef(null)

  useEffect(() => {
    if (codeRef.current) codeRef.current.value = snippet
  }, [language, snippet])

  return (
    <div className="flex flex-col h-full">
      <div className="h-[42px] bg-[#1a1a1a] border-b border-[#2a2a2a] flex items-center px-4 gap-3">
        <select value={language} onChange={e => setLanguage(e.target.value)} className="bg-[#2a2a2a] text-[#e8e8e8] text-[12px] px-2 py-1 rounded-[4px] border border-[#333] outline-none cursor-pointer">
          {LANGUAGES.map(l => <option key={l} value={l}>{l.charAt(0).toUpperCase() + l.slice(1)}</option>)}
        </select>
        <div className="ml-auto">
          <button onClick={() => { if (codeRef.current) codeRef.current.value = snippet }} className="text-[#6b6b6b] hover:text-[#e8e8e8] transition-colors p-1" title="Reset code">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-4.5"/></svg>
          </button>
        </div>
      </div>
      <div className="flex-1 relative overflow-hidden">
        <textarea ref={codeRef} defaultValue={snippet} key={language} className="absolute inset-0 w-full h-full bg-[#111111] text-[#e8e8e8] font-mono text-[13px] p-4 resize-none outline-none leading-relaxed" spellCheck={false}/>
      </div>
      <div className="h-[52px] bg-[#1a1a1a] border-t border-[#2a2a2a] flex items-center px-4 gap-3">
        <button onClick={() => onRun(codeRef.current?.value || '')} disabled={running || submitting} className="px-4 h-[32px] rounded-[4px] bg-[#2a2a2a] text-[#e8e8e8] text-[13px] hover:bg-[#333] transition-colors border border-[#333] disabled:opacity-50 flex items-center gap-2">
          {running && <div className="w-3 h-3 border border-[#e8e8e8] border-t-transparent rounded-full animate-spin"/>}
          {running ? 'Running...' : 'Run'}
        </button>
        <button onClick={() => onSubmit(codeRef.current?.value || '')} disabled={running || submitting} className="ml-auto px-4 h-[32px] rounded-[4px] bg-[#ffa116] text-black text-[13px] font-medium hover:bg-[#ffb84d] transition-colors disabled:opacity-50 flex items-center gap-2">
          {submitting && <div className="w-3 h-3 border border-black border-t-transparent rounded-full animate-spin"/>}
          {submitting ? 'Submitting...' : 'Submit'}
        </button>
      </div>
    </div>
  )
}

const BottomPanel = ({ problem, runResult, submitResult }) => {
  const [activeCase, setActiveCase] = useState(0)
  const cases = problem?.testCases?.slice(0, 3) || []
  const result = submitResult || runResult

  if (result) {
    const tc = result.testResults?.[activeCase]

    return (
      <div className="flex flex-col h-full">
        {/* Status header */}
        <div className={`px-4 py-2.5 flex items-center gap-3 border-b border-[#2a2a2a] ${result.allPassed ? 'bg-[#00b8a3]/5' : 'bg-[#ff375f]/5'}`}>
          <span className={`text-[14px] font-semibold ${result.allPassed ? 'text-[#00b8a3]' : 'text-[#ff375f]'}`}>
            {submitResult
              ? (result.allPassed ? '✓ Accepted' : '✗ Wrong Answer')
              : (result.allPassed ? '✓ All cases passed' : '✗ Some cases failed')}
          </span>
          {result.runtime && <span className="text-[11px] text-[#6b6b6b] ml-auto">Runtime: {result.runtime}</span>}
          {result.memory  && <span className="text-[11px] text-[#6b6b6b]">Memory: {result.memory}</span>}
        </div>

        {/* Case tabs with pass/fail icons */}
        <div className="flex items-center gap-1 px-4 pt-2 pb-0 border-b border-[#2a2a2a] bg-[#1a1a1a]">
          {result.testResults?.map((t, i) => (
            <button
              key={i}
              onClick={() => setActiveCase(i)}
              className={`flex items-center gap-1.5 px-3 py-2 text-[12px] rounded-t-[4px] transition-colors border-b-2 -mb-px
                ${activeCase === i
                  ? t.passed
                    ? 'border-[#00b8a3] text-[#00b8a3] bg-[#00b8a3]/5'
                    : 'border-[#ff375f] text-[#ff375f] bg-[#ff375f]/5'
                  : 'border-transparent text-[#6b6b6b] hover:text-[#e8e8e8]'
                }`}
            >
              <span className={`text-[10px] ${t.passed ? 'text-[#00b8a3]' : 'text-[#ff375f]'}`}>
                {t.passed ? '●' : '●'}
              </span>
              Case {i + 1}
            </button>
          ))}
        </div>

        {/* Active case detail */}
        {tc && (
          <div className={`flex-1 overflow-y-auto p-4 ${tc.passed ? 'bg-[#00b8a3]/[0.02]' : 'bg-[#ff375f]/[0.02]'}`}>
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <span className="text-[11px] text-[#6b6b6b]">Input</span>
                <div className="bg-[#1a1a1a] rounded-[6px] px-3 py-2 font-mono text-[13px] text-[#e8e8e8] border border-[#2a2a2a]">
                  {JSON.stringify(tc.input)}
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-[11px] text-[#6b6b6b]">Expected Output</span>
                <div className="bg-[#1a1a1a] rounded-[6px] px-3 py-2 font-mono text-[13px] text-[#00b8a3] border border-[#00b8a3]/20">
                  {JSON.stringify(tc.expectedOutput)}
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-[11px] text-[#6b6b6b]">Your Output</span>
                <div className={`bg-[#1a1a1a] rounded-[6px] px-3 py-2 font-mono text-[13px] border
                  ${tc.passed
                    ? 'text-[#00b8a3] border-[#00b8a3]/20'
                    : 'text-[#ff375f] border-[#ff375f]/20'}`}>
                  {tc.actualOutput ?? 'null'}
                </div>
              </div>

              {tc.stderr && (
                <div className="flex flex-col gap-1">
                  <span className="text-[11px] text-[#6b6b6b]">Stderr</span>
                  <div className="bg-[#ff375f]/10 rounded-[6px] px-3 py-2 font-mono text-[12px] text-[#ff375f] border border-[#ff375f]/20 whitespace-pre-wrap">
                    {tc.stderr}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    )
  }

  // Default test cases view (unchanged)
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-1 px-4 pt-3 pb-0 border-b border-[#2a2a2a]">
        {cases.map((_, i) => (
          <button key={i} onClick={() => setActiveCase(i)}
            className={`px-3 py-2 text-[12px] rounded-t-[4px] transition-colors ${activeCase === i ? 'bg-[#2a2a2a] text-[#e8e8e8]' : 'text-[#6b6b6b] hover:text-[#e8e8e8]'}`}>
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
                <div className="bg-[#1a1a1a] rounded-[6px] px-3 py-2 font-mono text-[13px] text-[#e8e8e8] border border-[#2a2a2a]">{JSON.stringify(val)}</div>
              </div>
            ))}
            <div className="flex flex-col gap-1">
              <span className="text-[11px] text-[#6b6b6b]">expected output =</span>
              <div className="bg-[#1a1a1a] rounded-[6px] px-3 py-2 font-mono text-[13px] text-[#e8e8e8] border border-[#2a2a2a]">{JSON.stringify(cases[activeCase].output)}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

const ProblemDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [problem, setProblem]           = useState(null)
  const [loading, setLoading]           = useState(true)
  const [error, setError]               = useState(null)
  const [leftTab, setLeftTab]           = useState('description')
  const [language, setLanguage]         = useState('javascript')
  const [problems, setProblems]         = useState([])
  const [running, setRunning]           = useState(false)
  const [submitting, setSubmitting]     = useState(false)
  const [runResult, setRunResult]       = useState(null)
  const [submitResult, setSubmitResult] = useState(null)

  useEffect(() => {
    const fetchProblem = async () => {
      setLoading(true); setError(null)
      try {
        const data = await getProblem(id)
        setProblem(data.problem || data)
      } catch (err) { setError(err.message) }
      finally { setLoading(false) }
    }
    fetchProblem()
  }, [id])

  useEffect(() => { getAllProblems().then(setProblems).catch(() => {}) }, [])
  useEffect(() => { setRunResult(null); setSubmitResult(null) }, [id])

  const currentIndex = problems.findIndex(p => p.id === id)
  const prevProblem  = problems[currentIndex - 1]
  const nextProblem  = problems[currentIndex + 1]

  const handleRun = async (code) => {
    if (!code.trim()) return
    setRunning(true); setRunResult(null); setSubmitResult(null)
    try { setRunResult(await runCode({ source_code: code, language, problem_id: id })) }
    catch (err) { console.error(err) }
    finally { setRunning(false) }
  }

  const handleSubmit = async (code) => {
    if (!code.trim()) return
    setSubmitting(true); setRunResult(null); setSubmitResult(null)
    try {
      const result = await submitCode({ source_code: code, language, problem_id: id })
      setSubmitResult(result)
      setLeftTab('submissions')
    } catch (err) { console.error(err) }
    finally { setSubmitting(false) }
  }

  if (loading) return (
    <div className="min-h-screen bg-[#111111] flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-6 h-6 border-2 border-[#ffa116] border-t-transparent rounded-full animate-spin"/>
        <span className="text-[13px] text-[#6b6b6b]">Loading problem...</span>
      </div>
    </div>
  )

  if (error || !problem) return (
    <div className="min-h-screen bg-[#111111] flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <span className="text-[14px] text-[#ff375f]">Failed to load problem</span>
        <button onClick={() => navigate('/problems')} className="text-[12px] text-[#6b6b6b] hover:text-[#e8e8e8]">Back to problems</button>
      </div>
    </div>
  )

  return (
    <div className="h-screen bg-[#111111] text-[#e8e8e8] flex flex-col overflow-hidden">
      <nav className="h-[50px] bg-[#1a1a1a] border-b border-[#2a2a2a] flex items-center px-4 gap-4 flex-shrink-0 z-50">
        <span onClick={() => navigate('/problems')} className="text-[#ffa116] font-bold text-[16px] tracking-tight cursor-pointer">leet<span className="text-white">code</span></span>
        <div className="flex items-center gap-1 text-[#6b6b6b] text-[12px]">
          <button onClick={() => navigate('/problems')} className="hover:text-[#e8e8e8] transition-colors">Problems</button>
          <span>/</span>
          <span className="text-[#e8e8e8] truncate max-w-[200px]">{problem.title}</span>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <button onClick={() => prevProblem && navigate(`/problems/${prevProblem.id}`)} disabled={!prevProblem} className={`w-[28px] h-[28px] flex items-center justify-center rounded-[4px] bg-[#2a2a2a] transition-colors ${prevProblem ? 'text-[#6b6b6b] hover:text-[#e8e8e8] hover:bg-[#333]' : 'text-[#3a3a3a] cursor-not-allowed'}`}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <button onClick={() => nextProblem && navigate(`/problems/${nextProblem.id}`)} disabled={!nextProblem} className={`w-[28px] h-[28px] flex items-center justify-center rounded-[4px] bg-[#2a2a2a] transition-colors ${nextProblem ? 'text-[#6b6b6b] hover:text-[#e8e8e8] hover:bg-[#333]' : 'text-[#3a3a3a] cursor-not-allowed'}`}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
        </div>
      </nav>

      <div className="flex flex-1 overflow-hidden">
        <div className="w-[420px] flex-shrink-0 flex flex-col border-r border-[#2a2a2a] overflow-hidden">
          <div className="flex border-b border-[#2a2a2a] bg-[#1a1a1a] flex-shrink-0">
            <Tab label="Description" active={leftTab === 'description'} onClick={() => setLeftTab('description')} />
            <Tab label="Solutions"   active={leftTab === 'solutions'}   onClick={() => setLeftTab('solutions')} />
            <Tab label="Submissions" active={leftTab === 'submissions'} onClick={() => setLeftTab('submissions')} />
          </div>
          <div className="flex-1 overflow-hidden">
            {leftTab === 'description'  && <DescriptionPanel problem={problem} />}
            {leftTab === 'solutions'    && <SolutionsPanel   problem={problem} />}
            {leftTab === 'submissions'  && <SubmissionsPanel />}
          </div>
        </div>

        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-hidden border-b border-[#2a2a2a]">
            <CodeEditor problem={problem} language={language} setLanguage={setLanguage} onRun={handleRun} onSubmit={handleSubmit} running={running} submitting={submitting}/>
          </div>
          <div className="h-[280px] flex-shrink-0 bg-[#111111]">
            <div className="h-[38px] bg-[#1a1a1a] border-b border-[#2a2a2a] flex items-center px-4 gap-3">
              <span className="text-[12px] font-medium text-[#e8e8e8]">{(runResult || submitResult) ? 'Results' : 'Test Cases'}</span>
              {(runResult || submitResult) && (
                <button onClick={() => { setRunResult(null); setSubmitResult(null) }} className="ml-auto text-[11px] text-[#6b6b6b] hover:text-[#e8e8e8] transition-colors">
                  Back to test cases
                </button>
              )}
            </div>
            <div className="h-[calc(100%-38px)] overflow-y-auto">
              <BottomPanel problem={problem} runResult={runResult} submitResult={submitResult}/>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProblemDetail