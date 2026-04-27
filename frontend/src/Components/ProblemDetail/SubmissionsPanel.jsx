export const SubmissionsPanel = ({ submitResult }) => {
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

  if (allPassed) {
    return (
      <div className="flex flex-col h-full overflow-hidden">
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
        <div className="flex flex-col items-center justify-center flex-1 gap-5 p-6">
          <div className="w-20 h-20 rounded-full bg-[#00b8a3]/10 border-2 border-[#00b8a3]/30 flex items-center justify-center">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#00b8a3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </div>
          <div className="flex flex-col items-center gap-1">
            <span className="text-[16px] font-semibold text-[#e8e8e8]">Great job!</span>
            <span className="text-[12px] text-[#6b6b6b]">Your solution is correct and efficient.</span>
          </div>
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

  const fc = firstFailed
  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="px-5 py-4 bg-[#ff375f]/5 border-b border-[#2a2a2a] flex-shrink-0">
        <div className="flex items-center justify-between mb-3">
          <div className="flex flex-col gap-0.5">
            <span className="text-[22px] font-bold text-[#ff375f]">✗ Wrong Answer</span>
            <span className="text-[12px] text-[#6b6b6b]">{passedCount} / {totalCount} test cases passed ({percent}%)</span>
          </div>
          <div className="flex flex-col items-center px-3 py-1.5 rounded-[6px] bg-[#ff375f]/10 border border-[#ff375f]/20">
            <span className="text-[13px] font-semibold text-[#ff375f]">{totalCount - passedCount} failed</span>
            <span className="text-[10px] text-[#ff375f]/60">test cases</span>
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <div className="h-[5px] rounded-full bg-[#2a2a2a] overflow-hidden">
            <div className="h-full rounded-full bg-[#ff375f] transition-all duration-700" style={{ width: `${percent}%` }}/>
          </div>
          <div className="flex justify-between text-[10px] text-[#4b4b4b]"><span>0</span><span>{totalCount}</span></div>
        </div>
      </div>
      {fc && (
        <div className="flex-1 overflow-y-auto p-4">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-medium text-[#6b6b6b] uppercase tracking-wider">First failing test case</span>
              <div className="flex-1 h-px bg-[#2a2a2a]"/>
              <span className="text-[11px] px-2 py-0.5 rounded-[4px] bg-[#ff375f]/10 text-[#ff375f] border border-[#ff375f]/20">Case #{fc.testCase}</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 rounded-[6px] bg-[#ff375f]/5 border border-[#ff375f]/20 w-fit">
              <span className="text-[12px] font-medium text-[#ff375f]">✗ {fc.status}</span>
              {fc.time && <span className="text-[11px] text-[#6b6b6b] border-l border-[#3a3a3a] pl-2">{fc.time}ms</span>}
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[11px] text-[#6b6b6b] font-medium">Input</span>
              <div className="bg-[#1a1a1a] rounded-[6px] px-3 py-2.5 font-mono text-[12px] text-[#e8e8e8] border border-[#2a2a2a]">
                {Object.entries(fc.input || {}).map(([k, v]) => (
                  <div key={k}><span className="text-[#6b6b6b]">{k}</span>{' = '}<span>{JSON.stringify(v)}</span></div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex flex-col gap-1">
                <span className="text-[11px] text-[#6b6b6b] font-medium">Expected output</span>
                <div className="bg-[#1a1a1a] rounded-[6px] px-3 py-2.5 font-mono text-[12px] text-[#00b8a3] border border-[#00b8a3]/20 min-h-[38px]">{JSON.stringify(fc.expectedOutput)}</div>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[11px] text-[#6b6b6b] font-medium">Your output</span>
                <div className="bg-[#1a1a1a] rounded-[6px] px-3 py-2.5 font-mono text-[12px] text-[#ff375f] border border-[#ff375f]/20 min-h-[38px]">{fc.actualOutput ?? 'null'}</div>
              </div>
            </div>
            {fc.stderr && (
              <div className="flex flex-col gap-1">
                <span className="text-[11px] text-[#6b6b6b] font-medium">Error</span>
                <div className="bg-[#ff375f]/5 rounded-[6px] px-3 py-2.5 font-mono text-[12px] text-[#ff375f] border border-[#ff375f]/20 whitespace-pre-wrap">{fc.stderr}</div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}