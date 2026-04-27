import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getAllProblems, getProblem, runCode, submitCode } from '../../api/Problems'
import Editor from '@monaco-editor/react'
import { DescriptionPanel } from '../Components/ProblemDetail/DescriptionPanel'
import { SolutionsPanel } from '../Components/ProblemDetail/SolutionsPanel'
import { SubmissionsPanel } from '../Components/ProblemDetail/SubmissionsPanel'
import { CodeEditor } from '../Components/ProblemDetail/CodeEditor'
import { BottomPanel } from '../Components/ProblemDetail/BottomPanel'
import { useVerticalResize } from '../hooks/useVerticalResize'
import Navbar from '../Components/ProblemDetail/Navbar'

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
  const [customTestCases, setCustomTestCases] = useState([])

  // Ref on the right column so the resize hook can read its height
  const rightColRef = useRef(null)
  const { bottomHeight, setBottomHeight, onMouseDown: onDividerMouseDown } = useVerticalResize(rightColRef, 280)

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
    try { setRunResult(await runCode({ source_code: code, language, problem_id: id, customTestCases })); setBottomHeight(window.innerHeight * 0.5) }
    catch (err) { console.error(err) }
    finally { setRunning(false) }
  }

  const handleSubmit = async (code) => {
    if (!code.trim()) return
    setSubmitting(true); setRunResult(null); setSubmitResult(null)
    try {
      const [submitRes, runRes] = await Promise.all([
        submitCode({ source_code: code, language, problem_id: id }),
        runCode({ source_code: code, language, problem_id: id, customTestCases })
      ])
      setSubmitResult({ ...submitRes, testResults: runRes.testResults }); setBottomHeight(window.innerHeight * 0.5)
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
      {/* ── Nav ── */}
      <Navbar problem={problem} prevProblem={prevProblem} nextProblem={nextProblem}/>

      {/* ── Body ── */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left panel */}
        <div className="w-[420px] flex-shrink-0 flex flex-col border-r border-[#2a2a2a] overflow-hidden">
          <div className="flex border-b border-[#2a2a2a] bg-[#1a1a1a] flex-shrink-0">
            <Tab label="Description" active={leftTab === 'description'} onClick={() => setLeftTab('description')} />
            <Tab label="Solutions"   active={leftTab === 'solutions'}   onClick={() => setLeftTab('solutions')} />
            <Tab label="Submissions" active={leftTab === 'submissions'} onClick={() => setLeftTab('submissions')} />
          </div>
          <div className="flex-1 overflow-hidden">
            {leftTab === 'description'  && <DescriptionPanel problem={problem} diffBg={diffBg}/>}
            {leftTab === 'solutions'    && <SolutionsPanel   problem={problem} />}
            {leftTab === 'submissions'  && <SubmissionsPanel submitResult={submitResult}/>}
          </div>
        </div>

        {/* Right column — editor + resizable bottom panel */}
        <div ref={rightColRef} className="flex-1 flex flex-col overflow-hidden">

          {/* Code editor — fills whatever space is left */}
          <div className="flex-1 overflow-hidden border-b border-[#2a2a2a]" style={{ minHeight: 120 }}>
            <CodeEditor
              problem={problem}
              language={language}
              setLanguage={setLanguage}
              onRun={handleRun}
              onSubmit={handleSubmit}
              running={running}
              submitting={submitting}
            />
          </div>

          {/* ── Drag handle ── */}
          <div
            onMouseDown={onDividerMouseDown}
            className="group relative flex-shrink-0 h-[5px] bg-[#1a1a1a] hover:bg-[#ffa116]/30 active:bg-[#ffa116]/50 cursor-row-resize transition-colors z-10 border-t border-b border-[#2a2a2a]"
            title="Drag to resize"
          >
            {/* Decorative dots */}
            <div className="absolute inset-0 flex items-center justify-center gap-[3px] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              <span className="w-[3px] h-[3px] rounded-full bg-[#ffa116]"/>
              <span className="w-[3px] h-[3px] rounded-full bg-[#ffa116]"/>
              <span className="w-[3px] h-[3px] rounded-full bg-[#ffa116]"/>
            </div>
          </div>

          {/* Bottom panel — fixed height driven by drag */}
          <div className="flex-shrink-0 bg-[#111111] overflow-hidden" style={{ height: bottomHeight }}>
            <div className="h-[38px] bg-[#1a1a1a] border-b border-[#2a2a2a] flex items-center px-4 gap-3">
              <span className="text-[12px] font-medium text-[#e8e8e8]">{(runResult || submitResult) ? 'Results' : 'Test Cases'}</span>
              {(runResult || submitResult) && (
                <button onClick={() => { setRunResult(null); setSubmitResult(null) }} className="ml-auto text-[11px] text-[#6b6b6b] hover:text-[#e8e8e8] transition-colors">
                  Back to test cases
                </button>
              )}
            </div>
            <div className="overflow-y-auto" style={{ height: bottomHeight  }}>
              <BottomPanel
                problem={problem}
                runResult={runResult}
                submitResult={submitResult}
                customTestCases={customTestCases}
                setCustomTestCases={setCustomTestCases}
              />
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

export default ProblemDetail