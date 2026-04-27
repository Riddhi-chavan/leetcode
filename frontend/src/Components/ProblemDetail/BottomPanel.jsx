import { useEffect, useState } from "react"

export const BottomPanel = ({ problem, runResult, submitResult, customTestCases, setCustomTestCases }) => {
  const [activeCase, setActiveCase] = useState(0)
  const builtinCases = problem?.testCases?.slice(0, 3) || []
  const allCases = [...builtinCases, ...customTestCases]
  const result = submitResult || runResult

  const addCustomCase = () => {
    const template = builtinCases[0]?.input || {}
    const blankInput = Object.fromEntries(Object.keys(template).map(k => [k, '']))
    const newCase = { input: blankInput, output: '', isCustom: true }
    setCustomTestCases(prev => [...prev, newCase])
    setActiveCase(allCases.length)
  }

  const updateCustomCase = (customIndex, field, keyOrVal, value) => {
    setCustomTestCases(prev => {
      const updated = [...prev]
      if (field === 'input') {
        updated[customIndex] = { ...updated[customIndex], input: { ...updated[customIndex].input, [keyOrVal]: value } }
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
            {submitResult ? (result.allPassed ? '✓ Accepted' : '✗ Wrong Answer') : (result.allPassed ? '✓ All cases passed' : '✗ Some cases failed')}
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

  const activeIsCustom = activeCase >= builtinCases.length
  const customIndex    = activeCase - builtinCases.length

  return (
    <div className="flex flex-col h-full">
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
            <span onClick={e => { e.stopPropagation(); deleteCustomCase(i) }} className="text-[#6b6b6b] hover:text-[#ff375f] transition-colors leading-none" title="Remove">✕</span>
          </button>
        ))}
        <button onClick={addCustomCase} className="flex-shrink-0 flex items-center gap-1 px-2.5 py-2 text-[12px] text-[#6b6b6b] hover:text-[#ffa116] transition-colors ml-1" title="Add custom test case">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Add case
        </button>
      </div>
      <div className="flex-1 p-4 overflow-y-auto">
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