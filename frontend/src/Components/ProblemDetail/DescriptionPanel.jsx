
export const DescriptionPanel = ({ problem , diffBg}) => (
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