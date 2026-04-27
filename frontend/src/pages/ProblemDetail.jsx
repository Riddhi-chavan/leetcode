import React, { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getAllProblems, getProblem, runCode, submitCode } from '../../api/Problems'
import Editor from '@monaco-editor/react'

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

const SubmissionsPanel = ({ submitResult }) => {
  if (!submitResult) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 text-[#6b6b6b]">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
        </svg>
        <span className="text-[13px]">No submissions yet</span>
        <span className="text-[11px] text-[#4b4b4b]">Submit your solution to see results here</span>
      </div>
    )
  }

  const { allPassed, passedCount, totalCount, firstFailed, runtime, memory } = submitResult
  const percent = Math.round((passedCount / totalCount) * 100)

  // ── ACCEPTED ──
  if (allPassed) {
    return (
      <div className="flex flex-col h-full overflow-hidden">
        {/* Banner */}
        <div className="px-5 py-4 bg-[#00b8a3]/5 border-b border-[#2a2a2a] flex items-center justify-between flex-shrink-0">
          <div className="flex flex-col gap-0.5">
            <span className="text-[22px] font-bold text-[#00b8a3]">✓ Accepted</span>
            <span className="text-[12px] text-[#6b6b6b]">All {totalCount} test cases passed</span>
          </div>
          <div className="flex items-center gap-3">
            {runtime && (
              <div className="flex flex-col items-center px-4 py-2 rounded-[8px] bg-[#1a1a1a] border border-[#2a2a2a]">
                <span className="text-[15px] font-semibold text-[#e8e8e8]">{runtime}</span>
                <span className="text-[10px] text-[#6b6b6b] mt-0.5">Runtime</span>
              </div>
            )}
            {memory && (
              <div className="flex flex-col items-center px-4 py-2 rounded-[8px] bg-[#1a1a1a] border border-[#2a2a2a]">
                <span className="text-[15px] font-semibold text-[#e8e8e8]">{memory}</span>
                <span className="text-[10px] text-[#6b6b6b] mt-0.5">Memory</span>
              </div>
            )}
          </div>
        </div>

        {/* Accepted body */}
        <div className="flex flex-col items-center justify-center flex-1 gap-5 p-6">
          {/* Big checkmark */}
          <div className="w-20 h-20 rounded-full bg-[#00b8a3]/10 border-2 border-[#00b8a3]/30 flex items-center justify-center">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#00b8a3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </div>

          <div className="flex flex-col items-center gap-1">
            <span className="text-[16px] font-semibold text-[#e8e8e8]">Great job!</span>
            <span className="text-[12px] text-[#6b6b6b]">Your solution is correct and efficient.</span>
          </div>

          {/* Progress bar */}
          <div className="w-full max-w-[340px] flex flex-col gap-2">
            <div className="flex justify-between text-[11px] text-[#6b6b6b]">
              <span>Test cases passed</span>
              <span className="text-[#00b8a3] font-medium">{passedCount} / {totalCount}</span>
            </div>
            <div className="h-[6px] rounded-full bg-[#2a2a2a] overflow-hidden">
              <div className="h-full rounded-full bg-[#00b8a3] transition-all duration-700" style={{ width: '100%' }}/>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ── WRONG ANSWER ──
  const fc = firstFailed
  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Banner */}
      <div className="px-5 py-4 bg-[#ff375f]/5 border-b border-[#2a2a2a] flex-shrink-0">
        <div className="flex items-center justify-between mb-3">
          <div className="flex flex-col gap-0.5">
            <span className="text-[22px] font-bold text-[#ff375f]">✗ Wrong Answer</span>
            <span className="text-[12px] text-[#6b6b6b]">
              {passedCount} / {totalCount} test cases passed ({percent}%)
            </span>
          </div>
          <div className="flex flex-col items-center px-3 py-1.5 rounded-[6px] bg-[#ff375f]/10 border border-[#ff375f]/20">
            <span className="text-[13px] font-semibold text-[#ff375f]">
              {totalCount - passedCount} failed
            </span>
            <span className="text-[10px] text-[#ff375f]/60">test cases</span>
          </div>
        </div>
        {/* Progress bar */}
        <div className="flex flex-col gap-1.5">
          <div className="h-[5px] rounded-full bg-[#2a2a2a] overflow-hidden">
            <div
              className="h-full rounded-full bg-[#ff375f] transition-all duration-700"
              style={{ width: `${percent}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-[#4b4b4b]">
            <span>0</span>
            <span>{totalCount}</span>
          </div>
        </div>
      </div>

      {/* First failing case */}
      {fc && (
        <div className="flex-1 overflow-y-auto p-4">
          <div className="flex flex-col gap-3">

            {/* Label */}
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-medium text-[#6b6b6b] uppercase tracking-wider">
                First failing test case
              </span>
              <div className="flex-1 h-px bg-[#2a2a2a]"/>
              <span className="text-[11px] px-2 py-0.5 rounded-[4px] bg-[#ff375f]/10 text-[#ff375f] border border-[#ff375f]/20">
                Case #{fc.testCase}
              </span>
            </div>

            {/* Status */}
            <div className="flex items-center gap-2 px-3 py-2 rounded-[6px] bg-[#ff375f]/5 border border-[#ff375f]/20 w-fit">
              <span className="text-[12px] font-medium text-[#ff375f]">✗ {fc.status}</span>
              {fc.time && <span className="text-[11px] text-[#6b6b6b] border-l border-[#3a3a3a] pl-2">{fc.time}ms</span>}
            </div>

            {/* Input */}
            <div className="flex flex-col gap-1">
              <span className="text-[11px] text-[#6b6b6b] font-medium">Input</span>
              <div className="bg-[#1a1a1a] rounded-[6px] px-3 py-2.5 font-mono text-[12px] text-[#e8e8e8] border border-[#2a2a2a]">
                {Object.entries(fc.input || {}).map(([k, v]) => (
                  <div key={k}>
                    <span className="text-[#6b6b6b]">{k}</span>
                    {' = '}
                    <span>{JSON.stringify(v)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Expected vs Got */}
            <div className="grid grid-cols-2 gap-2">
              <div className="flex flex-col gap-1">
                <span className="text-[11px] text-[#6b6b6b] font-medium">Expected output</span>
                <div className="bg-[#1a1a1a] rounded-[6px] px-3 py-2.5 font-mono text-[12px] text-[#00b8a3] border border-[#00b8a3]/20 min-h-[38px]">
                  {JSON.stringify(fc.expectedOutput)}
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[11px] text-[#6b6b6b] font-medium">Your output</span>
                <div className="bg-[#1a1a1a] rounded-[6px] px-3 py-2.5 font-mono text-[12px] text-[#ff375f] border border-[#ff375f]/20 min-h-[38px]">
                  {fc.actualOutput ?? 'null'}
                </div>
              </div>
            </div>

            {/* Stderr */}
            {fc.stderr && (
              <div className="flex flex-col gap-1">
                <span className="text-[11px] text-[#6b6b6b] font-medium">Error</span>
                <div className="bg-[#ff375f]/5 rounded-[6px] px-3 py-2.5 font-mono text-[12px] text-[#ff375f] border border-[#ff375f]/20 whitespace-pre-wrap">
                  {fc.stderr}
                </div>
              </div>
            )}

          </div>
        </div>
      )}
    </div>
  )
}



const CodeEditor = ({ problem, language, setLanguage, onRun, onSubmit, running, submitting }) => {
  const LANGUAGES = ['javascript', 'python', 'java']

  const monacoLangMap = {
    javascript: 'javascript',
    python: 'python',
    java: 'java',
  }

  const snippet = problem?.codeSnippets?.[language] || '// select a language'
  const [code, setCode] = useState(snippet)

  // Reset code when language or problem changes
  useEffect(() => {
    setCode(snippet)
  }, [language, snippet])

  const handleEditorMount = (editor, monaco) => {
    // VS Code dark theme
    monaco.editor.defineTheme('leetcode-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [],
      colors: {
        'editor.background': '#111111',
        'editor.lineHighlightBackground': '#1a1a1a',
        'editorLineNumber.foreground': '#3a3a3a',
        'editorLineNumber.activeForeground': '#6b6b6b',
        'editor.selectionBackground': '#ffa11630',
        'editor.inactiveSelectionBackground': '#ffa11615',
        'editorCursor.foreground': '#ffa116',
        'scrollbar.shadow': '#00000000',
        'scrollbarSlider.background': '#2a2a2a',
        'scrollbarSlider.hoverBackground': '#333333',
        'scrollbarSlider.activeBackground': '#3a3a3a',
      },
    })
    monaco.editor.setTheme('leetcode-dark')
  }

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="h-[42px] bg-[#1a1a1a] border-b border-[#2a2a2a] flex items-center px-4 gap-3 flex-shrink-0">
        <select
          value={language}
          onChange={e => setLanguage(e.target.value)}
          className="bg-[#2a2a2a] text-[#e8e8e8] text-[12px] px-2 py-1 rounded-[4px] border border-[#333] outline-none cursor-pointer"
        >
          {LANGUAGES.map(l => (
            <option key={l} value={l}>{l.charAt(0).toUpperCase() + l.slice(1)}</option>
          ))}
        </select>

        {/* Reset button */}
        <div className="ml-auto">
          <button
            onClick={() => setCode(snippet)}
            className="text-[#6b6b6b] hover:text-[#e8e8e8] transition-colors p-1"
            title="Reset code"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="1 4 1 10 7 10"/>
              <path d="M3.51 15a9 9 0 1 0 .49-4.5"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Monaco Editor */}
      <div className="flex-1 overflow-hidden">
        <Editor
          height="100%"
          language={monacoLangMap[language]}
          value={code}
          onChange={val => setCode(val || '')}
          onMount={handleEditorMount}
          options={{
            fontSize: 13,
            fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', Menlo, monospace",
            fontLigatures: true,
            lineHeight: 22,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            renderLineHighlight: 'line',
            cursorBlinking: 'smooth',
            cursorSmoothCaretAnimation: 'on',
            smoothScrolling: true,
            tabSize: 2,
            wordWrap: 'on',
            automaticLayout: true,
            padding: { top: 16, bottom: 16 },
            suggest: { enabled: true },
            quickSuggestions: true,
            formatOnPaste: true,
            formatOnType: true,
            autoIndent: 'full',
            bracketPairColorization: { enabled: true },
            guides: {
              bracketPairs: true,
              indentation: true,
            },
            renderWhitespace: 'none',
            folding: true,
            foldingHighlight: true,
            showFoldingControls: 'mouseover',
            occurrencesHighlight: true,
            selectionHighlight: true,
            scrollbar: {
              verticalScrollbarSize: 6,
              horizontalScrollbarSize: 6,
            },
          }}
        />
      </div>

      {/* Run / Submit bar */}
      <div className="h-[52px] bg-[#1a1a1a] border-t border-[#2a2a2a] flex items-center px-4 gap-3 flex-shrink-0">
        <button
          onClick={() => onRun(code)}
          disabled={running || submitting}
          className="px-4 h-[32px] rounded-[4px] bg-[#2a2a2a] text-[#e8e8e8] text-[13px] hover:bg-[#333] transition-colors border border-[#333] disabled:opacity-50 flex items-center gap-2"
        >
          {running && <div className="w-3 h-3 border border-[#e8e8e8] border-t-transparent rounded-full animate-spin"/>}
          {running ? 'Running...' : 'Run'}
        </button>

        <button
          onClick={() => onSubmit(code)}
          disabled={running || submitting}
          className="ml-auto px-4 h-[32px] rounded-[4px] bg-[#ffa116] text-black text-[13px] font-medium hover:bg-[#ffb84d] transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          {submitting && <div className="w-3 h-3 border border-black border-t-transparent rounded-full animate-spin"/>}
          {submitting ? 'Submitting...' : 'Submit'}
        </button>
      </div>
    </div>
  )
}

const BottomPanel = ({ problem, runResult, submitResult, customTestCases, setCustomTestCases }) => {
  const [activeCase, setActiveCase] = useState(0)
  const builtinCases = problem?.testCases?.slice(0, 3) || []
  const allCases = [...builtinCases, ...customTestCases]
  const result = submitResult || runResult

  const addCustomCase = () => {
    // Build a blank case mirroring the shape of the first test case's input keys
    const template = builtinCases[0]?.input || {}
    const blankInput = Object.fromEntries(Object.keys(template).map(k => [k, '']))
    const newCase = { input: blankInput, output: '', isCustom: true }
    setCustomTestCases(prev => [...prev, newCase])
    setActiveCase(allCases.length) // switch to the new tab
  }

  const updateCustomCase = (customIndex, field, keyOrVal, value) => {
    setCustomTestCases(prev => {
      const updated = [...prev]
      if (field === 'input') {
        updated[customIndex] = {
          ...updated[customIndex],
          input: { ...updated[customIndex].input, [keyOrVal]: value }
        }
      } else {
        updated[customIndex] = { ...updated[customIndex], output: value }
      }
      return updated
    })
  }

  const deleteCustomCase = (customIndex) => {
    setCustomTestCases(prev => prev.filter((_, i) => i !== customIndex))
    setActiveCase(Math.min(activeCase, allCases.length - 2))
  }

  useEffect(() => { setActiveCase(0) }, [runResult, submitResult])

  if (result) {
    const tc = result.testResults?.[activeCase]

    return (
      <div className="flex flex-col h-full">
        <div className={`px-4 py-2.5 flex items-center gap-3 border-b border-[#2a2a2a] ${result.allPassed ? 'bg-[#00b8a3]/5' : 'bg-[#ff375f]/5'}`}>
          <span className={`text-[14px] font-semibold ${result.allPassed ? 'text-[#00b8a3]' : 'text-[#ff375f]'}`}>
            {submitResult
              ? (result.allPassed ? '✓ Accepted' : '✗ Wrong Answer')
              : (result.allPassed ? '✓ All cases passed' : '✗ Some cases failed')}
          </span>
          {result.runtime && <span className="text-[11px] text-[#6b6b6b] ml-auto">Runtime: {result.runtime}</span>}
          {result.memory  && <span className="text-[11px] text-[#6b6b6b]">Memory: {result.memory}</span>}
        </div>

        <div className="flex items-center gap-1 px-4 pt-2 pb-0 border-b border-[#2a2a2a] bg-[#1a1a1a]">
          {result.testResults?.map((t, i) => (
            <button key={i} onClick={() => setActiveCase(i)}
              className={`flex items-center gap-1.5 px-3 py-2 text-[12px] rounded-t-[4px] transition-colors border-b-2 -mb-px
                ${activeCase === i
                  ? t.passed ? 'border-[#00b8a3] text-[#00b8a3] bg-[#00b8a3]/5' : 'border-[#ff375f] text-[#ff375f] bg-[#ff375f]/5'
                  : 'border-transparent text-[#6b6b6b] hover:text-[#e8e8e8]'}`}>
              <span className={`text-[10px] ${t.passed ? 'text-[#00b8a3]' : 'text-[#ff375f]'}`}>●</span>
              {i < builtinCases.length ? `Case ${i + 1}` : `Custom ${i - builtinCases.length + 1}`}
            </button>
          ))}
        </div>

        {tc && (
          <div className={`flex-1 overflow-y-auto p-4 ${tc.passed ? 'bg-[#00b8a3]/[0.02]' : 'bg-[#ff375f]/[0.02]'}`}>
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <span className="text-[11px] text-[#6b6b6b]">Input</span>
                <div className="bg-[#1a1a1a] rounded-[6px] px-3 py-2 font-mono text-[13px] text-[#e8e8e8] border border-[#2a2a2a]">{JSON.stringify(tc.input)}</div>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[11px] text-[#6b6b6b]">Expected Output</span>
                <div className="bg-[#1a1a1a] rounded-[6px] px-3 py-2 font-mono text-[13px] text-[#00b8a3] border border-[#00b8a3]/20">{JSON.stringify(tc.expectedOutput)}</div>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[11px] text-[#6b6b6b]">Your Output</span>
                <div className={`bg-[#1a1a1a] rounded-[6px] px-3 py-2 font-mono text-[13px] border ${tc.passed ? 'text-[#00b8a3] border-[#00b8a3]/20' : 'text-[#ff375f] border-[#ff375f]/20'}`}>
                  {tc.actualOutput ?? 'null'}
                </div>
              </div>
              {tc.stderr && (
                <div className="flex flex-col gap-1">
                  <span className="text-[11px] text-[#6b6b6b]">Stderr</span>
                  <div className="bg-[#ff375f]/10 rounded-[6px] px-3 py-2 font-mono text-[12px] text-[#ff375f] border border-[#ff375f]/20 whitespace-pre-wrap">{tc.stderr}</div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    )
  }

  // ---- Default view (no result yet) ----
  const activeIsCustom = activeCase >= builtinCases.length
  const customIndex    = activeCase - builtinCases.length

  return (
    <div className="flex flex-col h-full">
      {/* Tabs row */}
      <div className="flex items-center gap-1 px-4 pt-3 pb-0 border-b border-[#2a2a2a] overflow-x-auto">
        {builtinCases.map((_, i) => (
          <button key={i} onClick={() => setActiveCase(i)}
            className={`flex-shrink-0 px-3 py-2 text-[12px] rounded-t-[4px] transition-colors ${activeCase === i ? 'bg-[#2a2a2a] text-[#e8e8e8]' : 'text-[#6b6b6b] hover:text-[#e8e8e8]'}`}>
            Case {i + 1}
          </button>
        ))}
        {customTestCases.map((_, i) => (
          <button key={`c${i}`} onClick={() => setActiveCase(builtinCases.length + i)}
            className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-2 text-[12px] rounded-t-[4px] transition-colors
              ${activeCase === builtinCases.length + i ? 'bg-[#2a2a2a] text-[#ffa116]' : 'text-[#6b6b6b] hover:text-[#e8e8e8]'}`}>
            Custom {i + 1}
            {/* Delete button */}
            <span
              onClick={e => { e.stopPropagation(); deleteCustomCase(i) }}
              className="text-[#6b6b6b] hover:text-[#ff375f] transition-colors leading-none"
              title="Remove">✕</span>
          </button>
        ))}
        {/* + Add button */}
        <button onClick={addCustomCase}
          className="flex-shrink-0 flex items-center gap-1 px-2.5 py-2 text-[12px] text-[#6b6b6b] hover:text-[#ffa116] transition-colors ml-1"
          title="Add custom test case">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Add case
        </button>
      </div>

      {/* Case content */}
      <div className="flex-1 p-4 overflow-y-auto">
        {/* Built-in case — read only */}
        {!activeIsCustom && builtinCases[activeCase] && (
          <div className="flex flex-col gap-3">
            {Object.entries(builtinCases[activeCase].input).map(([key, val]) => (
              <div key={key} className="flex flex-col gap-1">
                <span className="text-[11px] text-[#6b6b6b]">{key} =</span>
                <div className="bg-[#1a1a1a] rounded-[6px] px-3 py-2 font-mono text-[13px] text-[#e8e8e8] border border-[#2a2a2a]">{JSON.stringify(val)}</div>
              </div>
            ))}
            <div className="flex flex-col gap-1">
              <span className="text-[11px] text-[#6b6b6b]">expected output =</span>
              <div className="bg-[#1a1a1a] rounded-[6px] px-3 py-2 font-mono text-[13px] text-[#e8e8e8] border border-[#2a2a2a]">{JSON.stringify(builtinCases[activeCase].output)}</div>
            </div>
          </div>
        )}

        {/* Custom case — editable */}
        {activeIsCustom && customTestCases[customIndex] && (
          <div className="flex flex-col gap-3">
            <p className="text-[11px] text-[#6b6b6b]">Edit your custom test case. Click Run to test it.</p>
            {Object.keys(customTestCases[customIndex].input).map(key => (
              <div key={key} className="flex flex-col gap-1">
                <span className="text-[11px] text-[#6b6b6b]">{key} =</span>
                <textarea
                  rows={1}
                  value={customTestCases[customIndex].input[key]}
                  onChange={e => updateCustomCase(customIndex, 'input', key, e.target.value)}
                  placeholder={`Enter value for ${key}...`}
                  className="bg-[#1a1a1a] rounded-[6px] px-3 py-2 font-mono text-[13px] text-[#e8e8e8] border border-[#ffa116]/30 focus:border-[#ffa116]/60 outline-none resize-none leading-relaxed"
                  spellCheck={false}
                />
              </div>
            ))}
            <div className="flex flex-col gap-1">
              <span className="text-[11px] text-[#6b6b6b]">expected output = <span className="text-[#6b6b6b]/60">(optional)</span></span>
              <textarea
                rows={1}
                value={customTestCases[customIndex].output}
                onChange={e => updateCustomCase(customIndex, 'output', null, e.target.value)}
                placeholder="Expected output..."
                className="bg-[#1a1a1a] rounded-[6px] px-3 py-2 font-mono text-[13px] text-[#e8e8e8] border border-[#ffa116]/30 focus:border-[#ffa116]/60 outline-none resize-none leading-relaxed"
                spellCheck={false}
              />
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
  const [customTestCases, setCustomTestCases] = useState([])

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
    try { setRunResult(await runCode({ source_code: code, language, problem_id: id ,customTestCases })) }
    catch (err) { console.error(err) }
    finally { setRunning(false) }
  }

  const handleSubmit = async (code) => {
  if (!code.trim()) return
  setSubmitting(true); setRunResult(null); setSubmitResult(null)
  try {
    // Run both in parallel — submit for the verdict, runCode for testResults
    const [submitRes, runRes] = await Promise.all([
      submitCode({ source_code: code, language, problem_id: id }),
      runCode({ source_code: code, language, problem_id: id, customTestCases })
    ])
    // Merge: keep submit verdict but attach testResults from runCode
    setSubmitResult({ ...submitRes, testResults: runRes.testResults })
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
            {leftTab === 'submissions'  && <SubmissionsPanel submitResult={submitResult}/>}
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
              <BottomPanel problem={problem} runResult={runResult} submitResult={submitResult} customTestCases={customTestCases}setCustomTestCases={setCustomTestCases}/>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProblemDetail